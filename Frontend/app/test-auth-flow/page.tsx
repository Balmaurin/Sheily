'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function TestAuthFlowPage() {
  const { isAuthenticated, user, token, login } = useAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState({
    username: 'testuser_' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  });

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAuthTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Iniciando prueba de flujo de autenticación...');
      
      // Paso 1: Verificar estado inicial
      addResult(`📊 Estado inicial - Auth: ${isAuthenticated}, User: ${user ? user.username : 'None'}, Token: ${token ? 'Presente' : 'Ausente'}`);
      
      // Paso 2: Intentar registro
      addResult('📝 Intentando registro de usuario...');
      try {
        const registerResponse = await axios.post('http://localhost:8000/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        addResult(`✅ Registro exitoso: ${registerResponse.data.message || 'Usuario creado'}`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          addResult('⚠️ Usuario ya existe, continuando con login...');
        } else {
          addResult(`❌ Error en registro: ${error.response?.data?.message || error.message}`);
          return;
        }
      }
      
      // Paso 3: Intentar login
      addResult('🔐 Intentando login...');
      try {
        const loginSuccess = await login(formData.username, formData.password);
        if (loginSuccess) {
          addResult('✅ Login exitoso');
          
          // Esperar un momento para que se actualice el estado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar estado después del login
          addResult(`📊 Estado después del login - Auth: ${isAuthenticated}, User: ${user ? user.username : 'None'}, Token: ${token ? 'Presente' : 'Ausente'}`);
          
          // Paso 4: Intentar navegar al dashboard
          addResult('🧭 Intentando navegar al dashboard...');
          router.push('/dashboard');
          
        } else {
          addResult('❌ Login falló');
        }
      } catch (error: any) {
        addResult(`💥 Error durante login: ${error.message}`);
      }
      
    } catch (error: any) {
      addResult(`💥 Error general: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-400">
          🧪 Prueba de Flujo de Autenticación - Sheily AI
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-cyan-400">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Configuración de Prueba</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Usuario de Prueba</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email de Prueba</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña de Prueba</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <button
              onClick={runAuthTest}
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mb-4"
            >
              {isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Prueba Completa'}
            </button>
            
            <button
              onClick={clearResults}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              🧹 Limpiar Resultados
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-purple-400">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Estado Actual</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Autenticado:</span>
                <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Usuario:</span>
                <span className="text-blue-400">
                  {user ? user.username : 'Ninguno'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Token:</span>
                <span className={token ? 'text-green-400' : 'text-red-400'}>
                  {token ? '✅ Presente' : '❌ Ausente'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-blue-400">
                  {user ? user.email : 'Ninguno'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={goToDashboard}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                🧭 Ir al Dashboard
              </button>
              
              <button
                onClick={goToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                🔐 Ir al Login
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-green-400">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Resultados de la Prueba</h2>
          
          {testResults.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No hay resultados aún. Ejecuta una prueba para comenzar.
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono py-1 border-b border-gray-700 last:border-b-0">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg text-lg font-semibold inline-block"
          >
            ← Volver a la Página Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
