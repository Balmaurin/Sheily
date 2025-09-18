#!/bin/bash
# Script de activación del entorno virtual

# Determinar la ruta absoluta del proyecto
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ruta al entorno virtual
VENV_PATH="${PROJECT_ROOT}/venv"

# Verificar si el entorno virtual existe
if [ ! -d "${VENV_PATH}" ]; then
    echo "❌ El entorno virtual no existe. Ejecuta setup_virtual_environment.py primero."
    return 1
fi

# Activar el entorno virtual
echo "🔧 Activando entorno virtual..."
source "${VENV_PATH}/bin/activate"

# Mostrar información del entorno
echo "✅ Entorno virtual activado"
echo "🐍 Python: $(python --version)"
echo "📦 Pip: $(pip --version)"
echo ""
echo "Para desactivar: deactivate"
