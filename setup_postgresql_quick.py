#!/usr/bin/env python3
"""
Configuración rápida de PostgreSQL para Sheily AI
"""

import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_command(command, description):
    """Ejecutar comando y manejar errores"""
    try:
        logger.info(f"🔄 {description}")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"✅ {description} - Exitoso")
            return True
        else:
            if "already exists" in result.stderr:
                logger.info(f"ℹ️ {description} - Ya existe")
                return True
            else:
                logger.error(f"❌ {description} - Error: {result.stderr}")
                return False
    except Exception as e:
        logger.error(f"❌ Error ejecutando {description}: {e}")
        return False


def setup_postgresql():
    """Configurar PostgreSQL para Sheily AI"""
    logger.info("🚀 Configurando PostgreSQL para Sheily AI...")

    # Comandos de configuración
    commands = [
        ("sudo systemctl start postgresql", "Iniciando PostgreSQL"),
        ("sudo systemctl enable postgresql", "Habilitando PostgreSQL al inicio"),
        (
            "sudo -u postgres psql -c \"CREATE USER sheily_ai_user WITH PASSWORD 'SheilyAI2025SecurePassword!';\"",
            "Creando usuario sheily_ai_user",
        ),
        (
            'sudo -u postgres psql -c "CREATE DATABASE sheily_ai_db OWNER sheily_ai_user;"',
            "Creando base de datos sheily_ai_db",
        ),
        (
            'sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sheily_ai_db TO sheily_ai_user;"',
            "Otorgando permisos",
        ),
        (
            'sudo -u postgres psql -c "ALTER USER sheily_ai_user CREATEDB;"',
            "Otorgando permisos de creación de BD",
        ),
    ]

    success_count = 0
    for command, description in commands:
        if run_command(command, description):
            success_count += 1

    logger.info(
        f"📊 Configuración completada: {success_count}/{len(commands)} comandos exitosos"
    )

    # Probar conexión
    logger.info("🔍 Probando conexión a PostgreSQL...")
    try:
        import psycopg2

        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="sheily_ai_db",
            user="sheily_ai_user",
            password="SheilyAI2025SecurePassword!",
        )
        conn.close()
        logger.info("✅ Conexión a PostgreSQL exitosa")
        return True
    except Exception as e:
        logger.error(f"❌ Error probando conexión: {e}")
        return False


if __name__ == "__main__":
    if setup_postgresql():
        print("🎉 PostgreSQL configurado correctamente para Sheily AI!")
        sys.exit(0)
    else:
        print("❌ Hubo problemas configurando PostgreSQL")
        sys.exit(1)
