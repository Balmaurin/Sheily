#!/usr/bin/env python3
"""
Dashboard de Monitoreo del Gateway Maestro Unificado - Sheily AI
===============================================================

Dashboard en tiempo real para monitorear el estado del Gateway Maestro
"""

import requests
import time
import os
import json
import psutil
from datetime import datetime

def clear_screen():
    """Limpiar pantalla"""
    os.system('clear' if os.name == 'posix' else 'cls')

def get_service_status():
    """Obtener estado de los servicios"""
    services = {
        "PostgreSQL": {"port": 5432, "url": None},
        "LLM Server": {"port": 8005, "url": "http://localhost:8005/health"},
        "Backend API": {"port": 8000, "url": "http://localhost:8000/api/health"},
        "Frontend": {"port": 3000, "url": "http://localhost:3000"},
        "AI System": {"port": 8080, "url": "http://localhost:8080/health"},
        "Blockchain": {"port": 8090, "url": "http://localhost:8090/health"},
    }
    
    status = {}
    
    for service_name, config in services.items():
        try:
            if config["url"]:
                response = requests.get(config["url"], timeout=2)
                if response.status_code == 200:
                    status[service_name] = {
                        "status": "✅ RUNNING",
                        "health": "💚 HEALTHY",
                        "port": config["port"],
                        "response_time": f"{response.elapsed.total_seconds():.3f}s"
                    }
                else:
                    status[service_name] = {
                        "status": "❌ ERROR",
                        "health": "💔 UNHEALTHY", 
                        "port": config["port"],
                        "response_time": "N/A"
                    }
            else:
                # Verificar puerto
                import socket
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    result = s.connect_ex(('localhost', config["port"]))
                    if result == 0:
                        status[service_name] = {
                            "status": "✅ RUNNING",
                            "health": "💚 HEALTHY",
                            "port": config["port"],
                            "response_time": "N/A"
                        }
                    else:
                        status[service_name] = {
                            "status": "⏹️ STOPPED",
                            "health": "❓ UNKNOWN",
                            "port": config["port"],
                            "response_time": "N/A"
                        }
        except Exception as e:
            status[service_name] = {
                "status": "❌ ERROR",
                "health": "💔 UNHEALTHY",
                "port": config["port"],
                "response_time": "N/A",
                "error": str(e)
            }
    
    return status

def get_system_resources():
    """Obtener recursos del sistema"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu": {
                "percent": cpu_percent,
                "status": "🟢" if cpu_percent < 70 else "🟡" if cpu_percent < 90 else "🔴"
            },
            "memory": {
                "percent": memory.percent,
                "used": f"{memory.used / (1024**3):.1f}GB",
                "total": f"{memory.total / (1024**3):.1f}GB",
                "status": "🟢" if memory.percent < 70 else "🟡" if memory.percent < 90 else "🔴"
            },
            "disk": {
                "percent": disk.percent,
                "used": f"{disk.used / (1024**3):.1f}GB",
                "total": f"{disk.total / (1024**3):.1f}GB",
                "status": "🟢" if disk.percent < 70 else "🟡" if disk.percent < 90 else "🔴"
            }
        }
    except Exception as e:
        return {"error": str(e)}

def print_dashboard():
    """Imprimir dashboard"""
    clear_screen()
    
    print("=" * 80)
    print("🚀 GATEWAY MAESTRO UNIFICADO - DASHBOARD DE MONITOREO")
    print("=" * 80)
    print(f"🕐 Última actualización: {datetime.now().strftime('%H:%M:%S')}")
    print()
    
    # Estado de servicios
    print("📊 ESTADO DE SERVICIOS:")
    print("-" * 80)
    
    services_status = get_service_status()
    
    for service_name, info in services_status.items():
        print(f"{info['status']} {service_name:<20} {info['health']:<12} Puerto: {info['port']:<6} Tiempo: {info['response_time']}")
        if 'error' in info:
            print(f"    ❌ Error: {info['error']}")
    
    print()
    
    # Recursos del sistema
    print("💻 RECURSOS DEL SISTEMA:")
    print("-" * 80)
    
    resources = get_system_resources()
    
    if 'error' not in resources:
        print(f"{resources['cpu']['status']} CPU:    {resources['cpu']['percent']:>5.1f}%")
        print(f"{resources['memory']['status']} Memoria: {resources['memory']['percent']:>5.1f}% ({resources['memory']['used']} / {resources['memory']['total']})")
        print(f"{resources['disk']['status']} Disco:   {resources['disk']['percent']:>5.1f}% ({resources['disk']['used']} / {resources['disk']['total']})")
    else:
        print(f"❌ Error obteniendo recursos: {resources['error']}")
    
    print()
    
    # URLs de acceso
    print("🌐 URLS DE ACCESO:")
    print("-" * 80)
    
    running_services = [name for name, info in services_status.items() if "RUNNING" in info['status']]
    
    if "Backend API" in running_services:
        print("⚙️  Backend API:     http://localhost:8000")
        print("📚 API Docs:       http://localhost:8000/docs")
        print("🔐 Auth Login:     http://localhost:8000/api/auth/login")
    
    if "LLM Server" in running_services:
        print("🧠 LLM Server:     http://localhost:8005")
        print("💬 Chat API:       http://localhost:8005/generate")
    
    if "Frontend" in running_services:
        print("🎨 Frontend App:   http://localhost:3000")
        print("💬 Dashboard Chat: http://localhost:3000/chat")
    
    if "AI System" in running_services:
        print("🤖 AI System:      http://localhost:8080")
        print("🔍 AI Query:       http://localhost:8080/query")
    
    if "Blockchain" in running_services:
        print("⛓️ Blockchain:     http://localhost:8090")
        print("💰 Wallet API:     http://localhost:8090/wallet/create")
    
    if "PostgreSQL" in running_services:
        print("🗄️ PostgreSQL:     localhost:5432 (sheily_ai_db)")
    
    print()
    print("=" * 80)
    print("🔄 Actualizando cada 5 minutos... (Ctrl+C para salir)")
    print("=" * 80)

def main():
    """Función principal del dashboard"""
    try:
        while True:
            print_dashboard()
            time.sleep(300)  # 5 minutos = 300 segundos
    except KeyboardInterrupt:
        print("\n👋 ¡Dashboard cerrado!")
    except Exception as e:
        print(f"\n❌ Error en dashboard: {e}")

if __name__ == "__main__":
    main()
