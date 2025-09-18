# Sistema LLM SHEILY AI

## Descripción

Sistema de inferencia LLM local integrado con el orquestador SHEILY AI. Utiliza Ollama con el modelo Llama 3.2 3B Instruct para proporcionar respuestas de alta calidad en español.

## Características

- **Modelo Local**: Llama 3.2 3B Instruct optimizado para SHEILY
- **Integración Completa**: Cliente unificado compatible con Ollama y APIs OpenAI
- **Pipeline Mejorado**: Sistema draft → critic → fix para respuestas de alta calidad
- **Configuración Flexible**: Soporte para múltiples modos de inferencia
- **Monitoreo**: Health checks y métricas de rendimiento

## Estructura del Sistema

```
llm/
├── Modelfile                    # Configuración del modelo SHEILY
├── docker-compose.llm.yml      # Compose para servicio Ollama
└── models/                     # Directorio para modelos GGUF (opcional)

scripts/
└── run_llm_ollama.sh          # Script de instalación y configuración

backend/
└── llm_client.py              # Cliente unificado LLM
```

## Instalación Rápida

### Prerrequisitos

- Docker y docker-compose instalados
- Al menos 4GB de RAM disponible
- Conexión a internet para descargar el modelo

### Paso 1: Levantar el Servicio LLM

```bash
# Ejecutar script de instalación
./scripts/run_llm_ollama.sh
```

Este script:
- ✅ Verifica que Docker esté disponible
- 🐳 Levanta el contenedor Ollama
- 📥 Descarga el modelo base llama3.2:3b-instruct
- 🔧 Crea el modelo personalizado sheily-llm
- 🧪 Prueba el modelo con una consulta de ejemplo

### Paso 2: Verificar Instalación

```bash
# Verificar que el servicio esté funcionando
curl http://localhost:11434/api/tags

# Probar el modelo SHEILY
curl http://localhost:11434/api/generate \
  -d '{"model":"sheily-llm","prompt":"Hola, ¿cómo estás?","stream":false}'
```

## Configuración

### Variables de Entorno

Edita `backend/config.env`:

```env
# Configuración del cliente LLM
LLM_MODE=ollama                    # ollama | openai
LLM_BASE_URL=http://localhost:11434
LLM_MODEL_NAME=sheily-llm
LLM_TIMEOUT=60
LLM_MAX_RETRIES=3
```

### Modos de Operación

#### Modo Ollama (Recomendado)
```env
LLM_MODE=ollama
LLM_BASE_URL=http://localhost:11434
```

#### Modo OpenAI-Compatible
```env
LLM_MODE=openai
LLM_BASE_URL=http://localhost:8001/v1  # vLLM, TGI, etc.
```

## Uso del Cliente LLM

### Uso Básico

```python
from backend.llm_client import get_llm_client

# Obtener cliente
client = get_llm_client()

# Chat simple
messages = [
    {"role": "user", "content": "Explica qué es la inteligencia artificial"}
]
response = client.llm_chat(messages)
print(response)
```

### Pipeline Mejorado (draft → critic → fix)

```python
# Usar pipeline completo para respuestas de alta calidad
result = client.process_pipeline(
    query="Dame un plan de seguridad informática en 5 pasos",
    context="Para una empresa de 50 empleados"
)

print("Respuesta final:", result['final_response'])
print("Tiempo de procesamiento:", result['processing_time'])
```

### Verificación de Estado

```python
# Verificar salud del servicio
health = client.health_check()
print(f"Estado: {health['status']}")
print(f"Modelo disponible: {health['model_available']}")
```

## Integración con el Orquestador

El cliente LLM está integrado automáticamente en el orquestador principal:

```python
from modules.orchestrator.main_orchestrator import MainOrchestrator

# El orquestador usa automáticamente el cliente LLM
orchestrator = MainOrchestrator()
response = orchestrator.process_query("¿Cómo optimizar una base de datos?")

# Verificar estado del LLM
llm_status = orchestrator.get_llm_status()
```

## Comandos Útiles

### Gestión del Servicio

```bash
# Ver modelos disponibles
docker exec sheily-llm-ollama ollama list

# Ver logs del servicio
docker logs sheily-llm-ollama

# Parar el servicio
docker-compose -f llm/docker-compose.llm.yml down

# Reiniciar el servicio
docker-compose -f llm/docker-compose.llm.yml restart
```

### Pruebas de Rendimiento

```bash
# Probar con diferentes tipos de consultas
curl http://localhost:11434/api/generate \
  -d '{"model":"sheily-llm","prompt":"Dame un plan de test de seguridad en 5 pasos","stream":false}'

curl http://localhost:11434/api/generate \
  -d '{"model":"sheily-llm","prompt":"Explica el algoritmo de ordenamiento quicksort","stream":false}'
```

## Monitoreo y Logs

### Logs del Sistema

```bash
# Logs del contenedor Ollama
docker logs sheily-llm-ollama -f

# Logs del orquestador
tail -f backend/logs/orchestrator.log
```

### Métricas de Rendimiento

El sistema registra automáticamente:
- Tiempo de respuesta por consulta
- Uso de memoria del modelo
- Errores y fallbacks
- Métricas del pipeline draft → critic → fix

## Solución de Problemas

### Error: "Docker no está instalado"
```bash
# Instalar Docker (Ubuntu/Debian)
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### Error: "Modelo no disponible"
```bash
# Verificar que el modelo se creó correctamente
docker exec sheily-llm-ollama ollama list

# Recrear el modelo si es necesario
docker exec -w /workspace sheily-llm-ollama ollama create sheily-llm -f Modelfile
```

### Error: "Servicio no responde"
```bash
# Verificar estado del contenedor
docker ps | grep ollama

# Reiniciar el servicio
docker-compose -f llm/docker-compose.llm.yml restart
```

### Error: "Memoria insuficiente"
```bash
# Verificar uso de memoria
docker stats sheily-llm-ollama

# Ajustar límites en docker-compose.llm.yml
# memory: 6G  # Reducir si es necesario
```

## Personalización del Modelo

### Modificar el System Prompt

Edita `llm/Modelfile`:

```
SYSTEM Eres SHEILY, especializado en [tu dominio específico]. 
[Personalizar comportamiento y personalidad]
```

### Ajustar Parámetros

```
PARAMETER temperature 0.2      # Creatividad (0.0-1.0)
PARAMETER num_ctx 8192        # Contexto máximo
PARAMETER top_p 0.95          # Núcleo de muestreo
PARAMETER top_k 50            # Muestreo top-k
```

### Recrear el Modelo

```bash
# Después de modificar Modelfile
docker exec -w /workspace sheily-llm-ollama ollama create sheily-llm -f Modelfile
```

## Opciones Avanzadas

### Usar vLLM (OpenAI-Compatible)

Para mayor rendimiento y compatibilidad con APIs:

```bash
# Instalar vLLM
pip install vllm

# Levantar servidor vLLM
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.2-3B-Instruct \
  --port 8001
```

### Usar llama.cpp (CPU Optimizado)

```bash
# Descargar GGUF
wget https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf

# Servir con llama.cpp
./llama-server -m Llama-3.2-3B-Instruct-Q4_K_M.gguf --port 8080
```

## Soporte

Para problemas o preguntas:
1. Revisar los logs del sistema
2. Verificar la configuración de variables de entorno
3. Comprobar que Docker esté funcionando correctamente
4. Consultar la documentación del orquestador en `docs/ORCHESTRATOR_GUIDE.md`

---

**¡Sistema LLM SHEILY listo para usar!** 🚀
