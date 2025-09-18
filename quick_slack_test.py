#!/usr/bin/env python3
"""
Script rápido para probar la configuración de Slack
"""
import os
import requests
import json
from datetime import datetime

def quick_test():
    """Prueba rápida del webhook de Slack"""

    # Intentar obtener la URL del webhook de diferentes fuentes
    webhook_url = None

    # 1. Variable de entorno
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')

    # 2. Archivo .env
    if not webhook_url and os.path.exists('.env'):
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('SLACK_WEBHOOK_URL='):
                        webhook_url = line.split('=', 1)[1].strip()
                        break
        except:
            pass

    # 3. Archivo slack_config.txt
    if not webhook_url and os.path.exists('slack_config.txt'):
        try:
            with open('slack_config.txt', 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('SLACK_WEBHOOK_URL=') and not line.startswith('#'):
                        webhook_url = line.split('=', 1)[1].strip()
                        break
                    elif line.startswith('https://hooks.slack.com/') and not line.startswith('#'):
                        webhook_url = line
                        break
        except:
            pass

    if not webhook_url:
        print("❌ No se encontró SLACK_WEBHOOK_URL")
        print("")
        print("📝 Para configurar:")
        print("1. Crea un archivo llamado 'slack_config.txt' con tu webhook URL")
        print("2. O establece la variable de entorno: export SLACK_WEBHOOK_URL='tu-url'")
        print("3. O crea un archivo .env con: SLACK_WEBHOOK_URL=tu-url")
        print("")
        print("🔗 Obtén tu webhook URL en: https://slack.com/apps → Incoming WebHooks")
        return False

    print("🔄 Probando conexión con Slack...")

    # Mensaje de prueba
    test_message = {
        "username": "Shaili-AI CI/CD",
        "icon_emoji": ":white_check_mark:",
        "text": "✅ *Configuración de Slack Exitosa*\n\n¡Las notificaciones del workflow están funcionando correctamente!",
        "attachments": [
            {
                "color": "good",
                "fields": [
                    {
                        "title": "Estado",
                        "value": "Prueba exitosa",
                        "short": True
                    },
                    {
                        "title": "Timestamp",
                        "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "short": True
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(
            webhook_url,
            data=json.dumps(test_message),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )

        if response.status_code == 200:
            print("✅ ¡Éxito! Slack está configurado correctamente")
            print("📨 Mensaje de prueba enviado a tu canal")
            print("")
            print("🎉 ¡Todo listo! Ahora puedes:")
            print("   1. Configurar SLACK_WEBHOOK_URL en GitHub Secrets")
            print("   2. Hacer push de los cambios")
            print("   3. Recibir notificaciones automáticas en Slack")
            return True
        else:
            print(f"❌ Error HTTP {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Prueba Rápida de Slack - Shaili-AI")
    print("=" * 40)
    quick_test()
