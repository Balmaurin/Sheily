#!/usr/bin/env python3
"""
Frontend Simplificado - Sheily AI
=================================

Servidor web simple que sirve una interfaz básica de chat
conectada con el backend y LLM.
"""

from flask import Flask, render_template_string, request, jsonify
import requests
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Template HTML simple pero funcional
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheily AI - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .panel { 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px; 
            padding: 25px; 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .panel h3 { margin-bottom: 15px; font-size: 1.3rem; }
        .chat-container { 
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            height: 500px;
            display: flex;
            flex-direction: column;
        }
        .chat-messages { 
            flex: 1; 
            overflow-y: auto; 
            margin-bottom: 20px; 
            padding: 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }
        .message { 
            margin-bottom: 15px; 
            padding: 10px; 
            border-radius: 10px; 
        }
        .user-message { 
            background: rgba(255,255,255,0.2); 
            margin-left: 20%; 
            text-align: right;
        }
        .ai-message { 
            background: rgba(100,200,255,0.3); 
            margin-right: 20%; 
        }
        .chat-input { 
            display: flex; 
            gap: 10px; 
        }
        .chat-input input { 
            flex: 1; 
            padding: 12px; 
            border: none; 
            border-radius: 25px; 
            background: rgba(255,255,255,0.2);
            color: white;
            font-size: 16px;
        }
        .chat-input input::placeholder { color: rgba(255,255,255,0.7); }
        .chat-input button { 
            padding: 12px 20px; 
            border: none; 
            border-radius: 25px; 
            background: #4CAF50; 
            color: white; 
            cursor: pointer;
            font-weight: bold;
        }
        .chat-input button:hover { background: #45a049; }
        .status { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .status-dot { width: 12px; height: 12px; border-radius: 50%; }
        .status-green { background: #4CAF50; }
        .status-red { background: #f44336; }
        .status-yellow { background: #ff9800; }
        @media (max-width: 768px) {
            .dashboard { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sheily AI Dashboard</h1>
            <p>Sistema de IA con Llama 3.2 Q8_0 - Servidor LLM local activo</p>
        </div>
        
        <div class="dashboard">
            <div class="panel">
                <h3>📊 Estado de Servicios</h3>
                <div class="status">
                    <div class="status-dot status-green"></div>
                    <span>Backend API: http://localhost:8000</span>
                </div>
                <div class="status">
                    <div class="status-dot status-green"></div>
                    <span>LLM Server: http://localhost:8005</span>
                </div>
                <div class="status">
                    <div class="status-dot status-green"></div>
                    <span>PostgreSQL: localhost:5432</span>
                </div>
                <div class="status">
                    <div class="status-dot status-green"></div>
                    <span>Servidor LLM: http://localhost:8005</span>
                </div>
                <div class="status">
                    <div class="status-dot status-green"></div>
                    <span>Blockchain: http://localhost:8090</span>
                </div>
            </div>
            
            <div class="panel">
                <h3>🔗 Enlaces Rápidos</h3>
                <p><a href="http://localhost:8000/docs" target="_blank" style="color: #87CEEB;">📚 API Documentation</a></p>
                <p><a href="http://localhost:8005/docs" target="_blank" style="color: #87CEEB;">🤖 Documentación LLM</a></p>
                <p><a href="http://localhost:8090/docs" target="_blank" style="color: #87CEEB;">⛓️ Blockchain Docs</a></p>
                <p><a href="http://localhost:8000/api/health" target="_blank" style="color: #87CEEB;">💚 Health Check</a></p>
            </div>
        </div>
        
        <div class="chat-container">
            <h3>💬 Chat con Sheily AI</h3>
            <div class="chat-messages" id="chatMessages">
                <div class="message ai-message">
                    <strong>Sheily AI:</strong> ¡Hola! Soy Sheily AI con Llama 3.2 Q8_0. ¿En qué puedo ayudarte hoy?
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Escribe tu mensaje aquí..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Enviar</button>
            </div>
        </div>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const messages = document.getElementById('chatMessages');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Agregar mensaje del usuario
            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.innerHTML = `<strong>Tú:</strong> ${message}`;
            messages.appendChild(userMsg);
            
            // Limpiar input
            input.value = '';
            
            // Agregar mensaje de "escribiendo..."
            const thinkingMsg = document.createElement('div');
            thinkingMsg.className = 'message ai-message';
            thinkingMsg.innerHTML = '<strong>Sheily AI:</strong> <em>Escribiendo...</em>';
            thinkingMsg.id = 'thinking';
            messages.appendChild(thinkingMsg);
            
            // Scroll al final
            messages.scrollTop = messages.scrollHeight;
            
            try {
                // Enviar al LLM directamente
                const response = await fetch('http://localhost:8005/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: message,
                        max_tokens: 200,
                        temperature: 0.7
                    })
                });
                
                const data = await response.json();
                
                // Remover mensaje de "escribiendo..."
                document.getElementById('thinking').remove();
                
                // Agregar respuesta de la IA
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai-message';
                aiMsg.innerHTML = `<strong>Sheily AI:</strong> ${data.response || 'Error generando respuesta'}`;
                messages.appendChild(aiMsg);
                
            } catch (error) {
                // Remover mensaje de "escribiendo..."
                document.getElementById('thinking').remove();
                
                // Agregar mensaje de error
                const errorMsg = document.createElement('div');
                errorMsg.className = 'message ai-message';
                errorMsg.innerHTML = '<strong>Sheily AI:</strong> <em>Lo siento, hubo un error. Por favor inténtalo de nuevo.</em>';
                messages.appendChild(errorMsg);
                
                console.error('Error:', error);
            }
            
            // Scroll al final
            messages.scrollTop = messages.scrollHeight;
        }
        
        // Verificar estado de servicios cada 30 segundos
        async function checkServiceStatus() {
            try {
                const response = await fetch('http://localhost:8000/api/health');
                const data = await response.json();
                console.log('Estado del sistema:', data);
            } catch (error) {
                console.warn('No se pudo verificar estado del sistema');
            }
        }
        
        // Verificar estado al cargar
        checkServiceStatus();
        setInterval(checkServiceStatus, 30000);
    </script>
</body>
</html>
"""


@app.route("/")
def dashboard():
    """Página principal del dashboard"""
    return render_template_string(HTML_TEMPLATE)


@app.route("/chat")
def chat():
    """Página de chat (misma que dashboard)"""
    return render_template_string(HTML_TEMPLATE)


@app.route("/health")
def health():
    """Endpoint de salud del frontend"""
    return jsonify(
        {
            "status": "healthy",
            "service": "Sheily AI Frontend",
            "version": "1.0.0",
            "timestamp": "2025-09-17T20:50:00Z",
        }
    )


@app.route("/api/status")
def api_status():
    """Estado de servicios backend"""
    try:
        # Verificar backend
        backend_response = requests.get("http://localhost:8000/api/health", timeout=2)
        backend_status = (
            backend_response.json()
            if backend_response.status_code == 200
            else {"status": "error"}
        )

        # Verificar LLM
        llm_response = requests.get("http://localhost:8005/health", timeout=2)
        llm_status = (
            llm_response.json()
            if llm_response.status_code == 200
            else {"status": "error"}
        )

        return jsonify(
            {
                "backend": backend_status,
                "llm": llm_status,
                "frontend": {"status": "healthy"},
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    logger.info("🚀 Iniciando Frontend Simplificado de Sheily AI...")

    try:
        app.run(host="0.0.0.0", port=3000, debug=False, threaded=True)
    except Exception as e:
        logger.error(f"❌ Error iniciando frontend: {e}")
        raise
