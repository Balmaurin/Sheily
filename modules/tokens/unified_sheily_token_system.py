import logging
import uuid
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto

import numpy as np
import torch
import asyncio
import httpx
import psycopg2
from solana.rpc.async_api import AsyncClient
from solana.transaction import Transaction
from solana.publickey import PublicKey

from modules.tokens.solana_blockchain import SolanaBlockchainReal, TokenTransaction, SolanaWallet
from evaluation.quality_metrics_advanced import AdvancedQualityMetricsEvaluator
from modules.core.continuous_improvement import ContinuousImprovement
from modules.core.integration_manager import IntegrationManager

class TokenType(Enum):
    """Tipos de tokens Sheily"""
    TRAINING = auto()
    RESPONSE = auto()
    INNOVATION = auto()
    GOVERNANCE = auto()
    SPECIAL_CONTRIBUTION = auto()
    LEARNING = auto()
    DOMAIN_EXPERTISE = auto()

class TokenStatus(Enum):
    """Estados de un token"""
    PENDING = auto()
    ACTIVE = auto()
    STAKED = auto()
    LOCKED = auto()
    EXPIRED = auto()
    BURNED = auto()

@dataclass
class SheilyTokenConfig:
    """Configuración avanzada de tokens Sheily"""
    base_token_value: float = 1.0
    quality_multiplier: float = 2.0
    max_tokens_per_session: int = 1000
    min_quality_threshold: float = 0.7
    token_expiration_days: int = 90
    blockchain_network: str = "devnet"
    governance_voting_power_threshold: int = 100
    token_types: Dict[TokenType, float] = field(default_factory=lambda: {
        TokenType.TRAINING: 1.0,
        TokenType.RESPONSE: 1.5,
        TokenType.INNOVATION: 2.0,
        TokenType.GOVERNANCE: 3.0,
        TokenType.SPECIAL_CONTRIBUTION: 3.0,
        TokenType.LEARNING: 1.2,
        TokenType.DOMAIN_EXPERTISE: 2.5
    })

