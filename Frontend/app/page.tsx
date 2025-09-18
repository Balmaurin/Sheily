'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Zap, Shield, Infinity, ChevronRight, Sparkles, Eye, Lock, ArrowRight } from 'lucide-react';

export default function EnterpriseLandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Debug: Log cuando se hace click
  const handleShowAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Botón clickeado, abriendo modal...');
    console.log('🔍 Estado actual del modal:', showAuthModal);
    setShowAuthModal(true);
    console.log('🔍 Modal debería estar abierto ahora');
  };
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Red neuronal ultra-avanzada con texturas jamás vistas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Partículas neuronales con propiedades avanzadas
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
      energy: number;
      quantum: number;
      dimension: number;
      resonance: number;
      phaseShift: number;
      neuralActivity: number;
      synapticStrength: number;
    }> = [];

    // Crear red neuronal cuántica
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.9 + 0.1,
        hue: Math.random() * 80 + 160, // Espectro azul-cyan-púrpura
        energy: Math.random(),
        quantum: Math.random() * Math.PI * 2,
        dimension: Math.random() * 3 + 1,
        resonance: Math.random() * 2 + 0.5,
        phaseShift: Math.random() * Math.PI * 2,
        neuralActivity: Math.random(),
        synapticStrength: Math.random() * 0.8 + 0.2
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 16;
      
      // Fondo holográfico dinámico
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      bgGradient.addColorStop(0, `hsla(220, 50%, 5%, 0.1)`);
      bgGradient.addColorStop(0.5, `hsla(200, 40%, 3%, 0.05)`);
      bgGradient.addColorStop(1, `hsla(180, 30%, 1%, 0.02)`);
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar partículas con física cuántica
      particles.forEach((particle, i) => {
        // Movimiento cuántico multi-dimensional
        const quantumField = Math.sin(time * 0.001 + particle.quantum) * 0.3;
        const dimensionalShift = Math.cos(time * 0.0008 + particle.dimension) * 0.2;
        
        particle.x += particle.vx + quantumField;
        particle.y += particle.vy + dimensionalShift;

        // Resonancia neuronal
        particle.neuralActivity = 0.5 + 0.5 * Math.sin(time * 0.003 + particle.resonance);
        particle.energy = 0.3 + 0.7 * Math.sin((time + particle.phaseShift) * 0.002);

        // Boundaries con efecto dimensional
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Campo de interacción con mouse (efecto cuántico)
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 250) {
          const quantumForce = (250 - distance) / 250;
          const fieldStrength = quantumForce * 0.0005;
          
          particle.vx += dx * fieldStrength;
          particle.vy += dy * fieldStrength;
          particle.energy += quantumForce * 0.4;
          particle.neuralActivity += quantumForce * 0.3;
          
          // Efecto de entrelazamiento cuántico
          particle.quantum += quantumForce * 0.1;
        }

        // Limitar velocidad
        const maxSpeed = 1.5;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
      });

      // Dibujar conexiones sinápticas cuánticas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const connectionStrength = (180 - distance) / 180;
            const synapticPower = particles[i].synapticStrength * particles[j].synapticStrength;
            const neuralSync = (particles[i].neuralActivity + particles[j].neuralActivity) / 2;
            
            // Gradiente holográfico avanzado
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            const alpha1 = connectionStrength * particles[i].energy * synapticPower * 0.8;
            const alpha2 = connectionStrength * particles[j].energy * synapticPower * 0.8;
            
            gradient.addColorStop(0, `hsla(${particles[i].hue}, 80%, 70%, ${alpha1})`);
            gradient.addColorStop(0.5, `hsla(${(particles[i].hue + particles[j].hue) / 2}, 90%, 80%, ${(alpha1 + alpha2) / 2})`);
            gradient.addColorStop(1, `hsla(${particles[j].hue}, 80%, 70%, ${alpha2})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = neuralSync * 2 + 0.5;
            
            // Efecto de pulso sináptico
            ctx.shadowColor = `hsla(${(particles[i].hue + particles[j].hue) / 2}, 100%, 70%, ${neuralSync * 0.5})`;
            ctx.shadowBlur = neuralSync * 8;
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            
            // Curva sináptica orgánica
            const midX = (particles[i].x + particles[j].x) / 2 + Math.sin(time * 0.005) * 20;
            const midY = (particles[i].y + particles[j].y) / 2 + Math.cos(time * 0.005) * 20;
            ctx.quadraticCurveTo(midX, midY, particles[j].x, particles[j].y);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          }
        }
      }

      // Dibujar partículas con efectos holográficos ultra-avanzados
      particles.forEach(particle => {
        const pulseIntensity = particle.energy * particle.neuralActivity;
        
        // Campo cuántico exterior
        for (let ring = 1; ring <= 4; ring++) {
          const ringGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * ring * 3
          );
          
          const ringAlpha = (pulseIntensity / ring) * 0.15;
          ringGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 80%, ${ringAlpha})`);
          ringGradient.addColorStop(0.7, `hsla(${particle.hue + 20}, 80%, 60%, ${ringAlpha * 0.5})`);
          ringGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
          
          ctx.fillStyle = ringGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * ring * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Núcleo holográfico
        const coreGradient = ctx.createRadialGradient(
          particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, 0,
          particle.x, particle.y, particle.size * 1.5
        );
        
        coreGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 95%, ${particle.opacity * pulseIntensity})`);
        coreGradient.addColorStop(0.4, `hsla(${particle.hue + 30}, 90%, 70%, ${particle.opacity * 0.8})`);
        coreGradient.addColorStop(0.8, `hsla(${particle.hue}, 70%, 50%, ${particle.opacity * 0.4})`);
        coreGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de resonancia cuántica
        if (pulseIntensity > 0.7) {
          ctx.strokeStyle = `hsla(${particle.hue}, 100%, 80%, ${(pulseIntensity - 0.7) * 2})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -time * 0.05;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Núcleo sólido
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePosition]);

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
          console.log('🔄 Datos guardados, cerrando modal...');
          
          // Cerrar modal inmediatamente
          setShowAuthModal(false);
          
          // Mostrar confirmación
          alert(`✅ ¡Bienvenido ${data.user.full_name}! Redirigiendo al dashboard...`);
          
          // Redirigir después de un momento
          setTimeout(() => {
            console.log('🚀 Ejecutando redirección al dashboard...');
            router.push('/dashboard');
          }, 1000);
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
      alert('Error de conexión con el Gateway Maestro. Verifica que todos los servicios estén activos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Canvas de fondo con red neuronal cuántica */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: `
            radial-gradient(ellipse at 20% 80%, #1e1b4b 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, #312e81 0%, transparent 50%),
            radial-gradient(ellipse at 40% 40%, #1e40af 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0f0f23 50%, #000000 100%)
          `
        }}
      />

      {/* Overlay holográfico con texturas avanzadas */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(6, 182, 212, 0.03) 2px,
              rgba(6, 182, 212, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(147, 51, 234, 0.03) 2px,
              rgba(147, 51, 234, 0.03) 4px
            )
          `,
          mixBlendMode: 'screen'
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo empresarial ultra-futurista */}
        <div className="text-center mb-20">
          {/* Logo con anillos orbitales cuánticos */}
          <div className="relative mb-16">
            <div className="w-40 h-40 mx-auto relative">
              {/* Anillos orbitales */}
              {[1, 2, 3, 4].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 border border-cyan-400/20 rounded-full animate-spin"
                  style={{ 
                    transform: `scale(${1 + ring * 0.25})`,
                    opacity: 1 / ring,
                    animationDuration: `${8 + ring * 3}s`,
                    animationDirection: ring % 2 === 0 ? 'reverse' : 'normal'
                  }}
                />
              ))}
              
              {/* Núcleo central holográfico */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <Brain className="w-20 h-20 text-white animate-pulse" />
              </div>
              
              {/* Partículas orbitales */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateX(80px) translateY(-50%)`,
                    animation: `spin ${5 + i}s linear infinite`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Título principal con efectos holográficos */}
          <div className="relative mb-12">
            <h1 className="text-8xl md:text-9xl font-black mb-8 relative">
              <span 
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent relative"
                style={{
                  textShadow: '0 0 50px rgba(6, 182, 212, 0.5)',
                  filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))'
                }}
              >
                SHEILY AI
              </span>
              
              {/* Efecto de escaneo holográfico */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-pulse"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)',
                  animation: 'scan 4s ease-in-out infinite',
                  mixBlendMode: 'screen'
                }}
              />
            </h1>
            
            <div className="space-y-6">
              <p className="text-4xl md:text-5xl text-gray-200 font-light">
                Sistema Empresarial de IA
              </p>
              <p className="text-2xl text-cyan-400 font-medium">
                Gateway Maestro • Llama 3.2 Q8_0 • Blockchain Solana
              </p>
              <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Plataforma de inteligencia artificial empresarial con control total desde gateway unificado.
                <br />
                <span className="text-cyan-300">100+ módulos integrados • Autenticación empresarial • Chat avanzado</span>
              </p>
            </div>
          </div>
        </div>

        {/* Características empresariales con efectos avanzados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 max-w-7xl">
          {[
            { 
              icon: Brain, 
              title: "IA Empresarial", 
              desc: "Llama 3.2 Q8_0 Fine-tuned", 
              color: "from-cyan-400 to-blue-500",
              features: ["Generación avanzada", "Memoria persistente", "Aprendizaje continuo"]
            },
            { 
              icon: Zap, 
              title: "Gateway Maestro", 
              desc: "Control Total Unificado", 
              color: "from-blue-500 to-purple-500",
              features: ["6 servicios integrados", "Detección automática", "Recuperación automática"]
            },
            { 
              icon: Shield, 
              title: "Blockchain Nativo", 
              desc: "Solana Devnet Integrado", 
              color: "from-purple-500 to-pink-500",
              features: ["Tokens SHEILY reales", "Wallet integrado", "Transacciones seguras"]
            },
            { 
              icon: Infinity, 
              title: "Escalabilidad", 
              desc: "Arquitectura Modular", 
              color: "from-pink-500 to-cyan-400",
              features: ["100+ módulos", "APIs REST", "Microservicios"]
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
              }}
              style={{ transition: 'transform 0.3s ease' }}
            >
              {/* Efecto de campo energético */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 rounded-3xl blur-xl group-hover:opacity-40 group-hover:blur-2xl transition-all duration-500`} />
              
              {/* Contenedor principal */}
              <div className="relative bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 text-center overflow-hidden">
                {/* Efecto de escaneo */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    animation: 'scan 2s ease-in-out infinite'
                  }}
                />
                
                {/* Icono con efectos */}
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center relative`}>
                  <feature.icon className="w-8 h-8 text-white" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-full blur-lg opacity-50`} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-cyan-400 font-medium mb-4">{feature.desc}</p>
                
                {/* Lista de características */}
                <ul className="space-y-2 text-left">
                  {feature.features.map((item, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300 text-sm">
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3 animate-pulse`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de prueba simple */}
        <div className="mb-8 text-center">
          <button
            onClick={() => {
              console.log('🧪 Botón de prueba clickeado');
              setShowAuthModal(!showAuthModal);
            }}
            className="px-12 py-6 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-xl border-2 border-red-400"
          >
            🧪 BOTÓN DE PRUEBA - ABRIR LOGIN
          </button>
          
          <div className="mt-4 text-gray-400">
            ↑ Usa este botón si el principal no funciona
          </div>
          
          <button
            onClick={() => {
              console.log('🚀 Acceso directo al dashboard');
              router.push('/dashboard');
            }}
            className="mt-4 px-8 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            🚀 ACCESO DIRECTO AL DASHBOARD
          </button>
        </div>

        {/* Botón principal empresarial ultra-futurista */}
        <div className="relative mb-20">
          <button
            onClick={handleShowAuth}
            onMouseEnter={() => console.log('🔍 Mouse sobre botón')}
            onMouseDown={() => console.log('🔍 Mouse down en botón')}
            onMouseUp={() => console.log('🔍 Mouse up en botón')}
            className="group relative px-20 py-8 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full text-white font-bold text-3xl shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer z-20 border-2 border-cyan-400/50"
            style={{
              boxShadow: '0 0 100px rgba(6, 182, 212, 0.4), inset 0 0 50px rgba(255, 255, 255, 0.1)',
              transform: 'translateZ(0)', // Forzar layer de composición
              willChange: 'transform', // Optimizar para animaciones
              pointerEvents: 'auto' // Asegurar que sea clickeable
            }}
          >
            {/* Ondas de energía */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'wave 3s ease-in-out infinite'
              }}
            />
            
            {/* Contenido del botón */}
            <span className="relative flex items-center gap-6">
              <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '3s' }} />
              ACCEDER AL SISTEMA
              <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform duration-300" />
            </span>
          </button>
          
          {/* Anillos de energía cuántica */}
          {[1, 2, 3, 4].map((ring) => (
            <div
              key={ring}
              className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
              style={{
                transform: `scale(${1 + ring * 0.3})`,
                animation: `pulse-ring ${2 + ring}s ease-in-out infinite`,
                animationDelay: `${ring * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Métricas empresariales en tiempo real */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center max-w-4xl">
          {[
            { value: "99.9%", label: "Disponibilidad", color: "text-green-400", icon: "🟢" },
            { value: "<50ms", label: "Latencia", color: "text-cyan-400", icon: "⚡" },
            { value: "6/6", label: "Servicios", color: "text-blue-400", icon: "🔄" },
            { value: "100%", label: "Integrado", color: "text-purple-400", icon: "✅" }
          ].map((metric, index) => (
            <div key={index} className="relative group">
              <div className="text-5xl font-black mb-3">
                <span className={`${metric.color} relative`}>
                  {metric.value}
                  <div className="absolute inset-0 blur-lg opacity-50">{metric.value}</div>
                </span>
              </div>
              <div className="text-gray-400 text-lg font-medium mb-2">{metric.label}</div>
              <div className="text-2xl">{metric.icon}</div>
              
              {/* Barra de progreso holográfica */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${metric.color.replace('text-', 'from-')} to-transparent rounded-full`}
                  style={{
                    width: '100%',
                    animation: `fill-bar 2s ease-out ${index * 0.2}s both`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug: Mostrar estado del modal */}
      <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg border border-cyan-500/50 text-sm">
        <div>Modal: <span className={showAuthModal ? 'text-green-400' : 'text-red-400'}>{showAuthModal ? 'ABIERTO' : 'CERRADO'}</span></div>
        <div>Modo: <span className="text-cyan-400">{authMode}</span></div>
        <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>{isLoading ? 'SÍ' : 'NO'}</span></div>
      </div>

      {/* Modal de autenticación empresarial ultra-moderno */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          {/* Backdrop holográfico */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
          
          <div
            className="relative bg-black/95 backdrop-blur-2xl border border-cyan-500/50 rounded-3xl p-12 w-full max-w-lg transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `
                linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(6,182,212,0.1) 50%, rgba(0,0,0,0.95) 100%),
                radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)
              `,
              boxShadow: `
                0 0 100px rgba(6, 182, 212, 0.4),
                inset 0 0 100px rgba(6, 182, 212, 0.1),
                0 0 200px rgba(147, 51, 234, 0.2)
              `
            }}
          >
            {/* Efectos de brillo dinámicos */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent rounded-3xl animate-pulse"
              style={{ animation: 'glow 3s ease-in-out infinite' }}
            />
            
            <div className="relative">
              {/* Header del modal */}
              <div className="text-center mb-12">
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-60 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                    {authMode === 'login' ? <Eye className="w-12 h-12 text-white" /> : <Lock className="w-12 h-12 text-white" />}
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-4">
                  {authMode === 'login' ? 'Acceso Empresarial' : 'Registro Empresarial'}
                </h2>
                <p className="text-gray-400 text-xl">
                  {authMode === 'login' ? 'Conecta con el Gateway Maestro' : 'Únete a la revolución de la IA empresarial'}
                </p>
              </div>

              {/* Formulario empresarial */}
              <form onSubmit={handleAuth} className="space-y-8">
                {authMode === 'register' && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-6 py-5 bg-white/5 border border-cyan-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                    <div className="absolute inset-0 border border-cyan-400/0 rounded-2xl transition-all duration-300 pointer-events-none focus-within:border-cyan-400/50 focus-within:shadow-lg focus-within:shadow-cyan-400/20" />
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email empresarial"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-6 py-5 bg-white/5 border border-cyan-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
                
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Contraseña segura (mín. 8 caracteres)"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-6 py-5 bg-white/5 border border-cyan-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:bg-white/10 transition-all duration-300"
                      minLength={8}
                      required
                    />
                    {formData.password.length > 0 && formData.password.length < 8 && (
                      <p className="text-red-400 text-sm mt-2">La contraseña debe tener al menos 8 caracteres</p>
                    )}
                  </div>

                {/* Botón de submit empresarial */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl text-white font-bold text-2xl relative overflow-hidden disabled:opacity-50 transform hover:scale-105 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 50px rgba(6, 182, 212, 0.4)'
                  }}
                >
                  {/* Efecto de carga holográfico */}
                  {isLoading && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{ animation: 'loading 1.5s ease-in-out infinite' }}
                    />
                  )}
                  
                  <span className="relative flex items-center justify-center gap-4">
                    {isLoading ? (
                      <>
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Conectando al Gateway Maestro...
                      </>
                    ) : (
                      <>
                        {authMode === 'login' ? <Eye className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                        {authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA EMPRESARIAL'}
                      </>
                    )}
                  </span>
                </button>

                {/* Toggle entre modos */}
                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-lg"
                  >
                    {authMode === 'login' 
                      ? '¿Nuevo en Sheily AI? Crear cuenta empresarial →' 
                      : '¿Ya tienes cuenta? Iniciar sesión →'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer empresarial */}
      <div className="absolute bottom-0 left-0 right-0 z-10 py-8 bg-black/60 backdrop-blur-xl border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 mb-4 md:mb-0 text-center md:text-left text-lg">
            <span className="font-bold text-white">Sheily AI Enterprise</span> • 
            Tecnología cuántica para el futuro empresarial
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-green-400 font-bold">Gateway Maestro Activo</span>
            </div>
            <div className="text-gray-400 text-2xl">•</div>
            <span className="text-cyan-400 font-bold">6/6 Servicios Operativos</span>
          </div>
        </div>
      </div>

      {/* CSS personalizado para animaciones avanzadas */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(-200%); }
          50% { transform: translateX(200%); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes fill-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        @keyframes loading {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.8) rotateY(90deg); opacity: 0; }
          to { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}