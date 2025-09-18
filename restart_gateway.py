#!/usr/bin/env python3
"""
Script para reiniciar el Gateway Maestro con todas las correcciones aplicadas
"""

import os
import signal
import subprocess
import time
import psutil
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def kill_existing_services():
    """Terminar servicios existentes"""
    logger.info("🛑 Terminando servicios existentes...")
    
    # Buscar y terminar procesos relacionados
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            
            # Procesos a terminar
            if any(pattern in cmdline for pattern in [
                'gateway_maestro_unificado.py',
                'gateway_dashboard.py',
                'run_llama_chat.py',
                'simple_ai_server.py',
                'blockchain_server.py'
            ]):
                logger.info(f"🔄 Terminando proceso: {proc.info['name']} (PID: {proc.info['pid']})")
                proc.terminate()
                
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    # Esperar a que terminen
    time.sleep(3)
    
    # Forzar terminación si es necesario
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            if any(pattern in cmdline for pattern in [
                'gateway_maestro_unificado.py',
                'run_llama_chat.py'
            ]):
                logger.warning(f"🔨 Forzando terminación: {proc.info['name']} (PID: {proc.info['pid']})")
                proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def main():
    """Función principal"""
    print("🔄 REINICIANDO GATEWAY MAESTRO UNIFICADO")
    print("="*50)
    
    # Terminar servicios existentes
    kill_existing_services()
    
    print("✅ Servicios anteriores terminados")
    print("🚀 Iniciando Gateway Maestro corregido...")
    print()
    
    # Iniciar Gateway Maestro
    try:
        subprocess.run(["python3", "gateway_maestro_unificado.py"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Gateway detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando Gateway: {e}")

if __name__ == "__main__":
    main()
