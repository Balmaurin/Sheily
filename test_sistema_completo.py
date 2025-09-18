#!/usr/bin/env python3
"""
Test del Sistema Completo - Gateway Maestro Unificado
====================================================

Prueba integral de todos los componentes del sistema
"""

import requests
import json
import time
import sys
from datetime import datetime

def test_backend_api():
    """Probar Backend API"""
    print("🔍 Probando Backend API...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Backend API: {health_data['status']}")
            print(f"   📊 Database: {health_data['database']['status']}")
            print(f"   🧠 Model: {health_data['model']['status']}")
            print(f"   ⏱️ Uptime: {health_data['uptime']:.1f}s")
            return True
        else:
            print(f"❌ Backend API error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend API error: {e}")
        return False

def test_llm_server():
    """Probar LLM Server"""
    print("🔍 Probando LLM Server...")
    
    try:
        # Test simple generation con el endpoint correcto
        payload = {
            "prompt": "Hola, ¿cómo estás?",
            "max_tokens": 50,
            "temperature": 0.7
        }
        
        response = requests.post(
            "http://localhost:8005/generate",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                reply = data["response"]
                print(f"✅ LLM Server: Generación exitosa")
                print(f"   💬 Respuesta: {reply[:100]}...")
                return True
            else:
                print(f"❌ LLM Server: Formato de respuesta inválido")
                return False
        else:
            print(f"❌ LLM Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ LLM Server error: {e}")
        return False

def test_database_connection():
    """Probar conexión a base de datos"""
    print("🔍 Probando conexión a PostgreSQL...")
    
    try:
        import psycopg2
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="sheily_ai_db",
            user="sheily_ai_user",
            password="SheilyAI2025SecurePassword"
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
        table_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"✅ PostgreSQL: Conexión exitosa")
        print(f"   📊 Tablas encontradas: {table_count}")
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL error: {e}")
        return False

def test_auth_system():
    """Probar sistema de autenticación"""
    print("🔍 Probando sistema de autenticación...")
    
    try:
        # Test login endpoint (debería fallar con credenciales inválidas)
        login_payload = {
            "username": "test_user",
            "password": "invalid_password"
        }
        
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_payload,
            timeout=5
        )
        
        # Esperamos que falle la autenticación
        if response.status_code in [401, 400]:
            print("✅ Auth System: Endpoint de login funcional")
            return True
        else:
            print(f"⚠️ Auth System: Respuesta inesperada {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Auth System error: {e}")
        return False

def test_integration_modules():
    """Probar módulos de integración"""
    print("🔍 Probando módulos de integración...")
    
    try:
        # Importar y probar IntegrationManager
        sys.path.append('.')
        from modules.core.integration_manager import IntegrationManager
        
        manager = IntegrationManager()
        
        # Test query processing
        result = manager.process_query("Hola, ¿qué es Python?")
        
        if isinstance(result, dict) and "success" in result:
            print("✅ Integration Manager: Procesamiento de consultas funcional")
            print(f"   🎯 Dominio detectado: {result.get('routing', {}).get('domain', 'N/A')}")
            return True
        else:
            print("❌ Integration Manager: Error en procesamiento")
            return False
            
    except Exception as e:
        print(f"❌ Integration Manager error: {e}")
        return False

def test_blockchain_integration():
    """Probar integración blockchain"""
    print("🔍 Probando integración blockchain...")
    
    try:
        from modules.blockchain.solana_integration import get_solana_integration
        
        solana = get_solana_integration()
        status = solana.get_connection_status()
        
        if status.get("enabled"):
            print("✅ Blockchain: Integración Solana disponible")
            print(f"   🌐 Red: {status.get('network', 'N/A')}")
            return True
        else:
            print("⚠️ Blockchain: Integración disponible pero no habilitada")
            return True  # No es crítico
            
    except Exception as e:
        print(f"❌ Blockchain error: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("="*80)
    print("🧪 PRUEBAS INTEGRALES DEL SISTEMA SHEILY AI")
    print("="*80)
    print(f"🕐 Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Backend API", test_backend_api),
        ("LLM Server", test_llm_server),
        ("PostgreSQL Database", test_database_connection),
        ("Authentication System", test_auth_system),
        ("Integration Modules", test_integration_modules),
        ("Blockchain Integration", test_blockchain_integration)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*40}")
        print(f"🧪 PROBANDO: {test_name}")
        print('='*40)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error crítico en {test_name}: {e}")
            results.append((test_name, False))
        
        time.sleep(1)  # Pausa entre pruebas
    
    # Resumen final
    print("\n" + "="*80)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 RESULTADO FINAL: {passed}/{total} pruebas exitosas ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ¡TODOS LOS COMPONENTES FUNCIONANDO CORRECTAMENTE!")
        print("🚀 El Gateway Maestro Unificado está completamente operativo")
    elif passed >= total * 0.8:
        print("✅ Sistema mayormente funcional con algunos componentes opcionales fallando")
    else:
        print("❌ Sistema con problemas críticos que requieren atención")
    
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
