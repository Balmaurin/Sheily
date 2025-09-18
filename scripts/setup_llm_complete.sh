#!/usr/bin/env bash
set -euo pipefail

# Script completo de configuración del sistema LLM SHEILY
# Autor: SHEILY AI System
# Fecha: $(date +%Y-%m-%d)

echo "🚀 Configuración completa del sistema LLM SHEILY"
echo "================================================"

# Verificar prerrequisitos
echo "🔍 Verificando prerrequisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "   Instala Docker antes de continuar:"
    echo "   sudo apt update && sudo apt install docker.io docker-compose"
    exit 1
fi

# Verificar docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: docker-compose no está disponible"
    echo "   Instala docker-compose antes de continuar"
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 no está instalado"
    exit 1
fi

echo "✅ Prerrequisitos verificados"

# Navegar al directorio del proyecto
cd "$(dirname "$0")/.."
echo "📁 Directorio de trabajo: $(pwd)"

# Paso 1: Levantar servicio LLM
echo ""
echo "🐳 Paso 1: Levantando servicio LLM con Ollama..."
./scripts/run_llm_ollama.sh

if [ $? -ne 0 ]; then
    echo "❌ Error levantando servicio LLM"
    exit 1
fi

# Paso 2: Verificar instalación
echo ""
echo "🧪 Paso 2: Verificando instalación..."

# Esperar un momento para que el servicio se estabilice
sleep 5

# Verificar que el servicio esté respondiendo
if ! curl -sSf http://localhost:11434/api/tags >/dev/null; then
    echo "❌ Error: Servicio Ollama no responde"
    echo "   Revisa los logs: docker logs sheily-llm-ollama"
    exit 1
fi

echo "✅ Servicio LLM funcionando"

# Paso 3: Probar integración
echo ""
echo "🔧 Paso 3: Probando integración del sistema..."

# Ejecutar pruebas de integración
python3 scripts/test_llm_integration.py

if [ $? -eq 0 ]; then
    echo "✅ Todas las pruebas pasaron"
else
    echo "⚠️ Algunas pruebas fallaron, pero el sistema básico está funcionando"
fi

# Paso 4: Mostrar información de uso
echo ""
echo "🎉 ¡Sistema LLM SHEILY configurado exitosamente!"
echo "================================================"
echo ""
echo "📍 Endpoints disponibles:"
echo "   • Ollama API: http://localhost:11434"
echo "   • Modelo SHEILY: sheily-llm"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver modelos: docker exec sheily-llm-ollama ollama list"
echo "   • Ver logs: docker logs sheily-llm-ollama"
echo "   • Parar servicio: docker-compose -f llm/docker-compose.llm.yml down"
echo "   • Reiniciar: docker-compose -f llm/docker-compose.llm.yml restart"
echo ""
echo "🧪 Probar el sistema:"
echo '   curl http://localhost:11434/api/generate -d '"'"'{"model":"sheily-llm","prompt":"Hola SHEILY, ¿cómo estás?"}'"'"
echo ""
echo "📚 Documentación:"
echo "   • README_LLM.md - Guía completa del sistema"
echo "   • docs/ORCHESTRATOR_GUIDE.md - Guía del orquestador"
echo ""
echo "🚀 ¡El sistema está listo para usar!"

# Mostrar estado final
echo ""
echo "📊 Estado del sistema:"
docker ps | grep ollama || echo "   ⚠️ Contenedor Ollama no encontrado"
curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null || echo "   ⚠️ No se pudieron listar los modelos"
