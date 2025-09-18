import logging
import uuid
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta

import numpy as np
import torch
import asyncio
import httpx
import psycopg2
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
from solana.publickey import PublicKey

from modules.tokens.solana_blockchain import (
    SolanaBlockchainReal,
    TokenTransaction,
    SolanaWallet,
)
from evaluation.quality_metrics_advanced import AdvancedQualityMetricsEvaluator
from modules.core.continuous_improvement import ContinuousImprovement


@dataclass
class SheilyTokenConfig:
    """Configuración avanzada de tokens Sheily"""

    base_token_value: float = 1.0
    quality_multiplier: float = 2.0
    max_tokens_per_session: int = 1000
    min_quality_threshold: float = 0.7
    token_expiration_days: int = 90
    blockchain_network: str = "devnet"
    token_types: Dict[str, float] = field(
        default_factory=lambda: {
            "TRAINING": 1.0,
            "RESPONSE": 1.5,
            "INNOVATION": 2.0,
            "SPECIAL_CONTRIBUTION": 3.0,
        }
    )


@dataclass
class SheilyToken:
    """Token Sheily con metadatos completos y blockchain"""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = ""
    session_id: str = ""
    amount: int = 0
    generation_reason: str = "default"
    quality_score: float = 0.0
    token_type: str = "TRAINING"
    blockchain_tx_hash: Optional[str] = None
    validation_status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    validated_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    staking_info: Optional[Dict[str, Any]] = None
    blockchain_signature: Optional[str] = None
    domain: Optional[str] = None