@dataclass
class SheilyToken:
    """Token Sheily con metadatos completos y blockchain"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = ""
    session_id: str = ""
    amount: int = 0
    generation_reason: str = "default"
    quality_score: float = 0.0
    token_type: TokenType = TokenType.TRAINING
    blockchain_tx_hash: Optional[str] = None
    validation_status: TokenStatus = TokenStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    validated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    staking_info: Optional[Dict[str, Any]] = None
    blockchain_signature: Optional[str] = None
    domain: Optional[str] = None
    voting_power: float = 0.0

class UnifiedSheilyTokenSystem:
    """
    Sistema unificado de tokens Sheily con arquitectura avanzada
    
    Características principales:
    - Generación de tokens multidominio
    - Sistema de gobernanza con tokens
    - Mecanismo de recompensas multinivel
    - Integración con flujos de trabajo de IA
    - Marketplace avanzado
    - Sistema de staking con múltiples pools
    """
    
    def __init__(
        self, 
        config: Optional[SheilyTokenConfig] = None,
        quality_evaluator: Optional[AdvancedQualityMetricsEvaluator] = None,
        continuous_improvement: Optional[ContinuousImprovement] = None,
        blockchain_system: Optional[SolanaBlockchainReal] = None,
        integration_manager: Optional[IntegrationManager] = None
    ):
        """
        Inicializar sistema unificado de tokens Sheily
        
        Args:
            config: Configuración de tokens
            quality_evaluator: Sistema de evaluación de calidad
            continuous_improvement: Sistema de mejora continua
            blockchain_system: Sistema de blockchain
            integration_manager: Gestor de integración
        """
        self.logger = logging.getLogger(__name__)
        
        # Configuración
        self.config = config or SheilyTokenConfig()
        
        # Componentes
        self.quality_evaluator = quality_evaluator or AdvancedQualityMetricsEvaluator()
        self.continuous_improvement = continuous_improvement or ContinuousImprovement()
        self.blockchain = blockchain_system or SolanaBlockchainReal()
        self.integration_manager = integration_manager or IntegrationManager()
        
        # Almacenamiento de tokens
        self.token_store: Dict[str, SheilyToken] = {}
        self.user_token_balances: Dict[str, int] = {}
        
        # Sistemas de gobernanza
        self.governance_proposals: Dict[str, Dict[str, Any]] = {}
        self.voting_records: Dict[str, List[Dict[str, Any]]] = {}
        
        # Marketplace de tokens
        self.token_marketplace: Dict[str, Dict[str, Any]] = {}
        
        # Pools de staking avanzados
        self.staking_pools: Dict[str, Dict[str, Any]] = {
            "basic": {
                "apy": 0.05,  # 5% anual
                "min_stake": 10,
                "max_stake": 1000,
                "lock_period_days": 30,
                "risk_level": "low"
            },
            "advanced": {
                "apy": 0.1,  # 10% anual
                "min_stake": 100,
                "max_stake": 5000,
                "lock_period_days": 90,
                "risk_level": "medium"
            },
            "expert": {
                "apy": 0.15,  # 15% anual
                "min_stake": 500,
                "max_stake": 10000,
                "lock_period_days": 180,
                "risk_level": "high"
            }
        }
    
    async def generate_tokens_for_workflow(
        self, 
        user_id: str, 
        workflow_type: str, 
        quality_score: float, 
        domain: Optional[str] = None,
        additional_metadata: Optional[Dict[str, Any]] = None
    ) -> List[SheilyToken]:
        """
        Generar tokens para diferentes flujos de trabajo de IA
        
        Args:
            user_id: ID del usuario
            workflow_type: Tipo de flujo de trabajo
            quality_score: Puntuación de calidad
            domain: Dominio específico
            additional_metadata: Metadatos adicionales
        
        Returns:
            Lista de tokens generados
        """
        # Mapear tipos de flujo de trabajo a tipos de tokens
        workflow_token_mapping = {
            "training_session": TokenType.TRAINING,
            "response_generation": TokenType.RESPONSE,
            "innovation_contribution": TokenType.INNOVATION,
            "learning_task": TokenType.LEARNING,
            "domain_expertise": TokenType.DOMAIN_EXPERTISE
        }
        
        token_type = workflow_token_mapping.get(workflow_type, TokenType.TRAINING)
        
        # Calcular cantidad de tokens
        base_tokens = int(
            quality_score * 
            self.config.base_token_value * 
            self.config.token_types.get(token_type, 1.0) * 
            100
        )
        tokens_to_generate = min(base_tokens, self.config.max_tokens_per_session)
        
        tokens = []
        for _ in range(tokens_to_generate):
            token = SheilyToken(
                user_id=user_id,
                token_type=token_type,
                amount=1,
                generation_reason=workflow_type,
                quality_score=quality_score,
                domain=domain,
                metadata=additional_metadata or {}
            )
            
            # Validar y firmar token en blockchain
            await self._validate_and_sign_token(token)
            
            tokens.append(token)
            self.token_store[token.id] = token
        
        # Actualizar balance de usuario
        self.user_token_balances[user_id] = self.user_token_balances.get(user_id, 0) + tokens_to_generate
        
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
            
            # Simular validación con sistema de integración
            validation_result = await self.integration_manager.validate_token(
                token_id=token.id,
                user_id=token.user_id,
                quality_score=token.quality_score,
                token_type=token.token_type.name
            )
            
            # Simular firma blockchain
            transaction = await self.blockchain.transfer_tokens(
                from_user="system", 
                to_user=token.user_id, 
                amount=token.amount, 
                token_type=token.token_type.name
            )
            
            # Actualizar token con información blockchain
            token.blockchain_tx_hash = transaction.transaction_id
            token.blockchain_signature = transaction.signature
            token.validation_status = TokenStatus.ACTIVE
            token.validated_at = datetime.now()
            token.expires_at = datetime.now() + timedelta(days=self.config.token_expiration_days)
            
            # Calcular poder de voto
            token.voting_power = (
                token.quality_score * 
                self.config.token_types.get(token.token_type, 1.0)
            )
            
        except Exception as e:
            self.logger.error(f"Error validando token: {e}")
            token.validation_status = TokenStatus.EXPIRED
    
    async def create_governance_proposal(
        self, 
        proposer_id: str, 
        proposal_type: str, 
        proposal_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Crear propuesta de gobernanza
        
        Args:
            proposer_id: ID del usuario que propone
            proposal_type: Tipo de propuesta
            proposal_details: Detalles de la propuesta
        
        Returns:
            Información de la propuesta
        """
        # Validar poder de voto del usuario
        user_voting_power = self._calculate_user_voting_power(proposer_id)
        
        if user_voting_power < self.config.governance_voting_power_threshold:
            raise ValueError("Poder de voto insuficiente para crear propuesta")
        
        proposal = {
            "id": str(uuid.uuid4()),
            "proposer_id": proposer_id,
            "type": proposal_type,
            "details": proposal_details,
            "created_at": datetime.now(),
            "status": "open",
            "votes": {
                "yes": 0,
                "no": 0
            },
            "voting_power": {
                "yes": 0.0,
                "no": 0.0
            }
        }
        
        self.governance_proposals[proposal['id']] = proposal
        
        return proposal
    
    async def vote_on_proposal(
        self, 
        user_id: str, 
        proposal_id: str, 
        vote: str
    ) -> Dict[str, Any]:
        """
        Votar en una propuesta de gobernanza
        
        Args:
            user_id: ID del usuario que vota
            proposal_id: ID de la propuesta
            vote: Voto ('yes' o 'no')
        
        Returns:
            Resultado de la votación
        """
        # Validar propuesta
        if proposal_id not in self.governance_proposals:
            raise ValueError("Propuesta no encontrada")
        
        proposal = self.governance_proposals[proposal_id]
        
        if proposal['status'] != 'open':
            raise ValueError("La propuesta no está abierta para votación")
        
        # Calcular poder de voto del usuario
        user_voting_power = self._calculate_user_voting_power(user_id)
        
        # Registrar voto
        voting_record = {
            "user_id": user_id,
            "proposal_id": proposal_id,
            "vote": vote,
            "voting_power": user_voting_power,
            "timestamp": datetime.now()
        }
        
        self.voting_records.setdefault(proposal_id, []).append(voting_record)
        
        # Actualizar contadores de votos
        proposal['votes'][vote] += 1
        proposal['voting_power'][vote] += user_voting_power
        
        return voting_record
    
    def _calculate_user_voting_power(self, user_id: str) -> float:
        """
        Calcular poder de voto de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Poder de voto total del usuario
        """
        user_tokens = [
            token for token in self.token_store.values()
            if token.user_id == user_id and 
               token.validation_status == TokenStatus.ACTIVE
        ]
        
        return sum(token.voting_power for token in user_tokens)
    
    async def stake_tokens(
        self, 
        user_id: str, 
        token_ids: List[str], 
        pool_name: str = "basic"
    ) -> Dict[str, Any]:
        """
        Realizar staking de tokens con evaluación de riesgo
        
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
            token for token in self.token_store.values() 
            if token.user_id == user_id and token.id in token_ids
        ]
        
        if not user_tokens:
            raise ValueError("No se encontraron tokens válidos para stake")
        
        # Calcular total de tokens para stake
        total_stake_amount = sum(token.amount for token in user_tokens)
        
        # Validar límites de stake
        if total_stake_amount < pool_config['min_stake']:
            raise ValueError(f"Monto de stake mínimo no alcanzado: {pool_config['min_stake']}")
        
        if total_stake_amount > pool_config['max_stake']:
            raise ValueError(f"Monto de stake máximo excedido: {pool_config['max_stake']}")
        
        # Crear registro de staking con evaluación de riesgo
        staking_record = {
            "user_id": user_id,
            "pool_name": pool_name,
            "tokens": [token.id for token in user_tokens],
            "total_amount": total_stake_amount,
            "apy": pool_config['apy'],
            "risk_level": pool_config['risk_level'],
            "start_date": datetime.now(),
            "end_date": datetime.now() + timedelta(days=pool_config['lock_period_days']),
            "status": "active"
        }
        
        # Marcar tokens como en stake
        for token in user_tokens:
            token.staking_info = staking_record
            token.validation_status = TokenStatus.STAKED
        
        return staking_record

    async def main():
        """Demostración del sistema unificado de tokens Sheily"""
        
        # Inicializar sistema de tokens
        token_system = UnifiedSheilyTokenSystem()
        
        # Simular generación de tokens para diferentes flujos de trabajo
        training_tokens = await token_system.generate_tokens_for_workflow(
            user_id="user123",
            workflow_type="training_session",
            quality_score=0.85,
            domain="machine_learning"
        )
        
        print("Tokens generados para sesión de entrenamiento:")
        for token in training_tokens:
            print(f"- Token ID: {token.id}, Estado: {token.validation_status}")
        
        # Simular creación de propuesta de gobernanza
        governance_proposal = await token_system.create_governance_proposal(
            proposer_id="user123",
            proposal_type="system_upgrade",
            proposal_details={
                "description": "Actualización del modelo de IA",
                "target_version": "2.0.0"
            }
        )
        
        print("\nPropuesta de gobernanza creada:")
        print(f"- ID de propuesta: {governance_proposal['id']}")
        print(f"- Tipo: {governance_proposal['type']}")
        
        # Simular votación en propuesta
        voting_result = await token_system.vote_on_proposal(
            user_id="user123",
            proposal_id=governance_proposal['id'],
            vote="yes"
        )
        
        print("\nVotación en propuesta:")
        print(f"- Resultado: {voting_result['vote']}")
        print(f"- Poder de voto: {voting_result['voting_power']}")
        
        # Simular staking de tokens
        staking_result = await token_system.stake_tokens(
            user_id="user123",
            token_ids=[token.id for token in training_tokens],
            pool_name="advanced"
        )
        
        print("\nStaking de tokens:")
        print(f"- Pool: {staking_result['pool_name']}")
        print(f"- Nivel de riesgo: {staking_result['risk_level']}")
        print(f"- Tokens en stake: {len(staking_result['tokens'])}")
        print(f"- Fecha de fin: {staking_result['end_date']}")

    if __name__ == "__main__":
        asyncio.run(main())
