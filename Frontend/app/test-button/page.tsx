'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestButtonPage() {
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🚀 Iniciando autenticación...', { authMode, email: formData.email });

    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const payload = authMode === 'login' 
        ? { 
            username: formData.email, 
            password: formData.password 
          }
        : { 
            username: formData.email.split('@')[0],
            email: formData.email, 
            password: formData.password,
            full_name: formData.fullName || formData.email.split('@')[0]
          };

      console.log('📡 Enviando request al Gateway...', payload);

      const response = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Respuesta recibida:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Autenticación exitosa:', data);
        
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('🔄 Redirigiendo al dashboard...');
          
          alert('✅ ¡Autenticación exitosa! Redirigiendo al dashboard...');
          setShowModal(false);
          router.push('/dashboard');
        } else {
          alert('Error: No se recibió token de autenticación');
        }
      } else {
        const error = await response.json();
        console.error('❌ Error de autenticación:', error);
        alert(error.error || error.message || 'Error en autenticación');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      alert('Error de conexión con el Gateway Maestro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🧪 Página de Prueba - Autenticación
        </h1>
        
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Estado del Sistema:</h2>
          <div>Modal: <span className={showModal ? 'text-green-400' : 'text-red-400'}>{showModal ? 'ABIERTO' : 'CERRADO'}</span></div>
          <div>Modo: <span className="text-cyan-400">{authMode}</span></div>
          <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>{isLoading ? 'SÍ' : 'NO'}</span></div>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => {
              console.log('🧪 Botón simple clickeado');
              setShowModal(!showModal);
            }}
            className="w-full px-8 py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            BOTÓN SIMPLE - TOGGLE MODAL
          </button>

          <button
            onClick={() => {
              console.log('🧪 Botón directo al dashboard');
              router.push('/dashboard');
            }}
            className="w-full px-8 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            IR DIRECTO AL DASHBOARD
          </button>
        </div>

        {/* Modal de prueba */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-gray-900 border border-cyan-500 rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded text-white"
                    required
                  />
                )}
                
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded text-white"
                  required
                />
                
                <input
                  type="password"
                  placeholder="Contraseña (mín. 8 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded text-white"
                  minLength={8}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isLoading ? 'Procesando...' : (authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {authMode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
                  </button>
                </div>
              </form>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
