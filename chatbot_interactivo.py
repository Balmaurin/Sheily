#!/usr/bin/env python3
"""
Chatbot SHEILY Interactivo - Terminal
"""

import sys
import os
import time
import requests
from datetime import datetime

def chat_with_ollama(prompt):
    """Chat directo con Ollama"""
    try:
        payload = {
            "model": "llama3.2:3b",
            "prompt": f"Eres SHEILY, un asistente de inteligencia artificial útil y preciso en español. Responde de manera clara y concisa.\n\nUsuario: {prompt}\nSHEILY:",
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 300
            }
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', 'Lo siento, no pude generar una respuesta.')
        else:
            return f"Error del servidor: {response.status_code}"
            
    except Exception as e:
        return f"Error: {e}"

def chat_with_backend(prompt):
    """Chat con el servidor backend"""
    try:
        chat_data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = requests.post(
            "http://localhost:8000/chat",
            json=chat_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', 'Lo siento, no pude generar una respuesta.')
        else:
            return f"Error del servidor: {response.status_code}"
            
    except Exception as e:
        return f"Error: {e}"

def test_services():
    """Probar qué servicios están disponibles"""
    print("🔍 Verificando servicios disponibles...")
    
    # Probar Ollama
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Ollama disponible - Modelos: {[m['name'] for m in models]}")
            return "ollama"
    except:
        print("❌ Ollama no disponible")
    
    # Probar Backend
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend disponible")
            return "backend"
    except:
        print("❌ Backend no disponible")
    
    return None

def start_chatbot():
    """Iniciar chatbot interactivo"""
    print("🤖 Chatbot SHEILY Interactivo")
    print("=" * 50)
    print("Comandos especiales:")
    print("  'salir' - Terminar el chat")
    print("  'cambio' - Cambiar entre Ollama y Backend")
    print("  'estado' - Ver estado de los servicios")
    print("=" * 50)
    
    # Detectar servicio disponible
    service = test_services()
    if not service:
        print("❌ No hay servicios disponibles. Inicia Ollama o el backend primero.")
        return
    
    print(f"🔄 Usando servicio: {service}")
    
    while True:
        try:
            # Obtener entrada del usuario
            user_input = input(f"\n👤 Tú: ").strip()
            
            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("👋 ¡Hasta luego!")
                break
            
            if user_input.lower() == 'cambio':
                new_service = test_services()
                if new_service:
                    service = new_service
                    print(f"🔄 Cambiado a servicio: {service}")
                else:
                    print("❌ No hay servicios disponibles")
                continue
            
            if user_input.lower() == 'estado':
                test_services()
                continue
            
            if not user_input:
                continue
            
            # Procesar consulta
            print("🤔 SHEILY está pensando...")
            start_time = time.time()
            
            if service == "ollama":
                response = chat_with_ollama(user_input)
            else:
                response = chat_with_backend(user_input)
            
            processing_time = time.time() - start_time
            
            # Mostrar respuesta
            print(f"\n🤖 SHEILY: {response}")
            print(f"⏱️ Tiempo: {processing_time:.2f}s | Servicio: {service}")
            
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando Chatbot SHEILY Interactivo")
    print("=" * 50)
    
    start_chatbot()

if __name__ == "__main__":
    main()
