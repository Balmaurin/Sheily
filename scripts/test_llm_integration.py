#!/usr/bin/env python3
"""
Script de prueba para verificar la integración del sistema LLM
"""

import sys
import os
import time
import requests
import json
from datetime import datetime

# Añadir el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))


def test_ollama_service():
    """Probar que el servicio Ollama esté funcionando"""
    print("🔍 Probando servicio Ollama...")

    try:
        # Verificar que el servicio esté disponible
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        response.raise_for_status()

        models = response.json().get("models", [])
        model_names = [model["name"] for model in models]

        print(f"✅ Servicio Ollama disponible")
        print(f"📋 Modelos disponibles: {model_names}")

        # Verificar que el modelo sheily-llm esté disponible
        if "sheily-llm" in model_names:
            print("✅ Modelo sheily-llm disponible")
            return True
        else:
            print("❌ Modelo sheily-llm no encontrado")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Error conectando con Ollama: {e}")
        return False


def test_llm_client():
    """Probar el cliente LLM"""
    print("\n🔍 Probando cliente LLM...")

    try:
        from llm_client import get_llm_client

        # Obtener cliente
        client = get_llm_client()
        print(f"✅ Cliente LLM inicializado - Modo: {client.llm_mode}")

        # Verificar salud
        health = client.health_check()
        print(f"📊 Estado del servicio: {health['status']}")

        if health["status"] == "healthy":
            # Probar chat simple
            messages = [{"role": "user", "content": "Hola, ¿cómo estás?"}]
            response = client.llm_chat(messages, max_tokens=50)
            print(f"✅ Chat funcionando - Respuesta: {response[:100]}...")

            return True
        else:
            print(f"❌ Servicio no saludable: {health}")
            return False

    except Exception as e:
        print(f"❌ Error en cliente LLM: {e}")
        return False


def test_orchestrator_integration():
    """Probar integración con el orquestador"""
    print("\n🔍 Probando integración con orquestador...")

    try:
        # Añadir path para módulos
        sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

        from modules.orchestrator.main_orchestrator import MainOrchestrator

        # Inicializar orquestador
        orchestrator = MainOrchestrator()
        print("✅ Orquestador inicializado")

        # Verificar estado del LLM
        llm_status = orchestrator.get_llm_status()
        print(f"📊 Estado LLM en orquestador: {llm_status['status']}")

        if llm_status["status"] == "healthy":
            # Probar consulta simple
            response = orchestrator.process_query("¿Qué es la inteligencia artificial?")
            print(
                f"✅ Consulta procesada - Fuente: {response.get('source', 'unknown')}"
            )
            print(f"📝 Respuesta: {response.get('text', '')[:100]}...")

            return True
        else:
            print(f"❌ LLM no disponible en orquestador: {llm_status}")
            return False

    except Exception as e:
        print(f"❌ Error en integración orquestador: {e}")
        return False


def test_pipeline_enhanced():
    """Probar pipeline mejorado draft → critic → fix"""
    print("\n🔍 Probando pipeline mejorado...")

    try:
        from llm_client import get_llm_client

        client = get_llm_client()

        # Probar pipeline completo
        result = client.process_pipeline(
            query="Dame un plan de seguridad informática básico",
            context="Para una pequeña empresa",
        )

        print("✅ Pipeline completado")
        print(f"⏱️ Tiempo de procesamiento: {result['processing_time']:.2f}s")
        print(f"📝 Borrador: {result['draft'][:100]}...")
        print(f"🔍 Crítica: {result['critique'][:100]}...")
        print(f"✨ Respuesta final: {result['final_response'][:100]}...")

        return True

    except Exception as e:
        print(f"❌ Error en pipeline mejorado: {e}")
        return False


def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas de integración LLM SHEILY")
    print("=" * 50)

    tests = [
        ("Servicio Ollama", test_ollama_service),
        ("Cliente LLM", test_llm_client),
        ("Integración Orquestador", test_orchestrator_integration),
        ("Pipeline Mejorado", test_pipeline_enhanced),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error inesperado en {test_name}: {e}")
            results.append((test_name, False))

    # Resumen de resultados
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 50)

    passed = 0
    total = len(results)

    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1

    print(f"\nResultado: {passed}/{total} pruebas pasaron")

    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! Sistema LLM listo.")
        return 0
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar configuración.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
