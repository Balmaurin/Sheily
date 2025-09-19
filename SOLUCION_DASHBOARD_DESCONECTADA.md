# 🔧 SOLUCIÓN: Dashboard Muestra "Desconectada" y Botones No Funcionan

## ❌ **PROBLEMA IDENTIFICADO**

Tu dashboard muestra **"Desconectada"** y los botones no funcionan porque:

1. **NINGÚN SERVICIO ESTÁ CORRIENDO** - Todos los servicios backend están apagados
2. El Frontend no puede conectarse a:
   - Backend API (puerto 8000) ❌
   - LLM Server (puerto 8005) ❌
   - PostgreSQL (puerto 5432) ❌
   - AI System (puerto 8080) ❌
   - Blockchain (puerto 8090) ❌

## ✅ **SOLUCIÓN RÁPIDA**

### **Opción 1: Iniciar TODO el Sistema (Recomendado)**

```bash
# Ejecuta este comando para iniciar todos los servicios
./start_sheily_complete.sh
```

Este script iniciará automáticamente:
- PostgreSQL
- Backend API
- LLM Server
- Frontend
- AI System
- Blockchain

### **Opción 2: Iniciar Servicios Manualmente**

Si prefieres control manual, ejecuta estos comandos en orden:

```bash
# 1. Iniciar PostgreSQL
sudo service postgresql start

# 2. Iniciar Backend API
cd /workspace/backend
node server.js &

# 3. Iniciar LLM Server
cd /workspace
python backend/llm_server.py &

# 4. Iniciar Frontend
cd /workspace/Frontend
npm run dev &
```

## 📊 **VERIFICAR ESTADO**

Después de iniciar los servicios, verifica que todo funcione:

```bash
# Ejecuta el verificador de estado
python3 /workspace/check_status.py
```

Deberías ver:
```
✅ PostgreSQL      | Puerto 5432 abierto
✅ Backend API     | Puerto 8000 abierto
✅ Frontend        | Puerto 3000 abierto
✅ LLM Server      | Puerto 8005 abierto
```

## 🌐 **ACCEDER AL DASHBOARD**

Una vez iniciados los servicios:

1. Abre tu navegador
2. Ve a: **http://localhost:3000/dashboard**
3. El estado debería cambiar de "Desconectada" a **"Conectada"** ✅
4. Los botones ahora funcionarán correctamente

## 🛑 **DETENER SERVICIOS**

Cuando termines, puedes detener todo con:

```bash
./stop_all_services.sh
```

## 🔍 **SOLUCIÓN DE PROBLEMAS**

### Si el dashboard sigue mostrando "Desconectada":

1. **Verifica los logs:**
   ```bash
   # Ver logs del backend
   tail -f /workspace/logs/backend.log
   
   # Ver logs del LLM
   tail -f /workspace/logs/llm_server.log
   ```

2. **Revisa la consola del navegador:**
   - Abre las DevTools (F12)
   - Ve a la pestaña Console
   - Busca errores de conexión

3. **Limpia caché del navegador:**
   - Ctrl+Shift+R (forzar recarga)
   - O abre en modo incógnito

### Si algún puerto está ocupado:

```bash
# Ver qué está usando el puerto (ejemplo: 8000)
sudo lsof -i :8000

# Matar el proceso
sudo fuser -k 8000/tcp
```

## 💡 **RESUMEN**

El problema **"Desconectada"** ocurre porque el dashboard no puede comunicarse con los servicios backend. La solución es simplemente **iniciar todos los servicios** usando el script proporcionado.

---

**¿Necesitas ayuda adicional?** Los logs están en `/workspace/logs/`