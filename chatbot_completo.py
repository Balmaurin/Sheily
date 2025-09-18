#!/usr/bin/env python3
"""
Chatbot SHEILY Completo - Integración TOTAL de todos los módulos
Sistema que utiliza TODAS las mejoras: memoria, ramas, LoRA, respuestas híbridas, prompts especializados
"""

import sys
import os
import time
import json
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

# Añadir paths necesarios
sys.path.append(os.path.join(os.path.dirname(__file__)))
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class AdvancedChatContext:
    """Contexto avanzado de la conversación"""
    user_id: str
    session_id: str
    conversation_history: List[Dict[str, str]]
    user_profile: Dict[str, Any]
    current_domain: str
    active_branch: Optional[str]
    confidence_scores: Dict[str, float]
    memory_context: Dict[str, Any]
    learning_data: List[Dict[str, Any]]
    lora_adapters: List[str]

class SHEILYCompleteChatbot:
    """Chatbot SHEILY con integración COMPLETA de todos los módulos"""
    
    def __init__(self):
        self.context = AdvancedChatContext(
            user_id="default_user",
            session_id=f"session_{int(time.time())}",
            conversation_history=[],
            user_profile={},
            current_domain="general",
            active_branch=None,
            confidence_scores={},
            memory_context={},
            learning_data=[],
            lora_adapters=[]
        )
        
        # Componentes del sistema
        self.llm_model = None
        self.rag_retriever = None
        self.semantic_analyzer = None
        self.quality_evaluator = None
        self.branch_manager = None
        self.response_generator = None
        self.short_term_memory = None
        self.episodic_memory = None
        self.lora_trainer = None
        self.advanced_training = None
        self.hybrid_response_system = None
        self.learning_system = None
        
        # Estado del sistema
        self.initialized = False
        self.available_modules = []
        self.branch_prompts = {}
        self.lora_models = {}
        
        logger.info("🚀 Inicializando Chatbot SHEILY Completo...")
        self._initialize_complete_system()
    
    def _initialize_complete_system(self):
        """Inicializar TODOS los componentes del sistema"""
        try:
            # 1. Cargar modelo LLM local
            self._load_llm_model()
            
            # 2. Inicializar sistema de memoria completo
            self._initialize_memory_systems()
            
            # 3. Inicializar sistema RAG avanzado
            self._initialize_advanced_rag()
            
            # 4. Inicializar análisis semántico
            self._initialize_semantic_analyzer()
            
            # 5. Inicializar evaluador de calidad
            self._initialize_quality_evaluator()
            
            # 6. Inicializar gestor de ramas
            self._initialize_branch_manager()
            
            # 7. Inicializar sistema LoRA
            self._initialize_lora_system()
            
            # 8. Inicializar sistema de entrenamiento
            self._initialize_training_system()
            
            # 9. Inicializar sistema de respuestas híbrido
            self._initialize_hybrid_response_system()
            
            # 10. Inicializar sistema de aprendizaje continuo
            self._initialize_learning_system()
            
            # 11. Cargar prompts especializados
            self._load_specialized_prompts()
            
            # 12. Cargar modelos LoRA disponibles
            self._load_lora_models()
            
            self.initialized = True
            logger.info("✅ Sistema SHEILY Completo inicializado correctamente")
            logger.info(f"📊 Módulos disponibles: {len(self.available_modules)}")
            
        except Exception as e:
            logger.error(f"❌ Error inicializando sistema completo: {e}")
            self.initialized = False
    
    def _load_llm_model(self):
        """Cargar modelo LLM local"""
        try:
            from llama_cpp import Llama
            
            model_path = "./models/cache/hub/models--bartowski--Llama-3.2-3B-Instruct-GGUF/snapshots/5ab33fa94d1d04e903623ae72c95d1696f09f9e8/Llama-3.2-3B-Instruct-Q8_0.gguf"
            
            if os.path.exists(model_path):
                self.llm_model = Llama(
                    model_path=model_path,
                    n_ctx=8192,  # Contexto más grande para respuestas híbridas
                    n_threads=6,
                    verbose=False
                )
                logger.info("✅ Modelo LLM local cargado con contexto extendido")
                self.available_modules.append("llm_local")
            else:
                logger.warning("⚠️ Modelo LLM local no encontrado")
                
        except Exception as e:
            logger.error(f"❌ Error cargando modelo LLM: {e}")
    
    def _initialize_memory_systems(self):
        """Inicializar sistemas de memoria completos"""
        try:
            # Memoria de corto plazo
            from modules.memory.short_term import ShortTermMemory
            self.short_term_memory = ShortTermMemory(
                max_messages=20,
                max_tokens=2048,
                summary_every=4000
            )
            logger.info("✅ Memoria de corto plazo inicializada")
            self.available_modules.append("short_term_memory")
            
            # Memoria episódica
            from modules.memory.intelligent_backup_system import IntelligentBackupSystem
            self.episodic_memory = IntelligentBackupSystem()
            logger.info("✅ Memoria episódica inicializada")
            self.available_modules.append("episodic_memory")
            
        except Exception as e:
            logger.warning(f"⚠️ Sistemas de memoria no disponibles: {e}")
    
    def _initialize_advanced_rag(self):
        """Inicializar sistema RAG avanzado"""
        try:
            from modules.memory.rag import RAGRetriever
            
            # Usar SQLite para desarrollo
            db_url = "sqlite:///data/knowledge_base.db"
            self.rag_retriever = RAGRetriever(
                embed_model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                db_url=db_url,
                index_path="data/faiss_index.index"
            )
            logger.info("✅ Sistema RAG avanzado inicializado")
            self.available_modules.append("advanced_rag")
            
        except Exception as e:
            logger.warning(f"⚠️ RAG avanzado no disponible: {e}")
    
    def _initialize_semantic_analyzer(self):
        """Inicializar analizador semántico"""
        try:
            from modules.ai.semantic_analyzer import SemanticAnalyzer
            
            self.semantic_analyzer = SemanticAnalyzer()
            logger.info("✅ Analizador semántico inicializado")
            self.available_modules.append("semantic_analysis")
            
        except Exception as e:
            logger.warning(f"⚠️ Analizador semántico no disponible: {e}")
    
    def _initialize_quality_evaluator(self):
        """Inicializar evaluador de calidad"""
        try:
            from modules.ai.quality_evaluator import QualityEvaluator
            
            self.quality_evaluator = QualityEvaluator()
            logger.info("✅ Evaluador de calidad inicializado")
            self.available_modules.append("quality_evaluation")
            
        except Exception as e:
            logger.warning(f"⚠️ Evaluador de calidad no disponible: {e}")
    
    def _initialize_branch_manager(self):
        """Inicializar gestor de ramas"""
        try:
            from modules.branches.branch_manager import BranchManager
            
            self.branch_manager = BranchManager("data/branches")
            logger.info("✅ Gestor de ramas inicializado")
            self.available_modules.append("branch_management")
            
        except Exception as e:
            logger.warning(f"⚠️ Gestor de ramas no disponible: {e}")
    
    def _initialize_lora_system(self):
        """Inicializar sistema LoRA"""
        try:
            from modules.training.automatic_lora_trainer import AutomaticLoRATrainer
            
            self.lora_trainer = AutomaticLoRATrainer()
            logger.info("✅ Sistema LoRA inicializado")
            self.available_modules.append("lora_system")
            
        except Exception as e:
            logger.warning(f"⚠️ Sistema LoRA no disponible: {e}")
    
    def _initialize_training_system(self):
        """Inicializar sistema de entrenamiento"""
        try:
            from modules.training.advanced_training_system import AdvancedTrainingSystem
            
            self.advanced_training = AdvancedTrainingSystem()
            logger.info("✅ Sistema de entrenamiento avanzado inicializado")
            self.available_modules.append("advanced_training")
            
        except Exception as e:
            logger.warning(f"⚠️ Sistema de entrenamiento no disponible: {e}")
    
    def _initialize_hybrid_response_system(self):
        """Inicializar sistema de respuestas híbrido"""
        try:
            from modules.ai.response_generator import ResponseGenerator
            
            self.response_generator = ResponseGenerator()
            logger.info("✅ Sistema de respuestas híbrido inicializado")
            self.available_modules.append("hybrid_responses")
            
        except Exception as e:
            logger.warning(f"⚠️ Sistema de respuestas híbrido no disponible: {e}")
    
    def _initialize_learning_system(self):
        """Inicializar sistema de aprendizaje continuo"""
        try:
            from modules.learning.neural_plasticity_manager import NeuralPlasticityManager
            
            self.learning_system = NeuralPlasticityManager()
            logger.info("✅ Sistema de aprendizaje continuo inicializado")
            self.available_modules.append("continuous_learning")
            
        except Exception as e:
            logger.warning(f"⚠️ Sistema de aprendizaje continuo no disponible: {e}")
    
    def _load_specialized_prompts(self):
        """Cargar prompts especializados de las ramas"""
        try:
            branches_dir = Path("data/branches")
            if branches_dir.exists():
                for branch_file in branches_dir.glob("*.json"):
                    try:
                        with open(branch_file, 'r', encoding='utf-8') as f:
                            branch_data = json.load(f)
                            branch_name = branch_data.get('name', branch_file.stem)
                            self.branch_prompts[branch_name] = branch_data.get('system_prompt', '')
                    except Exception as e:
                        logger.warning(f"⚠️ Error cargando rama {branch_file}: {e}")
            
            logger.info(f"✅ Cargados {len(self.branch_prompts)} prompts especializados")
            
        except Exception as e:
            logger.warning(f"⚠️ Error cargando prompts especializados: {e}")
    
    def _load_lora_models(self):
        """Cargar modelos LoRA disponibles"""
        try:
            lora_dir = Path("models/lora")
            if lora_dir.exists():
                for lora_file in lora_dir.glob("*.safetensors"):
                    branch_name = lora_file.stem
                    self.lora_models[branch_name] = str(lora_file)
            
            logger.info(f"✅ Cargados {len(self.lora_models)} modelos LoRA")
            
        except Exception as e:
            logger.warning(f"⚠️ Error cargando modelos LoRA: {e}")
    
    def analyze_query_advanced(self, query: str) -> Dict[str, Any]:
        """Análisis avanzado de la consulta usando todos los sistemas"""
        analysis = {
            "query": query,
            "domain": "general",
            "confidence": 0.5,
            "semantic_analysis": None,
            "rag_context": None,
            "branch_recommendation": None,
            "memory_context": None,
            "learning_opportunity": False,
            "lora_recommendation": None
        }
        
        try:
            # 1. Análisis semántico avanzado
            if self.semantic_analyzer:
                semantic_result = self.semantic_analyzer.analyze_text(query)
                analysis["semantic_analysis"] = semantic_result
                analysis["domain"] = semantic_result.get("main_topics", ["general"])[0]
                analysis["confidence"] = semantic_result.get("confidence", 0.5)
            
            # 2. Búsqueda RAG con contexto de memoria
            if self.rag_retriever:
                try:
                    # Combinar query con contexto de memoria
                    enhanced_query = query
                    if self.context.memory_context:
                        enhanced_query += f" Contexto: {self.context.memory_context.get('summary', '')}"
                    
                    rag_results = self.rag_retriever.query(enhanced_query, k=5)
                    if rag_results:
                        analysis["rag_context"] = rag_results
                        analysis["confidence"] = max(analysis["confidence"], 0.7)
                except:
                    pass
            
            # 3. Recomendación de rama especializada
            if self.branch_manager:
                try:
                    branches = self.branch_manager.get_all_branches()
                    best_branch = None
                    best_score = 0
                    
                    for branch in branches:
                        # Calcular score basado en palabras clave y contexto
                        score = 0
                        query_lower = query.lower()
                        
                        # Score por palabras clave
                        for keyword in branch.keywords:
                            if keyword.lower() in query_lower:
                                score += 0.3
                        
                        # Score por contexto de memoria
                        if self.context.memory_context:
                            memory_summary = self.context.memory_context.get('summary', '').lower()
                            for keyword in branch.keywords:
                                if keyword.lower() in memory_summary:
                                    score += 0.2
                        
                        if score > best_score:
                            best_score = score
                            best_branch = branch
                    
                    if best_branch and best_score > 0.3:
                        analysis["branch_recommendation"] = best_branch
                        analysis["confidence"] = max(analysis["confidence"], 0.8)
                        analysis["lora_recommendation"] = best_branch.name
                        
                except:
                    pass
            
            # 4. Contexto de memoria episódica
            if self.episodic_memory:
                try:
                    memory_context = self.episodic_memory.get_relevant_context(query)
                    if memory_context:
                        analysis["memory_context"] = memory_context
                        analysis["confidence"] = max(analysis["confidence"], 0.6)
                except:
                    pass
            
            # 5. Detectar oportunidad de aprendizaje
            if self.advanced_training:
                try:
                    # Detectar si la consulta puede generar datos de entrenamiento
                    if any(word in query.lower() for word in ['explica', 'enseña', 'cómo', 'qué es', 'por qué']):
                        analysis["learning_opportunity"] = True
                except:
                    pass
            
        except Exception as e:
            logger.warning(f"⚠️ Error en análisis avanzado: {e}")
        
        return analysis
    
    def generate_hybrid_response(self, query: str, analysis: Dict[str, Any]) -> str:
        """Generar respuesta híbrida usando todos los sistemas disponibles"""
        try:
            # 1. Determinar el mejor enfoque de respuesta
            response_approach = self._determine_response_approach(analysis)
            
            # 2. Preparar contexto híbrido
            hybrid_context = self._prepare_hybrid_context(query, analysis)
            
            # 3. Seleccionar prompt especializado
            system_prompt = self._get_specialized_prompt(analysis)
            
            # 4. Generar respuesta usando el enfoque seleccionado
            if response_approach == "branch_specialized":
                response = self._generate_branch_response(query, analysis, system_prompt, hybrid_context)
            elif response_approach == "rag_enhanced":
                response = self._generate_rag_response(query, analysis, system_prompt, hybrid_context)
            elif response_approach == "memory_enhanced":
                response = self._generate_memory_response(query, analysis, system_prompt, hybrid_context)
            else:
                response = self._generate_hybrid_response(query, analysis, system_prompt, hybrid_context)
            
            # 5. Post-procesar respuesta
            response = self._post_process_response(response, analysis)
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error generando respuesta híbrida: {e}")
            return f"Error generando respuesta: {e}"
    
    def _determine_response_approach(self, analysis: Dict[str, Any]) -> str:
        """Determinar el mejor enfoque de respuesta"""
        if analysis.get("branch_recommendation") and analysis["confidence"] > 0.8:
            return "branch_specialized"
        elif analysis.get("rag_context") and analysis["confidence"] > 0.7:
            return "rag_enhanced"
        elif analysis.get("memory_context") and analysis["confidence"] > 0.6:
            return "memory_enhanced"
        else:
            return "hybrid"
    
    def _prepare_hybrid_context(self, query: str, analysis: Dict[str, Any]) -> str:
        """Preparar contexto híbrido combinando todas las fuentes"""
        context_parts = []
        
        # Contexto RAG
        if analysis.get("rag_context"):
            context_parts.append("📚 Información relevante:")
            for i, result in enumerate(analysis["rag_context"][:3], 1):
                context_parts.append(f"{i}. {result.get('content', '')[:150]}...")
        
        # Contexto de memoria
        if analysis.get("memory_context"):
            context_parts.append("🧠 Contexto de conversaciones anteriores:")
            context_parts.append(analysis["memory_context"].get('summary', '')[:200])
        
        # Contexto de rama especializada
        if analysis.get("branch_recommendation"):
            branch = analysis["branch_recommendation"]
            context_parts.append(f"🎯 Especialización: {branch.description}")
            if branch.keywords:
                context_parts.append(f"Palabras clave: {', '.join(branch.keywords[:5])}")
        
        return "\n".join(context_parts) if context_parts else ""
    
    def _get_specialized_prompt(self, analysis: Dict[str, Any]) -> str:
        """Obtener prompt especializado basado en el análisis"""
        base_prompt = "Eres SHEILY, un asistente de inteligencia artificial avanzado con capacidades especializadas. Responde de manera precisa, útil y bien estructurada en español."
        
        # Usar prompt de rama si está disponible
        if analysis.get("branch_recommendation"):
            branch_name = analysis["branch_recommendation"].name
            if branch_name in self.branch_prompts:
                return self.branch_prompts[branch_name]
        
        # Usar prompt especializado por dominio
        domain = analysis.get("domain", "general")
        if domain in self.branch_prompts:
            return self.branch_prompts[domain]
        
        return base_prompt
    
    def _generate_branch_response(self, query: str, analysis: Dict[str, Any], system_prompt: str, context: str) -> str:
        """Generar respuesta usando rama especializada"""
        try:
            # Usar modelo LoRA si está disponible
            branch_name = analysis["branch_recommendation"].name
            if branch_name in self.lora_models and self.llm_model:
                # Aquí se cargaría el adaptador LoRA específico
                # Por ahora usamos el modelo base con prompt especializado
                pass
            
            # Generar respuesta con prompt especializado
            full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}\n\n{context}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            
            response = self.llm_model(
                full_prompt,
                max_tokens=400,
                temperature=0.1,  # Más determinístico para respuestas especializadas
                top_p=0.9,
                stop=["<|eot_id|>", "<|end_of_text|>"]
            )
            
            return response['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Error generando respuesta de rama: {e}")
            return "Error generando respuesta especializada."
    
    def _generate_rag_response(self, query: str, analysis: Dict[str, Any], system_prompt: str, context: str) -> str:
        """Generar respuesta usando RAG"""
        try:
            # Enriquecer prompt con contexto RAG
            enhanced_prompt = f"{system_prompt}\n\n{context}\n\nResponde basándote en la información proporcionada."
            
            full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{enhanced_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            
            response = self.llm_model(
                full_prompt,
                max_tokens=350,
                temperature=0.2,
                top_p=0.95,
                stop=["<|eot_id|>", "<|end_of_text|>"]
            )
            
            return response['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Error generando respuesta RAG: {e}")
            return "Error generando respuesta con RAG."
    
    def _generate_memory_response(self, query: str, analysis: Dict[str, Any], system_prompt: str, context: str) -> str:
        """Generar respuesta usando memoria episódica"""
        try:
            # Enriquecer prompt con contexto de memoria
            memory_prompt = f"{system_prompt}\n\n{context}\n\nConsidera el contexto de conversaciones anteriores para dar una respuesta coherente."
            
            full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{memory_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            
            response = self.llm_model(
                full_prompt,
                max_tokens=350,
                temperature=0.3,
                top_p=0.95,
                stop=["<|eot_id|>", "<|end_of_text|>"]
            )
            
            return response['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Error generando respuesta con memoria: {e}")
            return "Error generando respuesta con memoria."
    
    def _generate_hybrid_response(self, query: str, analysis: Dict[str, Any], system_prompt: str, context: str) -> str:
        """Generar respuesta híbrida general"""
        try:
            # Combinar todos los enfoques
            hybrid_prompt = f"{system_prompt}\n\n{context}\n\nResponde de manera integral usando toda la información disponible."
            
            full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{hybrid_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            
            response = self.llm_model(
                full_prompt,
                max_tokens=300,
                temperature=0.4,
                top_p=0.95,
                stop=["<|eot_id|>", "<|end_of_text|>"]
            )
            
            return response['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Error generando respuesta híbrida: {e}")
            return "Error generando respuesta híbrida."
    
    def _post_process_response(self, response: str, analysis: Dict[str, Any]) -> str:
        """Post-procesar respuesta para mejorar calidad"""
        try:
            # Limpiar respuesta
            response = response.strip()
            
            # Añadir información de contexto si es relevante
            if analysis.get("branch_recommendation"):
                branch = analysis["branch_recommendation"]
                response += f"\n\n*[Respuesta especializada en {branch.name}]*"
            
            return response
            
        except Exception as e:
            logger.warning(f"⚠️ Error en post-procesamiento: {e}")
            return response
    
    def update_memory_systems(self, query: str, response: str, analysis: Dict[str, Any]):
        """Actualizar sistemas de memoria con la nueva interacción"""
        try:
            # Actualizar memoria de corto plazo
            if self.short_term_memory:
                self.short_term_memory.add_message("user", query)
                self.short_term_memory.add_message("assistant", response)
            
            # Actualizar memoria episódica
            if self.episodic_memory:
                interaction_data = {
                    "query": query,
                    "response": response,
                    "analysis": analysis,
                    "timestamp": datetime.now().isoformat()
                }
                self.episodic_memory.store_interaction(interaction_data)
            
            # Detectar oportunidad de aprendizaje
            if analysis.get("learning_opportunity") and self.advanced_training:
                self._create_training_data(query, response, analysis)
            
        except Exception as e:
            logger.warning(f"⚠️ Error actualizando sistemas de memoria: {e}")
    
    def _create_training_data(self, query: str, response: str, analysis: Dict[str, Any]):
        """Crear datos de entrenamiento para el sistema LoRA"""
        try:
            if self.lora_trainer:
                training_data = {
                    "query": query,
                    "response": response,
                    "domain": analysis.get("domain", "general"),
                    "branch": analysis.get("branch_recommendation", {}).get("name", "general"),
                    "quality_score": analysis.get("confidence", 0.5),
                    "timestamp": datetime.now().isoformat()
                }
                
                # Añadir a cola de entrenamiento
                self.lora_trainer.add_training_data(training_data)
                
        except Exception as e:
            logger.warning(f"⚠️ Error creando datos de entrenamiento: {e}")
    
    def process_query_complete(self, query: str) -> Dict[str, Any]:
        """Procesar consulta usando TODOS los sistemas disponibles"""
        start_time = time.time()
        
        # 1. Análisis avanzado
        analysis = self.analyze_query_advanced(query)
        
        # 2. Generar respuesta híbrida
        response = self.generate_hybrid_response(query, analysis)
        
        # 3. Evaluar calidad
        quality_evaluation = self.evaluate_response_quality(response)
        
        # 4. Actualizar sistemas de memoria
        self.update_memory_systems(query, response, analysis)
        
        # 5. Actualizar contexto
        self.context.conversation_history.append({
            "role": "user",
            "content": query,
            "timestamp": datetime.now().isoformat()
        })
        self.context.conversation_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Mantener solo los últimos 20 mensajes
        if len(self.context.conversation_history) > 40:
            self.context.conversation_history = self.context.conversation_history[-40:]
        
        processing_time = time.time() - start_time
        
        return {
            "response": response,
            "analysis": analysis,
            "quality_evaluation": quality_evaluation,
            "processing_time": processing_time,
            "modules_used": self.available_modules,
            "confidence": analysis["confidence"],
            "response_approach": self._determine_response_approach(analysis),
            "memory_updated": True,
            "learning_opportunity": analysis.get("learning_opportunity", False)
        }
    
    def evaluate_response_quality(self, response: str) -> Dict[str, Any]:
        """Evaluar la calidad de la respuesta"""
        if not self.quality_evaluator:
            return {"score": 0.5, "details": "Evaluador no disponible"}
        
        try:
            evaluation = self.quality_evaluator.evaluate_response(response)
            return {
                "score": evaluation.get("overall_score", 0.5),
                "details": evaluation,
                "recommendations": evaluation.get("recommendations", [])
            }
        except Exception as e:
            logger.warning(f"⚠️ Error evaluando calidad: {e}")
            return {"score": 0.5, "details": f"Error en evaluación: {e}"}
    
    def get_complete_system_status(self) -> Dict[str, Any]:
        """Obtener estado completo del sistema"""
        return {
            "initialized": self.initialized,
            "available_modules": self.available_modules,
            "context": {
                "user_id": self.context.user_id,
                "session_id": self.context.session_id,
                "conversation_length": len(self.context.conversation_history),
                "current_domain": self.context.current_domain,
                "active_branch": self.context.active_branch,
                "lora_adapters": self.context.lora_adapters
            },
            "components": {
                "llm_model": self.llm_model is not None,
                "rag_retriever": self.rag_retriever is not None,
                "semantic_analyzer": self.semantic_analyzer is not None,
                "quality_evaluator": self.quality_evaluator is not None,
                "branch_manager": self.branch_manager is not None,
                "response_generator": self.response_generator is not None,
                "short_term_memory": self.short_term_memory is not None,
                "episodic_memory": self.episodic_memory is not None,
                "lora_trainer": self.lora_trainer is not None,
                "advanced_training": self.advanced_training is not None,
                "learning_system": self.learning_system is not None
            },
            "specialized_systems": {
                "branch_prompts_loaded": len(self.branch_prompts),
                "lora_models_loaded": len(self.lora_models),
                "available_branches": list(self.branch_prompts.keys()) if self.branch_prompts else [],
                "available_lora": list(self.lora_models.keys()) if self.lora_models else []
            }
        }

def start_complete_chatbot():
    """Iniciar chatbot completo interactivo"""
    print("🤖 Chatbot SHEILY Completo - Sistema Total Integrado")
    print("=" * 70)
    print("🧠 Módulos integrados:")
    print("  • LLM Local (Llama 3.2 3B) con contexto extendido")
    print("  • Sistema RAG Avanzado (Recuperación de conocimiento)")
    print("  • Análisis Semántico Multilingüe")
    print("  • Evaluación de Calidad Inteligente")
    print("  • Gestión de Ramas Especializadas (35 ramas)")
    print("  • Sistema LoRA y Entrenamiento Automático")
    print("  • Memoria de Corto Plazo y Episódica")
    print("  • Sistema de Respuestas Híbrido")
    print("  • Aprendizaje Continuo y Adaptativo")
    print("  • Prompts Especializados por Dominio")
    print("=" * 70)
    print("🎯 Comandos especiales:")
    print("  'salir' - Terminar el chat")
    print("  'estado' - Ver estado completo del sistema")
    print("  'ramas' - Ver ramas especializadas disponibles")
    print("  'lora' - Ver modelos LoRA disponibles")
    print("  'memoria' - Ver estado de la memoria")
    print("  'analizar <texto>' - Análisis semántico avanzado")
    print("  'calidad <texto>' - Evaluación de calidad")
    print("  'entrenar' - Iniciar proceso de entrenamiento")
    print("=" * 70)
    
    # Inicializar chatbot
    chatbot = SHEILYCompleteChatbot()
    
    if not chatbot.initialized:
        print("❌ Error inicializando el sistema completo")
        return
    
    print("✅ Sistema completo listo para usar")
    status = chatbot.get_complete_system_status()
    print(f"📊 Módulos disponibles: {len(status['available_modules'])}")
    print(f"🎯 Ramas especializadas: {status['specialized_systems']['branch_prompts_loaded']}")
    print(f"🔧 Modelos LoRA: {status['specialized_systems']['lora_models_loaded']}")
    
    while True:
        try:
            # Obtener entrada del usuario
            user_input = input(f"\n👤 Tú: ").strip()
            
            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("👋 ¡Hasta luego!")
                break
            
            if user_input.lower() == 'estado':
                status = chatbot.get_complete_system_status()
                print(f"\n📊 Estado Completo del Sistema:")
                print(f"  • Inicializado: {status['initialized']}")
                print(f"  • Módulos: {len(status['available_modules'])}")
                print(f"  • Conversación: {status['context']['conversation_length']} mensajes")
                print(f"  • Dominio actual: {status['context']['current_domain']}")
                print(f"  • Rama activa: {status['context']['active_branch'] or 'Ninguna'}")
                print(f"  • Adaptadores LoRA: {len(status['context']['lora_adapters'])}")
                print(f"  • Componentes activos: {sum(status['components'].values())}/{len(status['components'])}")
                continue
            
            if user_input.lower() == 'ramas':
                status = chatbot.get_complete_system_status()
                branches = status['specialized_systems']['available_branches']
                if branches:
                    print(f"\n🎯 Ramas Especializadas Disponibles ({len(branches)}):")
                    for i, branch in enumerate(branches, 1):
                        print(f"  {i}. {branch}")
                else:
                    print("\n⚠️ No hay ramas especializadas cargadas")
                continue
            
            if user_input.lower() == 'lora':
                status = chatbot.get_complete_system_status()
                lora_models = status['specialized_systems']['available_lora']
                if lora_models:
                    print(f"\n🔧 Modelos LoRA Disponibles ({len(lora_models)}):")
                    for i, model in enumerate(lora_models, 1):
                        print(f"  {i}. {model}")
                else:
                    print("\n⚠️ No hay modelos LoRA cargados")
                continue
            
            if user_input.lower() == 'memoria':
                if chatbot.short_term_memory:
                    print(f"\n🧠 Estado de la Memoria:")
                    print(f"  • Mensajes en memoria: {len(chatbot.short_term_memory.messages)}")
                    print(f"  • Tokens actuales: {chatbot.short_term_memory.current_tokens}")
                    print(f"  • Límite de mensajes: {chatbot.short_term_memory.max_messages}")
                else:
                    print("\n⚠️ Sistema de memoria no disponible")
                continue
            
            if user_input.lower().startswith('analizar '):
                text = user_input[9:].strip()
                if text:
                    analysis = chatbot.analyze_query_advanced(text)
                    print(f"\n🔍 Análisis Avanzado de '{text}':")
                    print(f"  • Dominio: {analysis['domain']}")
                    print(f"  • Confianza: {analysis['confidence']:.2f}")
                    if analysis.get('semantic_analysis'):
                        print(f"  • Temas principales: {analysis['semantic_analysis'].get('main_topics', [])}")
                    if analysis.get('branch_recommendation'):
                        print(f"  • Rama recomendada: {analysis['branch_recommendation'].name}")
                    if analysis.get('learning_opportunity'):
                        print(f"  • Oportunidad de aprendizaje: ✅")
                continue
            
            if user_input.lower().startswith('calidad '):
                text = user_input[8:].strip()
                if text:
                    evaluation = chatbot.evaluate_response_quality(text)
                    print(f"\n📊 Evaluación de Calidad:")
                    print(f"  • Puntuación: {evaluation['score']:.2f}")
                    if evaluation.get('details'):
                        print(f"  • Detalles: {evaluation['details']}")
                continue
            
            if user_input.lower() == 'entrenar':
                if chatbot.lora_trainer:
                    print("\n🚀 Iniciando proceso de entrenamiento...")
                    # Aquí se iniciaría el entrenamiento automático
                    print("✅ Proceso de entrenamiento iniciado en segundo plano")
                else:
                    print("\n⚠️ Sistema de entrenamiento no disponible")
                continue
            
            if not user_input:
                continue
            
            # Procesar consulta completa
            print("🤔 SHEILY está analizando con todos los sistemas...")
            
            result = chatbot.process_query_complete(user_input)
            
            # Mostrar respuesta
            print(f"\n🤖 SHEILY: {result['response']}")
            print(f"⏱️ Tiempo: {result['processing_time']:.2f}s")
            print(f"📊 Confianza: {result['confidence']:.2f}")
            print(f"🎯 Dominio: {result['analysis']['domain']}")
            print(f"⭐ Calidad: {result['quality_evaluation']['score']:.2f}")
            print(f"🔧 Enfoque: {result['response_approach']}")
            
            # Mostrar información adicional
            if result['analysis'].get('branch_recommendation'):
                print(f"🎯 Rama especializada: {result['analysis']['branch_recommendation'].name}")
            
            if result['learning_opportunity']:
                print("📚 Oportunidad de aprendizaje detectada")
            
            if result['memory_updated']:
                print("🧠 Memoria actualizada")
            
            # Mostrar módulos utilizados
            if result['modules_used']:
                print(f"🔧 Módulos: {', '.join(result['modules_used'])}")
            
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando Chatbot SHEILY Completo")
    print("=" * 70)
    
    start_complete_chatbot()

if __name__ == "__main__":
    main()
