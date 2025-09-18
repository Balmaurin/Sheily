#!/usr/bin/env bash
set -euo pipefail

# Script para levantar y configurar Ollama con modelo SHEILY
# Autor: SHEILY AI System
# Fecha: $(date +%Y-%m-%d)

echo "🚀 Iniciando servicio LLM con Ollama..."

# Verificar que Docker esté disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado o no está en el PATH"
    echo "   Por favor instala Docker antes de continuar"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: docker-compose no está disponible"
    echo "   Por favor instala docker-compose o usa Docker con soporte para 'compose'"
    exit 1
fi

# Navegar al directorio del proyecto
cd "$(dirname "$0")/.."

echo "📁 Directorio de trabajo: $(pwd)"

# Levantar el servicio Ollama
echo "🐳 Levantando contenedor Ollama..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f llm/docker-compose.llm.yml up -d
else
    docker compose -f llm/docker-compose.llm.yml up -d
fi

# Esperar a que el servicio esté disponible
echo "⏳ Esperando a que Ollama esté listo..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -sSf http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama está listo!"
        break
    fi
    
    echo "   Intento $((attempt + 1))/$max_attempts - Esperando..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: Ollama no respondió después de $((max_attempts * 2)) segundos"
    echo "   Revisa los logs con: docker logs sheily-llm-ollama"
    exit 1
fi

# Descargar modelo base si no existe
echo "📥 Verificando modelo base llama3.2:3b-instruct..."
if ! docker exec sheily-llm-ollama ollama list | grep -q "llama3.2:3b-instruct"; then
    echo "📥 Descargando modelo base llama3.2:3b-instruct..."
    docker exec sheily-llm-ollama ollama pull llama3.2:3b-instruct
    echo "✅ Modelo base descargado"
else
    echo "✅ Modelo base ya disponible"
fi

# Crear modelo personalizado SHEILY
echo "🔧 Creando modelo personalizado SHEILY..."
docker exec -w /workspace sheily-llm-ollama ollama create sheily-llm -f Modelfile

# Verificar que el modelo se creó correctamente
if docker exec sheily-llm-ollama ollama list | grep -q "sheily-llm"; then
    echo "✅ Modelo SHEILY creado exitosamente"
else
    echo "❌ Error: No se pudo crear el modelo SHEILY"
    exit 1
fi

# Probar el modelo con una consulta simple
echo "🧪 Probando el modelo SHEILY..."
test_response=$(curl -s http://localhost:11434/api/generate \
  -d '{"model":"sheily-llm","prompt":"Hola, ¿cómo estás?","stream":false}' \
  | jq -r '.response' 2>/dev/null || echo "Error en respuesta")

if [ "$test_response" != "Error en respuesta" ] && [ -n "$test_response" ]; then
    echo "✅ Modelo SHEILY funcionando correctamente"
    echo "📝 Respuesta de prueba: ${test_response:0:100}..."
else
    echo "⚠️  Advertencia: No se pudo verificar la respuesta del modelo"
fi

echo ""
echo "🎉 ¡Sistema LLM SHEILY listo!"
echo "📍 Endpoint: http://localhost:11434"
echo "🤖 Modelo: sheily-llm"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver modelos: docker exec sheily-llm-ollama ollama list"
echo "   Ver logs: docker logs sheily-llm-ollama"
echo "   Parar servicio: docker-compose -f llm/docker-compose.llm.yml down"
echo ""
echo "🧪 Probar con curl:"
echo '   curl http://localhost:11434/api/generate -d '"'"'{"model":"sheily-llm","prompt":"Dame un plan de test de seguridad en 5 pasos"}'"'"
