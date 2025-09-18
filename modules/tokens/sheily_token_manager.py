import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from modules.tokens.advanced_sheily_token_system import (
    AdvancedSheilyTokenSystem,
    SheilyToken,
    SheilyTokenConfig,
)
from evaluation.quality_metrics_advanced import AdvancedQualityMetricsEvaluator
from modules.core.continuous_improvement import ContinuousImprovement
from modules.tokens.solana_blockchain import SolanaBlockchainReal


class SheilyTokenManager:
    """
    Gestor centralizado de tokens Sheily para el sistema NeuroFusion

    Características principales:
    - Gestión unificada de tokens
    - Integración con sistemas de evaluación y mejora continua
    - Soporte para múltiples dominios y tipos de contribución
    - Gestión de marketplace y staking
    """

    def __init__(
        self,
        quality_evaluator: Optional[AdvancedQualityMetricsEvaluator] = None,
        continuous_improvement: Optional[ContinuousImprovement] = None,
        blockchain_system: Optional[SolanaBlockchainReal] = None,
        token_config: Optional[SheilyTokenConfig] = None,
    ):
        """
        Inicializar gestor de tokens Sheily

        Args:
            quality_evaluator: Sistema de evaluación de calidad
            continuous_improvement: Sistema de mejora continua
            blockchain_system: Sistema de blockchain
            token_config: Configuración de tokens
        """
        self.logger = logging.getLogger(__name__)

        # Sistemas de soporte
        self.quality_evaluator = quality_evaluator or AdvancedQualityMetricsEvaluator()
        self.continuous_improvement = continuous_improvement or ContinuousImprovement()

        # Sistema de tokens avanzado
        self.token_system = AdvancedSheilyTokenSystem(
            config=token_config or SheilyTokenConfig(),
            quality_evaluator=self.quality_evaluator,
            continuous_improvement=self.continuous_improvement,
            blockchain_system=blockchain_system or SolanaBlockchainReal(),
        )

        # Registro de contribuciones por dominio
        self.domain_contributions: Dict[str, List[Dict[str, Any]]] = {}

        # Registro de usuarios y sus contribuciones
        self.user_contributions: Dict[str, List[Dict[str, Any]]] = {}

    async def generate_tokens_for_training(
        self,
        user_id: str,
        session_id: str,
        quality_score: float,
        domain: Optional[str] = None,
    ) -> List[SheilyToken]:
        """
        Generar tokens para una sesión de entrenamiento

        Args:
            user_id: ID del usuario
            session_id: ID de la sesión
            quality_score: Puntuación de calidad
            domain: Dominio de entrenamiento

        Returns:
            Lista de tokens generados
        """
        tokens = await self.token_system.generate_tokens_for_training_session(
            session_id=session_id,
            user_id=user_id,
            quality_score=quality_score,
            domain=domain,
        )

        # Registrar contribución
        contribution_record = {
            "type": "training",
            "session_id": session_id,
            "tokens": [token.id for token in tokens],
            "quality_score": quality_score,
            "domain": domain,
            "timestamp": datetime.now(),
        }

        # Actualizar registros de contribuciones
        if domain:
            self.domain_contributions.setdefault(domain, []).append(contribution_record)

        self.user_contributions.setdefault(user_id, []).append(contribution_record)

        return tokens

    async def generate_tokens_for_response(
        self, user_id: str, response_quality: float, response_length: int
    ) -> List[SheilyToken]:
        """
        Generar tokens por calidad de respuesta

        Args:
            user_id: ID del usuario
            response_quality: Puntuación de calidad de respuesta
            response_length: Longitud de la respuesta

        Returns:
            Lista de tokens generados
        """
        tokens = await self.token_system.generate_tokens_for_response(
            user_id=user_id,
            response_quality=response_quality,
            response_length=response_length,
        )

        # Registrar contribución
        contribution_record = {
            "type": "response",
            "tokens": [token.id for token in tokens],
            "quality_score": response_quality,
            "response_length": response_length,
            "timestamp": datetime.now(),
        }

        self.user_contributions.setdefault(user_id, []).append(contribution_record)

        return tokens

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
        return await self.token_system.stake_tokens(
            user_id=user_id, token_ids=token_ids, pool_name=pool_name
        )

    async def create_marketplace_listing(
        self, user_id: str, token_ids: List[str], price_per_token: float
    ) -> Dict[str, Any]:
        """
        Crear lista de tokens en marketplace

        Args:
            user_id: ID del usuario vendedor
            token_ids: Lista de IDs de tokens a vender
            price_per_token: Precio por token

        Returns:
            Información de la lista en marketplace
        """
        return await self.token_system.create_marketplace_listing(
            user_id=user_id, token_ids=token_ids, price_per_token=price_per_token
        )

    async def purchase_tokens(self, buyer_id: str, listing_id: str) -> Dict[str, Any]:
        """
        Comprar tokens de una lista en marketplace

        Args:
            buyer_id: ID del comprador
            listing_id: ID de la lista de tokens

        Returns:
            Información de la transacción
        """
        return await self.token_system.purchase_tokens(
            buyer_id=buyer_id, listing_id=listing_id
        )

    def get_user_token_balance(self, user_id: str) -> int:
        """
        Obtener balance de tokens de un usuario

        Args:
            user_id: ID del usuario

        Returns:
            Número de tokens del usuario
        """
        return self.token_system.get_user_token_balance(user_id)

    def get_user_contributions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtener contribuciones de un usuario

        Args:
            user_id: ID del usuario

        Returns:
            Lista de contribuciones del usuario
        """
        return self.user_contributions.get(user_id, [])

    def get_domain_contributions(self, domain: str) -> List[Dict[str, Any]]:
        """
        Obtener contribuciones por dominio

        Args:
            domain: Dominio de contribución

        Returns:
            Lista de contribuciones en el dominio
        """
        return self.domain_contributions.get(domain, [])

    def get_top_contributors(
        self, domain: Optional[str] = None, top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Obtener los mejores contribuidores

        Args:
            domain: Dominio específico (opcional)
            top_n: Número de contribuidores a retornar

        Returns:
            Lista de mejores contribuidores
        """
        # Calcular contribuciones por usuario
        user_scores = {}

        if domain:
            contributions = self.domain_contributions.get(domain, [])
        else:
            contributions = [
                contrib
                for domain_contribs in self.domain_contributions.values()
                for contrib in domain_contribs
            ]

        for contrib in contributions:
            for token_id in contrib.get("tokens", []):
                token = self.token_system.token_store.get(token_id)
                if token:
                    user_scores[token.user_id] = (
                        user_scores.get(token.user_id, 0) + token.amount
                    )

        # Ordenar y retornar top contribuidores
        top_contributors = sorted(
            [
                {"user_id": user_id, "total_tokens": score}
                for user_id, score in user_scores.items()
            ],
            key=lambda x: x["total_tokens"],
            reverse=True,
        )[:top_n]

        return top_contributors


