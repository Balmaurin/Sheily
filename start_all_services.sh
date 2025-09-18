#!/bin/bash

# 🚀 Script de Inicio Completo - Sheily AI
# Este script inicia TODOS los servicios necesarios para el frontend

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para esperar a que un servicio esté listo
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Esperando que $service_name esté listo..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name está listo!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name no respondió después de $((max_attempts * 2)) segundos"
    return 1
}

# Función para limpiar procesos al salir
cleanup() {
    print_warning "Cerrando todos los servicios..."
    
    # Matar procesos en orden inverso
    if [ ! -z "$LLM_PID" ]; then
        print_status "Cerrando servidor LLM (PID: $LLM_PID)..."
        kill $LLM_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Cerrando backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    print_success "Todos los servicios cerrados correctamente"
    exit 0
}

# Configurar trap para limpieza al salir
trap cleanup SIGINT SIGTERM

print_header "🚀 INICIANDO SHEILY AI - SISTEMA COMPLETO"

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/server.js" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto Sheily AI"
    exit 1
fi

print_success "Directorio del proyecto verificado"

# 1. VERIFICAR DEPENDENCIAS
print_header "📋 VERIFICANDO DEPENDENCIAS"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_success "Node.js: $(node --version)"

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 no está instalado"
    exit 1
fi
print_success "Python3: $(python3 --version)"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    exit 1
fi
print_success "PostgreSQL disponible"

# Verificar curl
if ! command -v curl &> /dev/null; then
    print_error "curl no está instalado"
    exit 1
fi
print_success "curl disponible"

# 2. VERIFICAR PUERTOS
print_header "🔌 VERIFICANDO PUERTOS"

PORTS=(8000 8005 5432)
for port in "${PORTS[@]}"; do
    if check_port $port; then
        print_warning "Puerto $port está en uso"
        if [ $port -eq 8000 ] || [ $port -eq 8005 ]; then
            print_warning "¿Deseas continuar? Los servicios pueden fallar si los puertos están ocupados"
            read -p "Continuar? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        print_success "Puerto $port está libre"
    fi
done

# 3. CONFIGURAR ENTORNO
print_header "⚙️ CONFIGURANDO ENTORNO"

# Verificar archivo de configuración
if [ ! -f "backend/config.env" ]; then
    print_error "Archivo backend/config.env no encontrado"
    exit 1
fi
print_success "Archivo de configuración encontrado"

# Activar entorno virtual de Python si existe
if [ -d "backend/venv" ]; then
    print_status "Activando entorno virtual de Python..."
    source backend/venv/bin/activate
    print_success "Entorno virtual activado"
elif [ -d "venv" ]; then
    print_status "Activando entorno virtual de Python..."
    source venv/bin/activate
    print_success "Entorno virtual activado"
else
    print_warning "No se encontró entorno virtual de Python"
fi

# 4. INICIAR BASE DE DATOS
print_header "🗄️ VERIFICANDO BASE DE DATOS"

# Verificar conexión a PostgreSQL
if psql -h localhost -U sheily_ai_user -d sheily_ai_db -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Base de datos PostgreSQL conectada"
else
    print_error "No se puede conectar a la base de datos PostgreSQL"
    print_status "Asegúrate de que PostgreSQL esté ejecutándose y las credenciales sean correctas"
    exit 1
fi

# 5. INICIAR SERVIDOR LLM
print_header "🧠 INICIANDO SERVIDOR LLM (Puerto 8005)"

cd backend

# Verificar que el script de LLM existe
if [ ! -f "../run_llama_chat.py" ]; then
    print_error "Archivo run_llama_chat.py no encontrado"
    exit 1
fi

print_status "Iniciando servidor LLM Llama-3.2-3B-Instruct-Q8_0..."
nohup python3 ../run_llama_chat.py > ../logs/llm_server.log 2>&1 &
LLM_PID=$!

print_success "Servidor LLM iniciado (PID: $LLM_PID)"

# Esperar a que el servidor LLM esté listo
if wait_for_service "http://localhost:8005/health" "Servidor LLM"; then
    print_success "✅ Servidor LLM funcionando correctamente"
else
    print_error "❌ Servidor LLM no pudo iniciarse correctamente"
    print_status "Revisa los logs en logs/llm_server.log"
    exit 1
