#!/usr/bin/env python3
"""
🔍 GATEWAY AUDITOR DE ENDPOINTS - SHEILY AI
Auditoría completa, detección de duplicados y limpieza automática
"""

import requests
import json
import time
import re
from datetime import datetime
from collections import defaultdict
import subprocess

# Configuración
BACKEND_URL = "http://localhost:8000"
TIMEOUT = 5

class GatewayEndpointAuditor:
    def __init__(self):
        self.endpoints_found = []
        self.endpoints_tested = {}
        self.duplicates = []
        self.unused = []
        self.problematic = []
        self.metrics = {
            'total_found': 0,
            'working': 0,
            'duplicated': 0,
            'unused': 0,
            'problematic': 0
        }
    
    def scan_backend_code(self):
        """Escanear el código del backend para encontrar todos los endpoints"""
        print("🔍 Escaneando código del backend para encontrar endpoints...")
        
        try:
            # Buscar todos los endpoints en server.js
            with open('/home/yo/sheily-ai/backend/server.js', 'r') as f:
                content = f.read()
            
            # Patrones para encontrar endpoints
            patterns = [
                r"app\.(get|post|put|delete)\s*\(\s*['\"]([^'\"]+)['\"]",
                r"router\.(get|post|put|delete)\s*\(\s*['\"]([^'\"]+)['\"]"
            ]
            
            endpoints = set()
            for pattern in patterns:
                matches = re.findall(pattern, content)
                for method, path in matches:
                    if path.startswith('/api/'):
                        endpoints.add((method.upper(), path))
            
            self.endpoints_found = list(endpoints)
            self.metrics['total_found'] = len(endpoints)
            
            print(f"✅ Encontrados {len(endpoints)} endpoints en el código")
            return endpoints
            
        except Exception as e:
            print(f"❌ Error escaneando código: {e}")
            return set()
    
    def test_endpoint(self, method, path):
        """Probar un endpoint específico"""
        try:
            url = f"{BACKEND_URL}{path}"
            
            if method == 'GET':
                response = requests.get(url, timeout=TIMEOUT)
            elif method == 'POST':
                response = requests.post(url, json={}, timeout=TIMEOUT)
            elif method == 'PUT':
                response = requests.put(url, json={}, timeout=TIMEOUT)
            elif method == 'DELETE':
                response = requests.delete(url, timeout=TIMEOUT)
            
            return {
                'status_code': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'content_length': len(response.content),
                'working': response.status_code < 500
            }
        except Exception as e:
            return {
                'status_code': 0,
                'response_time': 0,
                'content_length': 0,
                'working': False,
                'error': str(e)
            }
    
    def test_all_endpoints(self):
        """Probar todos los endpoints encontrados"""
        print(f"\n🧪 Probando {len(self.endpoints_found)} endpoints...")
        print("-" * 60)
        
        for i, (method, path) in enumerate(self.endpoints_found, 1):
            print(f"🔍 {i:2d}/{len(self.endpoints_found)} {method} {path}")
            
            result = self.test_endpoint(method, path)
            self.endpoints_tested[f"{method} {path}"] = result
            
            if result['working']:
                status = "✅ FUNCIONAL"
                self.metrics['working'] += 1
            else:
                status = "❌ PROBLEMÁTICO"
                self.metrics['problematic'] += 1
                self.problematic.append((method, path, result))
            
            print(f"      {status} - {result['status_code']}")
            time.sleep(0.1)
    
    def detect_duplicates(self):
        """Detectar endpoints duplicados o similares"""
        print(f"\n🔄 Analizando duplicados y similitudes...")
        
        # Agrupar por funcionalidad similar
        groups = defaultdict(list)
        
        for method, path in self.endpoints_found:
            # Extraer la funcionalidad base
            base_path = re.sub(r'/\w+$', '', path)  # Remover último segmento
            key = f"{method}_{base_path}"
            groups[key].append((method, path))
        
        # Encontrar grupos con múltiples endpoints
        for key, endpoints in groups.items():
            if len(endpoints) > 1:
                self.duplicates.append({
                    'group': key,
                    'endpoints': endpoints,
                    'count': len(endpoints)
                })
                self.metrics['duplicated'] += len(endpoints) - 1  # -1 para mantener uno
        
        # Detectar endpoints específicamente duplicados
        specific_duplicates = [
            ([('GET', '/api/models/available'), ('GET', '/api/models/available/simple')], 'Modelos disponibles'),
            ([('GET', '/api/auth/tokens'), ('GET', '/api/auth/tokens/simple')], 'Tokens de usuario'),
            ([('POST', '/api/chat/send'), ('POST', '/api/chat/qwen'), ('POST', '/api/chat/8bit')], 'Chat endpoints')
        ]
        
        print(f"🔍 Duplicados encontrados:")
        for endpoints, description in specific_duplicates:
            existing = [ep for ep in endpoints if ep in self.endpoints_found]
            if len(existing) > 1:
                print(f"  📋 {description}: {len(existing)} versiones")
                for method, path in existing:
                    status = "✅" if self.endpoints_tested.get(f"{method} {path}", {}).get('working') else "❌"
                    print(f"    {status} {method} {path}")
    
    def detect_unused(self):
        """Detectar endpoints que pueden no estar siendo utilizados"""
        print(f"\n🗑️ Analizando endpoints potencialmente no utilizados...")
        
        # Patrones de endpoints que pueden estar obsoletos
        obsolete_patterns = [
            r'/qwen',  # Endpoints específicos de Qwen
            r'/cached',  # Endpoints de cache
            r'/reload',  # Endpoints de recarga
            r'/clear',  # Endpoints de limpieza
        ]
        
        potentially_unused = []
        for method, path in self.endpoints_found:
            for pattern in obsolete_patterns:
                if re.search(pattern, path):
                    potentially_unused.append((method, path, f"Contiene '{pattern}'"))
        
        # Endpoints que fallan consistentemente
        for endpoint, result in self.endpoints_tested.items():
            if not result['working'] and result['status_code'] == 404:
                method, path = endpoint.split(' ', 1)
                potentially_unused.append((method, path, "404 Not Found"))
        
        self.unused = potentially_unused
        self.metrics['unused'] = len(potentially_unused)
        
        print(f"🔍 Endpoints potencialmente no utilizados: {len(potentially_unused)}")
        for method, path, reason in potentially_unused:
            print(f"  🗑️ {method} {path} - {reason}")
    
    def generate_cleanup_recommendations(self):
        """Generar recomendaciones de limpieza"""
        print(f"\n📋 RECOMENDACIONES DE LIMPIEZA")
        print("=" * 60)
        
        recommendations = []
        
        # Duplicados a eliminar
        if self.duplicates:
            print("🔄 ENDPOINTS DUPLICADOS A CONSOLIDAR:")
            
            # Recomendar mantener versiones simplificadas
            if any('models/available' in str(dup) for dup in self.duplicates):
                recommendations.append({
                    'action': 'ELIMINAR',
                    'endpoint': 'GET /api/models/available',
                    'reason': 'Usar /api/models/available/simple que funciona mejor',
                    'keep': 'GET /api/models/available/simple'
                })
            
            if any('auth/tokens' in str(dup) for dup in self.duplicates):
                recommendations.append({
                    'action': 'ELIMINAR',
                    'endpoint': 'GET /api/auth/tokens',
                    'reason': 'Usar /api/auth/tokens/simple que no requiere auth',
                    'keep': 'GET /api/auth/tokens/simple'
                })
        
        # Endpoints problemáticos
        if self.problematic:
            print("❌ ENDPOINTS PROBLEMÁTICOS A REVISAR:")
            for method, path, result in self.problematic:
                if result['status_code'] == 500:
                    recommendations.append({
                        'action': 'REPARAR O ELIMINAR',
                        'endpoint': f'{method} {path}',
                        'reason': f'Error 500 - {result.get("error", "Error interno")}',
                        'keep': None
                    })
        
        # Endpoints no utilizados
        if self.unused:
            print("🗑️ ENDPOINTS NO UTILIZADOS A ELIMINAR:")
            for method, path, reason in self.unused:
                recommendations.append({
                    'action': 'ELIMINAR',
                    'endpoint': f'{method} {path}',
                    'reason': reason,
                    'keep': None
                })
        
        return recommendations
    
    def create_cleanup_script(self, recommendations):
        """Crear script de limpieza automática"""
        script_content = '''#!/usr/bin/env python3
"""
🧹 SCRIPT DE LIMPIEZA AUTOMÁTICA DE ENDPOINTS
Generado por Gateway Auditor
"""

import re

def cleanup_backend_endpoints():
    """Limpiar endpoints duplicados y problemáticos del backend"""
    
    try:
        # Leer archivo backend
        with open('/home/yo/sheily-ai/backend/server.js', 'r') as f:
            content = f.read()
        
        original_content = content
        changes_made = 0
        
        print("🧹 Iniciando limpieza de endpoints...")
        
'''
        
        # Agregar eliminaciones específicas
        for rec in recommendations:
            if rec['action'] == 'ELIMINAR':
                endpoint = rec['endpoint']
                method, path = endpoint.split(' ', 1)
                
                script_content += f'''
        # Eliminar: {endpoint} - {rec['reason']}
        pattern = r"app\\.{method.lower()}\\s*\\(\\s*['\\"]{re.escape(path)}['\\"]][^}}]*}}\\s*\\);?"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, f"// ELIMINADO: {endpoint} - {rec['reason']}", content, flags=re.DOTALL)
            changes_made += 1
            print(f"✅ Eliminado: {endpoint}")
'''
        
        script_content += '''
        
        if changes_made > 0:
            # Crear backup
            with open('/home/yo/sheily-ai/backend/server.js.backup', 'w') as f:
                f.write(original_content)
            
            # Escribir archivo limpio
            with open('/home/yo/sheily-ai/backend/server.js', 'w') as f:
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
'''
        
        with open('/home/yo/sheily-ai/cleanup_endpoints.py', 'w') as f:
            f.write(script_content)
        
        print(f"📝 Script de limpieza creado: cleanup_endpoints.py")
        return True
    
    def generate_report(self):
        """Generar reporte final"""
        print(f"\n" + "=" * 60)
        print("📊 REPORTE FINAL DE AUDITORÍA DE ENDPOINTS")
        print("=" * 60)
        
        print(f"🔍 Total endpoints encontrados: {self.metrics['total_found']}")
        print(f"✅ Endpoints funcionando: {self.metrics['working']}")
        print(f"❌ Endpoints problemáticos: {self.metrics['problematic']}")
        print(f"🔄 Endpoints duplicados: {self.metrics['duplicated']}")
        print(f"🗑️ Endpoints no utilizados: {self.metrics['unused']}")
        
        efficiency = (self.metrics['working'] / self.metrics['total_found']) * 100 if self.metrics['total_found'] > 0 else 0
        print(f"📈 Eficiencia del sistema: {efficiency:.1f}%")
        
        # Calcular potencial de limpieza
        cleanable = self.metrics['duplicated'] + self.metrics['unused'] + self.metrics['problematic']
        if cleanable > 0:
            print(f"🧹 Endpoints que se pueden limpiar: {cleanable}")
            print(f"📉 Reducción potencial: {(cleanable/self.metrics['total_found'])*100:.1f}%")
        
        return {
            'total': self.metrics['total_found'],
            'working': self.metrics['working'],
            'cleanable': cleanable,
            'efficiency': efficiency
        }

