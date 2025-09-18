#!/usr/bin/env python3
"""
Login Automático para Sergio - Sheily AI
========================================

Script para hacer login automático y configurar el navegador
"""

import requests
import json
import webbrowser
import time


def login_automatico():
    """Hacer login automático para sergio"""
    print("🚀 Iniciando login automático para Sergio...")

    try:
        # Hacer login
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json={"username": "sergiobalma.gomez@gmail.com", "password": "sheily123"},
        )

        if response.status_code == 200:
            data = response.json()

            print("✅ Login exitoso!")
            print(f"👤 Usuario: {data['user']['full_name']}")
            print(f"📧 Email: {data['user']['email']}")
            print(f"🎭 Rol: {data['user']['role']}")
            print(f"💰 Tokens: {data['user']['tokens']}")
            print(f"🔑 Token JWT: {data['token'][:50]}...")

            # Crear archivo HTML temporal con login automático
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Sheily AI - Login Automático</title>
    <style>
        body {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }}
        .container {{ 
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0,0,0,0.3);
            padding: 30px;
            border-radius: 15px;
        }}
        .btn {{ 
            background: linear-gradient(45deg, #00bcd4, #3f51b5);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            margin: 10px;
        }}
        .btn:hover {{ background: linear-gradient(45deg, #0097a7, #303f9f); }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sheily AI - Login Automático</h1>
        <p>¡Hola {data['user']['full_name']}!</p>
        <p>Tu sesión se está configurando automáticamente...</p>
        
        <div style="margin: 30px 0;">
            <div>📧 Email: {data['user']['email']}</div>
            <div>🎭 Rol: {data['user']['role']}</div>
            <div>💰 Tokens: {data['user']['tokens']}</div>
        </div>
        
        <button class="btn" onclick="goToDashboard()">
            📊 IR AL DASHBOARD
        </button>
        
        <button class="btn" onclick="goToChat()">
            💬 IR AL CHAT
        </button>
        
        <button class="btn" onclick="goToTraining()">
            🏋️ IR A ENTRENAMIENTOS
        </button>
    </div>
    
    <script>
        // Configurar autenticación automáticamente
        localStorage.setItem('authToken', '{data['token']}');
        localStorage.setItem('user', '{json.dumps(data['user']).replace("'", "\\'")}');
        
        console.log('✅ Autenticación configurada automáticamente');
        console.log('👤 Usuario:', '{data['user']['username']}');
        
        function goToDashboard() {{
            window.location.href = 'http://localhost:3000/dashboard';
        }}
        
        function goToChat() {{
            window.location.href = 'http://localhost:3000/chat';
        }}
        
        function goToTraining() {{
            window.location.href = 'http://localhost:3000/dashboard#training';
        }}
        
        // Auto-redirección después de 3 segundos
        setTimeout(() => {{
            console.log('🔄 Auto-redirección al dashboard...');
            goToDashboard();
        }}, 3000);
    </script>
</body>
</html>
            """

            # Guardar archivo HTML
            with open("login_sergio.html", "w", encoding="utf-8") as f:
                f.write(html_content)

            print("\n🌐 Abriendo navegador con login automático...")
            print("📁 Archivo creado: login_sergio.html")

            # Abrir en navegador
            webbrowser.open("file://" + os.path.abspath("login_sergio.html"))

            return True

        else:
            error = response.json()
            print(f"❌ Error de login: {error.get('error', 'Error desconocido')}")
            return False

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False


if __name__ == "__main__":
    import os

    print("🔑 CREDENCIALES PARA SERGIO:")
    print("📧 Email: sergiobalma.gomez@gmail.com")
    print("🔑 Contraseña: sheily123")
    print()

    success = login_automatico()

    if success:
        print("\n🎉 ¡Login automático completado!")
        print("🌐 El navegador debería abrirse automáticamente")
        print("🚀 Serás redirigido al dashboard en 3 segundos")
        print("\n📋 URLs disponibles:")
        print("   📊 Dashboard: http://localhost:3000/dashboard")
        print("   💬 Chat: http://localhost:3000/chat")
        print("   🏋️ Entrenamientos: http://localhost:3000/dashboard#training")
    else:
        print("\n❌ Error en login automático")
        print("🔧 Intenta manualmente en: http://localhost:3000")
