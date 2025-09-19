#!/bin/bash

# =============================================================================
# SHEILY AI - SCRIPT PARA DETENER TODOS LOS SERVICIOS
# =============================================================================

echo "🛑 DETENIENDO TODOS LOS SERVICIOS DE SHEILY AI"
echo "=============================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para detener proceso en puerto
stop_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}Deteniendo $service (puerto $port)...${NC}"
        fuser -k $port/tcp 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ $service detenido${NC}"
    else
        echo "ℹ️  $service no estaba activo (puerto $port)"
    fi
}

# Detener servicios por puerto
stop_port 3000 "Frontend"
stop_port 8000 "Backend API"
stop_port 8005 "LLM Server"
stop_port 8080 "AI System"
stop_port 8090 "Blockchain"

# Detener PostgreSQL
echo -e "${YELLOW}Deteniendo PostgreSQL...${NC}"
sudo service postgresql stop 2>/dev/null
echo -e "${GREEN}✅ PostgreSQL detenido${NC}"

# Matar procesos Python restantes relacionados con Sheily
echo ""
echo "Limpiando procesos Python restantes..."
pkill -f "sheily" 2>/dev/null || true
pkill -f "llm_server" 2>/dev/null || true
pkill -f "backend_integrado" 2>/dev/null || true
pkill -f "frontend_simple" 2>/dev/null || true
pkill -f "ai_system_server" 2>/dev/null || true
pkill -f "blockchain" 2>/dev/null || true

echo ""
echo "=========================================="
echo -e "${GREEN}✅ TODOS LOS SERVICIOS HAN SIDO DETENIDOS${NC}"
echo "=========================================="
echo ""
echo "Para reiniciar el sistema, ejecuta:"
echo "   ./start_sheily_complete.sh"