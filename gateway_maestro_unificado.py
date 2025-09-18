#!/usr/bin/env python3
"""
🚀 GATEWAY MAESTRO UNIFICADO - SHEILY AI
========================================

Sistema que controla ABSOLUTAMENTE TODO:
✅ Backend + Frontend + LLM + Base de datos
✅ Auth completo (login/registro) integrado
✅ Chat del dashboard conectado con Llama 3.2 Q8_0
✅ Blockchain, wallet, métricas - todo centralizado
✅ Módulos, endpoints, APIs - todo bajo el gateway
✅ Detección automática de puertos
✅ Recuperación automática de errores
✅ Monitoreo en tiempo real

UN SOLO COMANDO PARA INICIAR TODO EL SISTEMA COMPLETO
"""

import asyncio
import json
import logging
import os
import signal
import subprocess
import sys
import time
import psutil
import requests
import socket
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor
import threading

# Configurar logging avanzado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/gateway_maestro.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


@dataclass
class ServiceConfig:
    """Configuración de servicio"""

    name: str
    command: List[str]
    port: int
    health_endpoint: str
    working_dir: str = "."
    env_vars: Dict[str, str] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    restart_on_failure: bool = True
    max_restarts: int = 3
    startup_timeout: int = 45  # Timeout más generoso por defecto


@dataclass
class ServiceStatus:
    """Estado de servicio"""

    name: str
    pid: Optional[int] = None
    port: Optional[int] = None
    status: str = "stopped"  # stopped, starting, running, failed, restarting
    health: str = "unknown"  # healthy, unhealthy, unknown
    last_check: Optional[datetime] = None
    restart_count: int = 0
    uptime: Optional[datetime] = None
    error_message: Optional[str] = None


