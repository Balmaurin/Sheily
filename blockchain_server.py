#!/usr/bin/env python3
"""
Servidor de Blockchain Simplificado - Sheily AI
===============================================

Servidor que expone las funcionalidades de blockchain de forma simplificada
"""

import json
import logging
import time
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Modelos
class WalletRequest(BaseModel):
    user_id: str


class TransferRequest(BaseModel):
    from_wallet: str
    to_wallet: str
    amount: float
    token_type: str = "SHEILY"


# Crear aplicación FastAPI
app = FastAPI(
    title="Sheily AI Blockchain Service",
    description="Servicio de blockchain para tokens SHEILY",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado del sistema blockchain
blockchain_state = {
    "network": "devnet",
    "initialized": True,
    "start_time": datetime.now(),
    "wallets_created": 0,
    "transactions_processed": 0,
}


@app.get("/health")
async def health_check():
    """Endpoint de salud"""
    return {
        "status": "healthy",
        "network": blockchain_state["network"],
        "timestamp": datetime.now().isoformat(),
        "uptime": (datetime.now() - blockchain_state["start_time"]).total_seconds(),
        "wallets_created": blockchain_state["wallets_created"],
        "transactions_processed": blockchain_state["transactions_processed"],
    }


@app.post("/wallet/create")
async def create_wallet(request: WalletRequest):
    """Crear wallet para usuario"""
    try:
        # Simulación de creación de wallet
        import uuid

        wallet_address = f"sheily_{uuid.uuid4().hex[:16]}"

        blockchain_state["wallets_created"] += 1

        return {
            "success": True,
            "user_id": request.user_id,
            "wallet_address": wallet_address,
            "network": blockchain_state["network"],
            "initial_balance": 1000,
            "created_at": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creando wallet: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/wallet/{wallet_address}/balance")
async def get_balance(wallet_address: str):
    """Obtener balance de wallet"""
    try:
        import random

        # Simulación de balance
        balance = {
            "wallet_address": wallet_address,
            "sol_balance": round(random.uniform(0.1, 10.0), 4),
            "sheily_tokens": random.randint(100, 5000),
            "last_updated": datetime.now().isoformat(),
        }

        return balance

    except Exception as e:
        logger.error(f"Error obteniendo balance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transfer")
async def transfer_tokens(request: TransferRequest):
    """Transferir tokens entre wallets"""
    try:
        import uuid

        # Simulación de transferencia
        tx_hash = f"tx_{uuid.uuid4().hex}"

        blockchain_state["transactions_processed"] += 1

        return {
            "success": True,
            "transaction_hash": tx_hash,
            "from_wallet": request.from_wallet,
            "to_wallet": request.to_wallet,
            "amount": request.amount,
            "token_type": request.token_type,
            "network": blockchain_state["network"],
            "timestamp": datetime.now().isoformat(),
            "gas_used": 5000,
        }

    except Exception as e:
        logger.error(f"Error en transferencia: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/network/stats")
async def get_network_stats():
    """Obtener estadísticas de la red"""
    import random

    return {
        "network": blockchain_state["network"],
        "current_slot": random.randint(100000000, 200000000),
        "tps": round(random.uniform(1000, 5000), 2),
        "average_fee": round(random.uniform(0.00001, 0.0001), 6),
        "total_supply": 500000000,
        "circulating_supply": 400000000,
        "wallets_active": blockchain_state["wallets_created"],
        "transactions_total": blockchain_state["transactions_processed"],
        "last_updated": datetime.now().isoformat(),
    }


@app.get("/status")
async def get_status():
    """Obtener estado del sistema blockchain"""
    return {
        "system": "Sheily AI Blockchain Service",
        "version": "1.0.0",
        "network": blockchain_state["network"],
        "status": "running",
        "features": [
            "wallet_creation",
            "token_transfers",
            "balance_queries",
            "network_stats",
        ],
        "stats": blockchain_state,
    }


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Sheily AI Blockchain Service",
        "version": "1.0.0",
        "network": blockchain_state["network"],
        "status": "running",
        "endpoints": [
            "/health",
            "/wallet/create",
            "/wallet/{address}/balance",
            "/transfer",
            "/network/stats",
            "/status",
            "/docs",
        ],
    }


if __name__ == "__main__":
    logger.info("🚀 Iniciando Servidor Blockchain...")

    # Instalar uvicorn si no está disponible
    try:
        import uvicorn
    except ImportError:
        logger.error("❌ uvicorn no está instalado. Instalando...")
        import subprocess

        subprocess.check_call(
            [
                sys.executable,
                "-m",
                "pip",
                "install",
                "uvicorn",
                "fastapi",
                "--break-system-packages",
            ]
        )
        import uvicorn

    # Configurar servidor
    config = uvicorn.Config(
        app, host="0.0.0.0", port=8090, log_level="info", access_log=True
    )

    server = uvicorn.Server(config)

    try:
        server.run()
    except KeyboardInterrupt:
        logger.info("👋 Servidor Blockchain detenido")
    except Exception as e:
        logger.error(f"❌ Error en servidor: {e}")
        raise
