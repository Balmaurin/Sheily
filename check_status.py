#!/usr/bin/env python3
"""
Verificador de Estado de Servicios - Sheily AI
==============================================
Comprueba el estado de todos los servicios del sistema
"""

import requests
import socket
import time
from datetime import datetime

# Colores ANSI para la terminal
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color

def check_port(host, port):
    """Verifica si un puerto está abierto"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def check_http_service(url, service_name):
    """Verifica si un servicio HTTP está respondiendo"""
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return True, f"{GREEN}✅ Online{NC}"
        else:
            return False, f"{YELLOW}⚠️  Respondiendo con código {response.status_code}{NC}"
    except requests.ConnectionError:
        return False, f"{RED}❌ Sin conexión{NC}"
    except requests.Timeout:
        return False, f"{YELLOW}⚠️  Timeout{NC}"
    except Exception as e:
        return False, f"{RED}❌ Error: {str(e)[:30]}{NC}"

def main():
    print("=" * 60)
    print(f"{BLUE}🔍 VERIFICACIÓN DE ESTADO - SHEILY AI{NC}")
    print("=" * 60)
    print(f"📅 Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Definir servicios a verificar
    services = [
        {
            "name": "PostgreSQL",
            "port": 5432,
            "url": None,
            "icon": "🗄️"
        },
        {
            "name": "Backend API",
            "port": 8000,
            "url": "http://localhost:8000/api/health",
            "icon": "🔧"
        },
        {
            "name": "Frontend",
            "port": 3000,
            "url": "http://localhost:3000",
            "icon": "🎨"
        },
        {
            "name": "LLM Server",
            "port": 8005,
            "url": "http://localhost:8005/health",
            "icon": "🧠"
        },
        {
            "name": "AI System",
            "port": 8080,
            "url": "http://localhost:8080/health",
            "icon": "🤖"
        },
        {
            "name": "Blockchain",
            "port": 8090,
            "url": "http://localhost:8090/health",
            "icon": "⛓️"
        }
    ]
    
    print(f"{BLUE}📊 ESTADO DE SERVICIOS:{NC}")
    print("-" * 60)
    
    all_ok = True
    results = []
    
    for service in services:
        # Verificar puerto
        port_open = check_port("localhost", service["port"])
        
        # Estado del puerto
        if port_open:
            port_status = f"{GREEN}Puerto {service['port']} abierto{NC}"
        else:
            port_status = f"{RED}Puerto {service['port']} cerrado{NC}"
            all_ok = False
        
        # Verificar servicio HTTP si tiene URL
        if service["url"] and port_open:
            http_ok, http_status = check_http_service(service["url"], service["name"])
            if not http_ok:
                all_ok = False
        else:
            http_status = "N/A" if not service["url"] else f"{RED}❌ Puerto cerrado{NC}"
        
        # Mostrar resultado
        print(f"{service['icon']} {service['name']:<15} | {port_status:<30} | {http_status}")
        
        results.append({
            "name": service["name"],
            "port_open": port_open,
            "http_ok": http_ok if service["url"] and port_open else None
        })
    
    print()
    print("=" * 60)
    
    # Resumen
    if all_ok:
        print(f"{GREEN}✨ ¡TODOS LOS SERVICIOS ESTÁN FUNCIONANDO CORRECTAMENTE!{NC}")
        print()
        print(f"{BLUE}🌐 URLs de acceso:{NC}")
        print(f"  📊 Dashboard:  http://localhost:3000/dashboard")
        print(f"  💬 Chat:       http://localhost:3000/chat")
        print(f"  📚 API Docs:   http://localhost:8000/docs")
    else:
        print(f"{YELLOW}⚠️  HAY SERVICIOS QUE NO ESTÁN FUNCIONANDO{NC}")
        print()
        print(f"Para iniciar todos los servicios, ejecuta:")
        print(f"  {BLUE}./start_sheily_complete.sh{NC}")
    
    print()
    
    # Verificar conectividad del dashboard específicamente
    print(f"{BLUE}🔌 VERIFICACIÓN DE CONECTIVIDAD DEL DASHBOARD:{NC}")
    print("-" * 60)
    
    # Verificar si el frontend puede conectar con el backend
    frontend_ok = any(r["name"] == "Frontend" and r["port_open"] for r in results)
    backend_ok = any(r["name"] == "Backend API" and r["port_open"] for r in results)
    llm_ok = any(r["name"] == "LLM Server" and r["port_open"] for r in results)
    
    if frontend_ok and backend_ok:
        print(f"{GREEN}✅ Dashboard puede conectarse al Backend{NC}")
    else:
        print(f"{RED}❌ Dashboard NO puede conectarse al Backend{NC}")
        print(f"   Esto causa el mensaje 'Desconectada' en el dashboard")
    
    if frontend_ok and llm_ok:
        print(f"{GREEN}✅ Dashboard puede conectarse al LLM Server{NC}")
    else:
        print(f"{YELLOW}⚠️  Dashboard NO puede conectarse al LLM Server{NC}")
        print(f"   El chat no funcionará correctamente")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()