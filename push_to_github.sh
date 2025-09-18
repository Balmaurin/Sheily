#!/bin/bash

echo "📤 Push Final a GitHub - Shaili-AI"
echo "=================================="

# Verificar que hay remote configurado
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ Error: No hay remote configurado"
    echo "   Ejecuta primero:"
    echo "   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git"
    exit 1
fi

echo "✅ Remote configurado:"
git remote get-url origin
echo ""

# Cambiar a rama main si es necesario
current_branch=$(git branch --show-current)
if [ "$current_branch" = "master" ]; then
    echo "🌿 Cambiando a rama 'main'..."
    git branch -m master main
    current_branch="main"
fi

echo "🚀 Subiendo cambios..."
if git push -u origin "$current_branch"; then
    echo ""
    echo "🎉 ¡ÉXITO! Todos los cambios subidos a GitHub"
    echo ""
    echo "📋 Información del repositorio:"
    echo "- URL: $(git remote get-url origin | sed 's/\.git$//')"
    echo "- Rama: $current_branch"
    echo "- Commits: $(git rev-list --count HEAD)"
    echo ""
    echo "⚙️  SIGUIENTE PASO - Configurar Slack:"
    echo "======================================"
    echo "1. Ve a: $(git remote get-url origin | sed 's/\.git$/\/settings\/secrets\/actions/')"
    echo "2. New repository secret:"
    echo "   - Name: SLACK_WEBHOOK_URL"
    echo "   - Value: [tu webhook URL de Slack]"
    echo ""
    echo "3. ¡Las notificaciones funcionarán automáticamente!"
    echo ""
    echo "📊 Estado del repositorio:"
    git log --oneline -3
else
    echo ""
    echo "❌ Error al subir cambios"
    echo "   Solución: git pull origin $current_branch --rebase"
fi
