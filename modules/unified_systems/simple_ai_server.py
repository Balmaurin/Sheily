#!/usr/bin/env python3
"""
Servidor AI Unificado - Sheily AI Gateway
=========================================

Servidor que actúa como gateway entre el frontend y el LLM,
proporcionando respuestas inteligentes usando Llama 3.2
"""

import asyncio
import json
import logging
import requests
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import time

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modelos de request/response
class QueryRequest(BaseModel):
    query: str
    domain: str = "general"
    context: Dict[str, Any] = {}
    user_id: str = None
    max_tokens: int = 500
    temperature: float = 0.7
    top_p: float = 0.9

class QueryResponse(BaseModel):
    query: str
    response: str
    confidence: float
    domain: str
    timestamp: str
    model_used: str = "Llama-3.2-3B-Instruct-Q8_0"
    response_time: float = 0.0
    tokens_used: int = 0
    quality_score: float = 0.0

# Crear aplicación FastAPI
app = FastAPI(
    title="Sheily AI Unified System",
    description="Sistema unificado de IA para Sheily AI",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración del sistema
LLM_SERVER_URL = "http://localhost:8005"
BACKEND_URL = "http://localhost:8000"

# Estado del sistema
system_state = {
    "initialized": True,
    "start_time": datetime.now(),
    "requests_processed": 0,
    "llm_connected": False,
    "backend_connected": False
}

def check_llm_connection() -> str:
    """Verificar conexión con el servidor LLM"""
    try:
        response = requests.get(f"{LLM_SERVER_URL}/health", timeout=5)
        return "connected" if response.status_code == 200 else "disconnected"
    except:
        return "disconnected"

def check_backend_connection() -> str:
    """Verificar conexión con el backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        return "connected" if response.status_code == 200 else "disconnected"
    except:
        return "disconnected"

@app.get("/health")
def health_check():
    """Endpoint de salud"""
    # Verificar conexiones en tiempo real
    llm_status = check_llm_connection()
    backend_status = check_backend_connection()

    system_state["llm_connected"] = llm_status == "connected"
    system_state["backend_connected"] = backend_status == "connected"

    return {
        "status": "healthy" if llm_status == "connected" and backend_status == "connected" else "degraded",
        "timestamp": datetime.now().isoformat(),
        "uptime": (datetime.now() - system_state["start_time"]).total_seconds(),
        "requests_processed": system_state["requests_processed"],
        "connections": {
            "llm_server": llm_status,
            "backend": backend_status
        }
    }

@app.post("/query", response_model=QueryResponse)
def process_query(request: QueryRequest):
    """Procesar consulta usando el LLM a través del gateway"""
    start_time = time.time()

    try:
        system_state["requests_processed"] += 1

        # Verificar conexiones
        llm_status = check_llm_connection()
        if llm_status != "connected":
            raise HTTPException(
                status_code=503,
                detail="Servicio LLM no disponible. Por favor, verifica que el servidor LLM esté ejecutándose."
            )

        # Preparar la consulta para el LLM
        llm_payload = {
            "prompt": request.query,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p
        }

        # Enviar consulta al LLM server
        llm_response = requests.post(
            f"{LLM_SERVER_URL}/generate",
            json=llm_payload,
            timeout=30  # Timeout de 30 segundos
        )

        if llm_response.status_code != 200:
            raise HTTPException(
                status_code=llm_response.status_code,
                detail=f"Error del servidor LLM: {llm_response.text}"
            )

        llm_data = llm_response.json()

        # Calcular tiempo de respuesta
        end_time = time.time()
        response_time = end_time - start_time

        # Estimar tokens usados (aproximación simple)
        tokens_used = len(request.query.split()) + len(llm_data.get("response", "").split())

        # Calcular calidad de respuesta (basado en longitud y coherencia)
        response_length = len(llm_data.get("response", ""))
        quality_score = min(1.0, response_length / 100)  # Score basado en longitud

        # Determinar dominio (puede ser mejorado con análisis más sofisticado)
        query_lower = request.query.lower()
        if any(word in query_lower for word in ["python", "código", "programar", "desarrollo"]):
            domain = "programming"
        elif any(word in query_lower for word in ["ia", "inteligencia", "modelo", "aprendizaje"]):
            domain = "ai"
        elif any(word in query_lower for word in ["base de datos", "sql", "postgres"]):
            domain = "database"
        else:
            domain = request.domain  # Usar el dominio especificado o "general"

        # Log de la consulta procesada
        logger.info(f"✅ Consulta procesada - Dominio: {domain}, Tiempo: {response_time:.2f}s, Tokens: {tokens_used}")

        return QueryResponse(
            query=request.query,
            response=llm_data.get("response", "Lo siento, no pude generar una respuesta."),
            confidence=0.9,  # Alta confianza ya que viene del LLM
            domain=domain,
            timestamp=datetime.now().isoformat(),
            model_used="Llama-3.2-3B-Instruct-Q8_0",
            response_time=response_time,
            tokens_used=tokens_used,
            quality_score=quality_score
        )

    except requests.exceptions.Timeout:
        logger.error("Timeout conectando con LLM server")
        raise HTTPException(status_code=504, detail="Timeout: El servidor LLM tardó demasiado en responder")
    except requests.exceptions.ConnectionError:
        logger.error("Error de conexión con LLM server")
        raise HTTPException(status_code=503, detail="No se pudo conectar con el servidor LLM")
    except Exception as e:
        logger.error(f"Error procesando consulta: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/status")
def get_system_status():
    """Obtener estado del sistema"""
    # Verificar conexiones actuales
    llm_status = check_llm_connection()
    backend_status = check_backend_connection()

    return {
        "system": "Sheily AI Gateway",
        "version": "1.0.0",
        "status": "running",
        "description": "Gateway que conecta el frontend con el LLM Llama-3.2-3B-Instruct-Q8_0",
        "initialized": system_state["initialized"],
        "start_time": system_state["start_time"].isoformat(),
        "uptime": (datetime.now() - system_state["start_time"]).total_seconds(),
        "requests_processed": system_state["requests_processed"],
        "connections": {
            "llm_server": {
                "url": LLM_SERVER_URL,
                "status": llm_status,
                "model": "Llama-3.2-3B-Instruct-Q8_0"
            },
            "backend": {
                "url": BACKEND_URL,
                "status": backend_status
            }
        },
        "features": [
            "Procesamiento inteligente de consultas",
            "Clasificación automática de dominios",
            "Métricas de calidad de respuesta",
            "Gestión de conexiones en tiempo real",
            "Logging avanzado de consultas"
        ]
    }

@app.get("/")
def root():
    """Endpoint raíz del Gateway Sheily AI"""
    return {
        "message": "🚀 Sheily AI Gateway - Conectando Frontend con Llama 3.2",
        "version": "1.0.0",
        "status": "running",
        "description": "Gateway inteligente que procesa consultas del dashboard y las envía al LLM Llama-3.2-3B-Instruct-Q8_0",
        "architecture": {
            "frontend": "Dashboard React/Next.js (puerto 3000)",
            "gateway": "AI System (puerto 8080)",
            "llm": "Llama-3.2-3B-Instruct-Q8_0 (puerto 8005)",
            "backend": "API REST (puerto 8000)"
        },
        "endpoints": [
            "/health - Estado de salud y conexiones",
            "/query - Procesar consultas de chat (POST)",
            "/status - Estado detallado del sistema",
            "/docs - Documentación automática"
        ],
        "features": [
            "🔄 Procesamiento inteligente de consultas",
            "🎯 Clasificación automática de dominios",
            "📊 Métricas de rendimiento y calidad",
            "🔗 Gestión automática de conexiones",
            "📝 Logging avanzado"
        ]
    }

if __name__ == "__main__":
    print("""
    🚀 SHEILY AI GATEWAY
    ====================

    Conectando el Dashboard con Llama-3.2-3B-Instruct-Q8_0

    Arquitectura:
    • Frontend (puerto 3000) → Gateway (puerto 8080)
    • Gateway → LLM Server (puerto 8005)
    • Gateway → Backend API (puerto 8000)

    Iniciando servidor en http://localhost:8080
    """)

    logger.info("🚀 Iniciando Sheily AI Gateway...")

    # Configurar servidor
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info",
        access_log=True
    )

    server = uvicorn.Server(config)

    try:
        server.run()
    except KeyboardInterrupt:
        logger.info("👋 Sheily AI Gateway detenido")
    except Exception as e:
        logger.error(f"❌ Error en gateway: {e}")
        raise
