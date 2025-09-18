#!/bin/bash

# Script de auto-recuperación para Backend Sheily AI
# Siempre usa puerto 8000 y se auto-recupera si hay problemas

echo "🚀 Iniciando Backend Sheily AI con Auto-Recuperación"
echo "📍 Puerto fijo: 8000"
echo "🔄 Auto-recuperación: ACTIVADA"
echo ""

# Función para liberar puerto 8000
liberar_puerto() {
    echo "🧹 Liberando puerto 8000..."
    sudo fuser -k 8000/tcp 2>/dev/null || echo "Puerto 8000 ya está libre"
    sleep 2
}

# Función para verificar si el backend está funcionando
verificar_backend() {
    curl -s --connect-timeout 5 http://localhost:8000/api/health > /dev/null 2>&1
    return $?
}

# Función para iniciar el backend
iniciar_backend() {
    echo "🚀 Iniciando Backend en puerto 8000..."
    cd "/home/yo/Escritorio/DEFINITIVO (Copiar 3)/shaili-ai"
    source venv/bin/activate
    export JWT_SECRET="sheily-ai-jwt-secret-2025-ultra-secure-random-string-128-bits"
    export DB_PASSWORD="SheilyAI2025SecurePassword!"
    export PORT=8000
    
    # Iniciar en background (usando backend simplificado)
    nohup node backend_simple.js > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend iniciado con PID: $BACKEND_PID"
    
    # Esperar a que se inicie
    sleep 10
    
    # Verificar si está funcionando
    if verificar_backend; then
        echo "✅ Backend funcionando correctamente en puerto 8000"
        return 0
    else
        echo "❌ Backend falló al iniciar"
        return 1
    fi
}

# Función principal de monitoreo
monitorear_backend() {
    echo "👁️ Iniciando monitoreo del Backend..."
    echo "🔄 Verificando cada 30 segundos..."
    echo ""
    
    while true; do
        if ! verificar_backend; then
            echo "⚠️ Backend no responde - Iniciando recuperación automática"
            echo "🕐 $(date): Reiniciando Backend..."
            
            # Matar proceso si existe
            pkill -f "node.*backend" 2>/dev/null
            
            # Liberar puerto
            liberar_puerto
            
            # Reiniciar
            if iniciar_backend; then
                echo "✅ Backend recuperado exitosamente"
            else
                echo "❌ Error en recuperación - Reintentando en 60 segundos"
                sleep 60
            fi
        else
            echo "✅ Backend OK - $(date)"
        fi
        
        sleep 30
    done
}

# Función para manejar señales de terminación
cleanup() {
    echo ""
    echo "🛑 Recibida señal de terminación"
    echo "🧹 Limpiando procesos..."
    pkill -f "node.*backend" 2>/dev/null
    liberar_puerto
    echo "✅ Limpieza completada"
    exit 0
}

# Configurar manejo de señales
trap cleanup SIGINT SIGTERM

# Verificar si ya hay un backend funcionando
if verificar_backend; then
    echo "✅ Backend ya está funcionando en puerto 8000"
    echo "🔄 Iniciando solo monitoreo..."
    monitorear_backend
else
    echo "🚀 Backend no detectado - Iniciando nuevo proceso"
    liberar_puerto
    
    if iniciar_backend; then
        echo "✅ Backend iniciado exitosamente"
        echo "🔄 Iniciando monitoreo..."
        monitorear_backend
    else
        echo "❌ Error al iniciar Backend"
        echo "🔄 Reintentando en 10 segundos..."
        sleep 10
        liberar_puerto
        iniciar_backend
        monitorear_backend
    fi
fi