class AdvancedSheilyTokenSystem:
    """Sistema avanzado de tokens Sheily con integración blockchain y marketplace"""

    def __init__(
        self,
        config: Optional[SheilyTokenConfig] = None,
        quality_evaluator: Optional[AdvancedQualityMetricsEvaluator] = None,
        continuous_improvement: Optional[ContinuousImprovement] = None,
        blockchain_system: Optional[SolanaBlockchainReal] = None,
    ):
        """
        Inicializar sistema de tokens Sheily

        Args:
            config: Configuración de tokens
            quality_evaluator: Sistema de evaluación de calidad
            continuous_improvement: Sistema de mejora continua
            blockchain_system: Sistema de blockchain Solana
        """
        self.logger = logging.getLogger(__name__)

        # Configuración
        self.config = config or SheilyTokenConfig()

        # Componentes
        self.quality_evaluator = quality_evaluator or AdvancedQualityMetricsEvaluator()
        self.continuous_improvement = continuous_improvement or ContinuousImprovement()
        self.blockchain = blockchain_system or SolanaBlockchainReal()

        # Almacenamiento de tokens
        self.token_store: Dict[str, SheilyToken] = {}
        self.user_token_balances: Dict[str, int] = {}

        # Marketplace de tokens
        self.token_marketplace: Dict[str, Dict[str, Any]] = {}

        # Pools de staking
        self.staking_pools: Dict[str, Dict[str, Any]] = {
            "basic": {
                "apy": 0.05,  # 5% anual
                "min_stake": 10,
                "max_stake": 1000,
                "lock_period_days": 30,
            },
            "advanced": {
                "apy": 0.1,  # 10% anual
                "min_stake": 100,
                "max_stake": 5000,
                "lock_period_days": 90,
            },
        }

    async def generate_tokens_for_training_session(
        self,
        session_id: str,
        user_id: str,
        quality_score: float,
        domain: Optional[str] = None,
    ) -> List[SheilyToken]:
        """
        Generar tokens para una sesión de entrenamiento

        Args:
            session_id: ID de la sesión
            user_id: ID del usuario
            quality_score: Puntuación de calidad de la sesión
            domain: Dominio de entrenamiento

        Returns:
            Lista de tokens generados
        """
        # Validar puntuación de calidad
        if quality_score < self.config.min_quality_threshold:
            self.logger.warning(
                f"Calidad insuficiente para generar tokens: {quality_score}"
            )
            return []

        # Calcular cantidad de tokens
        base_tokens = int(quality_score * self.config.base_token_value * 100)
        tokens_to_generate = min(base_tokens, self.config.max_tokens_per_session)

        tokens = []
        for _ in range(tokens_to_generate):
            token = SheilyToken(
                user_id=user_id,
                session_id=session_id,
                amount=1,
                generation_reason="training_session",
                quality_score=quality_score,
                token_type="TRAINING",
                domain=domain,
            )

            # Validar y firmar token en blockchain
            await self._validate_and_sign_token(token)

            tokens.append(token)
            self.token_store[token.id] = token

        # Actualizar balance de usuario
        self.user_token_balances[user_id] = (
            self.user_token_balances.get(user_id, 0) + tokens_to_generate
        )

        return tokens

    async def generate_tokens_for_response(
        self, user_id: str, response_quality: float, response_length: int
    ) -> List[SheilyToken]:
        """
        Generar tokens por calidad de respuesta

        Args:
            user_id: ID del usuario
            response_quality: Puntuación de calidad de la respuesta
            response_length: Longitud de la respuesta

        Returns:
            Lista de tokens generados
        """
        # Calcular tokens basados en calidad y longitud
        base_tokens = int(response_quality * response_length * 0.1)
        tokens_to_generate = min(base_tokens, 50)  # Límite de 50 tokens por respuesta

        tokens = []
        for _ in range(tokens_to_generate):
            token = SheilyToken(
                user_id=user_id,
                generation_reason="response_quality",
                quality_score=response_quality,
                token_type="RESPONSE",
            )

            await self._validate_and_sign_token(token)

            tokens.append(token)
            self.token_store[token.id] = token

        self.user_token_balances[user_id] = (
            self.user_token_balances.get(user_id, 0) + tokens_to_generate
        )

        return tokens

    async def _validate_and_sign_token(self, token: SheilyToken):
        """
        Validar y firmar token en blockchain

        Args:
            token: Token Sheily a validar y firmar
        """
        try:
            # Crear wallet para el usuario si no existe
            if token.user_id not in self.blockchain.user_wallets:
                await self.blockchain.create_wallet(token.user_id)

            # Simular validación con Sheily-Core
            validation_payload = {
                "token_id": token.id,
                "user_id": token.user_id,
                "quality_score": token.quality_score,
                "generation_reason": token.generation_reason,
                "timestamp": datetime.now().isoformat(),
            }

            # Simular firma blockchain
            transaction = await self.blockchain.transfer_tokens(
                from_user="system",
                to_user=token.user_id,
                amount=token.amount,
                token_type=token.token_type,
            )

            # Actualizar token con información blockchain
            token.blockchain_tx_hash = transaction.transaction_id
            token.blockchain_signature = transaction.signature
            token.validation_status = "confirmed"
            token.validated_at = datetime.now()

        except Exception as e:
            self.logger.error(f"Error validando token: {e}")
            token.validation_status = "failed"

    async def stake_tokens(
        self, user_id: str, token_ids: List[str], pool_name: str = "basic"
    ) -> Dict[str, Any]:
        """
        Realizar staking de tokens

        Args:
            user_id: ID del usuario
            token_ids: Lista de IDs de tokens para stake
            pool_name: Nombre del pool de staking

        Returns:
            Información del staking
        """
        # Validar pool de staking
        if pool_name not in self.staking_pools:
            raise ValueError(f"Pool de staking no encontrado: {pool_name}")

        pool_config = self.staking_pools[pool_name]

        # Validar tokens del usuario
        user_tokens = [
            token
            for token in self.token_store.values()
            if token.user_id == user_id and token.id in token_ids
        ]

        if not user_tokens:
            raise ValueError("No se encontraron tokens válidos para stake")

        # Calcular total de tokens para stake
        total_stake_amount = sum(token.amount for token in user_tokens)

        # Validar límites de stake
        if total_stake_amount < pool_config["min_stake"]:
            raise ValueError(
                f"Monto de stake mínimo no alcanzado: {pool_config['min_stake']}"
            )

        if total_stake_amount > pool_config["max_stake"]:
            raise ValueError(
                f"Monto de stake máximo excedido: {pool_config['max_stake']}"
            )

        # Crear registro de staking
        staking_record = {
            "user_id": user_id,
            "pool_name": pool_name,
            "tokens": [token.id for token in user_tokens],
            "total_amount": total_stake_amount,
            "apy": pool_config["apy"],
            "start_date": datetime.now(),
            "end_date": datetime.now()
            + timedelta(days=pool_config["lock_period_days"]),
            "status": "active",
        }

        # Marcar tokens como en stake
        for token in user_tokens:
            token.staking_info = staking_record

        return staking_record

    async def create_marketplace_listing(
        self, user_id: str, token_ids: List[str], price_per_token: float
    ) -> Dict[str, Any]:
        """
        Crear una lista de tokens en el marketplace

        Args:
            user_id: ID del usuario vendedor
            token_ids: Lista de IDs de tokens a vender
            price_per_token: Precio por token

        Returns:
            Información de la lista en marketplace
        """
        # Validar tokens del usuario
        user_tokens = [
            token
            for token in self.token_store.values()
            if token.user_id == user_id and token.id in token_ids
        ]

        if not user_tokens:
            raise ValueError("No se encontraron tokens válidos para venta")

        # Crear lista en marketplace
        listing = {
            "id": str(uuid.uuid4()),
            "seller_id": user_id,
            "tokens": [token.id for token in user_tokens],
            "total_tokens": len(user_tokens),
            "price_per_token": price_per_token,
            "total_price": len(user_tokens) * price_per_token,
            "created_at": datetime.now(),
            "status": "active",
        }

        self.token_marketplace[listing["id"]] = listing

        return listing

    async def purchase_tokens(self, buyer_id: str, listing_id: str) -> Dict[str, Any]:
        """
        Comprar tokens de una lista en marketplace

        Args:
            buyer_id: ID del comprador
            listing_id: ID de la lista de tokens

        Returns:
            Información de la transacción
        """
        # Validar lista en marketplace
        if listing_id not in self.token_marketplace:
            raise ValueError("Lista de tokens no encontrada")

        listing = self.token_marketplace[listing_id]

        if listing["status"] != "active":
            raise ValueError("La lista de tokens no está activa")

        # Transferir tokens entre usuarios
        seller_id = listing["seller_id"]
        tokens_to_transfer = [
            self.token_store[token_id] for token_id in listing["tokens"]
        ]

        for token in tokens_to_transfer:
            # Transferir token en blockchain
            await self.blockchain.transfer_tokens(
                from_user=seller_id,
                to_user=buyer_id,
                amount=token.amount,
                token_type=token.token_type,
            )

            # Actualizar propietario del token
            token.user_id = buyer_id

        # Actualizar balances de tokens
        self.user_token_balances[seller_id] -= len(tokens_to_transfer)
        self.user_token_balances[buyer_id] = self.user_token_balances.get(
            buyer_id, 0
        ) + len(tokens_to_transfer)

        # Actualizar estado de la lista
        listing["status"] = "completed"
        listing["buyer_id"] = buyer_id
        listing["completed_at"] = datetime.now()

        return {
            "transaction_id": str(uuid.uuid4()),
            "listing": listing,
            "tokens_transferred": len(tokens_to_transfer),
        }

    def get_user_token_balance(self, user_id: str) -> int:
        """
        Obtener balance de tokens de un usuario

        Args:
            user_id: ID del usuario

        Returns:
            Número de tokens del usuario
        """
        return self.user_token_balances.get(user_id, 0)

    def get_token_marketplace_listings(self) -> List[Dict[str, Any]]:
        """
        Obtener todas las listas activas en el marketplace

        Returns:
            Lista de listas de tokens activas
        """
        return [
            listing
            for listing in self.token_marketplace.values()
            if listing["status"] == "active"
        ]


