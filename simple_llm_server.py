#!/usr/bin/env python3
"""
Simple LLM Server para Sheily AI
================================
Servidor mock para testing mientras no esté disponible el modelo real
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from datetime import datetime
import random

app = FastAPI(title="LLM Server Simple")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 200
    temperature: float = 0.7

class ChatRequest(BaseModel):
    message: str
    context: str = ""
    max_length: int = 200

# Respuestas predefinidas para simular el LLM
RESPONSES = [
    "Entiendo tu consulta. Como Sheily AI, puedo ayudarte con eso. ",
    "Excelente pregunta. Basándome en mi conocimiento, ",
    "Gracias por tu mensaje. Permíteme explicarte: ",
    "Interesante punto. Desde mi perspectiva como IA, ",
    "Claro, con gusto te ayudo con eso. ",
]

@app.get("/")
async def root():
    return {
        "service": "LLM Server",
        "status": "running",
        "model": "mock-llm",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model": "mock-llm",
        "available": True
    }

@app.post("/generate")
async def generate(request: GenerateRequest):
    # Simular respuesta del LLM
    base_response = random.choice(RESPONSES)
    
    # Agregar contenido basado en el prompt
    if "hola" in request.prompt.lower():
        response = f"¡Hola! Soy Sheily AI, tu asistente inteligente. {base_response}¿En qué puedo ayudarte hoy?"
    elif "que es" in request.prompt.lower() or "qué es" in request.prompt.lower():
        response = f"{base_response}Lo que preguntas es un tema interesante. En términos simples, se trata de un concepto que involucra varios aspectos importantes que debemos considerar."
    elif "como" in request.prompt.lower() or "cómo" in request.prompt.lower():
        response = f"{base_response}Para hacer esto, te recomiendo seguir estos pasos: 1) Analizar la situación, 2) Planificar tu enfoque, 3) Ejecutar con cuidado, y 4) Revisar los resultados."
    else:
        response = f"{base_response}Tu consulta '{request.prompt[:50]}...' es muy relevante. Déjame proporcionarte información útil al respecto."
    
    return {
        "response": response[:request.max_tokens],
        "tokens_used": min(len(response.split()), request.max_tokens),
        "model": "mock-llm",
        "temperature": request.temperature,
        "status": "success"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    # Simular respuesta de chat
    response = generate(GenerateRequest(
        prompt=request.message,
        max_tokens=request.max_length
    ))
    
    return await response

@app.get("/models")
async def get_models():
    return {
        "models": [
            {
                "id": "mock-llm",
                "name": "Mock LLM for Testing",
                "status": "available",
                "description": "Modelo simulado para desarrollo y testing"
            }
        ]
    }

@app.get("/status")
async def status():
    return {
        "status": "operational",
        "model_loaded": True,
        "memory_usage": "100MB",
        "requests_served": random.randint(100, 1000),
        "uptime": "1h 23m",
        "last_request": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("🚀 Iniciando LLM Server Simple en puerto 8005...")
    uvicorn.run(app, host="0.0.0.0", port=8005)