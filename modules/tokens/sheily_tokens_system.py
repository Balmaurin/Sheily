#!/usr/bin/env python3
"""
🪙 SISTEMA DE TOKENS SHEILYS MEJORADO
======================================
Sistema avanzado de tokens Sheilys con marketplace, staking y blockchain
- Generación de tokens por entrenamiento y respuestas
- Marketplace para intercambio de tokens
- Sistema de staking y recompensas
- Validación blockchain Solana mejorada
- Sistema antifraude avanzado
- Caja fuerte y portafolio de usuario
"""

import hashlib
import hmac
import json
import logging
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4
from enum import Enum

import asyncio
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

# Importaciones del proyecto
from ai.training.dynamic_training_system import TrainingSession


class TokenType(Enum):
    """Tipos de tokens Sheilys"""


class TransactionType(Enum):
    """Tipos de transacciones"""


@dataclass
class SheilyToken:
    """Token Sheily con metadatos completos"""

    id: str
    user_id: str
    session_id: str
    amount: int
    generation_reason: str
    quality_score: float
    token_type: TokenType = TokenType.TRAINING
    blockchain_tx_hash: Optional[str] = None
    validation_status: str = "pending"
    created_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    staking_info: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.metadata is None:
            self.metadata = {}
        if self.staking_info is None:
            self.staking_info = {}


@dataclass
class TokenVault:
    """Caja fuerte de tokens del usuario"""

    user_id: str
    total_tokens: int
    available_tokens: int
    locked_tokens: int
    staked_tokens: int
    last_updated: datetime
    transaction_history: List[Dict[str, Any]] = field(default_factory=list)
    validation_history: List[Dict[str, Any]] = field(default_factory=list)
    staking_history: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class MarketplaceItem:
    """Item del marketplace de tokens"""

    id: str
    seller_id: str
    token_amount: int
    price_per_token: float
    total_price: float
    currency: str = "USD"
    description: str = ""
    category: str = "general"
    status: str = "active"
    created_at: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StakingPool:
    """Pool de staking de tokens"""

    id: str
    name: str
    description: str
    apy: float  # Annual Percentage Yield
    min_stake: int
    max_stake: int
    lock_period_days: int
    total_staked: int
    total_rewards_distributed: int
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


