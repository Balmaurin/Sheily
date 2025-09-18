#!/bin/bash

echo "🚀 Configuración Completa de Notificaciones Slack para Shaili-AI"
echo "============================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f ".github/workflows/ci.yml" ]; then
    echo "❌ Error: No se encuentra el archivo .github/workflows/ci.yml"
    echo "   Asegúrate de estar en la raíz del proyecto Shaili-AI"
    exit 1
fi

echo "✅ Verificando archivos modificados..."

# Verificar archivos
files_to_check=(".github/workflows/ci.yml" "scripts/slack_notification.py" "test_slack_webhook.py")
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANTE"
    fi
done

echo ""
echo "📝 Archivos listos para commit:"
git status --porcelain

echo ""
echo "🔄 Preparando commit..."
git add .github/workflows/ci.yml scripts/slack_notification.py test_slack_webhook.py

echo ""
echo "💾 Creando commit..."
git commit -m "feat: Agregar notificaciones Slack al workflow CI/CD

- Corregir nombre del secreto SLACK_WEBHOOK_URL
- Crear script personalizado de notificaciones Slack
- Agregar script de prueba para validar configuración
- Mejorar formato de mensajes con emojis y detalles"

echo ""
echo "📤 Subiendo cambios a GitHub..."
git push origin main

echo ""
echo "🎉 ¡Cambios subidos exitosamente!"
echo ""
echo "📋 PASOS FINALES - Configurar secreto en GitHub:"
echo "==============================================="
echo ""
echo "1. Ve a tu repositorio en GitHub"
echo "2. Settings → Secrets and variables → Actions"
echo "3. New repository secret:"
echo "   - Name: SLACK_WEBHOOK_URL"
echo "   - Value: [tu webhook URL de Slack]"
echo ""
echo "4. Para obtener el webhook URL de Slack:"
echo "   - Ve a https://slack.com/apps"
echo "   - Busca 'Incoming WebHooks'"
echo "   - Crea un nuevo webhook"
echo "   - Selecciona el canal deseado"
echo "   - Copia la URL que te da Slack"
echo ""
echo "5. Prueba la configuración:"
echo "   python test_slack_webhook.py"
echo ""
echo "✅ ¡Listo! Tu workflow ahora enviará notificaciones a Slack."
