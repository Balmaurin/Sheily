#!/usr/bin/env python3
"""
🧹 LIMPIEZA MANUAL DE ENDPOINTS - SHEILY AI
Eliminación específica de endpoints duplicados y problemáticos
"""

import re
import os
from datetime import datetime


def backup_server_file():
    """Crear backup del archivo server.js"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"/home/yo/sheily-ai/backend/server.js.backup_{timestamp}"

    try:
        with open("/home/yo/sheily-ai/backend/server.js", "r") as original:
            with open(backup_path, "w") as backup:
                backup.write(original.read())
        print(f"💾 Backup creado: {backup_path}")
        return True
    except Exception as e:
        print(f"❌ Error creando backup: {e}")
        return False


def remove_qwen_endpoints():
    """Eliminar todos los endpoints relacionados con Qwen que están fallando"""

    endpoints_to_remove = [
        "POST /api/chat/qwen/reload",
        "POST /api/chat/qwen/history/:session_id/clear",
        "GET /api/chat/qwen/history/:session_id",
        "GET /api/chat/qwen/status",
        "POST /api/chat/qwen/cached",
        "POST /api/chat/qwen",  # Este también puede ser problemático
    ]

    try:
        with open("/home/yo/sheily-ai/backend/server.js", "r") as f:
            content = f.read()

        original_content = content
        changes_made = 0

        print("🧹 Eliminando endpoints de Qwen problemáticos...")

        # Patrones específicos para eliminar
        patterns_to_remove = [
            # Qwen reload endpoint
            r"// Endpoint para recargar modelo Qwen\s*app\.post\('/api/chat/qwen/reload'.*?\}\);",
            # Qwen history clear endpoint
            r"// Endpoint para limpiar historial de chat de Qwen\s*app\.post\('/api/chat/qwen/history/:session_id/clear'.*?\}\);",
            # Qwen history get endpoint
            r"// Endpoint para obtener historial de chat de Qwen\s*app\.get\('/api/chat/qwen/history/:session_id'.*?\}\);",
            # Qwen status endpoint
            r"// Endpoint para obtener estado del servidor Qwen\s*app\.get\('/api/chat/qwen/status'.*?\}\);",
            # Qwen cached endpoint
            r"// Endpoint para chat con Qwen usando cache\s*app\.post\('/api/chat/qwen/cached'.*?\}\);",
        ]

        for pattern in patterns_to_remove:
            if re.search(pattern, content, re.DOTALL):
                content = re.sub(
                    pattern,
                    "// ELIMINADO: Endpoint Qwen problemático - No funcional",
                    content,
                    flags=re.DOTALL,
                )
                changes_made += 1
                print(f"✅ Eliminado endpoint Qwen problemático")

        # También eliminar el endpoint principal de Qwen que es muy largo
        qwen_main_pattern = r"// Endpoint para chat funcional con Llama-3\.2-3B-Instruct-Q8_0\s*app\.post\('/api/chat/qwen'.*?(?=\n// Endpoint|\napp\.|$)"
        if re.search(qwen_main_pattern, content, re.DOTALL):
            content = re.sub(
                qwen_main_pattern,
                "// ELIMINADO: Endpoint chat/qwen principal - Usar /api/chat/send en su lugar",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado endpoint chat/qwen principal")

        return content, changes_made

    except Exception as e:
        print(f"❌ Error eliminando endpoints Qwen: {e}")
        return None, 0


def remove_duplicate_models_endpoint():
    """Eliminar el endpoint /api/models/available que falla"""

    try:
        with open("/home/yo/sheily-ai/backend/server.js", "r") as f:
            content = f.read()

        # Buscar y eliminar el endpoint problemático de modelos
        pattern = r"// Endpoint para obtener modelos disponibles\s*app\.get\('/api/models/available'.*?(?=\n// Endpoint|\napp\.|$)"

        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                "// ELIMINADO: /api/models/available - Usar /api/models/available/simple que funciona",
                content,
                flags=re.DOTALL,
            )
            print(f"✅ Eliminado endpoint /api/models/available duplicado")
            return content, 1

        return content, 0

    except Exception as e:
        print(f"❌ Error eliminando endpoint duplicado: {e}")
        return None, 0


def main():
    print("🧹 LIMPIEZA MANUAL DE ENDPOINTS - SHEILY AI")
    print("=" * 60)

    # 1. Crear backup
    if not backup_server_file():
        print("❌ No se pudo crear backup. Abortando.")
        return False

    # 2. Eliminar endpoints Qwen problemáticos
    content, qwen_changes = remove_qwen_endpoints()
    if content is None:
        print("❌ Error en limpieza de endpoints Qwen")
        return False

    # 3. Eliminar endpoint duplicado de modelos
    content, model_changes = remove_duplicate_models_endpoint()
    if content is None:
        print("❌ Error en limpieza de endpoint duplicado")
        return False

    total_changes = qwen_changes + model_changes

    # 4. Escribir archivo limpio
    if total_changes > 0:
        try:
            with open("/home/yo/sheily-ai/backend/server.js", "w") as f:
                f.write(content)

            print(f"\n🎉 LIMPIEZA COMPLETADA:")
            print(f"✅ Endpoints Qwen eliminados: {qwen_changes}")
            print(f"✅ Endpoints duplicados eliminados: {model_changes}")
            print(f"📊 Total cambios: {total_changes}")
            print(f"💾 Backup disponible para restaurar si es necesario")

            print(f"\n🔄 RECOMENDACIÓN:")
            print(f"Reinicia el backend para aplicar los cambios:")
            print(f"pkill -f 'node.*server.js' && cd backend && node server.js &")

            return True

        except Exception as e:
            print(f"❌ Error escribiendo archivo limpio: {e}")
            return False
    else:
        print("ℹ️ No se encontraron endpoints para limpiar")
        return False


if __name__ == "__main__":
    success = main()
    if success:
        print(f"\n✅ Limpieza exitosa. El sistema ahora será más eficiente.")
    else:
        print(f"\n❌ Limpieza fallida. Revisa los errores anteriores.")
