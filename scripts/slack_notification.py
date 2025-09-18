#!/usr/bin/env python3
"""
Script para enviar notificaciones personalizadas a Slack sobre el estado del CI/CD
"""
import os
import requests
import json
from datetime import datetime

def send_slack_notification():
    """Envía una notificación personalizada a Slack"""

    # Obtener variables de entorno
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    ci_status = os.getenv('CI_STATUS', 'unknown')

    if not webhook_url:
        print("Error: SLACK_WEBHOOK_URL no está configurado")
        return False

    # Determinar emoji y color basado en el estado
    status_config = {
        'success': {
            'emoji': '✅',
            'color': 'good',
            'message': '¡Éxito! El workflow de Shaili-AI se completó correctamente'
        },
        'failure': {
            'emoji': '❌',
            'color': 'danger',
            'message': 'Error: El workflow de Shaili-AI falló'
        },
        'cancelled': {
            'emoji': '⚠️',
            'color': 'warning',
            'message': 'Advertencia: El workflow de Shaili-AI fue cancelado'
        },
        'unknown': {
            'emoji': '❓',
            'color': '#808080',
            'message': 'Estado desconocido del workflow de Shaili-AI'
        }
    }

    config = status_config.get(ci_status.lower(), status_config['unknown'])

    # Obtener información del repositorio desde variables de entorno de GitHub
    repo_name = os.getenv('GITHUB_REPOSITORY', 'Desconocido')
    commit_sha = os.getenv('GITHUB_SHA', 'Desconocido')[:8]
    ref = os.getenv('GITHUB_REF', 'Desconocido')
    run_id = os.getenv('GITHUB_RUN_ID', 'Desconocido')
    workflow = os.getenv('GITHUB_WORKFLOW', 'Desconocido')

    # Crear mensaje personalizado
    message = {
        "username": "Shaili-AI CI/CD",
        "icon_emoji": ":robot_face:",
        "attachments": [
            {
                "color": config['color'],
                "title": f"{config['emoji']} {config['message']}",
                "fields": [
                    {
                        "title": "Repositorio",
                        "value": repo_name,
                        "short": True
                    },
                    {
                        "title": "Commit",
                        "value": f"`{commit_sha}`",
                        "short": True
                    },
                    {
                        "title": "Branch/Rama",
                        "value": ref.replace('refs/heads/', ''),
                        "short": True
                    },
                    {
                        "title": "Workflow",
                        "value": workflow,
                        "short": True
                    },
                    {
                        "title": "Run ID",
                        "value": f"#{run_id}",
                        "short": True
                    },
                    {
                        "title": "Estado",
                        "value": ci_status.upper(),
                        "short": True
                    }
                ],
                "footer": "Shaili-AI CI/CD Pipeline",
                "ts": datetime.now().timestamp()
            }
        ]
    }

    # Enviar notificación
    try:
        response = requests.post(
            webhook_url,
            data=json.dumps(message),
            headers={'Content-Type': 'application/json'}
        )

        if response.status_code == 200:
            print(f"✅ Notificación de Slack enviada exitosamente (Estado: {ci_status})")
            return True
        else:
            print(f"❌ Error al enviar notificación de Slack: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error al enviar notificación de Slack: {str(e)}")
        return False

if __name__ == "__main__":
    success = send_slack_notification()
    exit(0 if success else 1)
