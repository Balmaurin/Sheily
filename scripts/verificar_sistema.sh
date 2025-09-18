#!/bin/bash

# Script de verificación del sistema NeuroFusion
# Versión: 1.0.0
# Autor: Equipo NeuroFusion

# Colores para salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

# Función para imprimir encabezado
print_header() {
    echo -e "${YELLOW}🔍 Verificando: $1 ${NC}"
}

# Función para imprimir resultado
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 ${NC}"
    else
        echo -e "${RED}❌ $2 ${NC}"
    fi
}

# Verificar versiones de dependencias
check_dependencies() {
    print_header "Dependencias del Sistema"
    
    # Python
    python3 --version > /dev/null 2>&1
    print_result $? "Python instalado"
    
    # PyTorch
    python3 -c "import torch" > /dev/null 2>&1
    print_result $? "PyTorch instalado"
    
    # PostgreSQL
    psql --version > /dev/null 2>&1
    print_result $? "PostgreSQL instalado"
}

# Verificar bases de datos
check_databases() {
    print_header "Bases de Datos"
    
    # Verificar conexión PostgreSQL
    psql -l > /dev/null 2>&1
    print_result $? "Conexión PostgreSQL"
    
    # Verificar bases de datos específicas
    databases=("neurofusion_db" "knowledge_base" "embeddings")
    for db in "${databases[@]}"; do
        psql -d "$db" -c "\dt" > /dev/null 2>&1
        print_result $? "Base de datos $db accesible"
    done
}

# Verificar módulos de IA
check_ai_modules() {
    print_header "Módulos de IA"
    
    modules=(
        "modules.ai_components.advanced_ai_system"
        "modules.unified_systems.unified_generation_response_system"
        "modules.training.download_headqa_dataset"
    )
    
    for module in "${modules[@]}"; do
        python3 -c "import $module" > /dev/null 2>&1
        print_result $? "Módulo $module importado"
    done
}

# Verificar Docker
check_docker() {
    print_header "Configuración Docker"
    
    # Verificar instalación de Docker
    docker --version > /dev/null 2>&1
    print_result $? "Docker instalado"
    
    # Verificar docker-compose
    docker-compose --version > /dev/null 2>&1
    print_result $? "Docker Compose instalado"
    
    # Verificar archivos de configuración
    docker_files=(
        "docker-compose.yml"
        "docker-compose.dev.yml"
        "docker/Dockerfile"
        "backend.docker/Dockerfile"
        "frontend.docker/Dockerfile"
    )
    
    for file in "${docker_files[@]}"; do
        [ -f "$file" ] && echo -e "${GREEN}✅ Archivo Docker $file existe ${NC}" || echo -e "${RED}❌ Archivo Docker $file NO existe ${NC}"
    done
}

# Verificar rendimiento
check_performance() {
    print_header "Rendimiento del Sistema"
    
    # Prueba de tiempo de importación de módulos principales
    time python3 -c "
import modules.core.neurofusion_core
import modules.unified_systems.module_initializer
import modules.ai_components.advanced_ai_system
" > /dev/null 2>&1
    
    print_result $? "Importación de módulos principales"
}

# Función principal
main() {
    echo -e "${YELLOW}🚀 Iniciando verificación del sistema NeuroFusion ${NC}"
    
    check_dependencies
    check_databases
    check_ai_modules
    check_docker
    check_performance
    
    echo -e "${GREEN}✨ Verificación del sistema completada ${NC}"
}

# Ejecutar verificación
main
