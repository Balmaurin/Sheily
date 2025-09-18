#!/bin/bash

# 🚀 Script de Inicio Simple - Sheily AI
# Versión simplificada para inicio rápido

set -e

echo "🚀 Iniciando Sheily AI - Servicios Esenciales"
echo "=============================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/server.js" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Activar entorno virtual si existe
if [ -d "backend/venv" ]; then
    echo "📦 Activando entorno virtual..."
    source backend/venv/bin/activate
elif [ -d "venv" ]; then
    echo "📦 Activando entorno virtual..."
    source venv/bin/activate
fi

# Iniciar servidor LLM en background
echo "🧠 Iniciando servidor LLM (puerto 8005)..."
cd backend
nohup python3 ../run_llama_chat.py > ../logs/llm_server.log 2>&1 &
LLM_PID=$!
echo "✅ Servidor LLM iniciado (PID: $LLM_PID)"

# Esperar un momento para que el LLM se cargue
echo "⏳ Esperando que el modelo se cargue..."
sleep 10

# Iniciar backend
echo "🚀 Iniciando backend (puerto 8000)..."
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

cd ..

echo ""
echo "🎉 Servicios iniciados correctamente!"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "🧠 Servidor LLM: http://localhost:8005"
echo ""
echo "📝 Para iniciar el frontend:"
echo "   cd Frontend && npm run dev"
echo ""
echo "🛑 Para detener: Ctrl+C"

# Función de limpieza
cleanup() {
    echo ""
    echo "🛑 Cerrando servicios..."
    kill $LLM_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    echo "✅ Servicios cerrados"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Mantener el script ejecutándose
while true; do
    sleep 60
    echo "💓 Sistema funcionando - $(date '+%H:%M:%S')"
done
