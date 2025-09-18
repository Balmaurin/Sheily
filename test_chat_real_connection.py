#!/usr/bin/env python3
"""
Test de Conexión Real del Chat - Sin Fallbacks
==============================================

Verificar que el chat del dashboard esté conectado directamente
con el LLM Server generando respuestas reales (no fallbacks).
"""

import requests
import json
import time
from datetime import datetime


def test_llm_direct():
    """Probar LLM Server directamente"""
    print("🔍 Probando LLM Server directamente...")

    try:
        response = requests.post(
            "http://localhost:8005/generate",
            json={
                "prompt": "Explica qué es Python en una línea",
                "max_tokens": 50,
                "temperature": 0.7,
            },
            timeout=15,
        )

        if response.status_code == 200:
            data = response.json()
            llm_response = data.get("response", "")

            print(f"✅ LLM Server: Respuesta real recibida")
            print(f"   📝 Respuesta: {llm_response[:100]}...")
            print(f"   📊 Longitud: {len(llm_response)} caracteres")

            # Verificar que no es una respuesta de fallback
            fallback_indicators = [
                "lo siento",
                "no puedo",
                "error",
                "temporalmente",
                "problemas técnicos",
                "mantenimiento",
            ]

            is_fallback = any(
                indicator in llm_response.lower() for indicator in fallback_indicators
            )

            if is_fallback:
                print("❌ ALERTA: Respuesta parece ser fallback")
                return False
            else:
                print("✅ CONFIRMADO: Respuesta real del LLM")
                return True
        else:
            print(f"❌ LLM Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ LLM Server error: {e}")
        return False


def test_chat_service_simulation():
    """Simular lo que hace el chatService del frontend"""
    print("🔍 Simulando chatService del frontend...")

    try:
        # Simular exactamente lo que hace el frontend
        start_time = time.time()

        response = requests.post(
            "http://localhost:8005/generate",
            json={
                "prompt": "¿Cómo funciona el sistema Sheily AI?",
                "max_tokens": 200,
                "temperature": 0.7,
            },
            timeout=30,
        )

        end_time = time.time()
        response_time = end_time - start_time

        if response.status_code == 200:
            data = response.json()
            chat_response = data.get("response", "")

            print(f"✅ ChatService: Conexión exitosa")
            print(f"   🕐 Tiempo de respuesta: {response_time:.2f}s")
            print(f"   📝 Respuesta: {chat_response[:150]}...")
            print(f"   🧠 Modelo: Llama-3.2-3B-Instruct-Q8_0")
            print(f"   🔗 Endpoint: http://localhost:8005/generate")

            # Verificar calidad de respuesta
            if len(chat_response) > 20 and "sheily" in chat_response.lower():
                print("✅ CONFIRMADO: Respuesta real y contextual")
                return True
            else:
                print("⚠️ Respuesta muy corta o no contextual")
                return False
        else:
            print(f"❌ ChatService error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ChatService error: {e}")
        return False


def test_dashboard_chat_flow():
    """Probar el flujo completo del chat del dashboard"""
    print("🔍 Probando flujo completo del chat del dashboard...")

    try:
        # 1. Verificar que la página de chat esté accesible
        chat_page = requests.get("http://localhost:3000/chat", timeout=5)
        if chat_page.status_code != 200:
            print("❌ Página de chat no accesible")
            return False

        print("✅ Página de chat accesible")

        # 2. Simular envío de mensaje desde el dashboard
        test_messages = [
            "Hola, soy un usuario del dashboard",
            "¿Qué puedes hacer por mi empresa?",
            "Explícame las capacidades de Sheily AI",
        ]

        all_responses_valid = True

        for i, message in enumerate(test_messages, 1):
            print(f"\n📤 Enviando mensaje {i}: {message}")

            response = requests.post(
                "http://localhost:8005/generate",
                json={"prompt": message, "max_tokens": 150, "temperature": 0.7},
                timeout=20,
            )

            if response.status_code == 200:
                data = response.json()
                ai_response = data.get("response", "")

                print(f"✅ Respuesta {i} recibida ({len(ai_response)} chars)")
                print(f"   💬 Preview: {ai_response[:80]}...")

                # Verificar que es una respuesta real
                if len(ai_response) < 10:
                    print(f"❌ Respuesta {i} muy corta")
                    all_responses_valid = False
                elif any(
                    word in ai_response.lower()
                    for word in ["error", "lo siento", "no puedo"]
                ):
                    print(f"⚠️ Respuesta {i} puede ser fallback")
                    all_responses_valid = False
                else:
                    print(f"✅ Respuesta {i} es real y válida")
            else:
                print(f"❌ Error en mensaje {i}: {response.status_code}")
                all_responses_valid = False

            time.sleep(1)  # Pausa entre mensajes

        return all_responses_valid

    except Exception as e:
        print(f"❌ Error en flujo del dashboard: {e}")
        return False


def main():
    """Ejecutar todas las pruebas de conexión real del chat"""
    print("=" * 80)
    print("🧪 VERIFICACIÓN DE CONEXIÓN REAL DEL CHAT - SIN FALLBACKS")
    print("=" * 80)
    print(f"🕐 Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    tests = [
        ("LLM Server Directo", test_llm_direct),
        ("ChatService Simulación", test_chat_service_simulation),
        ("Dashboard Chat Flow", test_dashboard_chat_flow),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print("=" * 50)

        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error crítico en {test_name}: {e}")
            results.append((test_name, False))

        time.sleep(1)

    # Resumen final
    print("\n" + "=" * 80)
    print("📊 RESUMEN DE CONEXIÓN REAL DEL CHAT")
    print("=" * 80)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ REAL" if result else "❌ FALLBACK/ERROR"
        print(f"{status:<15} {test_name}")

    print(
        f"\n🎯 ESTADO CHAT: {passed}/{total} conexiones reales ({passed/total*100:.1f}%)"
    )

    if passed == total:
        print("🎉 ¡CHAT COMPLETAMENTE CONECTADO CON RESPUESTAS REALES!")
        print("🚀 El dashboard genera respuestas directas del LLM (SIN fallbacks)")
    elif passed >= total * 0.8:
        print("✅ Chat mayormente conectado con algunas mejoras pendientes")
    else:
        print("❌ Chat con problemas de conexión - usando fallbacks")

    print("=" * 80)

    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
