#!/usr/bin/env python3
"""
Chatbot SHEILY Interactivo - Terminal
"""

import time
import requests

def chat_with_llm(prompt):
    """Enviar mensajes al servidor LLM local"""
    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 512,
        "temperature": 0.7,
    }

    response = requests.post(
        "http://127.0.0.1:8005/v1/chat/completions", json=payload, timeout=60
    )
    if response.status_code != 200:
        raise RuntimeError(f"Error del servidor: {response.status_code} - {response.text}")

    data = response.json()
    return data["choices"][0]["message"]["content"], data.get("processing_time")


def ensure_service_available():
    """Validar que el servidor LLM esté disponible antes de iniciar."""
    print("🔍 Verificando servidor LLM local...")
    response = requests.get("http://127.0.0.1:8005/health", timeout=5)
    if response.status_code != 200:
        raise RuntimeError("El servidor LLM no respondió correctamente.")

    health = response.json()
    if health.get("status") != "healthy":
        raise RuntimeError(f"Servidor LLM no está listo: {health}")

    print(
        f"✅ LLM disponible | Modelo: {health.get('model')} | Contexto: {health.get('context_size')} tokens"
    )


def start_chatbot():
    """Iniciar chatbot interactivo"""
    print("🤖 Chatbot SHEILY Interactivo")
    print("=" * 50)
    print("Comandos especiales:")
    print("  'salir' - Terminar el chat")
    print("  'estado' - Ver estado del servidor")
    print("=" * 50)

    ensure_service_available()

    while True:
        try:
            # Obtener entrada del usuario
            user_input = input(f"\n👤 Tú: ").strip()

            if user_input.lower() in ["salir", "exit", "quit"]:
                print("👋 ¡Hasta luego!")
                break

            if user_input.lower() == "estado":
                ensure_service_available()
                continue

            if not user_input:
                continue

            # Procesar consulta
            print("🤔 SHEILY está pensando...")
            start_time = time.time()

            response, processing_time = chat_with_llm(user_input)

            if processing_time is None:
                processing_time = time.time() - start_time

            # Mostrar respuesta
            print(f"\n🤖 SHEILY: {response}")
            print(f"⏱️ Tiempo: {processing_time:.2f}s | Servicio: llama_local")

        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")


def main():
    """Función principal"""
    start_chatbot()


if __name__ == "__main__":
    main()
