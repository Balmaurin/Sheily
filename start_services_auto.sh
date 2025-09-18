#!/bin/bash

# Script automatizado para iniciar servicios de Sheily AI
# Sin solicitar contraseñas interactivamente

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo "================================"
    echo -e "${YELLOW}$1${NC}"
    echo "================================"
}

echo "================================"
echo "🚀 INICIANDO SHEILY AI - SISTEMA COMPLETO (AUTOMÁTICO)"
echo "================================"

# Verificar directorio
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto Sheily AI"
    exit 1
fi
print_success "Directorio del proyecto verificado"

# Verificar dependencias
print_header "📋 VERIFICANDO DEPENDENCIAS"

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_success "Node.js: $(node --version)"

if ! command -v python3 &> /dev/null; then
    print_error "Python3 no está instalado"
    exit 1
fi
print_success "Python3: $(python3 --version)"

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    exit 1
fi
print_success "PostgreSQL disponible"

# Verificar PostgreSQL automáticamente
print_header "🗄️ CONFIGURANDO BASE DE DATOS"

export PGPASSWORD='SheilyAI2025SecurePassword'

if psql -h localhost -U sheily_ai_user -d sheily_ai_db -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Base de datos PostgreSQL conectada"
else
    print_error "No se puede conectar a la base de datos PostgreSQL"
    print_status "Intentando configurar base de datos..."
    
    # Intentar crear usuario y BD si no existen
    sudo -u postgres psql -c "CREATE USER sheily_ai_user WITH PASSWORD 'SheilyAI2025SecurePassword';" 2>/dev/null || print_status "Usuario ya existe"
    sudo -u postgres psql -c "CREATE DATABASE sheily_ai_db OWNER sheily_ai_user;" 2>/dev/null || print_status "Base de datos ya existe"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sheily_ai_db TO sheily_ai_user;" 2>/dev/null
    
    # Probar conexión nuevamente
    if psql -h localhost -U sheily_ai_user -d sheily_ai_db -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Base de datos configurada y conectada"
    else
        print_error "No se pudo configurar la base de datos"
        exit 1
    fi
fi

# Activar entorno virtual
print_header "⚙️ CONFIGURANDO ENTORNO"

if [ -d "venv" ]; then
    print_status "Activando entorno virtual de Python..."
    source venv/bin/activate
    print_success "Entorno virtual activado"
else
    print_warning "No se encontró entorno virtual de Python"
fi

# Iniciar servidor LLM en background
print_header "🧠 INICIANDO SERVIDOR LLM (Puerto 8005)"

if [ -f "run_llama_chat.py" ]; then
    print_status "Iniciando servidor LLM..."
    python3 run_llama_chat.py > logs/llm_server.log 2>&1 &
    LLM_PID=$!
    sleep 3
    
    if kill -0 $LLM_PID 2>/dev/null; then
        print_success "Servidor LLM iniciado (PID: $LLM_PID)"
    else
        print_error "No se pudo iniciar el servidor LLM"
        exit 1
    fi
else
    print_warning "run_llama_chat.py no encontrado, saltando servidor LLM"
fi

# Iniciar backend
print_header "⚙️ INICIANDO BACKEND (Puerto 8000)"

cd backend

if [ -f "server.js" ]; then
    print_status "Iniciando servidor backend..."
    
    # Configurar variables de entorno para PostgreSQL
    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_NAME=sheily_ai_db
    export DB_USER=sheily_ai_user
    export DB_PASSWORD=SheilyAI2025SecurePassword
    export DB_TYPE=postgres
    
    node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 3
    
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend iniciado (PID: $BACKEND_PID)"
    else
        print_error "No se pudo iniciar el backend"
        exit 1
    fi
else
    print_error "server.js no encontrado en backend/"
    exit 1
fi

cd ..

# Verificar servicios
print_header "🔍 VERIFICANDO SERVICIOS"

# Verificar backend
sleep 2
if curl -s http://localhost:8000/api/health >/dev/null 2>&1; then
    print_success "Backend respondiendo en puerto 8000"
else
    print_warning "Backend no responde en puerto 8000 (puede necesitar más tiempo)"
fi

# Verificar LLM server
if curl -s http://localhost:8005/health >/dev/null 2>&1; then
    print_success "Servidor LLM respondiendo en puerto 8005"
else
    print_warning "Servidor LLM no responde en puerto 8005 (puede necesitar más tiempo)"
fi

print_header "🎉 SERVICIOS INICIADOS"

echo "✅ Servicios principales iniciados:"
echo "   🌐 Backend: http://localhost:8000"
echo "   🧠 LLM Server: http://localhost:8005"
echo "   🗄️ PostgreSQL: localhost:5432"
echo ""
echo "📋 PIDs de procesos:"
[ ! -z "$BACKEND_PID" ] && echo "   Backend: $BACKEND_PID"
[ ! -z "$LLM_PID" ] && echo "   LLM Server: $LLM_PID"
echo ""
echo "📊 Para monitorear logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/llm_server.log"
echo ""
echo "🛑 Para detener servicios:"
echo "   kill $BACKEND_PID $LLM_PID"

# Crear archivo con PIDs para fácil cleanup
echo "BACKEND_PID=$BACKEND_PID" > .service_pids
echo "LLM_PID=$LLM_PID" >> .service_pids

print_success "¡Sistema Sheily AI iniciado correctamente!"
print_status "Los servicios están ejecutándose en background"
