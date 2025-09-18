# 🚀 Guía de Inicio Completo - Sheily AI

Esta guía te ayudará a iniciar **TODOS** los servicios necesarios para que el frontend funcione completamente con chat, entrenamientos, ejercicios y todas las funcionalidades.

## 📋 **Servicios que se Inician**

### ✅ **Servicios Principales**
1. **Backend API** (Puerto 8000) - Servidor principal con todas las APIs
2. **Servidor LLM** (Puerto 8005) - Modelo Llama-3.2-3B-Instruct-Q8_0 para chat
3. **Base de Datos PostgreSQL** - Para usuarios, entrenamientos, ejercicios
4. **Sistema de Monitoreo** - Métricas y alertas en tiempo real
5. **Sistema de Backup** - Respaldo automático de conversaciones

### 🎯 **Funcionalidades Disponibles**
- ✅ **Chat con IA** - Conversaciones con Llama-3.2-3B-Instruct-Q8_0
- ✅ **Sistema de Entrenamiento** - 32 ramas de conocimiento
- ✅ **Ejercicios Interactivos** - Pruebas y evaluaciones
- ✅ **Dashboard Completo** - Métricas y estadísticas
- ✅ **Autenticación JWT** - Sistema de usuarios seguro
- ✅ **Caja Fuerte** - Gestión de tokens y créditos
- ✅ **Sistema de Prompts** - Gestión de prompts personalizados

## 🚀 **Opciones de Inicio**

### **Opción 1: Inicio Completo (Recomendado)**
```bash
./start_all_services.sh
```
**Características:**
- ✅ Verificación completa de dependencias
- ✅ Verificación de puertos
- ✅ Monitoreo continuo de servicios
- ✅ Manejo de errores avanzado
- ✅ Logs detallados
- ✅ Limpieza automática al salir

### **Opción 2: Inicio Simple**
```bash
./start_simple.sh
```
**Características:**
- ✅ Inicio rápido y directo
- ✅ Menos verificaciones
- ✅ Ideal para desarrollo
- ✅ Menos logs

### **Opción 3: Verificar Servicios**
```bash
./check_services.sh
```
**Características:**
- ✅ Verifica estado de todos los servicios
- ✅ Diagnóstico completo
- ✅ No inicia servicios, solo verifica

## 📊 **URLs de Acceso**

Una vez iniciados los servicios, tendrás acceso a:

### **Backend API (Puerto 8000)**
- **Health Check**: http://localhost:8000/api/health
- **Dashboard**: http://localhost:8000/api/dashboard
- **Modelos**: http://localhost:8000/api/models/available
- **Chat**: http://localhost:8000/api/chat/4bit
- **Entrenamiento**: http://localhost:8000/api/training/branches
- **Autenticación**: http://localhost:8000/api/auth/login

### **Servidor LLM (Puerto 8005)**
- **Health Check**: http://localhost:8005/health
- **Generar Respuesta**: http://localhost:8005/generate
- **Info del Modelo**: http://localhost:8005/info

### **Base de Datos**
- **Host**: localhost
- **Puerto**: 5432
- **Database**: sheily_ai_db
- **Usuario**: sheily_ai_user

## 🎯 **Iniciar Frontend**

Una vez que todos los servicios estén funcionando:

```bash
cd Frontend
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

## 🔧 **Requisitos Previos**

### **Software Necesario**
- ✅ **Node.js** (v18 o superior)
- ✅ **Python 3** (con llama-cpp-python)
- ✅ **PostgreSQL** (con base de datos configurada)
- ✅ **curl** (para verificaciones)

### **Configuración**
- ✅ **backend/config.env** - Configuración del backend
- ✅ **Base de datos PostgreSQL** - Configurada y funcionando
- ✅ **Entorno virtual Python** - Con dependencias instaladas

## 🛠️ **Solución de Problemas**

### **Error: Puerto en uso**
```bash
# Verificar qué proceso usa el puerto
lsof -i :8000
lsof -i :8005

# Matar proceso si es necesario
kill -9 <PID>
```

### **Error: Base de datos no conecta**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verificar conexión
psql -h localhost -U sheily_ai_user -d sheily_ai_db
```

### **Error: Modelo LLM no carga**
```bash
# Verificar logs
tail -f logs/llm_server.log

# Verificar dependencias Python
pip list | grep llama
```

### **Error: Backend no inicia**
```bash
# Verificar logs
tail -f backend/server.log

# Verificar dependencias Node.js
cd backend && npm install
```

## 📝 **Logs y Monitoreo**

### **Archivos de Log**
- **Backend**: `backend/server.log`
- **LLM Server**: `logs/llm_server.log`
- **Sistema**: `logs/backend.log`

### **Monitoreo en Tiempo Real**
```bash
# Ver logs del backend
tail -f backend/server.log

# Ver logs del LLM
tail -f logs/llm_server.log

# Verificar estado de servicios
./check_services.sh
```

## 🎉 **Verificación Final**

Para asegurar que todo funciona correctamente:

1. **Ejecutar verificación**:
   ```bash
   ./check_services.sh
   ```

2. **Verificar en navegador**:
   - http://localhost:8000/api/health
   - http://localhost:8005/health

3. **Iniciar frontend**:
   ```bash
   cd Frontend && npm run dev
   ```

4. **Probar funcionalidades**:
   - ✅ Login/Registro
   - ✅ Chat con IA
   - ✅ Dashboard
   - ✅ Entrenamientos
   - ✅ Ejercicios

## 🛑 **Detener Servicios**

Para detener todos los servicios:
- **Presiona Ctrl+C** en la terminal donde ejecutaste el script
- Los scripts manejan automáticamente la limpieza de procesos

## 📞 **Soporte**

Si tienes problemas:
1. Ejecuta `./check_services.sh` para diagnóstico
2. Revisa los logs en `backend/server.log` y `logs/llm_server.log`
3. Verifica que PostgreSQL esté funcionando
4. Asegúrate de que los puertos 8000 y 8005 estén libres

---

**¡Con estos scripts tendrás todo el sistema Sheily AI funcionando completamente!** 🚀
