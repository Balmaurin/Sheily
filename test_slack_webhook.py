#!/usr/bin/env python3
"""
Script para probar la configuración del webhook de Slack
"""
import os
import requests
import json
from datetime import datetime

def test_slack_webhook():
    """Prueba la configuración del webhook de Slack"""

    # Solicitar la URL del webhook
    webhook_url = input("Ingresa tu SLACK_WEBHOOK_URL: ").strip()

    if not webhook_url:
        print("❌ No se proporcionó una URL")
        return False

    # Validar que sea una URL de Slack
    if not webhook_url.startswith("https://hooks.slack.com/"):
        print("❌ La URL no parece ser un webhook válido de Slack")
        print("   Debe empezar con: https://hooks.slack.com/")
        return False

    print("🔄 Probando conexión con Slack...")

    # Crear mensaje de prueba
    test_message = {
        "username": "Shaili-AI CI/CD Test",
        "icon_emoji": ":test_tube:",
        "attachments": [
            {
                "color": "good",
                "title": "🧪 Prueba de Configuración Exitosa",
                "text": "¡La configuración de Slack está funcionando correctamente!",
                "fields": [
                    {
                        "title": "Estado",
                        "value": "✅ Conexión exitosa",
                        "short": True
                    },
                    {
                        "title": "Timestamp",
                        "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "short": True
                    }
                ],
                "footer": "Shaili-AI CI/CD Test",
                "ts": datetime.now().timestamp()
            }
        ]
    }

    try:
        # Enviar mensaje de prueba
        response = requests.post(
            webhook_url,
            data=json.dumps(test_message),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )

        if response.status_code == 200:
            print("✅ ¡Éxito! El webhook de Slack está configurado correctamente")
            print("📨 Mensaje de prueba enviado a tu canal de Slack")
            print("\n💡 Ahora puedes:")
            print("   1. Configurar el secreto SLACK_WEBHOOK_URL en GitHub")
            print("   2. Hacer commit de los cambios del workflow")
            print("   3. Probar el workflow con un push")
            return True
        else:
            print(f"❌ Error HTTP {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        return False

def generate_env_file():
    """Genera un archivo .env con la configuración de Slack"""
    webhook_url = input("Ingresa tu SLACK_WEBHOOK_URL para guardar en .env: ").strip()

    if webhook_url:
        with open('.env', 'w') as f:
            f.write(f"SLACK_WEBHOOK_URL={webhook_url}\n")
        print("✅ Archivo .env creado con la configuración de Slack")
    else:
        print("❌ No se guardó ningún archivo .env")

if __name__ == "__main__":
    print("🧪 Prueba de Configuración de Slack Webhook")
    print("=" * 50)

    choice = input("¿Qué quieres hacer?\n1. Probar webhook\n2. Generar archivo .env\n3. Ambos\nElige (1/2/3): ").strip()

    if choice in ['1', '3']:
        success = test_slack_webhook()
        if success and choice == '1':
            generate_env_file()
    elif choice == '2':
        generate_env_file()
    else:
        print("❌ Opción no válida")
