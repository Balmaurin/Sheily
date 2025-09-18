#!/usr/bin/env python3
"""
Gestor de Configuración del Sistema NeuroFusion
Maneja todas las configuraciones del sistema de manera centralizada y funcional
"""

import json
import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
import yaml
from datetime import datetime
import hashlib
import shutil

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SystemConfig:
    """Configuración principal del sistema"""

    system_name: str
    version: str
    debug_mode: bool
    base_path: str
    data_path: str
    models_path: str
    cache_path: str
    logs_path: str
    default_embedding_model: str
    default_llm_model: str
    max_concurrent_operations: int
    cache_enabled: bool
    cache_size: int
    enable_encryption: bool
    blockchain_enabled: bool
    solana_network: str
    log_level: str
    log_file: str
    frontend_port: int
    backend_port: int
    host: str
    enable_monitoring: bool
    advanced_modules_enabled: bool


@dataclass
class ComponentConfig:
    """Configuración de componentes del sistema"""

    embeddings: Dict[str, Any]
    branch_system: Dict[str, Any]
    learning: Dict[str, Any]
    memory: Dict[str, Any]
    evaluator: Dict[str, Any]
    security: Dict[str, Any]
    blockchain: Dict[str, Any]
    unified_systems: Dict[str, Any]


@dataclass
class PerformanceConfig:
    """Configuración de rendimiento"""

    max_response_time: float
    concurrent_queries: int
    memory_limit_mb: int
    cpu_limit_percent: int


@dataclass
class SecurityConfig:
    """Configuración de seguridad"""

    jwt_enabled: bool
    two_factor_enabled: bool
    rate_limiting: Dict[str, Any]


