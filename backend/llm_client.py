"""
Cliente LLM para SHEILY AI
=========================

Cliente unificado para comunicación con diferentes servidores de inferencia LLM:
- Ollama (modelo local sheily-llm)
- OpenAI-compatible (vLLM, TGI, etc.)

Integrado con el orquestador principal para el pipeline draft → critic → fix
"""

import requests
import json
import logging
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class LLMClient:
    """
    Cliente unificado para comunicación con servidores LLM
    """

    def __init__(self, config: Dict[str, Any] = None):
        """
        Inicializar cliente LLM

        Args:
            config (dict): Configuración del cliente
        """
        self.config = config or {}

        # Configuración por defecto
        self.llm_mode = os.getenv("LLM_MODE", "ollama")  # ollama | openai
        self.llm_base_url = os.getenv("LLM_BASE_URL", "http://localhost:11434")
        self.model_name = os.getenv("LLM_MODEL_NAME", "sheily-llm")
        self.timeout = int(os.getenv("LLM_TIMEOUT", "60"))
        self.max_retries = int(os.getenv("LLM_MAX_RETRIES", "3"))

        # Configuración específica por modo
        if self.llm_mode == "ollama":
            self.api_endpoint = f"{self.llm_base_url}/api/generate"
            self.chat_endpoint = f"{self.llm_base_url}/api/chat"
        elif self.llm_mode == "openai":
            # Para nuestro servidor HF personalizado
            self.api_endpoint = f"{self.llm_base_url}/chat"
            self.chat_endpoint = f"{self.llm_base_url}/chat"
        else:
            raise ValueError(f"Modo LLM no soportado: {self.llm_mode}")

        logger.info(
            f"🔧 Cliente LLM inicializado - Modo: {self.llm_mode}, URL: {self.llm_base_url}"
        )

    def _make_request(
        self, endpoint: str, payload: Dict[str, Any], retries: int = None
    ) -> Dict[str, Any]:
        """
        Realizar petición HTTP con reintentos

        Args:
            endpoint (str): URL del endpoint
            payload (dict): Datos de la petición
            retries (int): Número de reintentos

        Returns:
            dict: Respuesta de la API
        """
        if retries is None:
            retries = self.max_retries

        for attempt in range(retries + 1):
            try:
                response = requests.post(
                    endpoint,
                    json=payload,
                    timeout=self.timeout,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                return response.json()

            except requests.exceptions.RequestException as e:
                if attempt < retries:
                    wait_time = 2**attempt  # Backoff exponencial
                    logger.warning(
                        f"⚠️ Intento {attempt + 1} falló: {e}. Reintentando en {wait_time}s..."
                    )
                    time.sleep(wait_time)
                else:
                    logger.error(f"❌ Error después de {retries + 1} intentos: {e}")
                    raise

    def llm_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Función principal para chat con LLM (compatible con Ollama)

        Args:
            messages (list): Lista de mensajes del chat
            **kwargs: Parámetros adicionales (temperature, max_tokens, etc.)

        Returns:
            str: Respuesta del LLM
        """
        try:
            if self.llm_mode == "ollama":
                return self._chat_ollama(messages, **kwargs)
            elif self.llm_mode == "openai":
                return self._chat_openai(messages, **kwargs)
            else:
                raise ValueError(f"Modo LLM no soportado: {self.llm_mode}")

        except Exception as e:
            logger.error(f"❌ Error en llm_chat: {e}")
            return f"Error procesando consulta: {str(e)}"

    def _chat_ollama(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Chat con Ollama

        Args:
            messages (list): Lista de mensajes
            **kwargs: Parámetros adicionales

        Returns:
            str: Respuesta del LLM
        """
        # Convertir mensajes a prompt para Ollama
        prompt = self._messages_to_prompt_ollama(messages)

        # Parámetros por defecto
        params = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "temperature": kwargs.get("temperature", 0.2),
            "top_p": kwargs.get("top_p", 0.95),
            "top_k": kwargs.get("top_k", 50),
            "repeat_penalty": kwargs.get("repeat_penalty", 1.1),
            "num_ctx": kwargs.get("num_ctx", 8192),
        }

        # Añadir max_tokens si se especifica
        if "max_tokens" in kwargs:
            params["num_predict"] = kwargs["max_tokens"]

        logger.debug(f"🔄 Enviando petición a Ollama: {params['model']}")

        response = self._make_request(self.api_endpoint, params)
        return response.get("response", "")

    def _chat_openai(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Chat con API OpenAI-compatible (vLLM, TGI, etc.)

        Args:
            messages (list): Lista de mensajes
            **kwargs: Parámetros adicionales

        Returns:
            str: Respuesta del LLM
        """
        # Parámetros por defecto
        params = {
            "model": self.model_name,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.2),
            "top_p": kwargs.get("top_p", 0.95),
            "max_tokens": kwargs.get("max_tokens", 2048),
            "stream": False,
        }

        logger.debug(f"🔄 Enviando petición a OpenAI-compatible: {params['model']}")

        response = self._make_request(self.api_endpoint, params)
        return response["choices"][0]["message"]["content"]

    def _messages_to_prompt_ollama(self, messages: List[Dict[str, str]]) -> str:
        """
        Convertir mensajes de chat a prompt para Ollama

        Args:
            messages (list): Lista de mensajes

        Returns:
            str: Prompt formateado
        """
        prompt_parts = []

        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")

            if role == "system":
                prompt_parts.append(f"## Sistema: {content}")
            elif role == "user":
                prompt_parts.append(f"## Usuario: {content}")
            elif role == "assistant":
                prompt_parts.append(f"## Asistente: {content}")

        return "\n\n".join(prompt_parts)

    def llm_chat_openai(
        self, messages: List[Dict[str, str]], base_url: str = None, **kwargs
    ) -> str:
        """
        Función específica para API OpenAI-compatible con URL personalizable

        Args:
            messages (list): Lista de mensajes
            base_url (str): URL base personalizada
            **kwargs: Parámetros adicionales

        Returns:
            str: Respuesta del LLM
        """
        if base_url:
            # Usar URL personalizada temporalmente
            original_endpoint = self.api_endpoint
            self.api_endpoint = f"{base_url}/v1/chat/completions"

        try:
            return self._chat_openai(messages, **kwargs)
        finally:
            if base_url:
                # Restaurar endpoint original
                self.api_endpoint = original_endpoint

    def generate_draft(self, query: str, context: str = "") -> str:
        """
        Generar borrador de respuesta (pipeline draft → critic → fix)

        Args:
            query (str): Consulta del usuario
            context (str): Contexto adicional

        Returns:
            str: Borrador de respuesta
        """
        messages = [
            {
                "role": "system",
                "content": "Eres SHEILY. Genera un borrador inicial de respuesta basado en la consulta del usuario.",
            },
            {"role": "user", "content": f"Consulta: {query}\n\nContexto: {context}"},
        ]

        return self.llm_chat(messages, temperature=0.7, max_tokens=1024)

    def critique_response(self, draft: str, query: str) -> str:
        """
        Criticar y analizar el borrador (pipeline draft → critic → fix)

        Args:
            draft (str): Borrador de respuesta
            query (str): Consulta original

        Returns:
            str: Análisis crítico
        """
        messages = [
            {
                "role": "system",
                "content": "Eres SHEILY. Analiza críticamente el borrador de respuesta y identifica áreas de mejora.",
            },
            {
                "role": "user",
                "content": f"Consulta original: {query}\n\nBorrador: {draft}\n\nProporciona un análisis crítico constructivo.",
            },
        ]

        return self.llm_chat(messages, temperature=0.3, max_tokens=512)

    def fix_response(self, draft: str, critique: str, query: str) -> str:
        """
        Mejorar la respuesta basada en la crítica (pipeline draft → critic → fix)

        Args:
            draft (str): Borrador original
            critique (str): Análisis crítico
            query (str): Consulta original

        Returns:
            str: Respuesta mejorada
        """
        messages = [
            {
                "role": "system",
                "content": "Eres SHEILY. Mejora el borrador de respuesta basándote en el análisis crítico proporcionado.",
            },
            {
                "role": "user",
                "content": f"Consulta: {query}\n\nBorrador original: {draft}\n\nAnálisis crítico: {critique}\n\nGenera una respuesta mejorada.",
            },
        ]

        return self.llm_chat(messages, temperature=0.2, max_tokens=1536)

    def process_pipeline(self, query: str, context: str = "") -> Dict[str, str]:
        """
        Ejecutar pipeline completo draft → critic → fix

        Args:
            query (str): Consulta del usuario
            context (str): Contexto adicional

        Returns:
            dict: Resultados del pipeline
        """
        logger.info(f"🔄 Iniciando pipeline para consulta: {query[:100]}...")

        start_time = time.time()

        # Paso 1: Generar borrador
        draft = self.generate_draft(query, context)
        logger.info("✅ Borrador generado")

        # Paso 2: Criticar
        critique = self.critique_response(draft, query)
        logger.info("✅ Análisis crítico completado")

        # Paso 3: Mejorar
        final_response = self.fix_response(draft, critique, query)
        logger.info("✅ Respuesta final generada")

        processing_time = time.time() - start_time

        return {
            "draft": draft,
            "critique": critique,
            "final_response": final_response,
            "processing_time": processing_time,
            "pipeline_used": True,
        }

    def health_check(self) -> Dict[str, Any]:
        """
        Verificar estado del servicio LLM

        Returns:
            dict: Estado del servicio
        """
        try:
            if self.llm_mode == "ollama":
                # Verificar endpoint de tags
                response = requests.get(f"{self.llm_base_url}/api/tags", timeout=10)
                response.raise_for_status()
                models = response.json().get("models", [])
                model_available = any(
                    model["name"] == self.model_name for model in models
                )

                # Verificar si el modelo realmente funciona
                if model_available:
                    try:
                        # Probar una generación simple
                        test_payload = {
                            "model": self.model_name,
                            "prompt": "test",
                            "stream": False,
                            "options": {"num_predict": 1},
                        }
                        test_response = requests.post(
                            f"{self.llm_base_url}/api/generate",
                            json=test_payload,
                            timeout=10,
                        )
                        if test_response.status_code != 200:
                            model_available = False
                    except:
                        model_available = False

                return {
                    "status": "healthy" if model_available else "model_not_found",
                    "mode": self.llm_mode,
                    "base_url": self.llm_base_url,
                    "model_name": self.model_name,
                    "model_available": model_available,
                    "available_models": [model["name"] for model in models],
                }
            else:
                # Para OpenAI-compatible, hacer una petición simple
                test_messages = [{"role": "user", "content": "test"}]
                self._chat_openai(test_messages, max_tokens=1)

                return {
                    "status": "healthy",
                    "mode": self.llm_mode,
                    "base_url": self.llm_base_url,
                    "model_name": self.model_name,
                }

        except Exception as e:
            return {
                "status": "unhealthy",
                "mode": self.llm_mode,
                "base_url": self.llm_base_url,
                "model_name": self.model_name,
                "error": str(e),
            }


# Instancia global del cliente
llm_client = None


def get_llm_client() -> LLMClient:
    """
    Obtener instancia global del cliente LLM

    Returns:
        LLMClient: Instancia del cliente
    """
    global llm_client
    if llm_client is None:
        llm_client = LLMClient()
    return llm_client


# Funciones de conveniencia para compatibilidad
def llm_chat(messages: List[Dict[str, str]], **kwargs) -> str:
    """Función de conveniencia para chat con LLM"""
    return get_llm_client().llm_chat(messages, **kwargs)


def llm_chat_openai(
    messages: List[Dict[str, str]], base_url: str = None, **kwargs
) -> str:
    """Función de conveniencia para chat OpenAI-compatible"""
    return get_llm_client().llm_chat_openai(messages, base_url, **kwargs)


# Script de prueba
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Cliente LLM SHEILY")
    parser.add_argument(
        "--mode",
        choices=["ollama", "openai"],
        default="ollama",
        help="Modo del cliente",
    )
    parser.add_argument(
        "--url", default="http://localhost:11434", help="URL base del servicio"
    )
    parser.add_argument("--model", default="sheily-llm", help="Nombre del modelo")
    parser.add_argument("--message", required=True, help="Mensaje de prueba")

    args = parser.parse_args()

    # Configurar cliente
    os.environ["LLM_MODE"] = args.mode
    os.environ["LLM_BASE_URL"] = args.url
    os.environ["LLM_MODEL_NAME"] = args.model

    client = LLMClient()

    # Verificar salud
    health = client.health_check()
    print(f"Estado del servicio: {health}")

    if health["status"] == "healthy":
        # Probar chat
        messages = [{"role": "user", "content": args.message}]
        response = client.llm_chat(messages)
        print(f"Respuesta: {response}")
    else:
        print("❌ Servicio no disponible")
