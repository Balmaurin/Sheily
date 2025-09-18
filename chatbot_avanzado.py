#!/usr/bin/env python3
"""
Chatbot SHEILY Avanzado - Integración completa de módulos
Sistema mejorado con RAG, análisis semántico, evaluación de calidad y más
"""

import sys
import os
import time
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

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
class ChatContext:
    """Contexto de la conversación"""
    user_id: str
    session_id: str
    conversation_history: List[Dict[str, str]]
    user_profile: Dict[str, Any]
    current_domain: str
    confidence_scores: Dict[str, float]

class SHEILYAdvancedChatbot:
    """Chatbot SHEILY con integración completa de módulos"""
    
    def __init__(self):
        self.context = ChatContext(
            user_id="default_user",
            session_id=f"session_{int(time.time())}",
            conversation_history=[],
            user_profile={},
            current_domain="general",
            confidence_scores={}
        )
        
        # Componentes del sistema
        self.llm_model = None
        self.rag_retriever = None
        self.semantic_analyzer = None
        self.quality_evaluator = None
        self.branch_manager = None
        self.response_generator = None
        
        # Estado del sistema
        self.initialized = False
        self.available_modules = []
        
        logger.info("🚀 Inicializando Chatbot SHEILY Avanzado...")
        self._initialize_system()
    
    def _initialize_system(self):
        """Inicializar todos los componentes del sistema"""
        try:
            # 1. Cargar modelo LLM local
            self._load_llm_model()
            
            # 2. Inicializar RAG
            self._initialize_rag()
            
            # 3. Inicializar análisis semántico
            self._initialize_semantic_analyzer()
            
            # 4. Inicializar evaluador de calidad
            self._initialize_quality_evaluator()
            
            # 5. Inicializar gestor de ramas
            self._initialize_branch_manager()
            
            # 6. Inicializar generador de respuestas
            self._initialize_response_generator()
            
            self.initialized = True
            logger.info("✅ Sistema SHEILY Avanzado inicializado correctamente")
            
        except Exception as e:
            logger.error(f"❌ Error inicializando sistema: {e}")
            self.initialized = False
    
    def _load_llm_model(self):
        """Cargar modelo LLM local"""
        try:
            from llama_cpp import Llama
            
            # Usar un modelo público que no requiera permisos - Llama 3.2 1B sin restricciones
            model_name = "unsloth/Llama-3.2-1B-Instruct"
            
            if os.path.exists(model_name):
                self.llm_model = Llama(
                    model_path=model_name,
                    n_ctx=4096,
                    n_threads=4,
                    verbose=False
                )
                logger.info("✅ Modelo LLM local cargado")
                self.available_modules.append("llm_local")
            else:
                logger.warning("⚠️ Modelo LLM local no encontrado")
                
        except Exception as e:
            logger.error(f"❌ Error cargando modelo LLM: {e}")
    
    def _initialize_rag(self):
        """Inicializar sistema RAG"""
        try:
            from modules.memory.rag import RAGRetriever
            
            # Usar SQLite para desarrollo
            db_url = "sqlite:///data/knowledge_base.db"
            self.rag_retriever = RAGRetriever(
                embed_model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                db_url=db_url,
                index_path="data/faiss_index.index"
            )
            logger.info("✅ Sistema RAG inicializado")
            self.available_modules.append("rag")
            
        except Exception as e:
            logger.warning(f"⚠️ RAG no disponible: {e}")
    
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
    
    def _initialize_response_generator(self):
        """Inicializar generador de respuestas"""
        try:
            from modules.ai.response_generator import ResponseGenerator
            
            self.response_generator = ResponseGenerator()
            logger.info("✅ Generador de respuestas inicializado")
            self.available_modules.append("response_generation")
            
        except Exception as e:
            logger.warning(f"⚠️ Generador de respuestas no disponible: {e}")
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analizar la consulta del usuario"""
        analysis = {
            "query": query,
            "domain": "general",
            "confidence": 0.5,
            "semantic_analysis": None,
            "rag_context": None,
            "branch_recommendation": None
        }
        
        try:
            # Análisis semántico
            if self.semantic_analyzer:
                semantic_result = self.semantic_analyzer.analyze_text(query)
                analysis["semantic_analysis"] = semantic_result
                analysis["domain"] = semantic_result.get("main_topics", ["general"])[0]
                analysis["confidence"] = semantic_result.get("confidence", 0.5)
            
            # Búsqueda RAG
            if self.rag_retriever:
                try:
                    rag_results = self.rag_retriever.query(query, k=3)
                    if rag_results:
                        analysis["rag_context"] = rag_results
                        analysis["confidence"] = max(analysis["confidence"], 0.7)
                except:
                    pass
            
            # Recomendación de rama
            if self.branch_manager:
                try:
                    branches = self.branch_manager.get_all_branches()
                    # Lógica simple de recomendación basada en palabras clave
                    query_lower = query.lower()
                    for branch in branches:
                        if any(keyword in query_lower for keyword in branch.keywords):
                            analysis["branch_recommendation"] = branch
                            analysis["confidence"] = max(analysis["confidence"], 0.8)
                            break
                except:
                    pass
            
        except Exception as e:
            logger.warning(f"⚠️ Error en análisis de consulta: {e}")
        
        return analysis
    
    def generate_response(self, query: str, analysis: Dict[str, Any]) -> str:
        """Generar respuesta usando todos los componentes disponibles"""
        try:
            # Preparar contexto
            context_parts = []
            
            # Añadir contexto RAG si está disponible
            if analysis.get("rag_context"):
                context_parts.append("Información relevante:")
                for i, result in enumerate(analysis["rag_context"][:2], 1):
                    context_parts.append(f"{i}. {result.get('content', '')[:200]}...")
            
            # Añadir contexto de rama si está disponible
            if analysis.get("branch_recommendation"):
                branch = analysis["branch_recommendation"]
                context_parts.append(f"Especialización: {branch.description}")
            
            # Crear prompt mejorado
            system_prompt = "Eres SHEILY, un asistente de inteligencia artificial avanzado. Responde de manera precisa, útil y bien estructurada en español."
            
            if context_parts:
                system_prompt += f"\n\nContexto adicional:\n" + "\n".join(context_parts)
            
            # Generar respuesta
            if self.llm_model:
                full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
                
                response = self.llm_model(
                    full_prompt,
                    max_tokens=300,
                    temperature=0.2,
                    top_p=0.95,
                    stop=["<|eot_id|>", "<|end_of_text|>"]
                )
                
                return response['choices'][0]['text'].strip()
            else:
                return "Lo siento, el modelo LLM no está disponible en este momento."
                
        except Exception as e:
            logger.error(f"❌ Error generando respuesta: {e}")
            return f"Error generando respuesta: {e}"
    
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
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Procesar consulta completa"""
        start_time = time.time()
        
        # 1. Analizar consulta
        analysis = self.analyze_query(query)
        
        # 2. Generar respuesta
        response = self.generate_response(query, analysis)
        
        # 3. Evaluar calidad
        quality_evaluation = self.evaluate_response_quality(response)
        
        # 4. Actualizar contexto
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
        
        # Mantener solo los últimos 10 mensajes
        if len(self.context.conversation_history) > 20:
            self.context.conversation_history = self.context.conversation_history[-20:]
        
        processing_time = time.time() - start_time
        
        return {
            "response": response,
            "analysis": analysis,
            "quality_evaluation": quality_evaluation,
            "processing_time": processing_time,
            "modules_used": self.available_modules,
            "confidence": analysis["confidence"]
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtener estado del sistema"""
        return {
            "initialized": self.initialized,
            "available_modules": self.available_modules,
            "context": {
                "user_id": self.context.user_id,
                "session_id": self.context.session_id,
                "conversation_length": len(self.context.conversation_history),
                "current_domain": self.context.current_domain
            },
            "components": {
                "llm_model": self.llm_model is not None,
                "rag_retriever": self.rag_retriever is not None,
                "semantic_analyzer": self.semantic_analyzer is not None,
                "quality_evaluator": self.quality_evaluator is not None,
                "branch_manager": self.branch_manager is not None,
                "response_generator": self.response_generator is not None
            }
        }

def start_advanced_chatbot():
    """Iniciar chatbot avanzado interactivo"""
    print("🤖 Chatbot SHEILY Avanzado")
    print("=" * 60)
    print("Módulos integrados:")
    print("  • LLM Local (Llama 3.2 3B)")
    print("  • Sistema RAG (Recuperación de conocimiento)")
    print("  • Análisis Semántico")
    print("  • Evaluación de Calidad")
    print("  • Gestión de Ramas Especializadas")
    print("  • Generación de Respuestas Inteligente")
    print("=" * 60)
    print("Comandos especiales:")
    print("  'salir' - Terminar el chat")
    print("  'estado' - Ver estado del sistema")
    print("  'analizar <texto>' - Analizar texto específico")
    print("  'calidad <texto>' - Evaluar calidad de texto")
    print("=" * 60)
    
    # Inicializar chatbot
    chatbot = SHEILYAdvancedChatbot()
    
    if not chatbot.initialized:
        print("❌ Error inicializando el sistema")
        return
    
    print("✅ Sistema listo para usar")
    print(f"📊 Módulos disponibles: {', '.join(chatbot.available_modules)}")
    
    while True:
        try:
            # Obtener entrada del usuario
            user_input = input(f"\n👤 Tú: ").strip()
            
            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("👋 ¡Hasta luego!")
                break
            
            if user_input.lower() == 'estado':
                status = chatbot.get_system_status()
                print(f"\n📊 Estado del Sistema:")
                print(f"  • Inicializado: {status['initialized']}")
                print(f"  • Módulos: {len(status['available_modules'])}")
                print(f"  • Conversación: {status['context']['conversation_length']} mensajes")
                print(f"  • Dominio actual: {status['context']['current_domain']}")
                continue
            
            if user_input.lower().startswith('analizar '):
                text = user_input[9:].strip()
                if text:
                    analysis = chatbot.analyze_query(text)
                    print(f"\n🔍 Análisis de '{text}':")
                    print(f"  • Dominio: {analysis['domain']}")
                    print(f"  • Confianza: {analysis['confidence']:.2f}")
                    if analysis.get('semantic_analysis'):
                        print(f"  • Temas principales: {analysis['semantic_analysis'].get('main_topics', [])}")
                continue
            
            if user_input.lower().startswith('calidad '):
                text = user_input[8:].strip()
                if text:
                    evaluation = chatbot.evaluate_response_quality(text)
                    print(f"\n📊 Evaluación de calidad:")
                    print(f"  • Puntuación: {evaluation['score']:.2f}")
                    if evaluation.get('details'):
                        print(f"  • Detalles: {evaluation['details']}")
                continue
            
            if not user_input:
                continue
            
            # Procesar consulta
            print("🤔 SHEILY está analizando y generando respuesta...")
            
            result = chatbot.process_query(user_input)
            
            # Mostrar respuesta
            print(f"\n🤖 SHEILY: {result['response']}")
            print(f"⏱️ Tiempo: {result['processing_time']:.2f}s")
            print(f"📊 Confianza: {result['confidence']:.2f}")
            print(f"🎯 Dominio: {result['analysis']['domain']}")
            print(f"⭐ Calidad: {result['quality_evaluation']['score']:.2f}")
            
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
    print("🚀 Iniciando Chatbot SHEILY Avanzado")
    print("=" * 60)
    
    start_advanced_chatbot()

if __name__ == "__main__":
    main()