async def main():
    """Demostración del sistema de tokens Sheily"""

    # Inicializar sistema de tokens
    token_system = AdvancedSheilyTokenSystem()

    # Simular generación de tokens para una sesión de entrenamiento
    training_tokens = await token_system.generate_tokens_for_training_session(
        session_id="training_session_001",
        user_id="user123",
        quality_score=0.85,
        domain="machine_learning",
    )

    print("Tokens generados para sesión de entrenamiento:")
    for token in training_tokens:
        print(f"- Token ID: {token.id}, Estado: {token.validation_status}")

    # Simular generación de tokens por calidad de respuesta
    response_tokens = await token_system.generate_tokens_for_response(
        user_id="user123", response_quality=0.9, response_length=500
    )

    print("\nTokens generados por calidad de respuesta:")
    for token in response_tokens:
        print(f"- Token ID: {token.id}, Estado: {token.validation_status}")

    # Simular staking de tokens
    token_ids = [token.id for token in training_tokens]
    staking_result = await token_system.stake_tokens(
        user_id="user123", token_ids=token_ids, pool_name="basic"
    )

    print("\nStaking de tokens:")
    print(f"- Pool: {staking_result['pool_name']}")
    print(f"- Tokens en stake: {len(staking_result['tokens'])}")
    print(f"- Fecha de fin: {staking_result['end_date']}")

    # Simular creación de lista en marketplace
    marketplace_listing = await token_system.create_marketplace_listing(
        user_id="user123",
        token_ids=token_ids[:2],  # Vender los primeros 2 tokens
        price_per_token=0.5,
    )

    print("\nLista en marketplace:")
    print(f"- ID de lista: {marketplace_listing['id']}")
    print(f"- Tokens en venta: {marketplace_listing['total_tokens']}")
    print(f"- Precio total: {marketplace_listing['total_price']}")

    # Simular compra de tokens
    purchase_result = await token_system.purchase_tokens(
        buyer_id="user456", listing_id=marketplace_listing["id"]
    )

    print("\nCompra de tokens:")
    print(f"- ID de transacción: {purchase_result['transaction_id']}")
    print(f"- Tokens transferidos: {purchase_result['tokens_transferred']}")

    # Mostrar balance de tokens
    print("\nBalance de tokens:")
    print(f"- Usuario 123: {token_system.get_user_token_balance('user123')}")
    print(f"- Usuario 456: {token_system.get_user_token_balance('user456')}")


if __name__ == "__main__":
    asyncio.run(main())
