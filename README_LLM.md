# Servidor LLM Local SHEILY

Este documento describe la puesta en marcha del servicio LLM local utilizado por el dashboard de SHEILY. El servicio expone una API compatible con OpenAI utilizando el modelo cuantizado **Llama-3.2-3B-Instruct-Q8_0** cargado con `llama_cpp`.

## Arquitectura

- **Servidor HTTP**: `backend/llm_server.py` (Flask + CORS)
- **Modelo**: archivo GGUF ubicado por defecto en `models/Llama-3.2-3B-Instruct-Q8_0.gguf`
- **Cliente**: `backend/llm_client.py`, consumido por el backend Node y los scripts de integración
- **Punto de acceso**: `http://127.0.0.1:8005/v1/chat/completions`

Todo el procesamiento ocurre en la máquina local; no intervienen servicios de Ollama, Hugging Face Hub ni endpoints remotos.

## Requisitos previos

- Python 3.10 o superior
- Paquetes `flask`, `flask_cors` y `llama_cpp_python`
- Archivo GGUF del modelo Llama‑3.2‑3B‑Instruct cuantizado en Q8_0

Instalación de dependencias mínimas:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-llm.txt
```

> El archivo `backend/requirements-llm.txt` contiene únicamente las dependencias necesarias para ejecutar el servidor.

## Configuración del modelo

El servidor busca el modelo en la ruta indicada por la variable de entorno `LLM_MODEL_PATH`. Si no se define, utilizará `models/Llama-3.2-3B-Instruct-Q8_0.gguf` relativa al repositorio.

```bash
export LLM_MODEL_PATH="/ruta/absoluta/Llama-3.2-3B-Instruct-Q8_0.gguf"
export LLM_CONTEXT_SIZE=4096       # opcional
export LLM_MAX_TOKENS=2048         # opcional
export LLM_MAX_HISTORY=10          # opcional
```

## Puesta en marcha

```bash
source .venv/bin/activate
python backend/llm_server.py
```

El servicio escuchará en `http://127.0.0.1:8005`. Durante el arranque se carga el modelo una sola vez y se mantiene en memoria para futuras peticiones.

## Endpoints disponibles

- `GET /health`: devuelve el estado del modelo, tamaño de contexto y ruta actual.
- `GET /v1/models`: lista el identificador del modelo activo.
- `POST /v1/chat/completions`: compatible con el formato de OpenAI para peticiones de chat.
- `POST /chat`: alternativa simplificada empleada por scripts internos.

### Ejemplo de petición

```bash
curl http://127.0.0.1:8005/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "messages": [
          {"role": "system", "content": "Eres un asistente experto."},
          {"role": "user", "content": "Explica el algoritmo de Dijkstra"}
        ],
        "max_tokens": 512,
        "temperature": 0.7
      }'
```

## Cliente de referencia

El backend Node utiliza `backend/llm_client.py` como wrapper Python para pruebas y utilidades. El cliente expone los métodos:

- `health_check()`
- `chat(messages)`
- `process_pipeline(query, context)`

Todos ellos interactúan exclusivamente con el servidor local en `http://127.0.0.1:8005`.

## Supervisión y resolución de problemas

- Verifica los logs del servidor para comprobar la carga correcta del modelo.
- Si el archivo GGUF no existe, el servidor devolverá un error 500 y lo indicará en `/health`.
- Ajusta `LLM_CONTEXT_SIZE` y `LLM_MAX_TOKENS` según los recursos disponibles.

## Integración con el dashboard

El frontend consume los endpoints expuestos por el backend Node, que a su vez delega todas las respuestas en este servidor local. No existen rutas alternativas ni sistemas de respaldo: cualquier error en el modelo se propagará al usuario para mantener la transparencia del sistema.