def main():
    print("🚀 GATEWAY AUDITOR DE ENDPOINTS - SHEILY AI")
    print("=" * 60)
    print("Auditoría completa de endpoints del backend")
    print("=" * 60)
    
    auditor = GatewayEndpointAuditor()
    
    # 1. Escanear código
    auditor.scan_backend_code()
    
    # 2. Probar endpoints
    auditor.test_all_endpoints()
    
    # 3. Detectar duplicados
    auditor.detect_duplicates()
    
    # 4. Detectar no utilizados
    auditor.detect_unused()
    
    # 5. Generar recomendaciones
    recommendations = auditor.generate_cleanup_recommendations()
    
    # 6. Crear script de limpieza
    if recommendations:
        auditor.create_cleanup_script(recommendations)
    
    # 7. Reporte final
    report = auditor.generate_report()
    
    # 8. Pregunta al usuario si quiere ejecutar la limpieza
    if recommendations:
        print(f"\n🤔 ¿Quieres ejecutar la limpieza automática?")
        print(f"📋 Se procesarán {len(recommendations)} endpoints")
        print(f"💾 Se creará un backup automáticamente")
        print(f"\n✅ Para ejecutar la limpieza, usa:")
        print(f"python3 cleanup_endpoints.py")
    
    return report

if __name__ == "__main__":
    main()
