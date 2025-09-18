#!/usr/bin/env python3
"""
🧹 SCRIPT DE LIMPIEZA AUTOMÁTICA DE ENDPOINTS
Generado por Gateway Auditor
"""

import re


def cleanup_backend_endpoints():
    """Limpiar endpoints duplicados y problemáticos del backend"""

    try:
        # Leer archivo backend
        with open("/home/yo/sheily-ai/backend/server.js", "r") as f:
            content = f.read()

        original_content = content
        changes_made = 0

        print("🧹 Iniciando limpieza de endpoints...")

        # Eliminar: GET /api/auth/tokens - Usar /api/auth/tokens/simple que no requiere auth
        pattern = r"app\.get\s*\(\s*['\"]/api/auth/tokens['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: GET /api/auth/tokens - Usar /api/auth/tokens/simple que no requiere auth",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: GET /api/auth/tokens")

        # Eliminar: GET /api/chat/qwen/history/:session_id - Contiene '/qwen'
        pattern = r"app\.get\s*\(\s*['\"]/api/chat/qwen/history/:session_id['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: GET /api/chat/qwen/history/:session_id - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: GET /api/chat/qwen/history/:session_id")

        # Eliminar: POST /api/chat/qwen/history/:session_id/clear - Contiene '/qwen'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/history/:session_id/clear['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/history/:session_id/clear - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/history/:session_id/clear")

        # Eliminar: POST /api/chat/qwen/history/:session_id/clear - Contiene '/clear'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/history/:session_id/clear['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/history/:session_id/clear - Contiene '/clear'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/history/:session_id/clear")

        # Eliminar: POST /api/chat/qwen - Contiene '/qwen'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen")

        # Eliminar: POST /api/chat/qwen/reload - Contiene '/qwen'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/reload['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/reload - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/reload")

        # Eliminar: POST /api/chat/qwen/reload - Contiene '/reload'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/reload['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/reload - Contiene '/reload'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/reload")

        # Eliminar: POST /api/chat/qwen/cached - Contiene '/qwen'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/cached['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/cached - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/cached")

        # Eliminar: POST /api/chat/qwen/cached - Contiene '/cached'
        pattern = r"app\.post\s*\(\s*['\"]/api/chat/qwen/cached['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: POST /api/chat/qwen/cached - Contiene '/cached'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: POST /api/chat/qwen/cached")

        # Eliminar: GET /api/chat/qwen/status - Contiene '/qwen'
        pattern = r"app\.get\s*\(\s*['\"]/api/chat/qwen/status['\"]][^}]*}\s*\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                f"// ELIMINADO: GET /api/chat/qwen/status - Contiene '/qwen'",
                content,
                flags=re.DOTALL,
            )
            changes_made += 1
            print(f"✅ Eliminado: GET /api/chat/qwen/status")

        if changes_made > 0:
            # Crear backup
            with open("/home/yo/sheily-ai/backend/server.js.backup", "w") as f:
                f.write(original_content)

            # Escribir archivo limpio
            with open("/home/yo/sheily-ai/backend/server.js", "w") as f:
                f.write(content)

            print(f"🎉 Limpieza completada: {changes_made} endpoints procesados")
            print("💾 Backup creado: server.js.backup")
            return True
        else:
            print("ℹ️ No se encontraron endpoints para limpiar")
            return False

    except Exception as e:
        print(f"❌ Error en limpieza: {e}")
        return False


if __name__ == "__main__":
    cleanup_backend_endpoints()
