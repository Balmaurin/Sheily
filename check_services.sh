#!/bin/bash

# 🔍 Script de Verificación de Servicios - Sheily AI
# Verifica que todos los servicios estén funcionando correctamente

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 VERIFICANDO SERVICIOS DE SHEILY AI${NC}"
echo "=============================================="

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    local expected_response=$3
    
    echo -n "Verificando $name... "
    
    if curl -s "$url" | grep -q "$expected_response" 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Verificar puertos
echo -e "\n${BLUE}🔌 Verificando puertos:${NC}"
for port in 8000 8005 5432; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "Puerto $port: ${GREEN}✅ En uso${NC}"
    else
        echo -e "Puerto $port: ${RED}❌ Libre${NC}"
    fi
done

# Verificar servicios
echo -e "\n${BLUE}🌐 Verificando servicios:${NC}"

# Backend API
check_service "Backend API" "http://localhost:8000/api/health" "OK"

# Servidor LLM
check_service "Servidor LLM" "http://localhost:8005/health" "ok"

# Modelos disponibles
echo -n "Verificando modelos disponibles... "
if curl -s "http://localhost:8000/api/models/available" | grep -q "Sheily-Llama" 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️ Sin modelos${NC}"
fi

# Base de datos
echo -n "Verificando base de datos... "
if psql -h localhost -U sheily_ai_user -d sheily_ai_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

# Verificar endpoints específicos
echo -e "\n${BLUE}📡 Verificando endpoints:${NC}"

endpoints=(
    "http://localhost:8000/api/auth/test:Autenticación"
    "http://localhost:8000/api/dashboard:Dashboard"
    "http://localhost:8000/api/chat/health:Chat Health"
    "http://localhost:8005/info:LLM Info"
)

for endpoint in "${endpoints[@]}"; do
    url=$(echo $endpoint | cut -d: -f1)
    name=$(echo $endpoint | cut -d: -f2)
    
    echo -n "Verificando $name... "
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ERROR${NC}"
    fi
done

# Resumen
echo -e "\n${BLUE}📊 RESUMEN:${NC}"
echo "============"

# Contar servicios funcionando
total_services=4
working_services=0

if curl -s "http://localhost:8000/api/health" | grep -q "OK" 2>/dev/null; then
    ((working_services++))
fi

if curl -s "http://localhost:8005/health" | grep -q "ok" 2>/dev/null; then
    ((working_services++))
fi

if psql -h localhost -U sheily_ai_user -d sheily_ai_db -c "SELECT 1;" >/dev/null 2>&1; then
    ((working_services++))
fi

if curl -s "http://localhost:8000/api/models/available" | grep -q "Sheily-Llama" 2>/dev/null; then
    ((working_services++))
fi

echo -e "Servicios funcionando: ${working_services}/${total_services}"

if [ $working_services -eq $total_services ]; then
    echo -e "\n${GREEN}🎉 ¡TODOS LOS SERVICIOS ESTÁN FUNCIONANDO CORRECTAMENTE!${NC}"
    echo -e "${GREEN}✅ El frontend puede conectarse sin problemas${NC}"
    exit 0
elif [ $working_services -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️ ALGUNOS SERVICIOS ESTÁN FUNCIONANDO${NC}"
    echo -e "${YELLOW}Revisa los servicios con errores${NC}"
    exit 1
else
    echo -e "\n${RED}❌ NINGÚN SERVICIO ESTÁ FUNCIONANDO${NC}"
    echo -e "${RED}Ejecuta ./start_all_services.sh para iniciar todos los servicios${NC}"
    exit 1
fi