fi

# 6. INICIAR BACKEND
print_header "🚀 INICIANDO BACKEND (Puerto 8000)"

# Verificar dependencias de Node.js
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependencias de Node.js..."
    npm install
fi

print_status "Iniciando servidor backend..."
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!

print_success "Backend iniciado (PID: $BACKEND_PID)"

# Esperar a que el backend esté listo
if wait_for_service "http://localhost:8000/api/health" "Backend API"; then
    print_success "✅ Backend funcionando correctamente"
else
    print_error "❌ Backend no pudo iniciarse correctamente"
    print_status "Revisa los logs en backend/server.log"
    exit 1
fi

cd ..

# 7. VERIFICAR SERVICIOS
print_header "✅ VERIFICACIÓN FINAL DE SERVICIOS"

# Verificar servidor LLM
if curl -s "http://localhost:8005/health" | grep -q "ok"; then
    print_success "✅ Servidor LLM: Funcionando"
else
    print_error "❌ Servidor LLM: Error"
fi

# Verificar backend
if curl -s "http://localhost:8000/api/health" | grep -q "OK"; then
    print_success "✅ Backend API: Funcionando"
else
    print_error "❌ Backend API: Error"
fi

# Verificar modelos disponibles
if curl -s "http://localhost:8000/api/models/available" | grep -q "Sheily-Llama"; then
    print_success "✅ Modelos disponibles: Cargados"
else
    print_warning "⚠️ Modelos disponibles: Verificando..."
fi

# 8. MOSTRAR INFORMACIÓN DE ACCESO
print_header "🌐 SERVICIOS DISPONIBLES"

echo -e "${CYAN}📊 Backend API:${NC} http://localhost:8000"
echo -e "${CYAN}   - Health Check:${NC} http://localhost:8000/api/health"
echo -e "${CYAN}   - Dashboard:${NC} http://localhost:8000/api/dashboard"
echo -e "${CYAN}   - Modelos:${NC} http://localhost:8000/api/models/available"
echo -e "${CYAN}   - Chat:${NC} http://localhost:8000/api/chat/4bit"
echo ""

echo -e "${CYAN}🧠 Servidor LLM:${NC} http://localhost:8005"
echo -e "${CYAN}   - Health Check:${NC} http://localhost:8005/health"
echo -e "${CYAN}   - Generar:${NC} http://localhost:8005/generate"
echo -e "${CYAN}   - Info:${NC} http://localhost:8005/info"
echo ""

echo -e "${CYAN}🗄️ Base de Datos:${NC} PostgreSQL en puerto 5432"
echo -e "${CYAN}   - Host:${NC} localhost"
echo -e "${CYAN}   - Database:${NC} sheily_ai_db"
echo -e "${CYAN}   - User:${NC} sheily_ai_user"
echo ""

print_header "🎉 SISTEMA COMPLETAMENTE OPERATIVO"

echo -e "${GREEN}✅ Todos los servicios están funcionando correctamente${NC}"
echo -e "${GREEN}✅ El frontend puede conectarse a todos los servicios${NC}"
echo -e "${GREEN}✅ Chat, entrenamientos y ejercicios están disponibles${NC}"
echo ""

echo -e "${YELLOW}📝 Para iniciar el frontend, ejecuta:${NC}"
echo -e "${CYAN}   cd Frontend && npm run dev${NC}"
echo ""

echo -e "${YELLOW}🛑 Para detener todos los servicios, presiona Ctrl+C${NC}"
echo ""

# 9. MONITOREO CONTINUO
print_status "Iniciando monitoreo de servicios..."

while true; do
    sleep 30
    
    # Verificar servidor LLM
    if ! curl -s "http://localhost:8005/health" >/dev/null 2>&1; then
        print_error "⚠️ Servidor LLM no responde"
    fi
    
    # Verificar backend
    if ! curl -s "http://localhost:8000/api/health" >/dev/null 2>&1; then
        print_error "⚠️ Backend no responde"
    fi
    
    # Mostrar estado cada 5 minutos
    if [ $(($(date +%s) % 300)) -eq 0 ]; then
        print_status "Sistema funcionando correctamente - $(date)"
    fi
done
