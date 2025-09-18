#!/usr/bin/env python3
"""
Chatbot SHEILY usando modelo local con llama-cpp-python
"""

import sys
import os
import time
from datetime import datetime


def load_local_model():
    """Cargar modelo local GGUF"""
    try:
        from llama_cpp import Llama

        print("🔄 Cargando modelo local Llama 3.2 3B...")

        # Usar el modelo GGUF local
        model_path = "./models/cache/hub/models--bartowski--Llama-3.2-3B-Instruct-GGUF/snapshots/5ab33fa94d1d04e903623ae72c95d1696f09f9e8/Llama-3.2-3B-Instruct-Q8_0.gguf"

        if not os.path.exists(model_path):
            print(f"❌ Modelo no encontrado en: {model_path}")
            return None

        model = Llama(model_path=model_path, n_ctx=4096, n_threads=4, verbose=False)

        print("✅ Modelo local cargado exitosamente")
        return model

    except Exception as e:
        print(f"❌ Error cargando modelo local: {e}")
        return None


def generate_response(model, prompt):
    """Generar respuesta del modelo"""
    try:
        # Crear prompt para SHEILY
        system_prompt = "Eres SHEILY, un asistente de inteligencia artificial útil y preciso en español. Responde de manera clara y concisa."

        full_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"

        # Generar respuesta
        response = model(
            full_prompt,
            max_tokens=200,
            temperature=0.2,
            top_p=0.95,
            stop=["<|eot_id|>", "<|end_of_text|>"],
        )

        return response["choices"][0]["text"].strip()

    except Exception as e:
        return f"Error generando respuesta: {e}"


def start_chatbot():
    """Iniciar chatbot interactivo"""
    print("🤖 Chatbot SHEILY (Modelo Local)")
    print("=" * 50)
    print("Comandos especiales:")
    print("  'salir' - Terminar el chat")
    print("  'estado' - Ver información del modelo")
    print("=" * 50)

    # Cargar modelo
    model = load_local_model()
    if not model:
        print("❌ No se pudo cargar el modelo local")
        return

    print("✅ Modelo listo para usar")

    while True:
        try:
            # Obtener entrada del usuario
            user_input = input(f"\n👤 Tú: ").strip()

            if user_input.lower() in ["salir", "exit", "quit"]:
                print("👋 ¡Hasta luego!")
                break

            if user_input.lower() == "estado":
                print(f"📊 Modelo: Llama 3.2 3B Instruct (GGUF)")
                print(f"📊 Contexto: {model.n_ctx} tokens")
                print(f"📊 Hilos: {model.n_threads}")
                continue

            if not user_input:
                continue

            # Procesar consulta
            print("🤔 SHEILY está pensando...")
            start_time = time.time()

            response = generate_response(model, user_input)

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
    print("🚀 Iniciando Chatbot SHEILY (Modelo Local)")
    print("=" * 50)

    start_chatbot()


if __name__ == "__main__":
    main()
