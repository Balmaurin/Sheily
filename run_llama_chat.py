from llama_cpp import Llama
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

MAX_MESSAGES_IN_CONTEXT = 10 

app = Flask(__name__)

# Configurar CORS para permitir requests desde el frontend
CORS(app, origins=[
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:8000", 
    "http://127.0.0.1:8000"
], methods=["GET", "POST", "OPTIONS"], 
   allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

llm = Llama.from_pretrained(
    repo_id="bartowski/Llama-3.2-3B-Instruct-GGUF",
    filename="Llama-3.2-3B-Instruct-Q8_0.gguf",
    verbose=False,
    n_ctx=4096 
)

print("¡Servidor Llama-3.2-3B-Instruct-Q8_0 iniciado!")

# Ruta raíz
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Sheily AI LLM Server",
        "model": "Llama-3.2-3B-Instruct-Q8_0",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "generate": "/generate",
            "info": "/info"
        },
        "timestamp": "2025-09-04T02:35:00.000Z"
    }), 200

# Favicon
@app.route("/favicon.ico", methods=["GET"])
def favicon():
    from flask import Response
    svg_content = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧠</text></svg>'
    return Response(svg_content, mimetype='image/svg+xml', headers={'Cache-Control': 'public, max-age=31536000'})

# Endpoint de salud
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "model": "Llama-3.2-3B-Instruct-Q8_0"}), 200

# Endpoint para generar respuesta
@app.route("/generate", methods=["POST"])
def generate_response():
    data = request.json
    prompt = data.get("prompt")
    max_length = data.get("max_length", 150)
    temperature = data.get("temperature", 0.7)
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    messages = [{"role": "user", "content": prompt}] # Solo se envía el prompt actual
    
    try:
        llm_response_content = ""
        for chunk in llm.create_chat_completion(
            messages=messages,
            max_tokens=max_length,
            temperature=temperature,
            stream=True
        ):
            delta = chunk["choices"][0]["delta"]
            if "content" in delta:
                llm_response_content += delta["content"]
        
        return jsonify({"response": llm_response_content}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint para obtener información del modelo
@app.route("/info", methods=["GET"])
def get_model_info():
    return jsonify({
        "model_name": "Llama-3.2-3B-Instruct-Q8_0",
        "provider": "llama_cpp",
        "context_window": llm.n_ctx,
        "max_messages_in_context": MAX_MESSAGES_IN_CONTEXT
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("MODEL_SERVER_PORT", 8005))
    app.run(host="0.0.0.0", port=port)
    
