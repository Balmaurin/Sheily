#!/bin/bash

echo "🔧 Configurando PostgreSQL para Sheily AI..."

# Iniciar PostgreSQL si no está ejecutándose
echo "🚀 Iniciando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Esperar a que PostgreSQL esté listo
sleep 3

echo "👤 Creando usuario de base de datos..."
sudo -u postgres psql -c "CREATE USER sheily_ai_user WITH PASSWORD 'SheilyAI2025SecurePassword!';" 2>/dev/null || echo "Usuario ya existe"

echo "🗄️ Creando base de datos..."
sudo -u postgres psql -c "CREATE DATABASE sheily_ai_db OWNER sheily_ai_user;" 2>/dev/null || echo "Base de datos ya existe"

echo "🔑 Otorgando permisos..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sheily_ai_db TO sheily_ai_user;"

echo "✅ Configuración completada!"
echo ""
echo "📊 Verificando configuración..."
sudo -u postgres psql -d sheily_ai_db -c "SELECT version();" | head -3

echo ""
echo "🎉 PostgreSQL configurado correctamente para Sheily AI!"
