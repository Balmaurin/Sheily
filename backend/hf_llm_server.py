#!/usr/bin/env python3
"""
Servidor LLM usando Hugging Face Transformers
Llama 3.2 1B Instruct optimizado para SHEILY AI
"""

import os
import sys
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# Configurar logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class HuggingFaceLLMServer:
    """Servidor LLM usando Hugging Face Transformers"""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = "unsloth/Llama-3.2-1B-Instruct"
        self.device = None
        self.loaded = False

        # Configuración del modelo
        self.generation_config = {
            "max_new_tokens": 512,
            "temperature": 0.2,
            "top_p": 0.9,
            "top_k": 50,
            "do_sample": True,
            "pad_token_id": None,  # Se configurará después de cargar el tokenizer
        }

        logger.info("🚀 Inicializando servidor LLM Hugging Face")
        self._load_model()

    def _load_model(self):
        """Cargar modelo y tokenizer"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            import torch

            logger.info(f"🔄 Cargando modelo {self.model_name}...")

            # Detectar dispositivo
            if torch.cuda.is_available():
                self.device = "cuda"
                logger.info("🎯 Usando GPU CUDA")
            else:
                self.device = "cpu"
                logger.info("💻 Usando CPU")

            # Cargar tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, trust_remote_code=True
            )

            # Configurar pad_token si no existe
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.generation_config["pad_token_id"] = self.tokenizer.pad_token_id

            # Cargar modelo
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                low_cpu_mem_usage=True,
                trust_remote_code=True,
            )

            if self.device == "cpu":
                self.model = self.model.to(self.device)

            self.loaded = True
            logger.info("✅ Modelo cargado exitosamente")

        except Exception as e:
            logger.error(f"❌ Error cargando modelo: {e}")
            self.loaded = False

    def generate_response(
        self, messages: List[Dict[str, str]], **kwargs
    ) -> Dict[str, Any]:
        """Generar respuesta del modelo"""
        if not self.loaded:
            return {"error": "Modelo no cargado", "response": ""}

        try:
            # Formatear mensajes para Llama 3.2
            formatted_prompt = self._format_messages(messages)

            # Tokenizar
            inputs = self.tokenizer(
                formatted_prompt, return_tensors="pt", truncation=True, max_length=2048
            ).to(self.device)

            # Configurar parámetros de generación
            gen_config = self.generation_config.copy()
            gen_config.update(kwargs)

            # Generar respuesta
            start_time = time.time()

            with torch.no_grad():
                outputs = self.model.generate(
                    inputs.input_ids, attention_mask=inputs.attention_mask, **gen_config
                )

            generation_time = time.time() - start_time

            # Decodificar respuesta
            response = self.tokenizer.decode(
                outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True
            ).strip()

            return {
                "response": response,
                "model": self.model_name,
                "device": self.device,
                "generation_time": generation_time,
                "tokens_generated": len(outputs[0]) - inputs.input_ids.shape[1],
            }

        except Exception as e:
            logger.error(f"❌ Error generando respuesta: {e}")
            return {"error": str(e), "response": ""}

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """Formatear mensajes para Llama 3.2"""
        formatted_parts = ["<|begin_of_text|>"]

        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")

            if role == "system":
                formatted_parts.append(
                    f"<|start_header_id|>system<|end_header_id|>\n\n{content}<|eot_id|>"
                )
            elif role == "user":
                formatted_parts.append(
                    f"<|start_header_id|>user<|end_header_id|>\n\n{content}<|eot_id|>"
                )
            elif role == "assistant":
                formatted_parts.append(
                    f"<|start_header_id|>assistant<|end_header_id|>\n\n{content}<|eot_id|>"
                )

        # Añadir inicio de respuesta del asistente
        formatted_parts.append("<|start_header_id|>assistant<|end_header_id|>\n\n")

        return "".join(formatted_parts)

    def health_check(self) -> Dict[str, Any]:
        """Verificar estado del servidor"""
        return {
            "status": "healthy" if self.loaded else "unhealthy",
            "model": self.model_name,
            "device": self.device,
            "loaded": self.loaded,
            "timestamp": datetime.now().isoformat(),
        }


# Crear instancia global del servidor
llm_server = HuggingFaceLLMServer()

# Crear aplicación Flask
app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    """Endpoint de salud"""
    return jsonify(llm_server.health_check())


@app.route("/generate", methods=["POST"])
def generate():
    """Endpoint de generación"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        # Extraer mensajes
        messages = data.get("messages", [])
        if not messages:
            # Compatibilidad con formato simple
            prompt = data.get("prompt", "")
            if prompt:
                messages = [{"role": "user", "content": prompt}]
            else:
                return jsonify({"error": "Se requieren mensajes o prompt"}), 400

        # Parámetros opcionales
        kwargs = {
            "max_new_tokens": data.get("max_tokens", 512),
            "temperature": data.get("temperature", 0.2),
            "top_p": data.get("top_p", 0.9),
            "top_k": data.get("top_k", 50),
        }

        # Generar respuesta
        result = llm_server.generate_response(messages, **kwargs)

        if result.get("error"):
            return jsonify(result), 500

        return jsonify(result)

    except Exception as e:
        logger.error(f"❌ Error en endpoint generate: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """Endpoint de chat compatible con OpenAI"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        messages = data.get("messages", [])
        if not messages:
            return jsonify({"error": "Se requieren mensajes"}), 400

        # Añadir prompt del sistema por defecto si no existe
        if not any(msg.get("role") == "system" for msg in messages):
            system_msg = {
                "role": "system",
                "content": "Eres SHEILY, un asistente de inteligencia artificial avanzado. Responde en español de manera útil, precisa y bien estructurada.",
            }
            messages.insert(0, system_msg)

        # Parámetros opcionales
        kwargs = {
            "max_new_tokens": data.get("max_tokens", 512),
            "temperature": data.get("temperature", 0.2),
            "top_p": data.get("top_p", 0.9),
        }

        # Generar respuesta
        result = llm_server.generate_response(messages, **kwargs)

        if result.get("error"):
            return jsonify({"error": result["error"]}), 500

        # Formato compatible con OpenAI
        response = {
            "choices": [
                {
                    "message": {"role": "assistant", "content": result["response"]},
                    "finish_reason": "stop",
                }
            ],
            "model": result["model"],
            "usage": {"total_tokens": result.get("tokens_generated", 0)},
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"❌ Error en endpoint chat: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/info", methods=["GET"])
def info():
    """Información del servidor"""
    return jsonify(
        {
            "server": "SHEILY HuggingFace LLM Server",
            "model": llm_server.model_name,
            "device": llm_server.device,
            "status": "ready" if llm_server.loaded else "loading",
            "endpoints": {
                "health": "/health",
                "generate": "/generate",
                "chat": "/chat",
                "info": "/info",
            },
        }
    )


def start_server(host="127.0.0.1", port=8005, debug=False):
    """Iniciar servidor"""
    logger.info(f"🚀 Iniciando servidor LLM en http://{host}:{port}")
    app.run(host=host, port=port, debug=debug, threaded=True)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Servidor LLM SHEILY con Hugging Face")
    parser.add_argument("--host", default="127.0.0.1", help="Host del servidor")
    parser.add_argument("--port", type=int, default=8005, help="Puerto del servidor")
    parser.add_argument("--debug", action="store_true", help="Modo debug")

    args = parser.parse_args()

    start_server(args.host, args.port, args.debug)
