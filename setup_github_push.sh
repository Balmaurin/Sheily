#!/bin/bash

echo "🚀 Configuración de GitHub Push para Shaili-AI"
echo "=============================================="

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo "❌ Error: No se encuentra repositorio git"
    echo "   Ejecuta: git init"
    exit 1
fi

# Verificar estado del repositorio
echo "📊 Estado actual del repositorio:"
git status --short
echo ""

# Verificar si ya hay remote configurado
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote 'origin' ya configurado:"
    git remote get-url origin
    echo ""

    # Preguntar si quiere cambiar el remote
    read -p "¿Quieres cambiar la URL del repositorio? (s/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🔄 Configurando nuevo remote..."
        read -p "Ingresa la URL completa de tu repositorio GitHub: " repo_url

        if [[ $repo_url == https://github.com/* ]]; then
            git remote set-url origin "$repo_url"
            echo "✅ Remote actualizado: $repo_url"
        else
            echo "❌ URL inválida. Debe empezar con https://github.com/"
            exit 1
        fi
    fi
else
    echo "📝 No hay remote configurado"
    echo ""
    echo "🔗 Para configurar el remote, necesitas:"
    echo "1. Crear un repositorio en GitHub (si no existe)"
    echo "2. Copiar la URL del repositorio"
    echo "3. Proporcionarla aquí"
    echo ""

    read -p "¿Tienes la URL de tu repositorio GitHub? (s/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Ingresa la URL completa de tu repositorio GitHub: " repo_url

        if [[ $repo_url == https://github.com/* ]]; then
            git remote add origin "$repo_url"
            echo "✅ Remote configurado: $repo_url"
        else
            echo "❌ URL inválida. Debe empezar con https://github.com/"
            echo ""
            echo "💡 Ejemplo: https://github.com/tu-usuario/shaili-ai.git"
            exit 1
        fi
    else
        echo "ℹ️  Para crear un repositorio en GitHub:"
        echo "   1. Ve a https://github.com/new"
        echo "   2. Nombre: shaili-ai"
        echo "   3. Descripción: Sistema completo de IA con especialización en entrenamiento personalizado"
        echo "   4. Público o privado según prefieras"
        echo "   5. NO marques 'Add README' ni '.gitignore'"
        echo "   6. Haz clic en 'Create repository'"
        echo "   7. Copia la URL que aparece"
        echo ""
        echo "🔄 Ejecuta este script nuevamente cuando tengas la URL"
        exit 0
    fi
fi

echo ""
echo "🔄 Verificando conexión con GitHub..."
if git ls-remote --heads origin >/dev/null 2>&1; then
    echo "✅ Conexión exitosa con GitHub"
else
    echo "❌ Error de conexión con GitHub"
    echo "   Verifica que:"
    echo "   - La URL del repositorio sea correcta"
    echo "   - Tienes permisos para acceder al repositorio"
    echo "   - Tu clave SSH está configurada (si usas SSH)"
    echo ""
    echo "🔧 Para configurar SSH con GitHub:"
    echo "   1. ssh-keygen -t ed25519 -C 'tu-email@example.com'"
    echo "   2. cat ~/.ssh/id_ed25519.pub"
    echo "   3. Copia la clave y pégala en GitHub → Settings → SSH and GPG keys"
    exit 1
fi

echo ""
echo "📤 Preparando push a GitHub..."

# Cambiar a rama main si es necesario (GitHub prefiere main sobre master)
current_branch=$(git branch --show-current)
if [ "$current_branch" = "master" ]; then
    echo "🌿 Cambiando de 'master' a 'main' (estándar de GitHub)"
    git branch -m master main
    current_branch="main"
fi

echo "📤 Subiendo cambios a GitHub..."
if git push -u origin "$current_branch"; then
    echo ""
    echo "🎉 ¡Éxito! Cambios subidos a GitHub"
    echo ""
    echo "📋 RESUMEN:"
    echo "==========="
    echo "✅ Repositorio: $(git remote get-url origin)"
    echo "✅ Rama: $current_branch"
    echo "✅ Commits subidos: $(git log --oneline origin/$current_branch..HEAD | wc -l)"
    echo ""
    echo "🔗 Enlaces importantes:"
    echo "- Repositorio: $(git remote get-url origin | sed 's/\.git$//')"
    echo "- Actions: $(git remote get-url origin | sed 's/\.git$/\/actions/')"
    echo "- Settings: $(git remote get-url origin | sed 's/\.git$/\/settings/')"
    echo ""
    echo "⚙️  PRÓXIMOS PASOS:"
    echo "=================="
    echo "1. Ve a tu repositorio en GitHub"
    echo "2. Settings → Secrets and variables → Actions"
    echo "3. New repository secret:"
    echo "   - Name: SLACK_WEBHOOK_URL"
    echo "   - Value: [tu webhook URL de Slack]"
    echo ""
    echo "4. ¡Listo! Las notificaciones Slack funcionarán automáticamente"
else
    echo ""
    echo "❌ Error al subir cambios"
    echo "   Posibles causas:"
    echo "   - Conflicto con cambios existentes en GitHub"
    echo "   - Permisos insuficientes"
    echo "   - Autenticación fallida"
    echo ""
    echo "🔧 Soluciones:"
    echo "   - git pull origin $current_branch --rebase"
    echo "   - Verificar credenciales de GitHub"
    echo "   - Configurar token de acceso personal"
    exit 1
fi