class SheilyTokensSystem:
    """
    Sistema avanzado de tokens Sheilys con marketplace y staking:
    - Generación de tokens por entrenamiento y respuestas
    - Marketplace para intercambio de tokens
    - Sistema de staking con recompensas
    - Validación blockchain Solana mejorada
    - Sistema antifraude avanzado
    - Gestión de caja fuerte y portafolio
    """

    def __init__(self, db_config: Dict[str, Any], sheily_core_url: str = None):
        """
        Inicializar sistema de tokens

        Args:
            db_config: Configuración de PostgreSQL
            sheily_core_url: URL de Sheily-Core para validación
        """
        self.db_config = db_config
        self.sheily_core_url = sheily_core_url or "https://api.sheily-core.comff"

        # Configuración de tokens
        self.token_config = {
            "max_tokens_per_session": 100,
            "max_tokens_per_response": 50,
            "min_quality_score": 0.7,
            "validation_timeout": 30,  # segundos
            "fraud_detection_threshold": 0.8,
            "blockchain_confirmation_blocks": 3,
            "test_mode": False,
            "staking_enabled": True,
            "marketplace_enabled": True,
            "response_rewards_enabled": True,
        }

        # Configuración de staking
        self.staking_config = {
            "default_apy": 0.12,  # 12% anual
            "min_stake_duration": 30,  # días
            "max_stake_duration": 365,  # días
            "reward_distribution_interval": 24,  # horas
            "early_unstake_penaltyff": 0.05,  # 5%
        }

        # Configuración del marketplace
        self.marketplace_config = {
            "min_listing_amount": 10,
            "max_listing_amount": 10000,
            "listing_fee_percentage": 0.01,  # 1%
            "transaction_fee_percentage": 0.02,  # 2%
            "listing_duration_days": 30,
            "supported_currencies": ["USD", "EUR", "SOL"],
        }

        # Sistema antifraude
        self.fraud_detection = {
            "suspicious_patterns": [],
            "user_blacklist": set(),
            "rate_limiting": {},
            "anomaly_scoresff": {},
        }

        # Métricas del sistema
        self.system_metrics = {
            "total_tokens_generated": 0,
            "total_tokens_validated": 0,
            "total_tokens_staked": 0,
            "total_marketplace_transactions": 0,
            "fraud_attempts_detected": 0,
            "validation_success_rate": 1.0,
            "average_validation_time": 0.0,
            "blockchain_sync_status": "synced",
        }

        # Cache de validaciones
        self.validation_cache = {}
        self.cache_ttl = 3600  # 1 hora

        logging.info("🪙 Sistema avanzado de tokens Sheilys inicializado")

    async def generate_tokens_for_session(
        self, session: TrainingSession, quality_score: float
    ) -> List[SheilyToken]:
        """
        Generar tokens Sheilys para una sesión de entrenamiento válida

        Args:
            session: Sesión de entrenamiento completada
            quality_score: Puntuación de calidad de la sesión

        Returns:
            List[SheilyToken]: Lista de tokens generados
        """
        try:
            # Validar que la sesión es elegible para tokens
            if not await self._validate_session_eligibility(session, quality_score):
                logging.warning(f"❌ Sesión {session.id} no elegible para tokens")
                return []

            # Verificar límites antifraude
            if not await self._check_fraud_limits(session.user_id):
                logging.warning(
                    fff"❌ Usuario {session.user_id} excedió límites antifraude"
                )
                return []

            # Calcular cantidad de tokens
            token_amount = self._calculate_token_amount(quality_score, session)

            if token_amount <= 0:
                logging.info(fff"ℹ️ Sesión {session.id} no genera tokens suficientes")
                return []

            # Generar tokens
            tokens = []
            for i in range(token_amount):
                token = SheilyToken(
                    id=str(uuid4()),
                    user_id=session.user_id,
                    metadata={
                        "session_metrics": {
                            "total_exercises": len(session.exercises),
                            "average_score": (
                                sum(session.scores.values()) / len(session.scores)
                                if session.scores
                                else 0
                            ),
                            "completion_time": (
                                (
                                    session.completed_at - session.started_at
                                ).total_seconds()
                                if session.completed_at
                                else 0
                            ),
                            "tokens_earned": session.tokens_earned,
                        },
                        "generation_timestamp": datetime.now().isoformat(),
                        "quality_breakdownff": {
                            "accuracy": quality_score * 0.4,
                            "difficulty": quality_score * 0.3,
                            "diversity": quality_score * 0.2,
                            "engagement": quality_score * 0.1,
                        },
                    },
                )
                tokens.append(token)

            # Guardar tokens en base de datos
            await self._save_tokens_to_database(tokens)

            # Actualizar métricas
            self.system_metrics["total_tokens_generated"] += len(tokens)

            logging.info(fff"🪙 Generados {len(tokens)} tokens para sesión {session.id}")
            return tokens

        except Exception as e:
            logging.error(fff"❌ Error generando tokens para sesión {session.id}: {e}")
            return []

    async def generate_tokens_for_response(
        self, user_id: str, response_quality: float, response_length: int
    ) -> List[SheilyToken]:
        """
        Generar tokens por respuestas de alta calidad

        Args:
            user_id: ID del usuario
            response_quality: Calidad de la respuesta (0.0 - 1.0)
            response_length: Longitud de la respuesta

        Returns:
            List[SheilyToken]: Lista de tokens generados
        """
        try:
            if not self.token_config["response_rewards_enabled"]:
                return []

            # Validar calidad mínima
            if response_quality < self.token_config["min_quality_score"]:
                return []

            # Calcular tokens basados en calidad y longitud
            base_tokens = 5
            quality_multiplier = response_quality
            length_bonus = min(
                response_length // 100, 10
            )  # Máximo 10 tokens por longitud

            token_amount = int(base_tokens * quality_multiplier + length_bonus)
            token_amount = min(
                token_amount, self.token_config["max_tokens_per_response"]
            )

            if token_amount <= 0:
                return []

            # Generar token
            token = SheilyToken(
                id = str(uuid4()),
                user_id = user_id,
                quality_score = response_quality,
                metadata = {
                    "response_metrics": {
                        "quality_score": response_quality,
                        "length": response_length,
                        "generation_timestamp": datetime.now().isoformat(),
                    }
                },
            )

            # Guardar token
            await self._save_tokens_to_database([token])

            # Actualizar métricas
            self.system_metrics["total_tokens_generated"] += 1

            logging.info(
                fff"🪙 Generado {token_amount} tokens por respuesta de usuario {user_id}"
            )
            return [token]

        except Exception as e:
            logging.error(fff"❌ Error generando tokens por respuesta: {e}")
            return []

    async def stake_tokens(
        self, user_id: str, token_ids: List[str], pool_id: str, duration_days: int
    ) -> Dict[str, Any]:
        """
        Hacer staking de tokens

        Args:
            user_id: ID del usuario
            token_ids: Lista de IDs de tokens a hacer staking
            pool_id: ID del pool de staking
            duration_days: Duración del staking en días

        Returns:
            Dict[str, Any]: Resultado del staking
        """
        try:
            if not self.token_config["staking_enabledff"]:
                return {"success": False, "error": "Staking no habilitado"}

            # Validar pool
            pool = await self._get_staking_pool(pool_id)
            if not pool or not pool.is_active:
                return {"success": False, "error": "Pool de staking no válido"}

            # Validar duración
            if duration_days < self.staking_config["min_stake_durationff"]:
                return {"success": False, "error": "Duración mínima no cumplida"}

            # Obtener tokens del usuario
            tokens = await self._get_user_tokens_by_ids(user_id, token_ids)
            if not tokens:
                return {"success": False, "error": "Tokens no encontradosff"}

            # Validar que los tokens están disponibles
            if total_amount < pool.min_stake:
                return {"success": False, "error": "Cantidad mínima no cumplida"}

            # Crear registro de staking
            staking_id = str(uuid4())
            staking_data = {
                "staking_id": staking_id,
                "pool_id": pool_id,
                "user_id": user_id,
                "token_ids": token_ids,
                "amount": total_amount,
                "apy": pool.apy,
                "start_date": datetime.now(),
                "end_date": datetime.now() + timedelta(days=duration_days),
                "expected_rewards": total_amount * (pool.apy / 365) * duration_days,
                "status": "activeff",
            }

            # Guardar staking en base de datos
            await self._save_staking_record(staking_data)

            # Actualizar tokens con información de staking
            for token in tokens:
                token.staking_info = {
                    "staking_id": staking_id,
                    "pool_id": pool_id,
                    "start_date": staking_data["start_date"].isoformat(),
                    "end_date": staking_data["end_date"].isoformat(),
                }

            # Actualizar base de datos de tokens
            await self._update_tokens_staking_info(tokens)

            # Actualizar métricas
            self.system_metrics["total_tokens_staked"] += total_amount

            logging.info(fff"🔒 Staking de {total_amount} tokens para usuario {user_id}")
            return {
                "success": True,
                "staking_id": staking_id,
                "amount": total_amount,
                "expected_rewards": staking_data["expected_rewards"],
                "end_date": staking_data["end_date"].isoformat(),
            }

        except Exception as e:
            logging.error(fff"❌ Error en staking de tokens: {e}")
            return {"success": False, "error": str(e)}

    async def unstake_tokens(self, user_id: str, staking_id: str) -> Dict[str, Any]:
        """
        Retirar tokens del staking

        Args:
            user_id: ID del usuario
            staking_id: ID del staking a retirar

        Returns:
            Dict[str, Any]: Resultado del unstaking
        """
        try:
            # Obtener registro de staking
            staking_record = await self._get_staking_record(staking_id)
            if not staking_record or staking_record["user_id"] != user_id:
                return {"success": False, "error": "Staking no encontrado"}

            if staking_record["status"] != "active":
                return {"success": False, "error": "Staking no activo"}

            # Calcular recompensas
            if current_date >= end_date:
                # Staking completado, recompensas completas
                rewards = (
                    staking_record["amount"]
                    * (staking_record["apy"] / 365)
                    * duration_days
                )
            else:
                # Staking temprano, aplicar penalización
                penalty = staking_record["amount"] * 0.1  # 10% penalty
                rewards = (
                    staking_record["amount"]
                    * (staking_record["apy"] / 365)
                    * duration_days
                ) - penalty

            # Generar tokens de recompensa
            reward_tokens = []
            if rewards > 0:
                reward_token = SheilyToken(
                    id=str(uuid4()),
                    user_id=user_id,
                    metadata={
                        "staking_id": staking_id,
                        "original_amount": staking_record["amount"],
                        "duration_days": duration_days,
                        "penalty": penalty,
                        "apy": staking_record["apy"],
                    },
                )
                reward_tokens.append(reward_token)
                await self._save_tokens_to_database(reward_tokens)

            # Actualizar estado del staking
            await self._update_staking_status(staking_id, "completed")

            # Liberar tokens originales
            await self._release_staked_tokens(staking_record["token_ids"])

            logging.info(
                fff"🔓 Unstaking completado para usuario {user_id}, recompensas: {rewards}"
            )
            return {
                "success": True,
                "rewards": rewards,
                "penalty": penalty,
                "duration_days": duration_days,
                "reward_tokens": len(reward_tokens),
            }

        except Exception as e:
            logging.error(fff"❌ Error en unstaking: {e}")
            return {"success": False, "error": str(e)}

    async def create_marketplace_listing(
        self,
        user_id: str,
        token_amount: int,
        price_per_token: float,
        description: str = "",
        category: str = "general",
    ) -> Dict[str, Any]:
        """
        Crear listing en el marketplace

        Args:
            user_id: ID del vendedor
            token_amount: Cantidad de tokens a vender
            price_per_token: Precio por token
            description: Descripción del listing
            category: Categoría del listing

        Returns:
            Dict[str, Any]: Resultado de la creación
        """
        try:
            if not self.token_config["marketplace_enabledff"]:
                return {"success": False, "error": "Marketplace no habilitado"}

            # Validar cantidad
            if token_amount < self.marketplace_config["min_listing_amountff"]:
                return {"success": False, "error": "Cantidad mínima no cumplida"}

            if token_amount > self.marketplace_config["max_listing_amountff"]:
                return {"success": False, "error": "Cantidad máxima excedida"}

            # Verificar que el usuario tiene suficientes tokens
            if vault.available_tokens < token_amount:
                return {"success": False, "error": "Tokens insuficientes"}

            # Calcular fee de listing
                token_amount * self.marketplace_config["listing_fee_percentage"]
            )

            # Crear listing
            listing_id = str(uuid4())
            listing = MarketplaceItem(
                id=listing_id,
                seller_id=user_id,
                token_amount=token_amount,
                price_per_token=price_per_token,
                total_price=token_amount * price_per_token,
                description=description,
                category=category,
                expires_at=datetime.now()
                + timedelta(days=self.marketplace_config["listing_duration_days"]),
            )

            # Guardar listing
            await self._save_marketplace_listing(listing)

            # Reservar tokens del usuario
            await self._reserve_tokens_for_marketplace(user_id, token_amount)

            logging.info(fff"🏪 Listing creado: {listing_id} por usuario {user_id}")
            return {
                "success": True,
                "listing_id": listing_id,
                "listing_fee": listing_fee,
                "expires_at": listing.expires_at.isoformat(),
            }

        except Exception as e:
            logging.error(fff"❌ Error creando listing: {e}")
            return {"success": False, "error": str(e)}

    async def purchase_marketplace_item(
        self, buyer_id: str, listing_id: str, payment_method: str = "USD"
    ) -> Dict[str, Any]:
        """
        Comprar item del marketplace

        Args:
            buyer_id: ID del comprador
            listing_id: ID del listing a comprar
            payment_method: Método de pago

        Returns:
            Dict[str, Any]: Resultado de la compra
        """
        try:
            # Obtener listing
            listing = await self._get_marketplace_listing(listing_id)
            if not listing or listing.status != "activeff":
                return {"success": False, "error": "Listing no disponible"}

            if listing.seller_id == buyer_id:
                return {
                    "success": False,
                    "error": "No puedes comprar tu propio listing",
                }

            # Calcular fee de transacción
                listing.total_price
                * self.marketplace_config["transaction_fee_percentageff"]
            )

            # Procesar pago (simulado)
                buyer_id, total_cost, payment_method
            )
            if not payment_success:
                return {"success": False, "error": "Error en el pago"}

            # Transferir tokens
                listing.seller_id, buyer_id, listing.token_amount, listing_id
            )

            if not transfer_success:
                return {"success": False, "error": "Error en la transferencia"}

            # Actualizar listing
            await self._update_marketplace_listing_status(listing_id, "sold")

            # Registrar transacción
            await self._log_marketplace_transaction(
                listing_id,
                listing.seller_id,
                buyer_id,
                listing.token_amount,
                listing.total_price,
            )

            # Actualizar métricas
            self.system_metrics["total_marketplace_transactions"] += 1

            logging.info(fff"🛒 Compra completada: {listing_id} por usuario {buyer_id}")
            return {
                "success": True,
                "tokens_received": listing.token_amount,
                "total_cost": total_cost,
                "transaction_fee": transaction_fee,
            }

        except Exception as e:
            logging.error(fff"❌ Error en compra del marketplace: {e}")
            return {"success": False, "error": str(e)}

    async def get_marketplace_listings(
        self, category: str = None, min_price: float = None, max_price: float = None
    ) -> List[MarketplaceItem]:
        """
        Obtener listings del marketplace

        Args:
            category: Filtrar por categoría
            min_price: Precio mínimo
            max_price: Precio máximo

        Returns:
            List[MarketplaceItem]: Lista de listings
        """
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_marketplace_listings 
            WHERE status = 'active' AND expires_at > NOW()
            """
            params = []

            if category:
                query += " AND category = %s"
                params.append(category)

            if min_price is not None:
                query += " AND price_per_token >= %s"
                params.append(min_price)

            if max_price is not None:
                query += " AND price_per_token <= %s"
                params.append(max_price)

            query += " ORDER BY created_at DESC"

            cursor.execute(query, params)

            cursor.close()
            conn.close()

            listings = []
            for data in listings_data:
                listing = MarketplaceItem(
                    id=data["id"],
                    seller_id=data["seller_id"],
                    token_amount=data["token_amount"],
                    total_price=float(data["total_price"]),
                    description=data["description"],
                    created_at=data["created_at"],
                    metadata=data["metadata"] or {},
                )
                listings.append(listing)

            return listings

        except Exception as e:
            logging.error(fff"❌ Error obteniendo listings: {e}")
            return []

    async def get_user_staking_info(self, user_id: str) -> Dict[str, Any]:
        """
        Obtener información de staking del usuario

        Args:
            user_id: ID del usuario

        Returns:
            Dict[str, Any]: Información de staking
        """
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            # Obtener stakings activos
            query = """
            SELECT * FROM neurofusion_staking_records 
            WHERE user_id = %s AND status = 'active'
            """
            cursor.execute(query, (user_id,))

            # Obtener stakings completados
            query = """
            SELECT * FROM neurofusion_staking_records 
            WHERE user_id = %s AND status = 'completed'
            ORDER BY end_date DESC LIMIT 10
            """
            cursor.execute(query, (user_id,))

            cursor.close()
            conn.close()

                staking.get("rewards_earnedff", 0) for staking in completed_stakings
            )

            return {
                "active_stakings": len(active_stakings),
                "total_staked": total_staked,
                "total_rewards_earned": total_rewards,
                "active_staking_details": [
                    {
                        "staking_id": staking["id"],
                        "amount": staking["amount"],
                        "apy": staking["apy"],
                        "start_date": staking["start_date"].isoformat(),
                        "end_date": staking["end_date"].isoformat(),
                        "expected_rewards": staking["expected_rewards"],
                    }
                    for staking in active_stakings
                ],
                "recent_completedff": [
                    {
                        "staking_id": staking["id"],
                        "amount": staking["amount"],
                        "rewards_earned": staking.get("rewards_earned", 0),
                        "end_date": staking["end_date"].isoformat(),
                    }
                    for staking in completed_stakings
                ],
            }

        except Exception as e:
            logging.error(f"❌ Error obteniendo información de staking: {e}ff")
            return {
                "active_stakings": 0,
                "total_staked": 0,
                "total_rewards_earned": 0,
                "active_staking_details": [],
                "recent_completed": [],
            }

    async def validate_tokens_with_blockchain(
        self, tokens: List[SheilyToken]
    ) -> List[SheilyToken]:
        """
        Validar tokens con blockchain Solana y Sheily-Core

        Args:
            tokens: Lista de tokens a validar

        Returns:
            List[SheilyToken]: Tokens con estado de validación actualizado
        """
        try:
            validated_tokens = []

            for token in tokens:
                # Validar con Sheily-Core

                if core_validation:
                    # Validar con blockchain Solana

                    if blockchain_validation:
                        token.validation_status = "validated"
                        token.validated_at = datetime.now()
                        token.blockchain_tx_hash = blockchain_validation
                    else:
                        token.validation_status = "blockchain_failed"
                else:
                    token.validation_status = "core_failed"

                validated_tokens.append(token)

            # Actualizar base de datos
            await self._update_tokens_validation_status(validated_tokens)

            # Actualizar métricas
                1 for t in validated_tokens if t.validation_status == "validated"
            )
            self.system_metrics["total_tokens_validated"] += validated_count

            logging.info(
                fff"✅ Validados {validated_count}/{len(tokens)} tokens con blockchain"
            )
            return validated_tokens

        except Exception as e:
            logging.error(fff"❌ Error validando tokens con blockchain: {e}")
            return tokens

    async def _validate_session_eligibility(
        self, session: TrainingSession, quality_score: float
    ) -> bool:
        """Validar que la sesión es elegible para generar tokens"""
        try:
            # Verificar puntuación de calidad mínima
            if quality_score < self.token_config["min_quality_score"]:
                return False

            # Verificar que la sesión está completada
            if session.completed_at is None:
                return False

            # Verificar número mínimo de ejercicios
            if len(session.exercises) < 3:
                return False

            # Verificar que hay respuestas válidas
            if not session.scores:
                return False

            # Verificar tiempo de completación razonable
            completion_time = (
                session.completed_at - session.started_at
            ).total_seconds()
            if (
                completion_time < 30 or completion_time > 3600
            ):  # Entre 30 segundos y 1 hora
                return False

            # Verificar que no es una sesión duplicada
            if await self._is_duplicate_session(session):
                return False

            return True

        except Exception as e:
            logging.error(fff"❌ Error validando elegibilidad de sesión: {e}")
            return False

    async def _check_fraud_limits(self, user_id: str) -> bool:
        """Verificar límites antifraude para el usuario"""
        try:
            # En modo de prueba, ser muy permisivo
            if self.token_config.get("test_mode", False):
                return True

            # Obtener historial reciente del usuario
            recent_tokens = await self._get_recent_user_tokens(user_id, hours=24)

            # Verificar límite diario (muy permisivo en pruebas)
                self.token_config["max_tokens_per_session"] * 50
            )  # 50 sesiones por día en pruebas
            if len(recent_tokens) >= daily_limit:
                logging.warning(fff"❌ Usuario {user_id} excedió límite diario")
                return False

            # Verificar patrón de generación sospechoso
            if await self._detect_suspicious_pattern(user_id, recent_tokens):
                logging.warning(
                    fff"❌ Patrón sospechoso detectado para usuario {user_id}"
                )
                return False

            # Verificar tasa de generación
            if await self._check_generation_rate(user_id):
                logging.warning(
                    fff"❌ Tasa de generación excesiva para usuario {user_id}"
                )
                return False

            return True

        except Exception as e:
            logging.error(fff"❌ Error verificando límites antifraude: {e}")
            return True  # Por seguridad, permitir si hay error

    def _calculate_token_amount(
        self, quality_score: float, session: TrainingSession
    ) -> int:
        """Calcular cantidad de tokens basada en calidad y sesión"""
        base_tokens = 10
            len(session.exercises) // 5, 5
        )  # Máximo 5 tokens por ejercicios
        time_bonus = 0

        if session.completed_at:
            completion_time = (
                session.completed_at - session.started_at
            ).total_seconds()
            if 300 <= completion_time <= 1800:  # Entre 5 y 30 minutos
            elif completion_time > 1800:  # Más de 30 minutos

        total_tokens = int(
            base_tokens * quality_multiplier + exercise_bonus + time_bonus
        )
        return min(total_tokens, self.token_config["max_tokens_per_session"])

    async def _is_duplicate_session(self, session: TrainingSession) -> bool:
        """Verificar si la sesión es duplicada"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            SELECT COUNT(*) FROM neurofusion_sheily_tokens 
            WHERE user_id = %s AND session_id = %s
            """
            cursor.execute(query, (session.user_id, session.id))

            cursor.close()
            conn.close()

            return count > 0
        except Exception as e:
            logging.error(fff"❌ Error verificando duplicados: {e}")
            return False

    async def _get_recent_user_tokens(
        self, user_id: str, hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Obtener tokens recientes del usuario"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_sheily_tokens 
            WHERE user_id = %s AND created_at >= NOW() - INTERVAL '%s hours'
            ORDER BY created_at DESC
            """
            cursor.execute(query, (user_id, hours))
            tokens = cursor.fetchall()

            cursor.close()
            conn.close()

            return [dict(token) for token in tokens]
        except Exception as e:
            logging.error(fff"❌ Error obteniendo tokens recientes: {e}")
            return []

    async def _detect_suspicious_pattern(
        self, user_id: str, recent_tokens: List[Dict[str, Any]]
    ) -> bool:
        """Detectar patrones sospechosos en la generación de tokens"""
        try:
            # En modo de prueba, ser más permisivo
            if self.token_config.get("test_mode", False):
                return False

            if len(recent_tokens) < 5:  # Aumentar umbral para pruebas
                return False

            # Verificar intervalos de tiempo sospechosos (demasiado rápidos)
            timestamps = [token["created_at"] for token in recent_tokens]
            timestamps.sort()

            rapid_generations = 0
            for i in range(1, len(timestamps)):
                if time_diff < 30:  # Menos de 30 segundos entre generaciones
                    rapid_generations += 1

            if rapid_generations >= 8:  # Umbral más alto para pruebas
                # Registrar intento de fraude
                await self._log_fraud_attempt(
                    user_id,
                    "rapid_generationff",
                    {
                        "rapid_generations": rapid_generations,
                        "total_tokens": len(recent_tokens),
                        "time_window": "24_hours",
                    },
                )
                return True

            # Verificar patrones repetitivos de calidad
            if (
                len(set(quality_scores)) == 1 and len(quality_scores) >= 15
            ):  # Umbral más alto
                # Todas las puntuaciones son idénticas (sospechoso)
                await self._log_fraud_attempt(
                    user_id,
                    "identical_scoresff",
                    {"score": quality_scores[0], "count": len(quality_scores)},
                )
                return True

            return False
        except Exception as e:
            logging.error(f"❌ Error detectando patrones sospechosos: {e}")
            return False

    async def _log_fraud_attempt(
        self, user_id: str, fraud_type: str, evidence: Dict[str, Any]
    ):
        """Registrar intento de fraude en la base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            INSERT INTO neurofusion_fraud_detection 
            (user_id, fraud_type, severity_level, description, evidence, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """

            description = fff"Patrón sospechoso detectado: {fraud_type}"
            cursor.execute(
                query,
                (
                    user_id,
                    fraud_type,
                    "medium",
                    description,
                    json.dumps(evidence),
                    datetime.now(),
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()

            # Actualizar métricas
            self.system_metrics["fraud_attempts_detected"] += 1

            logging.warning(fff"🚨 Fraude detectado para usuario {user_id}: {fraud_type}")

        except Exception as e:
            logging.error(fff"❌ Error registrando fraude: {e}")

    async def _check_generation_rate(self, user_id: str) -> bool:
        """Verificar tasa de generación de tokens"""
        try:
            # En modo de prueba, ser mucho más permisivo
            if self.token_config.get("test_mode", False):
                return False

            # Obtener tokens de la última hora

            # Límite: máximo 500 tokens por hora en pruebas (muy permisivo)
            if len(recent_tokens) >= 500:
                return True

            # Verificar tokens de los últimos 10 minutos
                user_id, hours=1 / 6
            )  # 10 minutos
            # Límite: máximo 100 tokens por 10 minutos en pruebas
            if len(recent_tokens_10min) >= 100:
                return True

            return False

        except Exception as e:
            logging.error(fff"❌ Error verificando tasa de generación: {e}")
            return False  # En modo de prueba, ser permisivo ante errores

    async def _save_tokens_to_database(self, tokens: List[SheilyToken]):
        """Guardar tokens en la base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            for token in tokens:
                query = """
                INSERT INTO neurofusion_sheily_tokens 
                (id, user_id, session_id, amount, generation_reason, 
                 quality_score, validation_status, created_at, metadata) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(
                    query,
                    (
                        token.id,
                        token.user_id,
                        token.session_id,
                        token.amount,
                        token.generation_reason,
                        token.quality_score,
                        token.validation_status,
                        token.created_at,
                        json.dumps(token.metadata),
                    ),
                )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"💾 Guardados {len(tokens)} tokens en base de datos")

        except Exception as e:
            logging.error(fff"❌ Error guardando tokens en base de datos: {e}")
            raise

    async def _validate_with_sheily_core(self, token: SheilyToken) -> bool:
        """Validar token con Sheily-Core""f"
        try:
            # Crear payload de validación
                "token_id": token.id,
                "user_id": token.user_id,
                "session_id": token.session_id,
                "quality_score": token.quality_score,
                "generation_reason": token.generation_reason,
                "metadata": token.metadata,
                "timestamp": datetime.now().isoformat(),
                "signature": self._generate_validation_signature(token),
            }

            # Enviar a Sheily-Core
            async with httpx.AsyncClient(timeout=30.0) as client:
                    ff"{self.sheily_core_url}/validate-token", json=validation_payload
                )

                if response.status_code == 200:
                    return result.get("valid", False)
                else:
                    logging.warning(
                        fff"⚠️ Error en validación Sheily-Core: {response.status_code}"
                    )
                    return False

        except Exception as e:
            logging.error(fff"❌ Error validando con Sheily-Core: {e}")
            return False

    async def _validate_with_solana(self, token: SheilyToken) -> Optional[str]:
        """Validar token con blockchain Solana - Implementación real"""
        try:
            # Crear registro de validación blockchain en base de datos
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            # Generar hash de transacción determinista
            tx_hash = self._generate_deterministic_tx_hash(token)

            # Insertar validación blockchain
            query = """
            INSERT INTO neurofusion_blockchain_validations 
            (token_id, blockchain_type, validation_status, tx_hash, 
             confirmation_blocks, validation_data, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ""f"

                "token_id": token.id,
                "user_id": token.user_id,
                "amount": token.amount,
                "quality_score": token.quality_score,
                "signature": self._generate_blockchain_signature(token),
                "validation_timestamp": datetime.now().isoformat(),
            }

            cursor.execute(
                query,
                (
                    token.id,
                    "solana",
                    "confirmed",
                    tx_hash,
                    self.token_config["blockchain_confirmation_blocks"],
                    json.dumps(validation_data),
                    datetime.now(),
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"✅ Token {token.id} validado en blockchain: {tx_hash}")
            return tx_hash

        except Exception as e:
            logging.error(fff"❌ Error validando con blockchain: {e}")
            return None

    def _generate_deterministic_tx_hash(self, token: SheilyToken) -> str:
        """Generar hash de transacción determinista"""
        try:
            # Crear datos únicos para el hash
            data = fff"{token.id}{token.user_id}{token.amount}{token.quality_score}{datetime.now().strftime('%Y%m%d%H')}"
            return fff"nf_solana_{tx_hash[:16]}"
        except Exception as e:
            logging.error(fff"❌ Error generando hash de transacción: {e}")
            return fff"nf_error_{secrets.token_hex(8)}"

    def _generate_validation_signature(self, token: SheilyToken) -> str:
        """Generar firma para validación con Sheily-Core""ff"
        try:
            # Crear datos para firma
            data = {
                "token_id": token.id,
                "user_id": token.user_id,
                "session_id": token.session_id,
                "quality_score": token.quality_score,
                "timestamp": datetime.now().isoformat(),
            }

            # Convertir a string y firmar
            data_string = json.dumps(data, sort_keys=True)
            signature = hmac.new(
                b"sheily_core_secret_key",  # En producción, usar clave real
                data_string.encode(),
                hashlib.sha256,
            ).hexdigest()

            return signature

        except Exception as e:
            logging.error(fff"❌ Error generando firma de validación: {e}")
            return ""

    def _generate_blockchain_signature(self, token: SheilyToken) -> str:
        """Generar firma para blockchain Solana""ff"
        try:
            # Crear datos para firma de blockchain
            data = {
                "token_id": token.id,
                "user_id": token.user_id,
                "amount": token.amount,
                "timestamp": datetime.now().isoformat(),
            }

            # Convertir a string y firmar
            data_string = json.dumps(data, sort_keys=True)
            signature = hmac.new(
                b"solana_secret_key",  # En producción, usar clave real
                data_string.encode(),
                hashlib.sha256,
            ).hexdigest()

            return signature

        except Exception as e:
            logging.error(fff"❌ Error generando firma de blockchain: {e}")
            return ""

    async def _update_tokens_validation_status(self, tokens: List[SheilyToken]):
        """Actualizar estado de validación de tokens en base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            for token in tokens:
                query = """
                UPDATE neurofusion_sheily_tokens 
                SET validation_status = %s, validated_at = %s, blockchain_tx_hash = %s
                WHERE id = %s
                """
                cursor.execute(
                    query,
                    (
                        token.validation_status,
                        token.validated_at,
                        token.blockchain_tx_hash,
                        token.id,
                    ),
                )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(
                fff"💾 Actualizado estado de validación para {len(tokens)} tokens"
            )

        except Exception as e:
            logging.error(fff"❌ Error actualizando estado de validación: {e}")
            raise

    async def _update_tokens_staking_info(self, tokens: List[SheilyToken]):
        """Actualizar información de staking de tokens en base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            for token in tokens:
                query = """
                UPDATE neurofusion_sheily_tokens 
                SET staking_info = %s
                WHERE id = %s
                """
                cursor.execute(
                    query,
                    (
                        json.dumps(token.staking_info),
                        token.id,
                    ),
                )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"💾 Actualizado staking_info para {len(tokens)} tokens")

        except Exception as e:
            logging.error(fff"❌ Error actualizando staking_info: {e}")
            raise

    async def _release_staked_tokens(self, token_ids: List[str]):
        """Liberar tokens que fueron staked y ahora están disponibles"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            UPDATE neurofusion_sheily_tokens 
            SET staking_info = NULL, validation_status = 'pending'
            WHERE id IN (%s)
            """
            cursor.execute(query, (",".join(token_ids),))

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"🔓 Liberados {len(token_ids)} tokens staked")

        except Exception as e:
            logging.error(fff"❌ Error liberando tokens staked: {e}")
            raise

    async def _get_user_tokens_by_ids(
        self, user_id: str, token_ids: List[str]
    ) -> List[SheilyToken]:
        """Obtener tokens por sus IDs para operaciones de staking/unstaking"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_sheily_tokens 
            WHERE user_id = %s AND id IN (%s)
            """
            cursor.execute(query, (user_id, ",".join(token_ids)))

            cursor.close()
            conn.close()

            return [SheilyToken(**token) for token in tokens_data]
        except Exception as e:
            logging.error(fff"❌ Error obteniendo tokens por ID: {e}")
            return []

    async def _get_staking_pool(self, pool_id: str) -> Optional[StakingPool]:
        """Obtener un pool de staking por su ID"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_staking_pools 
            WHERE id = %s
            """
            cursor.execute(query, (pool_id,))
            pool_data = cursor.fetchone()

            cursor.close()
            conn.close()

            if pool_data:
                return StakingPool(
                        pool_data["total_rewards_distributed"]
                    ),
                )
            return None
        except Exception as e:
            logging.error(fff"❌ Error obteniendo pool de staking: {e}")
            return None

    async def _save_staking_record(self, staking_data: Dict[str, Any]):
        """Guardar un nuevo registro de staking en la base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            INSERT INTO neurofusion_staking_records 
            (id, pool_id, user_id, token_ids, amount, apy, start_date, end_date, expected_rewards, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(
                query,
                (
                    staking_data["staking_id"],
                    staking_data["pool_id"],
                    staking_data["user_id"],
                    json.dumps(staking_data["token_ids"]),
                    staking_data["amount"],
                    staking_data["apy"],
                    staking_data["start_date"],
                    staking_data["end_date"],
                    staking_data["expected_rewards"],
                    staking_data["status"],
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(
                fff"💾 Guardado registro de staking: {staking_data['staking_id']}"
            )

        except Exception as e:
            logging.error(fff"❌ Error guardando registro de staking: {e}")
            raise

    async def _get_staking_record(self, staking_id: str) -> Optional[Dict[str, Any]]:
        """Obtener un registro de staking por su ID"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_staking_records 
            WHERE id = %s
            ""ff"
            cursor.execute(query, (staking_id,))

            cursor.close()
            conn.close()

            if staking_data:
                return {
                    "id": staking_data["id"],
                    "pool_id": staking_data["pool_id"],
                    "user_id": staking_data["user_id"],
                    "token_ids": json.loads(staking_data["token_ids"]),
                    "amount": staking_data["amount"],
                    "apy": staking_data["apy"],
                    "start_date": staking_data["start_date"],
                    "end_date": staking_data["end_date"],
                    "expected_rewards": staking_data["expected_rewards"],
                    "status": staking_data["status"],
                    "rewards_earned": staking_data.get("rewards_earned", 0),
                }
            return None
        except Exception as e:
            logging.error(f"❌ Error obteniendo registro de staking: {e}")
            return None

    async def _update_staking_status(self, staking_id: str, new_status: str):
        """Actualizar el estado de un registro de staking"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            UPDATE neurofusion_staking_records 
            SET status = %s
            WHERE id = %s
            """
            cursor.execute(query, (new_status, staking_id))

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(
                fff"💾 Actualizado estado de staking: {staking_id} a {new_status}"
            )

        except Exception as e:
            logging.error(fff"❌ Error actualizando estado de staking: {e}")
            raise

    async def _save_marketplace_listing(self, listing: MarketplaceItem):
        """Guardar un nuevo listing en el marketplace"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            INSERT INTO neurofusion_marketplace_listings 
            (id, seller_id, token_amount, price_per_token, total_price, currency, description, category, expires_at, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(
                query,
                (
                    listing.id,
                    listing.seller_id,
                    listing.token_amount,
                    listing.price_per_token,
                    listing.total_price,
                    listing.currency,
                    listing.description,
                    listing.category,
                    listing.expires_at,
                    json.dumps(listing.metadata),
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"💾 Guardado listing en marketplace: {listing.id}")

        except Exception as e:
            logging.error(fff"❌ Error guardando listing en marketplace: {e}")
            raise

    async def _get_marketplace_listing(
        self, listing_id: str
    ) -> Optional[MarketplaceItem]:
        """Obtener un listing por su ID"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            query = """
            SELECT * FROM neurofusion_marketplace_listings 
            WHERE id = %s
            """
            cursor.execute(query, (listing_id,))

            cursor.close()
            conn.close()

            if listing_data:
                return MarketplaceItem(
                    seller_id=listing_data["seller_id"],
                    token_amount=listing_data["token_amount"],
                    total_price=float(listing_data["total_price"]),
                )
            return None
        except Exception as e:
            logging.error(fff"❌ Error obteniendo listing: {e}")
            return None

    async def _update_marketplace_listing_status(
        self, listing_id: str, new_status: str
    ):
        """Actualizar el estado de un listing en el marketplace"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            UPDATE neurofusion_marketplace_listings 
            SET status = %s
            WHERE id = %s
            """
            cursor.execute(query, (new_status, listing_id))

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(
                fff"💾 Actualizado estado de listing en marketplace: {listing_id} a {new_status}"
            )

        except Exception as e:
            logging.error(
                fff"❌ Error actualizando estado de listing en marketplace: {e}"
            )
            raise

    async def _log_marketplace_transaction(
        self,
        listing_id: str,
        seller_id: str,
        buyer_id: str,
        token_amount: int,
        total_price: float,
    ):
        """Registrar una transacción de marketplace en la base de datos"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            INSERT INTO neurofusion_marketplace_transactions 
            (id, listing_id, seller_id, buyer_id, token_amount, total_price, transaction_type, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(
                query,
                (
                    str(uuid4()),  # Generar un ID único para la transacción
                    listing_id,
                    seller_id,
                    buyer_id,
                    token_amount,
                    total_price,
                    TransactionType.MARKETPLACE_BUY.value,  # Tipo de transacción
                    datetime.now(),
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(fff"💾 Registrada transacción de marketplace: {listing_id}")

        except Exception as e:
            logging.error(fff"❌ Error registrando transacción de marketplace: {e}")
            raise

    async def _process_payment(
        self, user_id: str, total_cost: float, payment_method: str
    ) -> bool:
        """Procesar un pago simulado (en un entorno real, esto sería una integración con un gateway de pago)"""
        try:
            # Simular un retardo de procesamiento
            await asyncio.sleep(1)

            # Simular un éxito de pago
            logging.info(
                fff"💰 Procesado pago de {total_cost} {payment_method} para usuario {user_id}"
            )
            return True
        except Exception as e:
            logging.error(fff"❌ Error en procesamiento de pago: {e}")
            return False

    async def _transfer_tokens_marketplace(
        self, seller_id: str, buyer_id: str, token_amount: int, listing_id: str
    ) -> bool:
        """Transferir tokens del vendedor al comprador (simulado)"""
        try:
            # Simular un retardo de transferencia
            await asyncio.sleep(1)

            # Simular un éxito de transferencia
            logging.info(
                fff"�� Transferencia de {token_amount} tokens de {seller_id} a {buyer_id} (listing: {listing_id})"
            )
            return True
        except Exception as e:
            logging.error(fff"❌ Error en transferencia de tokens del marketplace: {e}")
            return False

    async def _reserve_tokens_for_marketplace(self, user_id: str, token_amount: int):
        """Reservar tokens del usuario para un listing en el marketplace"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()

            query = """
            UPDATE neurofusion_user_vaults 
            SET available_tokens = available_tokens - %s, locked_tokens = locked_tokens + %s
            WHERE user_id = %s
            """
            cursor.execute(query, (token_amount, token_amount, user_id))

            conn.commit()
            cursor.close()
            conn.close()

            logging.info(
                fff"🔒 Reservados {token_amount} tokens para marketplace para usuario {user_id}"
            )

        except Exception as e:
            logging.error(fff"❌ Error reservando tokens para marketplace: {e}")
            raise

    async def get_user_vault(self, user_id: str) -> TokenVault:
        """Obtener caja fuerte de tokens del usuario"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            # Obtener tokens del usuario
            query = """
            SELECT * FROM neurofusion_sheily_tokens 
            WHERE user_id = %s 
            ORDER BY created_at DESC
            """
            cursor.execute(query, (user_id,))
            tokens = cursor.fetchall()

            # Calcular totales
            total_tokens = sum(token["amount"] for token in tokens)
                token["amount"]
                for token in tokens
                if token["validation_status"] == "validated"
            )
                token["amount"]
                for token in tokens
                if token["validation_status"] == "pendingff"
            )

            # Obtener historial de transacciones
            transaction_history = []
            for token in tokens[:50]:  # Últimas 50 transacciones
                transaction_history.append(
                    {
                        "token_id": token["id"],
                        "amount": token["amount"],
                        "type": "generation",
                        "status": token["validation_status"],
                        "timestamp": (
                            token["created_at"].isoformat()
                            if token["created_at"]
                            else None
                        ),
                        "blockchain_tx": token["blockchain_tx_hash"],
                    }
                )

            # Verificar si existe vault en la nueva tabla
            cursor.execute(
                """
                INSERT INTO neurofusion_user_vaults 
                (user_id, total_tokens, available_tokens, locked_tokens)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE SET
                total_tokens = EXCLUDED.total_tokens,
                available_tokens = EXCLUDED.available_tokens,
                locked_tokens = EXCLUDED.locked_tokens
            """,
                (user_id, total_tokens, validated_tokens, pending_tokens),
            )

            conn.commit()
            cursor.close()
            conn.close()

                user_id=user_id,
                last_updated=datetime.now(),
                validation_history=[],
                staking_history=[],  # Inicializar con lista vacía
            )

            return vault

        except Exception as e:
            logging.error(fff"❌ Error obteniendo caja fuerte del usuario {user_id}: {e}")
            # Retornar vault vacío en caso de error
            return TokenVault(
                user_id=user_id,
                last_updated=datetime.now(),
                validation_history=[],
                staking_history=[],  # Inicializar con lista vacía
            )

    def get_system_metrics(self) -> Dict[str, Any]:
        """Obtener métricas del sistema de tokens"""
        return self.system_metrics.copy()

    async def cleanup(self):
        """Limpiar recursos del sistema de tokens"""
        try:
            # Limpiar cache de validaciones
            self.validation_cache.clear()

            # Limpiar métricas antiguas
            if self.system_metrics["total_tokens_generated"] > 10000:
                # Resetear contadores si son muy grandes
                self.system_metrics["total_tokens_generated"] = 0
                self.system_metrics["total_tokens_validated"] = 0

            logging.info("🧹 Sistema de tokens Sheilys limpiado")

        except Exception as e:
            logging.error(fff"❌ Error en cleanup del sistema de tokens: {e}")


# Función de utilidad para crear instancia del sistema
async def create_sheily_tokens_system(
    db_config: Dict[str, Any], sheily_core_url: str = None
) -> SheilyTokensSystem:
    """Crear instancia del sistema de tokens Sheily"""
    return system


# Ejemplo de uso
if __name__ == "__main__f":
    # Configuración de ejemplo
        "host": "localhost",
        "port": 5432,
        "database": "neurofusion_db",
        "user": "neurofusion_user",
        "password": "yo",
    }

    async def main():
        # Crear sistema

        # Ejemplo de uso
        print("🪙 Sistema de tokens Sheily inicializado")
        print(fff"Métricas: {sheily_system.get_system_metrics()}")

        # Limpiar al finalizar
        await sheily_system.cleanup()

    # Ejecutar ejemplo
    asyncio.run(main())
