#!/usr/bin/env python3
"""
Chatbot SHEILY Simple - Versión directa con cliente LLM
"""

import sys
import os
import time
import json
from datetime import datetime

# Añadir paths necesarios
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))


def create_simple_llm_client():
    """Crear cliente LLM simple"""
    try:
        from llm_client import LLMClient

        # Configurar cliente con modelo base
        client = LLMClient(
            {
                "llm_mode": "ollama",
                "llm_base_url": "http://localhost:11434",
                "model_name": "llama3.2:3b",  # Usar modelo base que funciona
            }
        )

        return client
    except Exception as e:
        print(f"❌ Error creando cliente LLM: {e}")
        return None


def test_ollama_direct():
    """Probar Ollama directamente"""
    print("🔍 Probando Ollama...")

    try:
        import requests

        # Verificar que el servicio esté disponible
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        response.raise_for_status()

        models = response.json().get("models", [])
        model_names = [model["name"] for model in models]

        print(f"✅ Servicio Ollama disponible")
        print(f"📋 Modelos disponibles: {model_names}")

        # Probar con el modelo base
        test_payload = {
            "model": "llama3.2:3b",
            "prompt": "Hola, ¿cómo estás?",
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 50},
        }

        print("🧪 Probando generación...")
        response = requests.post(
            "http://localhost:11434/api/generate", json=test_payload, timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            print(
                f"✅ Generación exitosa: {result.get('response', 'Sin respuesta')[:100]}..."
            )
            return True
        else:
            print(f"❌ Error en generación: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def chat_with_ollama_direct(prompt):
    """Chat directo con Ollama"""
    try:
        import requests

        payload = {
            "model": "llama3.2:3b",
            "prompt": f"Eres SHEILY, un asistente de inteligencia artificial útil en español. Responde de manera clara y precisa.\n\nUsuario: {prompt}\nSHEILY:",
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 200},
        }

        response = requests.post(
            "http://localhost:11434/api/generate", json=payload, timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            return result.get("response", "Lo siento, no pude generar una respuesta.")
        else:
            return f"Error: {response.status_code} - {response.text}"

    except Exception as e:
        return f"Error: {e}"


def start_simple_chatbot():
    """Iniciar chatbot simple"""
    print("\n🤖 Iniciando Chatbot SHEILY Simple")
    print("=" * 50)
    print("Escribe 'salir' para terminar")
    print("=" * 50)

    while True:
        try:
            # Obtener entrada del usuario
            user_input = input("\n👤 Tú: ").strip()

            if user_input.lower() in ["salir", "exit", "quit"]:
                print("👋 ¡Hasta luego!")
                break

            if not user_input:
                continue

            # Procesar consulta
            print("🤔 SHEILY está pensando...")
            start_time = time.time()

            response = chat_with_ollama_direct(user_input)

            processing_time = time.time() - start_time

            # Mostrar respuesta
            print(f"\n🤖 SHEILY: {response}")
            print(f"⏱️ Tiempo: {processing_time:.2f}s")

        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")


def main():
    """Función principal"""
    print("🚀 Iniciando Chatbot SHEILY Simple")
    print("=" * 50)

    # Probar Ollama
    if test_ollama_direct():
        print("\n✅ Sistema listo para usar")
        start_simple_chatbot()
    else:
        print("\n❌ No se pudo conectar con Ollama")
        print("Verifica que Ollama esté ejecutándose en el puerto 11434")
        return 1

    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
