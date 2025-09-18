from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_cpp import Llama
import threading
import time
import logging
from llm_branch_integrator import LLMBranchIntegrator

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configurar CORS para permitir conexiones desde el frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], 
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Configuración del LLM
LLM_MODEL_REPO_ID = "bartowski/Llama-3.2-3B-Instruct-GGUF"
LLM_MODEL_FILENAME = "Llama-3.2-3B-Instruct-Q8_0.gguf"
LLM_N_CTX = 4096
LLM_MAX_TOKENS = 2048 # Max tokens para la respuesta del LLM
MAX_MESSAGES_IN_CONTEXT = 10 # Limitar el contexto a los últimos 10 mensajes

llm_instance = None
model_load_lock = threading.Lock() # Para asegurar que el modelo se carga una sola vez
is_loading = False

# Integrador de ramas
branch_integrator = None

def load_llm_model():
    global llm_instance, branch_integrator, is_loading
    if llm_instance is None and not is_loading:
        is_loading = True
        logger.info(f"Cargando modelo LLM: {LLM_MODEL_FILENAME} desde {LLM_MODEL_REPO_ID}...")
        with model_load_lock:
            try:
                llm_instance = Llama.from_pretrained(
                    repo_id=LLM_MODEL_REPO_ID,
                    filename=LLM_MODEL_FILENAME,
                    n_ctx=LLM_N_CTX,
                    verbose=True # Mantener verbose para la carga inicial del servidor
                )
                logger.info("✅ Modelo LLM cargado exitosamente.")
                
                # Inicializar integrador de ramas
                logger.info("🔄 Inicializando integrador de ramas...")
                branch_integrator = LLMBranchIntegrator(llm_instance)
                logger.info("✅ Integrador de ramas inicializado.")
                
            except Exception as e:
                logger.error(f"❌ Error al cargar el modelo LLM: {e}")
            finally:
                is_loading = False
    return llm_instance

# Cargar el modelo en un hilo separado al inicio
threading.Thread(target=load_llm_model).start()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    # Asegurar que el modelo esté cargado
    if llm_instance is None:
        logger.warning("El modelo LLM aún no está cargado. Esperando...")
        # Esperar un momento si el modelo aún se está cargando
        time_waited = 0
        while llm_instance is None and time_waited < 60: # Esperar hasta 60 segundos
            time.sleep(1)
            time_waited += 1
        
        if llm_instance is None:
            return jsonify({"error": "Modelo LLM no disponible, intente más tarde."}), 503

    try:
        # Mantener solo los últimos mensajes para el contexto
        if len(messages) > MAX_MESSAGES_IN_CONTEXT:
            messages = messages[len(messages) - MAX_MESSAGES_IN_CONTEXT:]

        # NUEVO: Usar el integrador de ramas si está disponible
        if branch_integrator and branch_integrator.system_status["initialized"]:
            logger.info("🎯 Usando sistema de ramas especializadas")
            result = branch_integrator.process_query(messages)
            
            # Devolver respuesta con metadatos del sistema de ramas
            return jsonify({
                "response": result.get("response", "Error en procesamiento"),
                "domain": result.get("domain", "general"),
                "domain_confidence": result.get("domain_confidence", 0.5),
                "processing_method": result.get("processing_method", "unknown"),
                "processing_time": result.get("processing_time", 0.0),
                "system_enhanced": True
            })
        else:
            # Fallback al sistema original
            logger.info("🔄 Usando Llama 3.2 base (sistema de ramas no disponible)")
            
            response_chunks = []
            full_response_content = ""

            # Generar respuesta del chat en streaming
            for chunk in llm_instance.create_chat_completion(
                messages=messages,
                max_tokens=LLM_MAX_TOKENS,
                stream=True
            ):
                delta = chunk["choices"][0]["delta"]
                if "content" in delta:
                    response_chunks.append(delta["content"])
                    full_response_content += delta["content"]
            
            # Devolver la respuesta completa como un solo string
            return jsonify({
                "response": full_response_content,
                "domain": "general",
                "domain_confidence": 0.5,
                "processing_method": "llama_base",
                "processing_time": 0.0,
                "system_enhanced": False
            })

    except Exception as e:
        logger.error(f"❌ Error al generar respuesta del LLM: {e}")
        return jsonify({"error": f"Error del LLM: {e}"}), 500

@app.route('/system/status', methods=['GET'])
def system_status():
    """Obtener estado del sistema de ramas"""
    try:
        if branch_integrator:
            status = branch_integrator.get_system_status()
            return jsonify(status)
        else:
            return jsonify({
                "error": "Integrador de ramas no disponible",
                "llama_available": llm_instance is not None
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/system/domains', methods=['GET'])
def available_domains():
    """Obtener dominios disponibles"""
    try:
        if branch_integrator:
            domains = branch_integrator.get_available_domains()
            return jsonify({"domains": domains})
        else:
            return jsonify({"domains": ["general"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/system/branches', methods=['GET'])
def branch_status():
    """Obtener estado de las ramas"""
    try:
        if branch_integrator:
            domain = request.args.get('domain')
            status = branch_integrator.get_branch_status(domain)
            return jsonify(status)
        else:
            return jsonify({"error": "Integrador de ramas no disponible"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Asegurarse de que el modelo se carga antes de iniciar el servidor Flask
    # o al menos se inicia el hilo de carga
    load_llm_model() # Iniciar la carga si no se ha iniciado ya
    
    logger.info("🚀 Iniciando servidor LLM en http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=False) # Desactivar debug en producción
