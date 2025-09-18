#!/usr/bin/env python3
"""
Script de prueba simple para el cliente LLM
"""

import sys
import os
import requests
import json

# Añadir el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

def test_ollama_direct():
    """Probar Ollama directamente"""
    print("🔍 Probando Ollama directamente...")
    
    try:
        # Verificar que el servicio esté disponible
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        response.raise_for_status()
        
        models = response.json().get('models', [])
        model_names = [model['name'] for model in models]
        
        print(f"✅ Servicio Ollama disponible")
        print(f"📋 Modelos disponibles: {model_names}")
        
        # Probar con el modelo base
        test_payload = {
            "model": "llama3.2:3b",
            "prompt": "Hola",
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 10
            }
        }
        
        print("🧪 Probando generación...")
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=test_payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Generación exitosa: {result.get('response', 'Sin respuesta')}")
            return True
        else:
            print(f"❌ Error en generación: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_llm_client_simple():
    """Probar cliente LLM con configuración simple"""
    print("\n🔍 Probando cliente LLM...")
    
    try:
        from llm_client import LLMClient
        
        # Configurar cliente con modelo base
        client = LLMClient({
            'llm_mode': 'ollama',
            'llm_base_url': 'http://localhost:11434',
            'model_name': 'llama3.2:3b'
        })
        
        print(f"✅ Cliente LLM inicializado")
        
        # Verificar salud
        health = client.health_check()
        print(f"📊 Estado: {health['status']}")
        
        if health['status'] == 'healthy':
            # Probar chat simple
            messages = [{"role": "user", "content": "Hola"}]
            response = client.llm_chat(messages, max_tokens=20, temperature=0.1)
            print(f"✅ Chat funcionando: {response[:50]}...")
            return True
        else:
            print(f"❌ Servicio no saludable: {health}")
            return False
            
    except Exception as e:
        print(f"❌ Error en cliente LLM: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Prueba simple del sistema LLM")
    print("=" * 40)
    
    # Probar Ollama directamente
    ollama_ok = test_ollama_direct()
    
    # Probar cliente LLM
    client_ok = test_llm_client_simple()
    
    print("\n" + "=" * 40)
    print("📊 RESUMEN")
    print("=" * 40)
    print(f"Ollama directo: {'✅ OK' if ollama_ok else '❌ FALLÓ'}")
    print(f"Cliente LLM: {'✅ OK' if client_ok else '❌ FALLÓ'}")
    
    if ollama_ok and client_ok:
        print("\n🎉 ¡Sistema funcionando correctamente!")
        return 0
    else:
        print("\n⚠️ Hay problemas que resolver")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
