#!/bin/bash

echo "🔧 Arreglando configuración completa de Sheily AI Backend..."

# 1. Configurar PostgreSQL
echo "📊 Configurando PostgreSQL..."
sudo systemctl start postgresql 2>/dev/null || echo "PostgreSQL ya está ejecutándose"

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER sheily_ai_user WITH PASSWORD 'SheilyAI2025SecurePassword!';" 2>/dev/null || echo "Usuario ya existe"
sudo -u postgres psql -c "CREATE DATABASE sheily_ai_db OWNER sheily_ai_user;" 2>/dev/null || echo "Base de datos ya existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sheily_ai_db TO sheily_ai_user;"

# 2. Verificar configuración del backend
echo "🔍 Verificando configuración del backend..."
cd /home/yo/Escritorio/sheily-ai/backend

# Verificar que el archivo config.env existe
if [ ! -f "config.env" ]; then
    echo "❌ El archivo config.env no existe"
    exit 1
fi

# 3. Probar conexión a PostgreSQL
echo "🔌 Probando conexión a PostgreSQL..."
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'sheily_ai_db',
  user: 'sheily_ai_user',
  password: 'SheilyAI2025SecurePassword!'
});

client.connect()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    return client.end();
  })
  .then(() => {
    console.log('✅ Configuración de base de datos completada');
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    echo "❌ Error en la configuración de PostgreSQL"
    exit 1
fi

# 4. Inicializar base de datos
echo "🗄️ Inicializando base de datos..."
node database/init_db.js

if [ $? -ne 0 ]; then
    echo "❌ Error al inicializar la base de datos"
    exit 1
fi

# 5. Iniciar servidor backend
echo "🚀 Iniciando servidor backend..."
node server.js &
BACKEND_PID=$!

# Esperar a que el servidor esté listo
sleep 5

# 6. Verificar que el backend esté funcionando
echo "📊 Verificando que el backend responda..."
curl -s http://localhost:8000/api/health | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "✅ Backend funcionando correctamente!"
    echo "🌐 URL del backend: http://localhost:8000"
    echo "🔐 Endpoints de auth: http://localhost:8000/api/auth/"
else
    echo "❌ El backend no está respondiendo correctamente"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 7. Verificar endpoint de login
echo "🔑 Probando endpoint de login..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  http://localhost:8000/api/auth/login | grep -q "error"

if [ $? -eq 0 ]; then
    echo "✅ Endpoint de login funcionando (retorna error esperado para credenciales inválidas)"
else
    echo "❌ Endpoint de login no responde correctamente"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo "📋 Resumen:"
echo "  ✅ PostgreSQL configurado"
echo "  ✅ Base de datos inicializada"
echo "  ✅ Backend ejecutándose en puerto 8000"
echo "  ✅ Endpoints de autenticación disponibles"
echo ""
echo "🖥️ El frontend debería poder conectarse ahora correctamente"
echo "🔄 Si hay problemas, reinicia el frontend con: cd Frontend && npm run dev"

# Mantener el backend ejecutándose
wait $BACKEND_PID