async def main():
    """Demostración del sistema de gestión de tokens Sheily"""

    # Inicializar gestor de tokens
    token_manager = SheilyTokenManager()

    # Simular generación de tokens para sesión de entrenamiento
    training_tokens = await token_manager.generate_tokens_for_training(
        user_id="user123",
        session_id="training_session_001",
        quality_score=0.85,
        domain="machine_learning",
    )

    print("Tokens generados para sesión de entrenamiento:")
    for token in training_tokens:
        print(f"- Token ID: {token.id}, Estado: {token.validation_status}")

    # Simular generación de tokens por calidad de respuesta
    response_tokens = await token_manager.generate_tokens_for_response(
        user_id="user123", response_quality=0.9, response_length=500
    )

    print("\nTokens generados por calidad de respuesta:")
    for token in response_tokens:
        print(f"- Token ID: {token.id}, Estado: {token.validation_status}")

    # Simular staking de tokens
    token_ids = [token.id for token in training_tokens]
    staking_result = await token_manager.stake_tokens(
        user_id="user123", token_ids=token_ids, pool_name="basic"
    )

    print("\nStaking de tokens:")
    print(f"- Pool: {staking_result['pool_name']}")
    print(f"- Tokens en stake: {len(staking_result['tokens'])}")
    print(f"- Fecha de fin: {staking_result['end_date']}")

    # Simular creación de lista en marketplace
    marketplace_listing = await token_manager.create_marketplace_listing(
        user_id="user123",
        token_ids=token_ids[:2],  # Vender los primeros 2 tokens
        price_per_token=0.5,
    )

    print("\nLista en marketplace:")
    print(f"- ID de lista: {marketplace_listing['id']}")
    print(f"- Tokens en venta: {marketplace_listing['total_tokens']}")
    print(f"- Precio total: {marketplace_listing['total_price']}")

    # Simular compra de tokens
    purchase_result = await token_manager.purchase_tokens(
        buyer_id="user456", listing_id=marketplace_listing["id"]
    )

    print("\nCompra de tokens:")
    print(f"- ID de transacción: {purchase_result['transaction_id']}")
    print(f"- Tokens transferidos: {purchase_result['tokens_transferred']}")

    # Mostrar balance de tokens
    print("\nBalance de tokens:")
    print(f"- Usuario 123: {token_manager.get_user_token_balance('user123')}")
    print(f"- Usuario 456: {token_manager.get_user_token_balance('user456')}")

    # Mostrar contribuciones de usuario
    print("\nContribuciones de usuario:")
    user_contributions = token_manager.get_user_contributions("user123")
    for contrib in user_contributions:
        print(
            f"- Tipo: {contrib['type']}, Dominio: {contrib.get('domain', 'N/A')}, Tokens: {len(contrib['tokens'])}"
        )

    # Mostrar mejores contribuidores
    print("\nMejores contribuidores en Machine Learning:")
    top_contributors = token_manager.get_top_contributors(domain="machine_learning")
    for contrib in top_contributors:
        print(f"- Usuario: {contrib['user_id']}, Tokens: {contrib['total_tokens']}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
