#!/bin/bash

echo "🚀 Configuración Completa de Slack para Shaili-AI"
echo "================================================"

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "📦 Verificando dependencias..."
if ! command_exists python3; then
    echo "❌ Python3 no está instalado"
    exit 1
fi

if ! command_exists pip; then
    echo "❌ pip no está instalado"
    exit 1
fi

echo "✅ Python3 y pip están disponibles"

# Instalar requests si no está instalado
echo "📥 Instalando dependencias de Python..."
pip install requests --quiet

# Verificar archivos
echo ""
echo "📁 Verificando archivos de configuración..."
files=("scripts/slack_notification.py" "quick_slack_test.py" "slack_config.txt")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANTE"
        exit 1
    fi
done

echo ""
echo "🔧 Configuración del Webhook de Slack"
echo "====================================="
echo ""
echo "Para configurar Slack, necesitas:"
echo ""
echo "1. 📱 Crear webhook en Slack:"
echo "   - Ve a: https://slack.com/apps"
echo "   - Busca: 'Incoming WebHooks'"
echo "   - Instala la app"
echo "   - Crea un nuevo webhook"
echo "   - Selecciona el canal deseado"
echo ""
echo "2. 🔗 Copiar la URL del webhook"
echo ""
echo "3. 📝 Configurar la URL en uno de estos archivos:"
echo "   - slack_config.txt (quita # y pega la URL)"
echo "   - .env (SLACK_WEBHOOK_URL=tu-url)"
echo "   - Variable de entorno: export SLACK_WEBHOOK_URL='tu-url'"
echo ""

read -p "¿Ya tienes la URL del webhook de Slack? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    read -p "Pega tu webhook URL de Slack: " webhook_url

    if [[ $webhook_url == https://hooks.slack.com/* ]]; then
        echo ""
        echo "✅ URL válida detectada"

        # Crear archivo .env
        echo "SLACK_WEBHOOK_URL=$webhook_url" > .env
        echo "✅ Archivo .env creado"

        # Probar la configuración
        echo ""
        echo "🧪 Probando configuración..."
        python3 quick_slack_test.py

        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 ¡Configuración exitosa!"
            echo ""
            echo "📋 PRÓXIMOS PASOS:"
            echo "=================="
            echo ""
            echo "1. 🔐 Configurar secreto en GitHub:"
            echo "   - Ve a tu repositorio → Settings → Secrets and variables → Actions"
            echo "   - Nuevo secreto: SLACK_WEBHOOK_URL"
            echo "   - Valor: $webhook_url"
            echo ""
            echo "2. 📤 Subir cambios a GitHub:"
            echo "   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git"
            echo "   git push -u origin master"
            echo ""
            echo "3. 🎯 ¡Listo! Recibirás notificaciones automáticas en Slack"
        else
            echo ""
            echo "❌ La prueba falló. Verifica tu webhook URL"
        fi
    else
        echo "❌ URL inválida. Debe empezar con https://hooks.slack.com/"
        echo ""
        echo "Puedes configurar manualmente editando slack_config.txt"
        echo "o creando un archivo .env con SLACK_WEBHOOK_URL=tu-url"
    fi
else
    echo ""
    echo "📝 Configuración manual:"
    echo ""
    echo "1. Edita slack_config.txt y configura tu webhook URL"
    echo "2. O crea .env con: SLACK_WEBHOOK_URL=tu-webhook-url"
    echo "3. Prueba con: python3 quick_slack_test.py"
    echo "4. Configura el secreto en GitHub"
    echo "5. Sube los cambios"
fi

echo ""
echo "📚 Scripts disponibles:"
echo "- quick_slack_test.py    → Prueba automática"
echo "- test_slack_webhook.py  → Prueba interactiva"
echo "- setup_slack_notifications.sh → Configuración completa"
