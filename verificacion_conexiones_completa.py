#!/usr/bin/env python3
"""
Verificación Completa de Conexiones - Gateway Maestro
====================================================

Verificación exhaustiva de todas las conexiones del sistema
"""

import requests
import json
import psycopg2
import sqlite3
import subprocess
import time
from datetime import datetime

def test_postgresql():
    """Verificar PostgreSQL"""
    print("🔍 Verificando PostgreSQL...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="sheily_ai_db",
            user="sheily_ai_user",
            password="SheilyAI2025SecurePassword"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users;")
        users = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        print(f"✅ PostgreSQL: {users} usuarios registrados")
        return True
    except Exception as e:
        print(f"❌ PostgreSQL: {e}")
        return False

def test_llm_direct():
    """Verificar LLM directamente"""
    print("🔍 Verificando LLM Server...")
    try:
        # Health check
        health = requests.get("http://localhost:8005/health", timeout=5)
        if health.status_code == 200:
            print("✅ LLM Health: OK")
            
            # Test generation
            gen_response = requests.post(
                "http://localhost:8005/generate",
                json={"prompt": "Di 'Conectado' si me recibes", "max_tokens": 10},
                timeout=15
            )
            
            if gen_response.status_code == 200:
                response_text = gen_response.json().get("response", "")
                print(f"✅ LLM Generation: {response_text[:50]}...")
                return True
            else:
                print(f"❌ LLM Generation: Status {gen_response.status_code}")
                return False
        else:
            print(f"❌ LLM Health: Status {health.status_code}")
            return False
    except Exception as e:
        print(f"❌ LLM Server: {e}")
        return False

def test_backend_api():
    """Verificar Backend API"""
    print("🔍 Verificando Backend API...")
    try:
        # Health check
        health = requests.get("http://localhost:8000/api/health", timeout=5)
        if health.status_code == 200:
            health_data = health.json()
            print(f"✅ Backend Health: {health_data['status']}")
            print(f"   📊 Database: {health_data['database']['status']}")
            print(f"   🧠 Model: {health_data['model']['status']}")
            
            # Test auth endpoint
            auth_test = requests.post(
                "http://localhost:8000/api/auth/login",
                json={"username": "test", "password": "wrong"},
                timeout=5
            )
            
            if auth_test.status_code in [400, 401]:
                print("✅ Backend Auth: Endpoint funcional")
                return True
            else:
                print(f"❌ Backend Auth: Status inesperado {auth_test.status_code}")
                return False
        else:
            print(f"❌ Backend Health: Status {health.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend API: {e}")
        return False

def test_frontend():
    """Verificar Frontend"""
    print("🔍 Verificando Frontend...")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            content = response.text
            if "Sheily AI" in content:
                print("✅ Frontend: Aplicación cargada correctamente")
                return True
            else:
                print("❌ Frontend: Contenido no esperado")
                return False
        else:
            print(f"❌ Frontend: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend: {e}")
        return False

def test_backend_llm_connection():
    """Verificar conexión Backend <-> LLM"""
    print("🔍 Verificando conexión Backend <-> LLM...")
    try:
        # Verificar que el backend pueda comunicarse con el LLM
        # Esto se hace indirectamente verificando que el backend reporte el modelo como disponible
        health = requests.get("http://localhost:8000/api/health", timeout=5)
        if health.status_code == 200:
            health_data = health.json()
            model_status = health_data.get("model", {}).get("status")
            
            if model_status == "available":
                print("✅ Backend <-> LLM: Conexión verificada")
                return True
            else:
                print(f"❌ Backend <-> LLM: Modelo no disponible ({model_status})")
                return False
        else:
            print(f"❌ Backend <-> LLM: No se puede verificar")
            return False
    except Exception as e:
        print(f"❌ Backend <-> LLM: {e}")
        return False

def test_sqlite_databases():
    """Verificar bases de datos SQLite"""
    print("🔍 Verificando bases de datos SQLite...")
    
    databases = [
        ("data/knowledge_base.db", "knowledge_base"),
        ("data/embeddings_sqlite.db", "embeddings"),
        ("backend/sheily_ai.db", "users")
    ]
    
    results = []
    
    for db_path, table_name in databases:
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            
            print(f"✅ {db_path}: {count} registros en {table_name}")
            results.append(True)
        except Exception as e:
            print(f"❌ {db_path}: {e}")
            results.append(False)
    
    return all(results)

def test_gateway_status():
    """Verificar estado del Gateway"""
    print("🔍 Verificando Gateway Maestro...")
    try:
        # Verificar que el proceso del gateway esté ejecutándose
        result = subprocess.run(
            ["ps", "aux"], 
            capture_output=True, 
            text=True
        )
        
        if "gateway_maestro_unificado.py" in result.stdout:
            print("✅ Gateway Maestro: Proceso ejecutándose")
            
            # Verificar logs del gateway
            try:
                with open("logs/gateway_maestro.log", "r") as f:
                    logs = f.readlines()
                    recent_logs = logs[-5:] if len(logs) >= 5 else logs
                    
                    if any("Sistema iniciado exitosamente" in log for log in recent_logs):
                        print("✅ Gateway Maestro: Sistema iniciado exitosamente")
                        return True
                    else:
                        print("⚠️ Gateway Maestro: No se confirma inicio exitoso")
                        return False
            except FileNotFoundError:
                print("⚠️ Gateway Maestro: Log no encontrado")
                return False
        else:
            print("❌ Gateway Maestro: Proceso no encontrado")
            return False
    except Exception as e:
        print(f"❌ Gateway Maestro: {e}")
        return False

def main():
    """Ejecutar verificación completa"""
    print("="*80)
    print("🔍 VERIFICACIÓN COMPLETA DE CONEXIONES - GATEWAY MAESTRO")
    print("="*80)
    print(f"🕐 Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("PostgreSQL Database", test_postgresql),
        ("LLM Server Direct", test_llm_direct),
        ("Backend API", test_backend_api),
        ("Frontend React", test_frontend),
        ("Backend <-> LLM Connection", test_backend_llm_connection),
        ("SQLite Databases", test_sqlite_databases),
        ("Gateway Master Status", test_gateway_status)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print('='*50)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error crítico en {test_name}: {e}")
            results.append((test_name, False))
        
        time.sleep(0.5)
    
    # Resumen final
    print("\n" + "="*80)
    print("📊 RESUMEN FINAL DE CONEXIONES")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ CONECTADO" if result else "❌ DESCONECTADO"
        print(f"{status:<15} {test_name}")
    
    print(f"\n🎯 ESTADO GENERAL: {passed}/{total} conexiones exitosas ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ¡TODAS LAS CONEXIONES FUNCIONANDO PERFECTAMENTE!")
        print("🚀 El Gateway Maestro tiene control total del sistema")
    elif passed >= total * 0.8:
        print("✅ Sistema mayormente conectado - funcional para producción")
    else:
        print("❌ Sistema con problemas de conexión críticos")
    
    print("="*80)
    
    return passed >= total * 0.8

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