class ConfigManager:
    """Gestor principal de configuración del sistema NeuroFusion"""

    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self.config_cache = {}
        self.config_hashes = {}
        self._load_all_configs()

    def _load_all_configs(self):
        """Carga todas las configuraciones del sistema"""
        try:
            # Cargar configuración principal
            self.main_config = self._load_json_config("neurofusion_config.json")

            # Cargar configuraciones específicas
            self.module_init = self._load_json_config("module_initialization.json")
            self.rate_limits = self._load_json_config("rate_limits.json")
            self.monitoring_config = self._load_json_config("monitoring_config.json")
            self.training_config = self._load_json_config("training_token_config.json")
            self.sheily_token_config = self._load_json_config(
                "sheily_token_config.json"
            )
            self.sheily_token_metadata = self._load_json_config(
                "sheily_token_metadata.json"
            )
            self.advanced_training_config = self._load_json_config(
                "advanced_training_config.json"
            )

            # Cargar configuraciones Docker
            self.docker_compose = self._load_yaml_config("docker-compose.yml")
            self.docker_compose_dev = self._load_yaml_config("docker-compose.dev.yml")

            logger.info("Todas las configuraciones cargadas exitosamente")

        except Exception as e:
            logger.error(f"Error cargando configuraciones: {e}")
            raise

    def _load_json_config(self, filename: str) -> Dict[str, Any]:
        """Carga una configuración JSON"""
        file_path = self.config_dir / filename
        if not file_path.exists():
            raise FileNotFoundError(
                f"Archivo de configuración no encontrado: {file_path}"
            )

        with open(file_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        # Calcular hash para detectar cambios
        config_hash = hashlib.md5(
            json.dumps(config, sort_keys=True).encode()
        ).hexdigest()
        self.config_hashes[filename] = config_hash

        return config

    def _load_yaml_config(self, filename: str) -> Dict[str, Any]:
        """Carga una configuración YAML"""
        file_path = self.config_dir / filename
        if not file_path.exists():
            raise FileNotFoundError(
                f"Archivo de configuración no encontrado: {file_path}"
            )

        with open(file_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)

        return config

    def get_config(self, config_name: str) -> Dict[str, Any]:
        """Obtiene una configuración específica"""
        if config_name in self.config_cache:
            return self.config_cache[config_name]

        config_map = {
            "main": self.main_config,
            "module_init": self.module_init,
            "rate_limits": self.rate_limits,
            "monitoring": self.monitoring_config,
            "training": self.training_config,
            "sheily_token": self.sheily_token_config,
            "sheily_metadata": self.sheily_token_metadata,
            "advanced_training": self.advanced_training_config,
            "docker": self.docker_compose,
            "docker_dev": self.docker_compose_dev,
        }

        if config_name not in config_map:
            raise ValueError(f"Configuración no encontrada: {config_name}")

        self.config_cache[config_name] = config_map[config_name]
        return config_map[config_name]

    def get_system_config(self) -> SystemConfig:
        """Obtiene la configuración del sistema como objeto estructurado"""
        config = self.get_config("main")
        return SystemConfig(
            system_name=config["system_name"],
            version=config["version"],
            debug_mode=config["debug_mode"],
            base_path=config["base_path"],
            data_path=config["data_path"],
            models_path=config["models_path"],
            cache_path=config["cache_path"],
            logs_path=config["logs_path"],
            default_embedding_model=config["default_embedding_model"],
            default_llm_model=config["default_llm_model"],
            max_concurrent_operations=config["max_concurrent_operations"],
            cache_enabled=config["cache_enabled"],
            cache_size=config["cache_size"],
            enable_encryption=config["enable_encryption"],
            blockchain_enabled=config["blockchain_enabled"],
            solana_network=config["solana_network"],
            log_level=config["log_level"],
            log_file=config["log_file"],
            frontend_port=config["frontend_port"],
            backend_port=config["backend_port"],
            host=config["host"],
            enable_monitoring=config["enable_monitoring"],
            advanced_modules_enabled=config["advanced_modules_enabled"],
        )

    def get_component_config(self) -> ComponentConfig:
        """Obtiene la configuración de componentes como objeto estructurado"""
        config = self.get_config("main")
        components = config["components"]

        return ComponentConfig(
            embeddings=components["embeddings"],
            branch_system=components["branch_system"],
            learning=components["learning"],
            memory=components["memory"],
            evaluator=components["evaluator"],
            security=components["security"],
            blockchain=components["blockchain"],
            unified_systems=components["unified_systems"],
        )

    def get_performance_config(self) -> PerformanceConfig:
        """Obtiene la configuración de rendimiento como objeto estructurado"""
        config = self.get_config("main")
        performance = config["performance"]

        return PerformanceConfig(
            max_response_time=performance["max_response_time"],
            concurrent_queries=performance["concurrent_queries"],
            memory_limit_mb=performance["memory_limit_mb"],
            cpu_limit_percent=performance["cpu_limit_percent"],
        )

    def get_security_config(self) -> SecurityConfig:
        """Obtiene la configuración de seguridad como objeto estructurado"""
        config = self.get_config("main")
        security = config["security"]

        return SecurityConfig(
            jwt_enabled=security["jwt_enabled"],
            two_factor_enabled=security["two_factor_enabled"],
            rate_limiting=security["rate_limiting"],
        )

    def get_branch_config(self) -> List[str]:
        """Obtiene la lista de ramas configuradas"""
        config = self.get_config("main")
        return config["components"]["branch_system"]["branches"]

    def get_model_config(self) -> Dict[str, str]:
        """Obtiene la configuración de modelos"""
        config = self.get_config("main")
        return {
            "embedding_model": config["default_embedding_model"],
            "llm_model": config["default_llm_model"],
        }

    def get_database_config(self) -> Dict[str, Any]:
        """Obtiene la configuración de base de datos desde Docker"""
        docker_config = self.get_config("docker")
        postgres_service = docker_config["services"]["postgres"]

        return {
            "host": postgres_service["environment"]["POSTGRES_DB"],
            "user": postgres_service["environment"]["POSTGRES_USER"],
            "password": postgres_service["environment"]["POSTGRES_PASSWORD"],
            "port": 5432,
        }

    def get_redis_config(self) -> Dict[str, Any]:
        """Obtiene la configuración de Redis desde Docker"""
        docker_config = self.get_config("docker")
        redis_service = docker_config["services"]["redis"]

        return {"host": "redis", "port": 6379, "password": "shaili_redis_password"}

    def validate_config(self) -> Dict[str, Any]:
        """Valida todas las configuraciones del sistema"""
        validation_results = {"valid": True, "errors": [], "warnings": []}

        try:
            # Validar configuración principal
            main_config = self.get_config("main")
            required_fields = [
                "system_name",
                "version",
                "base_path",
                "data_path",
                "models_path",
                "default_embedding_model",
                "default_llm_model",
            ]

            for field in required_fields:
                if field not in main_config:
                    validation_results["errors"].append(
                        f"Campo requerido faltante: {field}"
                    )
                    validation_results["valid"] = False

            # Validar rutas
            paths_to_check = [
                "base_path",
                "data_path",
                "models_path",
                "cache_path",
                "logs_path",
            ]
            for path_field in paths_to_check:
                if path_field in main_config:
                    path = Path(main_config[path_field])
                    if not path.exists():
                        validation_results["warnings"].append(f"Ruta no existe: {path}")

            # Validar configuración de componentes
            components = main_config.get("components", {})
            required_components = ["embeddings", "branch_system", "learning", "memory"]

            for component in required_components:
                if component not in components:
                    validation_results["errors"].append(
                        f"Componente requerido faltante: {component}"
                    )
                    validation_results["valid"] = False

            # Validar configuración de Docker
            docker_config = self.get_config("docker")
            required_services = ["postgres", "redis", "backend", "frontend"]

            for service in required_services:
                if service not in docker_config.get("services", {}):
                    validation_results["errors"].append(
                        f"Servicio Docker requerido faltante: {service}"
                    )
                    validation_results["valid"] = False

        except Exception as e:
            validation_results["errors"].append(f"Error durante la validación: {e}")
            validation_results["valid"] = False

        return validation_results

    def update_config(self, config_name: str, updates: Dict[str, Any]) -> bool:
        """Actualiza una configuración específica"""
        try:
            config = self.get_config(config_name)

            # Actualizar configuración
            config.update(updates)

            # Guardar configuración actualizada
            file_path = self.config_dir / f"{config_name}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            # Limpiar cache
            if config_name in self.config_cache:
                del self.config_cache[config_name]

            logger.info(f"Configuración {config_name} actualizada exitosamente")
            return True

        except Exception as e:
            logger.error(f"Error actualizando configuración {config_name}: {e}")
            return False

    def backup_configs(self, backup_dir: str = None) -> str:
        """Crea un backup de todas las configuraciones"""
        if backup_dir is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = f"config/backups/config_backup_{timestamp}"

        backup_path = Path(backup_dir)
        backup_path.mkdir(parents=True, exist_ok=True)

        try:
            # Copiar todos los archivos de configuración
            for config_file in self.config_dir.glob("*.json"):
                shutil.copy2(config_file, backup_path / config_file.name)

            for config_file in self.config_dir.glob("*.yml"):
                shutil.copy2(config_file, backup_path / config_file.name)

            for config_file in self.config_dir.glob("*.yaml"):
                shutil.copy2(config_file, backup_path / config_file.name)

            logger.info(f"Backup de configuraciones creado en: {backup_path}")
            return str(backup_path)

        except Exception as e:
            logger.error(f"Error creando backup: {e}")
            raise

    def restore_configs(self, backup_dir: str) -> bool:
        """Restaura configuraciones desde un backup"""
        backup_path = Path(backup_dir)
        if not backup_path.exists():
            logger.error(f"Directorio de backup no existe: {backup_path}")
            return False

        try:
            # Crear backup del estado actual antes de restaurar
            current_backup = self.backup_configs()

            # Restaurar archivos de configuración
            for config_file in backup_path.glob("*.json"):
                shutil.copy2(config_file, self.config_dir / config_file.name)

            for config_file in backup_path.glob("*.yml"):
                shutil.copy2(config_file, self.config_dir / config_file.name)

            for config_file in backup_path.glob("*.yaml"):
                shutil.copy2(config_file, self.config_dir / config_file.name)

            # Recargar configuraciones
            self._load_all_configs()

            logger.info(f"Configuraciones restauradas desde: {backup_path}")
            return True

        except Exception as e:
            logger.error(f"Error restaurando configuraciones: {e}")
            return False

    def get_config_summary(self) -> Dict[str, Any]:
        """Obtiene un resumen de todas las configuraciones"""
        return {
            "system_info": {
                "name": self.main_config["system_name"],
                "version": self.main_config["version"],
                "status": self.main_config["implementation_status"],
            },
            "components": {
                "total_branches": self.main_config["total_branches"],
                "total_micro_branches": self.main_config["total_micro_branches"],
                "enabled_components": list(self.main_config["components"].keys()),
            },
            "performance": self.main_config["performance"],
            "security": {
                "jwt_enabled": self.main_config["security"]["jwt_enabled"],
                "two_factor_enabled": self.main_config["security"][
                    "two_factor_enabled"
                ],
                "rate_limiting_enabled": self.main_config["security"]["rate_limiting"][
                    "enabled"
                ],
            },
            "blockchain": {
                "enabled": self.main_config["blockchain_enabled"],
                "network": self.main_config["solana_network"],
            },
        }


# Instancia global del gestor de configuración
config_manager = ConfigManager()


def get_config_manager() -> ConfigManager:
    """Obtiene la instancia global del gestor de configuración"""
    return config_manager


if __name__ == "__main__":
    # Ejemplo de uso
    manager = ConfigManager()

    # Validar configuraciones
    validation = manager.validate_config()
    print("Validación de configuraciones:", validation)

    # Obtener resumen
    summary = manager.get_config_summary()
    print("Resumen del sistema:", json.dumps(summary, indent=2))

    # Obtener configuración del sistema
    system_config = manager.get_system_config()
    print(f"Sistema: {system_config.system_name} v{system_config.version}")
