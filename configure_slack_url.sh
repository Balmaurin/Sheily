#!/bin/bash

echo "🔗 Configuración de URL de Slack Webhook"
echo "========================================"

# Función para validar URL de Slack
validate_slack_url() {
    local url=$1
    if [[ $url == https://hooks.slack.com/services/* ]]; then
        return 0
    else
        return 1
    fi
}

# Pedir URL de Slack
echo "📝 Necesitas una URL de webhook de Slack."
echo "   Si no la tienes, obténla en: https://slack.com/apps → Incoming WebHooks"
echo ""

read -p "Ingresa tu URL de webhook de Slack: " slack_url

# Validar URL
if ! validate_slack_url "$slack_url"; then
    echo "❌ URL inválida"
    echo "   Debe empezar con: https://hooks.slack.com/services/"
    echo "   Ejemplo: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
    exit 1
fi

echo "✅ URL válida detectada"

# Crear archivo .env
echo "SLACK_WEBHOOK_URL=$slack_url" > .env
echo "✅ Archivo .env creado"

# Actualizar slack_config.txt si existe
if [ -f "slack_config.txt" ]; then
    # Crear backup
    cp slack_config.txt slack_config.txt.backup

    # Reemplazar la línea en slack_config.txt
    sed -i "s|#SLACK_WEBHOOK_URL=.*|SLACK_WEBHOOK_URL=$slack_url|" slack_config.txt
    echo "✅ Archivo slack_config.txt actualizado"
fi

# Probar la configuración
echo ""
echo "🧪 Probando configuración..."
python3 quick_slack_test.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Configuración completada exitosamente!"
    echo ""
    echo "📋 RESUMEN:"
    echo "=========="
    echo "✅ URL de Slack configurada"
    echo "✅ Archivo .env creado"
    echo "✅ Configuración probada exitosamente"
    echo ""
    echo "🚀 PRÓXIMOS PASOS:"
    echo "=================="
    echo "1. Configurar repositorio GitHub (si no está hecho)"
    echo "2. Ejecutar: ./push_to_github.sh"
    echo "3. Configurar secreto en GitHub Settings"
    echo "4. ¡Las notificaciones funcionarán automáticamente!"
else
    echo ""
    echo "⚠️  La prueba falló, pero la configuración se guardó"
    echo "   Verifica tu URL de Slack e intenta nuevamente"
fi
