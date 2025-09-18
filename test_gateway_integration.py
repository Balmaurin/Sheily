#!/usr/bin/env python3
"""
Script de prueba para verificar la integración del Gateway Sheily AI
=====================================================================

Este script verifica que:
1. El servidor AI Gateway esté funcionando
2. Las conexiones con LLM y Backend estén activas
3. El procesamiento de consultas funcione correctamente
"""

import requests
import time
import json
from datetime import datetime


def test_gateway_health():
    """Prueba el endpoint de salud del gateway"""
    print("🔍 Probando endpoint de salud del Gateway...")
    try:
        response = requests.get("http://localhost:8080/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Gateway saludable")
            print(f"   Estado: {data['status']}")
            print(f"   Uptime: {data['uptime']:.1f} segundos")
            print(f"   Consultas procesadas: {data['requests_processed']}")
            print(f"   LLM conectado: {data['connections']['llm_server']}")
            print(f"   Backend conectado: {data['connections']['backend']}")
            return True
        else:
            print(f"❌ Gateway respondió con código {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando con Gateway: {e}")
        return False


def test_gateway_status():
    """Prueba el endpoint de status del gateway"""
    print("\n🔍 Probando endpoint de status del Gateway...")
    try:
        response = requests.get("http://localhost:8080/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Status del Gateway obtenido")
            print(f"   Sistema: {data['system']}")
            print(f"   Versión: {data['version']}")
            print(f"   Estado: {data['status']}")
            return True
        else:
            print(f"❌ Status falló con código {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error obteniendo status: {e}")
        return False


def test_query_processing():
    """Prueba el procesamiento de consultas"""
    print("\n🔍 Probando procesamiento de consultas...")
    test_query = "Hola, ¿puedes explicarme qué es la inteligencia artificial?"

    try:
        payload = {
            "query": test_query,
            "domain": "ai",
            "max_tokens": 300,
            "temperature": 0.7,
            "top_p": 0.9,
        }

        start_time = time.time()
        response = requests.post(
            "http://localhost:8080/query", json=payload, timeout=30
        )
        end_time = time.time()

        if response.status_code == 200:
            data = response.json()
            print("✅ Consulta procesada exitosamente")
            print(f"   Consulta: '{test_query[:50]}...'")
            print(f"   Dominio detectado: {data['domain']}")
            print(f"   Modelo usado: {data['model_used']}")
            print(f"   Tiempo de respuesta: {data['response_time']:.2f}s")
            print(f"   Tokens usados: {data['tokens_used']}")
            print(f"   Confianza: {data['confidence']:.2f}")
            print(f"   Longitud de respuesta: {len(data['response'])} caracteres")
            print(f"   Puntaje de calidad: {data['quality_score']:.2f}")
            return True
        else:
            print(f"❌ Consulta falló con código {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error procesando consulta: {e}")
        return False


def test_llm_server():
    """Prueba directa del servidor LLM"""
    print("\n🔍 Probando servidor LLM directamente...")
    try:
        response = requests.get("http://localhost:8005/health", timeout=5)
        if response.status_code == 200:
            print("✅ LLM Server saludable")
            return True
        else:
            print(f"❌ LLM Server falló con código {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando con LLM Server: {e}")
        return False


def test_backend():
    """Prueba el backend API"""
    print("\n🔍 Probando Backend API...")
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API saludable")
            return True
        else:
            print(f"❌ Backend falló con código {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando con Backend: {e}")
        return False


def main():
    """Función principal de pruebas"""
    print("=" * 70)
    print("🚀 PRUEBA DE INTEGRACIÓN - GATEWAY SHEILY AI")
    print("=" * 70)
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    tests = [
        ("Backend API", test_backend),
        ("LLM Server", test_llm_server),
        ("Gateway Health", test_gateway_health),
        ("Gateway Status", test_gateway_status),
        ("Query Processing", test_query_processing),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 EJECUTANDO: {test_name}")
        print("=" * 50)
        success = test_func()
        results.append((test_name, success))

    # Resumen final
    print("\n" + "=" * 70)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 70)

    successful = 0
    for test_name, success in results:
        status = "✅ PASÓ" if success else "❌ FALLÓ"
        print(f"{status}: {test_name}")
        if success:
            successful += 1

    print(f"\n📈 Resultado: {successful}/{len(results)} pruebas pasaron")

    if successful == len(results):
        print(
            "🎉 ¡Todas las pruebas pasaron! La integración está funcionando correctamente."
        )
        return True
    else:
        print(
            "⚠️ Algunas pruebas fallaron. Revisa los servicios que no están funcionando."
        )
        return False


if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n👋 Prueba interrumpida por el usuario")
        exit(1)
    except Exception as e:
        print(f"\n❌ Error fatal durante las pruebas: {e}")
        exit(1)
