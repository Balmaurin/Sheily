#!/usr/bin/env python3
"""
🚀 GATEWAY MAESTRO UNIFICADO CON AUDITOR INTEGRADO - SHEILY AI
Sistema de control completo con auditoría automática de endpoints
"""

import subprocess
import time
import logging
import signal
import sys
import os
import requests
import json
import re
from datetime import datetime
from pathlib import Path

class GatewayMaestroConAuditor:
    def __init__(self):
        self.services = {}
        self.running = True
        self.logger = self.setup_logging()
        self.audit_interval = 3600  # 1 hora
        self.last_audit = 0
        
        # Configuración de servicios
        self.service_configs = {
            'postgresql': {
                'name': 'PostgreSQL Database',
                'check_cmd': ['pg_isready', '-h', 'localhost', '-p', '5432'],
                'start_cmd': None,  # Ya debe estar ejecutándose
                'port': 5432,
                'health_url': None
            },
            'llm_server': {
                'name': 'LLM Server (Llama 3.2 Q8_0)',
                'check_cmd': None,
                'start_cmd': ['python3', '/home/yo/sheily-ai/backend/llm_server.py'],
                'port': 8005,
                'health_url': 'http://localhost:8005/health',
                'startup_timeout': 30
            },
            'backend': {
                'name': 'Backend API Server',
                'check_cmd': None,
                'start_cmd': ['node', 'server.js'],
                'port': 8000,
                'health_url': 'http://localhost:8000/api/health',
                'cwd': '/home/yo/sheily-ai/backend',
                'startup_timeout': 15
            },
            'ai_system': {
                'name': 'Unified AI System',
                'check_cmd': None,
                'start_cmd': ['python3', '/home/yo/sheily-ai/modules/unified_systems/simple_ai_server.py'],
                'port': 8080,
                'health_url': 'http://localhost:8080/health',
                'startup_timeout': 10
            },
            'blockchain': {
                'name': 'Blockchain Integration',
                'check_cmd': None,
                'start_cmd': ['python3', '/home/yo/sheily-ai/blockchain_server.py'],
                'port': 8090,
                'health_url': 'http://localhost:8090/health',
                'startup_timeout': 10
            },
            'frontend': {
                'name': 'Frontend Next.js App',
                'check_cmd': None,
                'start_cmd': ['npm', 'run', 'dev'],
                'port': 3000,
                'health_url': 'http://localhost:3000',
                'cwd': '/home/yo/sheily-ai/Frontend',
                'startup_timeout': 60
            }
        }
    
    def setup_logging(self):
        """Configurar sistema de logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    def audit_endpoints(self):
        """Auditoría automática de endpoints"""
        try:
            self.logger.info("🔍 Iniciando auditoría automática de endpoints...")
            
            # Verificar que el backend esté funcionando
            try:
                response = requests.get('http://localhost:8000/api/health', timeout=5)
                if response.status_code != 200:
                    self.logger.warning("⚠️ Backend no responde - saltando auditoría")
                    return
            except:
                self.logger.warning("⚠️ Backend no disponible - saltando auditoría")
                return
            
            # Ejecutar auditor
            result = subprocess.run([
                'python3', 
                '/home/yo/sheily-ai/gateway_auditor_endpoints.py'
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                # Extraer métricas del resultado
                output = result.stdout
                
                # Buscar métricas en la salida
                efficiency_match = re.search(r'Eficiencia del sistema: ([\d.]+)%', output)
                total_match = re.search(r'Total endpoints encontrados: (\d+)', output)
                working_match = re.search(r'Endpoints funcionando: (\d+)', output)
                cleanable_match = re.search(r'Endpoints que se pueden limpiar: (\d+)', output)
                
                if efficiency_match and total_match and working_match:
                    efficiency = float(efficiency_match.group(1))
                    total = int(total_match.group(1))
                    working = int(working_match.group(1))
                    cleanable = int(cleanable_match.group(1)) if cleanable_match else 0
                    
                    self.logger.info(f"📊 Auditoría completada:")
                    self.logger.info(f"   📈 Eficiencia: {efficiency}%")
                    self.logger.info(f"   ✅ Funcionando: {working}/{total}")
                    self.logger.info(f"   🧹 Limpiables: {cleanable}")
                    
                    # Si la eficiencia es baja, sugerir limpieza
                    if efficiency < 85.0 and cleanable > 5:
                        self.logger.warning(f"⚠️ Eficiencia baja ({efficiency}%) - {cleanable} endpoints limpiables")
                        self.logger.info(f"💡 Sugerencia: Ejecutar 'python3 limpieza_endpoints_manual.py'")
                
                self.last_audit = time.time()
                
            else:
                self.logger.error(f"❌ Error en auditoría: {result.stderr}")
                
        except Exception as e:
            self.logger.error(f"❌ Error ejecutando auditoría: {e}")
    
    def check_port_available(self, port):
        """Verificar si un puerto está disponible"""
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) != 0
    
    def find_available_port(self, start_port):
        """Encontrar puerto disponible comenzando desde start_port"""
        port = start_port
        while port < start_port + 100:
            if self.check_port_available(port):
                return port
            port += 1
        return None
    
    def start_service(self, service_name, config):
        """Iniciar un servicio específico"""
        if service_name == 'postgresql':
            # PostgreSQL debe estar ya ejecutándose
            try:
                result = subprocess.run(config['check_cmd'], 
                                      capture_output=True, timeout=5)
                if result.returncode == 0:
                    self.logger.info(f"✅ {config['name']} ya está ejecutándose")
                    return True
                else:
                    self.logger.error(f"❌ {config['name']} no está disponible")
                    return False
            except:
                self.logger.error(f"❌ No se puede verificar {config['name']}")
                return False
        
        # Para otros servicios, verificar puerto y iniciar
        port = config['port']
        if not self.check_port_available(port):
            # Puerto ocupado, buscar alternativo
            new_port = self.find_available_port(port + 1)
            if new_port:
                self.logger.info(f"🔄 Puerto {port} ocupado, usando {new_port} para {service_name}")
                port = new_port
                config['port'] = new_port
                # Actualizar URL de salud si existe
                if config.get('health_url'):
                    config['health_url'] = config['health_url'].replace(f":{config['port']}", f":{new_port}")
            else:
                self.logger.error(f"❌ No se encontró puerto disponible para {service_name}")
                return False
        
        self.logger.info(f"🚀 Iniciando {config['name']}...")
        
        try:
            # Preparar comando de inicio
            cmd = config['start_cmd'].copy()
            if service_name == 'llm_server':
                cmd.extend(['--port', str(port)])
            elif service_name == 'backend':
                # Configurar puerto para backend
                env = os.environ.copy()
                env['PORT'] = str(port)
                process = subprocess.Popen(cmd, cwd=config.get('cwd'), env=env)
            else:
                process = subprocess.Popen(cmd, cwd=config.get('cwd'))
            
            if service_name != 'backend':
                process = subprocess.Popen(cmd, cwd=config.get('cwd'))
            
            # Esperar a que el servicio esté listo
            timeout = config.get('startup_timeout', 30)
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                if config.get('health_url'):
                    try:
                        response = requests.get(config['health_url'], timeout=2)
                        if response.status_code == 200:
                            self.services[service_name] = {
                                'process': process,
                                'port': port,
                                'pid': process.pid
                            }
                            self.logger.info(f"✅ {config['name']} iniciado exitosamente (PID: {process.pid}, Puerto: {port})")
                            return True
                    except:
                        pass
                
                time.sleep(2)
            
            # Si llegamos aquí, el servicio no respondió a tiempo
            process.terminate()
            self.logger.error(f"❌ {config['name']} no respondió en {timeout}s")
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Error iniciando {config['name']}: {e}")
            return False
    
    def start_all_services(self):
        """Iniciar todos los servicios"""
        self.logger.info("🚀 Iniciando todos los servicios del sistema...")
        
        started = 0
        total = len(self.service_configs)
        
        for service_name, config in self.service_configs.items():
            if self.start_service(service_name, config):
                started += 1
            time.sleep(2)  # Pausa entre servicios
        
        self.logger.info(f"📊 Servicios iniciados: {started}/{total}")
        
        if started == total:
            self.logger.info("✅ Sistema iniciado exitosamente")
            return True
        else:
            self.logger.warning(f"⚠️ Solo {started} de {total} servicios iniciaron correctamente")
            return False
    
    def monitor_services(self):
        """Monitorear servicios y hacer auditorías periódicas"""
        self.logger.info("👁️ Iniciando monitoreo de servicios...")
        
        while self.running:
            try:
                # Verificar salud de servicios cada 5 minutos
                time.sleep(300)
                
                if not self.running:
                    break
                
                # Auditoría automática cada hora
                current_time = time.time()
                if current_time - self.last_audit > self.audit_interval:
                    self.audit_endpoints()
                
                # Verificar salud básica del backend
                try:
                    response = requests.get('http://localhost:8000/api/health', timeout=5)
                    if response.status_code == 200:
                        self.logger.info("💚 Sistema funcionando correctamente")
                    else:
                        self.logger.warning("⚠️ Backend respondiendo con errores")
                except:
                    self.logger.error("❌ Backend no responde")
                
            except Exception as e:
                if self.running:
                    self.logger.error(f"❌ Error en monitoreo: {e}")
    
    def stop_all_services(self):
        """Detener todos los servicios"""
        self.logger.info("🛑 Deteniendo todos los servicios...")
        
        for service_name, service_info in self.services.items():
            try:
                config = self.service_configs[service_name]
                self.logger.info(f"🛑 Deteniendo {config['name']}...")
                
                process = service_info['process']
                process.terminate()
                
                # Esperar terminación
                try:
                    process.wait(timeout=10)
                    self.logger.info(f"✅ {config['name']} detenido")
                except subprocess.TimeoutExpired:
                    process.kill()
                    self.logger.warning(f"🔪 {config['name']} forzado a terminar")
                
            except Exception as e:
                self.logger.error(f"❌ Error deteniendo {service_name}: {e}")
        
        self.logger.info("✅ Todos los servicios detenidos")
    
    def signal_handler(self, signum, frame):
        """Manejar señales del sistema"""
        self.logger.info(f"🛑 Señal {signum} recibida, iniciando limpieza...")
        self.running = False
        self.stop_all_services()
        sys.exit(0)
    
    def run(self):
        """Ejecutar el Gateway Maestro"""
        # Configurar manejo de señales
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("🚀 GATEWAY MAESTRO UNIFICADO CON AUDITOR - SHEILY AI")
        print("=" * 60)
        print("Iniciando sistema completo que controla:")
        print("✅ PostgreSQL Database")
        print("✅ LLM Server (Llama 3.2 Q8_0)")
        print("✅ Backend API")
        print("✅ Frontend React")
        print("✅ AI System Unificado")
        print("✅ Blockchain Integration")
        print("🔍 Auditoría automática de endpoints")
        print("Presiona Ctrl+C para detener todos los servicios")
        
        self.logger.info("🚀 Gateway Maestro Unificado con Auditor inicializado")
        
        # Configurar servicios
        self.logger.info("⚙️ Configurando servicios del sistema...")
        self.logger.info(f"✅ {len(self.service_configs)} servicios configurados")
        
        # Iniciar servicios
        if not self.start_all_services():
            self.logger.error("❌ No se pudieron iniciar todos los servicios")
            return False
        
        # Ejecutar auditoría inicial
        time.sleep(10)  # Esperar que los servicios estén estables
        self.audit_endpoints()
        
        # Iniciar monitoreo
        try:
            self.monitor_services()
        except KeyboardInterrupt:
            self.logger.info("🛑 Interrupción de teclado recibida")
        finally:
            self.stop_all_services()
        
        return True

def main():
    gateway = GatewayMaestroConAuditor()
    return gateway.run()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
