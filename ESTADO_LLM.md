# Estado del Servidor LLM Local

## ✅ Componentes operativos

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Servidor Flask (`backend/llm_server.py`) | ✅ | Expone `/v1/chat/completions`, `/chat`, `/health` y `/v1/models`.
| Modelo Llama‑3.2‑3B‑Instruct‑Q8_0 | ✅ | Archivo GGUF cargado mediante `llama_cpp`.
| Cliente Python (`backend/llm_client.py`) | ✅ | Pipeline draft → critic → fix contra el servidor local.
| Integración backend Node | ✅ | Servicios Express consumen exclusivamente el endpoint local.

## 🔁 Flujo actual

1. El servidor se inicia con `python backend/llm_server.py` y carga el modelo desde `LLM_MODEL_PATH`.
2. El backend llama a `/v1/chat/completions` para cada mensaje del dashboard.
3. Las métricas de uso y tiempo de inferencia se devuelven directamente al frontend; no hay datos simulados.

## ⚠️ Advertencias

- Si el archivo GGUF no está disponible, `/health` responderá con `status: error` y el backend propagará la incidencia al usuario.
- No existe infraestructura de respaldo: cualquier interrupción del servidor detendrá el chat hasta que el modelo vuelva a cargarse.

## ✅ Próximos pasos recomendados

- Automatizar la verificación de disponibilidad del archivo GGUF antes de iniciar el backend.
- Añadir scripts de supervisión que reinicien el servidor en caso de fallo.

El entorno ya no depende de Ollama ni de servicios de Hugging Face. Toda la inferencia se resuelve localmente.

