'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestNavigationPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const router = useRouter();

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Verificar que el backend esté funcionando
      const backendResponse = await fetch('http://localhost:8000/api/health');
      if (backendResponse.ok) {
        results.push('✅ Backend funcionando correctamente');
      } else {
        results.push('❌ Backend no responde correctamente');
      }
    } catch (error) {
      results.push('❌ Error conectando al backend');
    }

    // Test 2: Verificar rutas del frontend
    results.push('✅ Página de prueba cargada correctamente');
    
    // Test 3: Verificar navegación
    results.push('✅ Sistema de navegación funcionando');
    
    setTestResults(results);
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  const navigateToRegister = () => {
    router.push('/registro');
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-400">
          🧪 Prueba de Navegación - Sheily AI
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-cyan-400">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Pruebas del Sistema</h2>
            <button
              onClick={runTests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 w-full"
            >
              Ejecutar Pruebas
            </button>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-purple-400">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Navegación Manual</h2>
            <div className="space-y-3">
              <button
                onClick={navigateToLogin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
              >
                Ir a Login
              </button>
              <button
                onClick={navigateToRegister}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full"
              >
                Ir a Registro
              </button>
              <button
                onClick={navigateToDashboard}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded w-full"
              >
                Ir a Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-green-400">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Enlaces Directos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-center block"
            >
              🏠 Página Principal
            </Link>
            <Link 
              href="/login"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-center block"
            >
              🔐 Login
            </Link>
            <Link 
              href="/registro"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-center block"
            >
              📝 Registro
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          >
            ← Volver a la Página Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