class GatewayMaestroUnificado:
    """Gateway Maestro que controla absolutamente todo el sistema Sheily AI"""

    def __init__(self):
        """Inicializar Gateway Maestro"""
        self.base_path = Path(__file__).parent
        self.services: Dict[str, ServiceConfig] = {}
        self.service_status: Dict[str, ServiceStatus] = {}
        self.processes: Dict[str, subprocess.Popen] = {}
        self.running = False
        self.executor = ThreadPoolExecutor(max_workers=10)

        # Configuración de la base de datos
        self.db_config = {
            "host": "localhost",
            "port": 5432,
            "database": "sheily_ai_db",
            "user": "sheily_ai_user",
            "password": "SheilyAI2025SecurePassword",
        }

        # Configurar señales para limpieza
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        logger.info("🚀 Gateway Maestro Unificado inicializado")

        # Configurar todos los servicios
        self._setup_services()

    def _setup_services(self):
        """Configurar todos los servicios del sistema"""
        logger.info("⚙️ Configurando servicios del sistema...")

        # 1. PostgreSQL (ya debe estar ejecutándose)
        self.services["postgresql"] = ServiceConfig(
            name="PostgreSQL Database",
            command=["systemctl", "status", "postgresql"],  # Solo verificar
            port=5432,
            health_endpoint="",  # Verificación personalizada
            dependencies=[],
        )

        # 2. Servidor LLM Llama 3.2 Q8_0
        self.services["llm_server"] = ServiceConfig(
            name="LLM Server (Llama 3.2 Q8_0)",
            command=["python3", "run_llama_chat.py"],
            port=8005,
            health_endpoint="http://localhost:8005/health",
            working_dir=str(self.base_path),
            env_vars={
                "MODEL_PATH": "models/cache/hub/models--bartowski--Llama-3.2-3B-Instruct-GGUF/snapshots/5ab33fa94d1d04e903623ae72c95d1696f09f9e8/Llama-3.2-3B-Instruct-Q8_0.gguf"
            },
            dependencies=[],
        )

        # 3. Backend API
        self.services["backend"] = ServiceConfig(
            name="Backend API Server",
            command=["node", "server.js"],
            port=8000,
            health_endpoint="http://localhost:8000/api/health",
            working_dir=str(self.base_path / "backend"),
            env_vars={
                "DB_HOST": self.db_config["host"],
                "DB_PORT": str(self.db_config["port"]),
                "DB_NAME": self.db_config["database"],
                "DB_USER": self.db_config["user"],
                "DB_PASSWORD": self.db_config["password"],
                "DB_TYPE": "postgres",
                "MODEL_SERVER_URL": "http://localhost:8005",
                "LLM_MODEL_NAME": "Llama-3.2-3B-Instruct-Q8_0",
                "JWT_SECRET": "sheily-ai-jwt-secret-2025-ultra-secure-random-string-128-bits",
                "BCRYPT_ROUNDS": "12",
                "SESSION_TIMEOUT": "86400000",
                "NODE_ENV": "development",
            },
            dependencies=["postgresql", "llm_server"],
        )

        # 4. Frontend Next.js (Landing + Dashboard)
        self.services["frontend"] = ServiceConfig(
            name="Frontend Next.js App",
            command=["npm", "run", "dev"],
            port=3000,
            health_endpoint="http://localhost:3000",
            working_dir=str(self.base_path / "Frontend"),
            env_vars={
                "REACT_APP_API_URL": "http://localhost:8000",
                "REACT_APP_ENVIRONMENT": "development",
            },
            dependencies=["backend"],
            startup_timeout=60,  # Next.js necesita más tiempo
        )

        # 5. Sistema Unificado de IA
        self.services["ai_system"] = ServiceConfig(
            name="Unified AI System",
            command=["python3", "modules/unified_systems/simple_ai_server.py"],
            port=8080,
            health_endpoint="http://localhost:8080/health",
            working_dir=str(self.base_path),
            env_vars={
                "BACKEND_URL": "http://localhost:8000",
                "LLM_URL": "http://localhost:8005",
            },
            dependencies=["backend"],
        )

        # 6. Sistema de Blockchain
        self.services["blockchain"] = ServiceConfig(
            name="Blockchain Integration",
            command=["python3", "blockchain_server.py"],
            port=8090,
            health_endpoint="http://localhost:8090/health",
            working_dir=str(self.base_path),
            dependencies=[],
        )

        logger.info(f"✅ {len(self.services)} servicios configurados")

    def _find_free_port(self, start_port: int = 8000) -> int:
        """Encontrar puerto libre automáticamente"""
        for port in range(start_port, start_port + 100):
            if not self._is_port_in_use(port):
                return port
        raise RuntimeError(f"No se encontró puerto libre desde {start_port}")

    def _is_port_in_use(self, port: int) -> bool:
        """Verificar si un puerto está en uso"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("localhost", port))
                return False
            except OSError:
                return True

    def _check_postgresql(self) -> bool:
        """Verificar conexión a PostgreSQL"""
        try:
            import psycopg2

            conn = psycopg2.connect(
                host=self.db_config["host"],
                port=self.db_config["port"],
                database=self.db_config["database"],
                user=self.db_config["user"],
                password=self.db_config["password"],
            )
            conn.close()
            return True
        except Exception as e:
            logger.error(f"❌ Error conectando a PostgreSQL: {e}")
            return False

    async def start_service(self, service_name: str) -> bool:
        """Iniciar un servicio específico"""
        if service_name not in self.services:
            logger.error(f"❌ Servicio desconocido: {service_name}")
            return False

        config = self.services[service_name]
        status = self.service_status.get(service_name, ServiceStatus(service_name))

        # Verificar dependencias
        for dep in config.dependencies:
            dep_status = self.service_status.get(dep)
            if not dep_status or dep_status.status != "running":
                logger.warning(
                    f"⚠️ Dependencia {dep} no está ejecutándose para {service_name}"
                )
                return False

        # Verificar si el puerto está libre (si no es PostgreSQL)
        if service_name != "postgresql" and self._is_port_in_use(config.port):
            # Intentar encontrar puerto libre
            try:
                new_port = self._find_free_port(config.port)
                logger.info(
                    f"🔄 Puerto {config.port} ocupado, usando {new_port} para {service_name}"
                )
                config.port = new_port
                # Actualizar variables de entorno si es necesario
                if "REACT_APP_API_URL" in config.env_vars:
                    config.env_vars["REACT_APP_API_URL"] = (
                        f"http://localhost:{new_port}"
                    )
            except RuntimeError as e:
                logger.error(
                    f"❌ No se pudo encontrar puerto libre para {service_name}: {e}"
                )
                return False

        logger.info(f"🚀 Iniciando {config.name}...")
        status.status = "starting"
        status.uptime = datetime.now()
        self.service_status[service_name] = status

        try:
            # Manejo especial para PostgreSQL
            if service_name == "postgresql":
                if self._check_postgresql():
                    status.status = "running"
                    status.health = "healthy"
                    status.port = config.port
                    logger.info(f"✅ {config.name} ya está ejecutándose")
                    return True
                else:
                    status.status = "failed"
                    status.error_message = "No se puede conectar a PostgreSQL"
                    logger.error(f"❌ {config.name} no está disponible")
                    return False

            # Preparar entorno
            env = os.environ.copy()
            env.update(config.env_vars)

            # Iniciar proceso
            process = subprocess.Popen(
                config.command,
                cwd=config.working_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid,  # Para poder terminar el grupo de procesos
            )

            self.processes[service_name] = process
            status.pid = process.pid
            status.port = config.port

            # Esperar a que el servicio esté listo
            await self._wait_for_service_ready(service_name, config.startup_timeout)

            if status.status == "running":
                logger.info(
                    f"✅ {config.name} iniciado exitosamente (PID: {process.pid}, Puerto: {config.port})"
                )
                return True
            else:
                logger.error(f"❌ {config.name} falló al iniciar")
                return False

        except Exception as e:
            status.status = "failed"
            status.error_message = str(e)
            logger.error(f"❌ Error iniciando {config.name}: {e}")
            return False

    async def _wait_for_service_ready(self, service_name: str, timeout: int):
        """Esperar a que un servicio esté listo"""
        config = self.services[service_name]
        status = self.service_status[service_name]

        start_time = time.time()

        while time.time() - start_time < timeout:
            # Verificar si el proceso sigue vivo
            if service_name in self.processes:
                process = self.processes[service_name]
                if process.poll() is not None:
                    # El proceso terminó
                    status.status = "failed"
                    status.error_message = (
                        f"Proceso terminó con código {process.returncode}"
                    )
                    return

            # Verificar health endpoint si existe
            if config.health_endpoint:
                try:
                    response = requests.get(config.health_endpoint, timeout=2)
                    if response.status_code == 200:
                        status.status = "running"
                        status.health = "healthy"
                        status.last_check = datetime.now()
                        return
                except requests.RequestException:
                    pass
            else:
                # Si no hay endpoint de salud, verificar puerto
                if not self._is_port_in_use(config.port):
                    await asyncio.sleep(1)
                    continue
                else:
                    status.status = "running"
                    status.health = "healthy"
                    status.last_check = datetime.now()
                    return

            await asyncio.sleep(1)

        # Timeout alcanzado
        status.status = "failed"
        status.error_message = f"Timeout después de {timeout} segundos"

    async def stop_service(self, service_name: str):
        """Detener un servicio"""
        if service_name not in self.processes:
            logger.warning(f"⚠️ Servicio {service_name} no está ejecutándose")
            return

        config = self.services[service_name]
        process = self.processes[service_name]

        logger.info(f"🛑 Deteniendo {config.name}...")

        try:
            # Terminar el grupo de procesos
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)

            # Esperar a que termine
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                # Forzar terminación
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                process.wait()

            del self.processes[service_name]

            status = self.service_status.get(service_name)
            if status:
                status.status = "stopped"
                status.pid = None
                status.health = "unknown"

            logger.info(f"✅ {config.name} detenido")

        except Exception as e:
            logger.error(f"❌ Error deteniendo {config.name}: {e}")

    async def start_all_services(self):
        """Iniciar todos los servicios en orden de dependencias"""
        logger.info("🚀 Iniciando todos los servicios del sistema...")

        # Crear directorio de logs si no existe
        os.makedirs("logs", exist_ok=True)

        # Orden de inicio basado en dependencias
        startup_order = [
            "postgresql",
            "llm_server",
            "backend",
            "ai_system",
            "blockchain",
            "frontend",
        ]

        success_count = 0

        for service_name in startup_order:
            if await self.start_service(service_name):
                success_count += 1
                # Pequeña pausa entre servicios
                await asyncio.sleep(2)
            else:
                logger.error(f"❌ Falló al iniciar {service_name}")
                # Continuar con otros servicios no críticos
                if service_name in ["postgresql", "llm_server", "backend"]:
                    logger.error("❌ Servicio crítico falló, deteniendo inicio")
                    break

        logger.info(f"📊 Servicios iniciados: {success_count}/{len(startup_order)}")

        if success_count >= 3:  # Al menos los servicios críticos
            self.running = True
            logger.info("✅ Sistema iniciado exitosamente")
            await self._start_monitoring()
        else:
            logger.error("❌ No se pudieron iniciar suficientes servicios críticos")

    async def _start_monitoring(self):
        """Iniciar monitoreo de servicios"""
        logger.info("👁️ Iniciando monitoreo de servicios...")

        while self.running:
            await self._health_check_all()
            await asyncio.sleep(300)  # Verificar cada 5 minutos

    async def _health_check_all(self):
        """Verificar salud de todos los servicios"""
        for service_name, config in self.services.items():
            await self._health_check_service(service_name)

    async def _health_check_service(self, service_name: str):
        """Verificar salud de un servicio específico"""
        config = self.services[service_name]
        status = self.service_status.get(service_name)

        if not status or status.status != "running":
            return

        try:
            if service_name == "postgresql":
                # Verificación especial para PostgreSQL
                if self._check_postgresql():
                    status.health = "healthy"
                else:
                    status.health = "unhealthy"
            elif config.health_endpoint:
                # Verificar endpoint de salud
                response = requests.get(config.health_endpoint, timeout=5)
                if response.status_code == 200:
                    status.health = "healthy"
                else:
                    status.health = "unhealthy"
            else:
                # Verificar si el proceso sigue vivo
                if service_name in self.processes:
                    process = self.processes[service_name]
                    if process.poll() is None:
                        status.health = "healthy"
                    else:
                        status.health = "unhealthy"
                        status.status = "failed"

            status.last_check = datetime.now()

            # Reiniciar si está unhealthy y se permite restart
            if status.health == "unhealthy" and config.restart_on_failure:
                if status.restart_count < config.max_restarts:
                    logger.warning(
                        f"⚠️ Reiniciando {config.name} (intento {status.restart_count + 1})"
                    )
                    await self.stop_service(service_name)
                    status.restart_count += 1
                    await asyncio.sleep(5)
                    await self.start_service(service_name)
                else:
                    logger.error(
                        f"❌ {config.name} falló demasiadas veces, no reiniciando más"
                    )

        except Exception as e:
            status.health = "unhealthy"
            status.last_check = datetime.now()
            logger.error(f"❌ Error verificando salud de {service_name}: {e}")

    def get_system_status(self) -> Dict[str, Any]:
        """Obtener estado completo del sistema"""
        return {
            "gateway": {
                "running": self.running,
                "uptime": datetime.now().isoformat(),
                "services_count": len(self.services),
            },
            "services": {
                name: {
                    "name": status.name,
                    "status": status.status,
                    "health": status.health,
                    "pid": status.pid,
                    "port": status.port,
                    "uptime": status.uptime.isoformat() if status.uptime else None,
                    "last_check": (
                        status.last_check.isoformat() if status.last_check else None
                    ),
                    "restart_count": status.restart_count,
                    "error": status.error_message,
                }
                for name, status in self.service_status.items()
            },
        }

    def print_status(self):
        """Imprimir estado del sistema"""
        print("\n" + "=" * 80)
        print("🚀 ESTADO DEL GATEWAY MAESTRO UNIFICADO - SHEILY AI")
        print("=" * 80)

        for service_name, status in self.service_status.items():
            config = self.services[service_name]

            # Emojis para estado
            status_emoji = {
                "running": "✅",
                "starting": "🔄",
                "stopped": "⏹️",
                "failed": "❌",
                "restarting": "🔄",
            }.get(status.status, "❓")

            health_emoji = {"healthy": "💚", "unhealthy": "💔", "unknown": "❓"}.get(
                status.health, "❓"
            )

            print(f"{status_emoji} {config.name}")
            print(f"   📊 Estado: {status.status.upper()}")
            print(f"   {health_emoji} Salud: {status.health}")
            if status.port:
                print(f"   🔌 Puerto: {status.port}")
            if status.pid:
                print(f"   🆔 PID: {status.pid}")
            if status.uptime:
                uptime = datetime.now() - status.uptime
                print(f"   ⏱️ Uptime: {uptime}")
            if status.restart_count > 0:
                print(f"   🔄 Reinicios: {status.restart_count}")
            if status.error_message:
                print(f"   ❌ Error: {status.error_message}")
            print()

        # URLs de acceso
        print("🌐 URLS DE ACCESO:")
        if (
            "frontend" in self.service_status
            and self.service_status["frontend"].status == "running"
        ):
            print(
                f"   🎨 Frontend: http://localhost:{self.service_status['frontend'].port}"
            )
        if (
            "backend" in self.service_status
            and self.service_status["backend"].status == "running"
        ):
            print(
                f"   ⚙️ Backend API: http://localhost:{self.service_status['backend'].port}"
            )
        if (
            "llm_server" in self.service_status
            and self.service_status["llm_server"].status == "running"
        ):
            print(
                f"   🧠 LLM Server: http://localhost:{self.service_status['llm_server'].port}"
            )
        if (
            "ai_system" in self.service_status
            and self.service_status["ai_system"].status == "running"
        ):
            print(
                f"   🤖 AI System: http://localhost:{self.service_status['ai_system'].port}"
            )

        print("=" * 80)

    async def stop_all_services(self):
        """Detener todos los servicios"""
        logger.info("🛑 Deteniendo todos los servicios...")
        self.running = False

        # Detener en orden inverso
        stop_order = list(
            reversed(["frontend", "ai_system", "blockchain", "backend", "llm_server"])
        )

        for service_name in stop_order:
            if service_name in self.processes:
                await self.stop_service(service_name)
                await asyncio.sleep(1)

        logger.info("✅ Todos los servicios detenidos")

    def _signal_handler(self, signum, frame):
        """Manejador de señales para limpieza"""
        logger.info(f"🛑 Señal {signum} recibida, iniciando limpieza...")
        asyncio.create_task(self.stop_all_services())

    async def run_forever(self):
        """Ejecutar el gateway indefinidamente"""
        try:
            await self.start_all_services()

            if self.running:
                # Imprimir estado inicial
                self.print_status()

                # Ejecutar indefinidamente
                while self.running:
                    await asyncio.sleep(300)  # 5 minutos
                    # Imprimir estado cada 5 minutos
                    self.print_status()

        except KeyboardInterrupt:
            logger.info("👋 Interrupción del usuario")
        except Exception as e:
            logger.error(f"❌ Error fatal: {e}")
        finally:
            await self.stop_all_services()


# Función principal
async def main():
    """Función principal del Gateway Maestro"""
    print(
        """
🚀 GATEWAY MAESTRO UNIFICADO - SHEILY AI
========================================

Iniciando sistema completo que controla:
✅ PostgreSQL Database
✅ LLM Server (Llama 3.2 Q8_0)  
✅ Backend API
✅ Frontend React
✅ AI System Unificado
✅ Blockchain Integration

Presiona Ctrl+C para detener todos los servicios
"""
    )

    gateway = GatewayMaestroUnificado()
    await gateway.run_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 ¡Hasta luego!")
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        sys.exit(1)
