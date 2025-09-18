'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Brain, Zap, Shield, Infinity, ChevronRight, Sparkles, Eye, Lock } from 'lucide-react';

export default function EnterpriseLandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { scrollY } = useScroll();
  
  // Transformaciones basadas en scroll
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const payload = authMode === 'login' 
        ? { username: formData.email, password: formData.password }
        : { 
            username: formData.email.split('@')[0],
            email: formData.email, 
            password: formData.password,
            full_name: formData.fullName
          };

      const response = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Error en autenticación');
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Canvas de fondo será agregado por separado */}
      
      {/* Overlay de gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-cyan-900/20" />

      {/* Contenido principal */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
        style={{ y: textY, opacity }}
      >
        {/* Logo y título principal */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-24 h-24 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-lg opacity-75" />
              <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            SHEILY AI
          </motion.h1>
          
          <motion.p 
            className="text-2xl md:text-3xl text-gray-300 font-light mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Inteligencia Artificial de Nueva Generación
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Potenciado por <span className="text-cyan-400 font-semibold">Llama 3.2 Q8_0</span> • 
            Gateway Maestro Unificado • Blockchain Solana • 
            Sistema de Entrenamiento Personalizado
          </motion.p>
        </motion.div>

        {/* Botón principal de acceso */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="relative"
        >
          <motion.button
            onClick={() => setShowAuthModal(true)}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full text-white font-bold text-xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-100, 300] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Contenido del botón */}
            <span className="relative flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              Acceder al Sistema
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Modal de autenticación */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl" />
              
              <div className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h2>
                  <p className="text-gray-400">
                    {authMode === 'login' ? 'Accede a tu dashboard de IA' : 'Únete a la revolución de la IA'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  {authMode === 'register' && (
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all"
                      required
                    />
                  )}
                  
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all"
                    required
                  />
                  
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all"
                    required
                  />

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg relative overflow-hidden disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative">
                      {isLoading ? 'Conectando...' : (authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </span>
                  </motion.button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {authMode === 'login' 
                        ? '¿No tienes cuenta? Crear una nueva' 
                        : '¿Ya tienes cuenta? Iniciar sesión'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
