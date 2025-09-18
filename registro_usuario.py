#!/usr/bin/env python3
"""
Script simple para registrar usuarios en Sheily AI
Funciona sin base de datos (modo demo)
"""

import requests
import json
import sys

def registrar_usuario():
    """Registrar un nuevo usuario"""
    print("🔐 Registro de Usuario - Sheily AI")
    print("=" * 40)
    
    # Obtener datos del usuario
    username = input("👤 Nombre de usuario: ").strip()
    email = input("📧 Email: ").strip()
    password = input("🔒 Contraseña: ").strip()
    
    if not username or not email or not password:
        print("❌ Todos los campos son obligatorios")
        return False
    
    # Datos para el registro
    datos_registro = {
        "username": username,
        "email": email,
        "password": password
    }
    
    print(f"\n📝 Registrando usuario: {username}")
    print("⏳ Enviando solicitud...")
    
    try:
        # Intentar registro en el backend
        response = requests.post(
            "http://localhost:8000/api/auth/register",
            json=datos_registro,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 201:
            resultado = response.json()
            print("✅ ¡Usuario registrado exitosamente!")
            print(f"🆔 ID: {resultado.get('user', {}).get('id', 'N/A')}")
            print(f"👤 Usuario: {resultado.get('user', {}).get('username', username)}")
            print(f"📧 Email: {resultado.get('user', {}).get('email', email)}")
            print(f"🔑 Token: {resultado.get('token', 'N/A')[:20]}...")
            return True
            
        elif response.status_code == 409:
            print("❌ Error: El usuario o email ya existe")
            return False
            
        else:
            print(f"❌ Error del servidor: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar con el backend")
        print("💡 Asegúrate de que el backend esté ejecutándose en http://localhost:8000")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Error: Tiempo de espera agotado")
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def login_usuario():
    """Iniciar sesión con un usuario existente"""
    print("\n🔑 Inicio de Sesión - Sheily AI")
    print("=" * 40)
    
    username = input("👤 Nombre de usuario: ").strip()
    password = input("🔒 Contraseña: ").strip()
    
    if not username or not password:
        print("❌ Usuario y contraseña son obligatorios")
        return False
    
    print(f"\n🔐 Iniciando sesión para: {username}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json={"username": username, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            resultado = response.json()
            print("✅ ¡Inicio de sesión exitoso!")
            print(f"👤 Usuario: {resultado.get('user', {}).get('username', username)}")
            print(f"📧 Email: {resultado.get('user', {}).get('email', 'N/A')}")
            print(f"🔑 Token: {resultado.get('token', 'N/A')[:20]}...")
            return True
            
        elif response.status_code == 401:
            print("❌ Error: Credenciales inválidas")
            return False
            
        else:
            print(f"❌ Error del servidor: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar con el backend")
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Sheily AI - Gestión de Usuarios")
    print("=" * 50)
    
    while True:
        print("\n📋 Opciones disponibles:")
        print("1. 🔐 Registrar nuevo usuario")
        print("2. 🔑 Iniciar sesión")
        print("3. 🌐 Abrir frontend web")
        print("4. ❌ Salir")
        
        opcion = input("\n👉 Selecciona una opción (1-4): ").strip()
        
        if opcion == "1":
            registrar_usuario()
        elif opcion == "2":
            login_usuario()
        elif opcion == "3":
            print("\n🌐 Abriendo frontend en el navegador...")
            print("URL: http://localhost:3000")
            print("💡 Haz clic en el núcleo central para acceder al registro/login")
        elif opcion == "4":
            print("👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción inválida. Por favor, selecciona 1-4.")

if __name__ == "__main__":
    main()
