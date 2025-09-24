"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroOrb() {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [clickStartTime, setClickStartTime] = React.useState(0);
  const [explosionPhase, setExplosionPhase] = React.useState(0);
  const [showLoginForm, setShowLoginForm] = React.useState(false);
  const [showRegisterForm, setShowRegisterForm] = React.useState(false);
  
  // Estados para el formulario de login
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  
  // Estados para el formulario de registro
  const [registerData, setRegisterData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [registerLoading, setRegisterLoading] = React.useState(false);
  const [registerError, setRegisterError] = React.useState("");

  // Hook de autenticación y navegación
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Referencias para el contexto de audio
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const chargingOscillatorRef = React.useRef<OscillatorNode | null>(null);
  const chargingGainRef = React.useRef<GainNode | null>(null);

  // Crear el contexto de audio
  React.useEffect(() => {
    // Crear contexto de audio solo cuando sea necesario
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Inicializar audio en el primer click
    const handleFirstClick = () => {
      initAudio();
      document.removeEventListener('click', handleFirstClick);
    };

    document.addEventListener('click', handleFirstClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Función para reproducir sonido de click (pistola eléctrica)
  const playClickSound = () => {
    console.log('🎵 Reproduciendo sonido de click (pistola eléctrica)');
    if (audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // Sonido principal de la pistola eléctrica
      const mainOsc = audioContextRef.current.createOscillator();
      const mainGain = audioContextRef.current.createGain();
      const filter = audioContextRef.current.createBiquadFilter();
      
      mainOsc.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(audioContextRef.current.destination);
      
      // Configurar filtro para sonido metálico
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(8, now);
      
      // Frecuencia principal con modulación
      mainOsc.frequency.setValueAtTime(1200, now);
      mainOsc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      
      // Ganancia con ataque rápido y release
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
      mainGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      // Sonido de chispa eléctrica
      const sparkOsc = audioContextRef.current.createOscillator();
      const sparkGain = audioContextRef.current.createGain();
      const sparkFilter = audioContextRef.current.createBiquadFilter();
      
      sparkOsc.connect(sparkFilter);
      sparkFilter.connect(sparkGain);
      sparkGain.connect(audioContextRef.current.destination);
      
      sparkFilter.type = 'highpass';
      sparkFilter.frequency.setValueAtTime(8000, now);
      
      sparkOsc.frequency.setValueAtTime(12000, now);
      sparkOsc.frequency.exponentialRampToValueAtTime(4000, now + 0.1);
      
      sparkGain.gain.setValueAtTime(0, now);
      sparkGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
      sparkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      // Iniciar y detener
      mainOsc.start(now);
      mainOsc.stop(now + 0.15);
      sparkOsc.start(now);
      sparkOsc.stop(now + 0.1);
    }
  };

  // Función para reproducir sonido de carga del láser (duración completa hasta explosión)
  const playChargingSound = () => {
    console.log('🎵 Iniciando sonido de carga del láser (duración completa)');
    if (audioContextRef.current && !chargingOscillatorRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // Crear buffer de audio desde el archivo MP3
      console.log('📡 Cargando archivo: /sounds/062708_laser-charging-81968.mp3');
      fetch('/sounds/062708_laser-charging-81968.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          // Crear fuente de audio
          const source = audioContextRef.current!.createBufferSource();
          const gainNode = audioContextRef.current!.createGain();
          
          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current!.destination);
          
          // Configurar ganancia para el sonido de carga
          gainNode.gain.setValueAtTime(0.4, now);
          
          // Iniciar reproducción
          console.log('▶️ Reproduciendo sonido de carga del láser (sin loop)');
          source.start(now);
          
          // Guardar referencias para poder detenerlo
          chargingOscillatorRef.current = source as any;
          chargingGainRef.current = gainNode;
          
          // NO configurar loop - se reproduce solo una vez
          source.loop = false;
          
          // Configurar aceleración progresiva del sonido
          const startTime = Date.now();
          const totalDuration = 7000; // 7 segundos total
          
          const accelerationInterval = setInterval(() => {
            if (chargingOscillatorRef.current && audioContextRef.current) {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / totalDuration, 1);
              
              // Aceleración progresiva: de 0.5x a 2.0x velocidad
              const playbackRate = 0.5 + (progress * 1.5);
              source.playbackRate.setValueAtTime(playbackRate, audioContextRef.current.currentTime);
              
              // Aumentar ganancia progresivamente para compensar la aceleración
              const gainValue = 0.4 + (progress * 0.3);
              gainNode.gain.setValueAtTime(gainValue, audioContextRef.current.currentTime);
              
              console.log(`🎵 Aceleración del láser: ${playbackRate.toFixed(2)}x, Ganancia: ${gainValue.toFixed(2)}`);
              
              // Detener el intervalo cuando termine la carga
              if (elapsed >= totalDuration) {
                clearInterval(accelerationInterval);
              }
            }
          }, 100); // Actualizar cada 100ms para transición suave
          
          // Limpiar intervalo si se detiene manualmente
          setTimeout(() => {
            clearInterval(accelerationInterval);
          }, totalDuration);
        })
        .catch(error => {
          console.error('Error cargando sonido de carga:', error);
          toast({
            title: "Error de Audio",
            description: "No se pudo cargar el sonido de carga",
            variant: "destructive"
          });
          throw new Error('No se pudo cargar el archivo de audio requerido');
        });
    }
  };
  
  // Función de respaldo con sonido sintético (duración completa hasta explosión)
  const playChargingSoundFallback = () => {
    if (audioContextRef.current && !chargingOscillatorRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // Oscilador principal de carga
      const mainOsc = audioContextRef.current.createOscillator();
      const mainGain = audioContextRef.current.createGain();
      const mainFilter = audioContextRef.current.createBiquadFilter();
      
      mainOsc.connect(mainFilter);
      mainFilter.connect(mainGain);
      mainGain.connect(audioContextRef.current.destination);
      
      // Configurar filtro para sonido de energía
      mainFilter.type = 'lowpass';
      mainFilter.frequency.setValueAtTime(800, now);
      mainFilter.Q.setValueAtTime(4, now);
      
      // Frecuencia base con modulación
      mainOsc.frequency.setValueAtTime(150, now);
      mainOsc.type = 'sawtooth';
      
      // Ganancia con modulación para efecto de "pulso"
      mainGain.gain.setValueAtTime(0.08, now);
      
      // Oscilador de modulación para crear efecto de "zumbido" eléctrico
      const modOsc = audioContextRef.current.createOscillator();
      const modGain = audioContextRef.current.createGain();
      
      modOsc.connect(modGain);
      modGain.connect(mainOsc.frequency);
      
      modOsc.frequency.setValueAtTime(8, now); // Modulación lenta
      modGain.gain.setValueAtTime(50, now); // Cantidad de modulación
      
      // Oscilador de alta frecuencia para "chispas" eléctricas
      const sparkOsc = audioContextRef.current.createOscillator();
      const sparkGain = audioContextRef.current.createGain();
      const sparkFilter = audioContextRef.current.createBiquadFilter();
      
      sparkOsc.connect(sparkFilter);
      sparkFilter.connect(sparkGain);
      sparkGain.connect(audioContextRef.current.destination);
      
      sparkFilter.type = 'highpass';
      sparkFilter.frequency.setValueAtTime(6000, now);
      
      sparkOsc.frequency.setValueAtTime(8000, now);
      sparkOsc.type = 'square';
      
      sparkGain.gain.setValueAtTime(0.03, now);
      
      // Iniciar todos los osciladores
      mainOsc.start(now);
      modOsc.start(now);
      sparkOsc.start(now);
      
      // Guardar referencias
      chargingOscillatorRef.current = mainOsc as any;
      chargingGainRef.current = mainGain;
      
      // Configurar aceleración progresiva del sonido sintético
      const startTime = Date.now();
      const totalDuration = 7000; // 7 segundos total
      
      const accelerationInterval = setInterval(() => {
        if (chargingOscillatorRef.current && audioContextRef.current) {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / totalDuration, 1);
          
          // Aceleración progresiva de la frecuencia: de 150Hz a 400Hz
          const targetFreq = 150 + (progress * 250);
          if (chargingOscillatorRef.current.frequency) {
            chargingOscillatorRef.current.frequency.setValueAtTime(targetFreq, audioContextRef.current.currentTime);
          }
          
          // Acelerar modulación: de 8Hz a 20Hz
          const modFreq = 8 + (progress * 12);
          modOsc.frequency.setValueAtTime(modFreq, audioContextRef.current.currentTime);
          
          // Aumentar ganancia progresivamente
          const gainValue = 0.08 + (progress * 0.12);
          mainGain.gain.setValueAtTime(gainValue, audioContextRef.current.currentTime);
          
          console.log(`🎵 Aceleración sintética del láser: Frecuencia: ${targetFreq.toFixed(0)}Hz, Modulación: ${modFreq.toFixed(1)}Hz`);
          
          // Detener el intervalo cuando termine la carga
          if (elapsed >= totalDuration) {
            clearInterval(accelerationInterval);
          }
        }
      }, 100); // Actualizar cada 100ms para transición suave
      
      // Limpiar intervalo si se detiene manualmente
      setTimeout(() => {
        clearInterval(accelerationInterval);
      }, totalDuration);
    }
  };

  // Función para detener sonido de carga
  const stopChargingSound = () => {
    if (chargingOscillatorRef.current && chargingGainRef.current) {
      // Detener el sonido (funciona tanto para MP3 como para sintético)
      if (chargingOscillatorRef.current.stop) {
        chargingOscillatorRef.current.stop();
      }
      
      // Limpiar referencias
      chargingOscillatorRef.current = null;
      chargingGainRef.current = null;
    }
  };

  // Función para reproducir sonido de explosión (archivo MP3 real)
  const playExplosionSound = () => {
    console.log('💥 Iniciando carga del sonido de explosión (MP3 real)');
    if (audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // Crear buffer de audio desde el archivo MP3 del flash
      console.log('📡 Cargando archivo: /sounds/whoosh-drum-hits-169007.mp3');
      fetch('/sounds/whoosh-drum-hits-169007.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          console.log('✅ Archivo de explosión MP3 decodificado correctamente');
          // Crear fuente de audio
          const source = audioContextRef.current!.createBufferSource();
          const gainNode = audioContextRef.current!.createGain();
          
          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current!.destination);
          
          // Configurar ganancia para el sonido del flash
          gainNode.gain.setValueAtTime(0.5, now);
          
          // Iniciar reproducción
          console.log('▶️ Reproduciendo sonido de explosión MP3');
          source.start(now);
          
          // Limpiar automáticamente después de la reproducción
          source.onended = () => {
            source.disconnect();
            gainNode.disconnect();
          };
        })
        .catch(error => {
          console.error('Error cargando sonido de explosión:', error);
          toast({
            title: "Error de Audio", 
            description: "No se pudo cargar el sonido de explosión",
            variant: "destructive"
          });
          playExplosionSoundFallback();
        });
    }
  };
  
  // Función de respaldo con sonido sintético para explosión
  const playExplosionSoundFallback = () => {
    if (audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // 1. ONDA DE CHOQUE PRINCIPAL (bajo profundo)
      const shockwaveOsc = audioContextRef.current.createOscillator();
      const shockwaveGain = audioContextRef.current.createGain();
      const shockwaveFilter = audioContextRef.current.createBiquadFilter();
      
      shockwaveOsc.connect(shockwaveFilter);
      shockwaveFilter.connect(shockwaveGain);
      shockwaveGain.connect(audioContextRef.current.destination);
      
      shockwaveFilter.type = 'lowpass';
      shockwaveFilter.frequency.setValueAtTime(80, now);
      shockwaveFilter.Q.setValueAtTime(2, now);
      
      shockwaveOsc.frequency.setValueAtTime(60, now);
      shockwaveOsc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
      shockwaveOsc.type = 'sine';
      
      shockwaveGain.gain.setValueAtTime(0, now);
      shockwaveGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
      shockwaveGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      // 2. RUIDO DE EXPLOSIÓN (medio)
      const explosionBufferSize = audioContextRef.current.sampleRate * 0.8;
      const explosionBuffer = audioContextRef.current.createBuffer(1, explosionBufferSize, audioContextRef.current.sampleRate);
      const explosionOutput = explosionBuffer.getChannelData(0);
      
      for (let i = 0; i < explosionBufferSize; i++) {
        explosionOutput[i] = (Math.random() * 2 - 1) * Math.exp(-i / (explosionBufferSize * 0.3));
      }
      
      const explosionNoise = audioContextRef.current.createBufferSource();
      const explosionGain = audioContextRef.current.createGain();
      const explosionFilter = audioContextRef.current.createBiquadFilter();
      
      explosionNoise.buffer = explosionBuffer;
      explosionNoise.connect(explosionFilter);
      explosionFilter.connect(explosionGain);
      explosionGain.connect(audioContextRef.current.destination);
      
      explosionFilter.type = 'bandpass';
      explosionFilter.frequency.setValueAtTime(800, now);
      explosionFilter.Q.setValueAtTime(1, now);
      
      explosionGain.gain.setValueAtTime(0, now);
      explosionGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
      explosionGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      // 3. FRAGMENTOS METÁLICOS (agudo)
      const fragmentsOsc = audioContextRef.current.createOscillator();
      const fragmentsGain = audioContextRef.current.createGain();
      const fragmentsFilter = audioContextRef.current.createBiquadFilter();
      
      fragmentsOsc.connect(fragmentsFilter);
      fragmentsFilter.connect(fragmentsGain);
      fragmentsGain.connect(audioContextRef.current.destination);
      
      fragmentsFilter.type = 'highpass';
      fragmentsFilter.frequency.setValueAtTime(4000, now);
      
      fragmentsOsc.frequency.setValueAtTime(6000, now);
      fragmentsOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.4);
      fragmentsOsc.type = 'sawtooth';
      
      fragmentsGain.gain.setValueAtTime(0, now);
      fragmentsGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      fragmentsGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      // 4. ECO DE LA EXPLOSIÓN (delay)
      const delayNode = audioContextRef.current.createDelay();
      const delayGain = audioContextRef.current.createGain();
      
      delayNode.delayTime.setValueAtTime(0.1, now);
      delayGain.gain.setValueAtTime(0.3, now);
      
      // Conectar eco
      explosionGain.connect(delayNode);
      delayNode.connect(delayGain);
      delayGain.connect(audioContextRef.current.destination);
      
      // Iniciar todos los sonidos
      shockwaveOsc.start(now);
      shockwaveOsc.stop(now + 0.3);
      
      explosionNoise.start(now);
      explosionNoise.stop(now + 0.8);
      
      fragmentsOsc.start(now);
      fragmentsOsc.stop(now + 0.4);
      
      // Limpiar nodos después de un tiempo
      setTimeout(() => {
        delayNode.disconnect();
        delayGain.disconnect();
      }, 1000);
    }
  };

  React.useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = Math.min(2000, Math.floor(width * devicePixelRatio));
    canvas.height = Math.min(2000, Math.floor(height * devicePixelRatio));

    const DPR = devicePixelRatio || 1;
    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    const reduced = prefersReducedMotion();
    const count = reduced ? 240 : 480;
    const layers = 8;
    const particles: {
      r: number;
      a: number;
      sp: number;
      size: number;
      hue: number;
      el: number;
      originalSp: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const ring = Math.floor((i / count) * layers);
      const r = 50 + ring * 35 + Math.random() * 15;
      const originalSp = (0.001 + Math.random() * 0.002) * (Math.random() < 0.5 ? -1 : 1);
      particles.push({
        r,
        a: Math.random() * Math.PI * 2,
        sp: originalSp,
        size: 1.5 + Math.random() * 3,
        hue: 180 + Math.random() * 180,
        el: Math.random() * 0.5,
        originalSp
      });
    }

    let t = 0;

    function draw() {
      t += 1.5;
      ctx.clearRect(0, 0, W, H);

      // Calcular progreso de la carga
      let loadProgress = 0;
      let shakeIntensity = 0;
      let scale = 1;
      
      if (isClicked && clickStartTime > 0) {
        const elapsed = Date.now() - clickStartTime;
        
        if (elapsed < 3000) {
          // Fase 1: Carga blanca con temblor (3 segundos)
          loadProgress = elapsed / 3000;
          shakeIntensity = loadProgress * 0.8; // Temblar más intensamente mientras carga
          
          // Iniciar sonido de carga en el primer frame
          if (elapsed < 50) {
            playChargingSound();
          }
        } else if (elapsed < 7000) {
          // Fase 2: Núcleo completo blanco, orbe encogiendo (4 segundos)
          loadProgress = 1;
          shakeIntensity = 0.8; // Temblor constante más intenso
          const shrinkProgress = (elapsed - 3000) / 4000;
          scale = 1 - shrinkProgress * 0.98; // Encogimiento más suave
        } else {
          // Fase 3: Explosión
          stopChargingSound(); // Detener sonido de carga
          setExplosionPhase(1);
          return;
        }
      }

      // Aplicar temblor
      const shakeX = shakeIntensity * (Math.random() - 0.5) * 15;
      const shakeY = shakeIntensity * (Math.random() - 0.5) * 15;

      // background glow
      const grd = ctx.createRadialGradient(CX, CY, 30, CX, CY, Math.min(W, H) * 0.6);
      grd.addColorStop(0, "rgba(0,255,255,0.25)");
      grd.addColorStop(0.5, "rgba(138,43,226,0.15)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Aplicar escala y temblor
      ctx.save();
      ctx.translate(CX + shakeX, CY + shakeY);
      ctx.scale(scale, scale);
      ctx.translate(-CX, -CY);

      // nucleus con carga blanca
      ctx.beginPath();
      ctx.arc(CX, CY, 35 * DPR, 0, Math.PI * 2);
      
      if (loadProgress > 0) {
        // Núcleo con carga blanca progresiva
        const nucleusGradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, 35 * DPR);
        nucleusGradient.addColorStop(0, "rgba(255,255,255,1)");
        nucleusGradient.addColorStop(Math.min(0.99, loadProgress), "rgba(255,255,255,1)");
        nucleusGradient.addColorStop(Math.min(0.99, loadProgress + 0.01), "rgba(255,0,0,1)");
        nucleusGradient.addColorStop(1, "rgba(255,0,0,1)");
        ctx.fillStyle = nucleusGradient;
        ctx.fill();
      } else {
        // Núcleo rojo normal
        const nucleusGradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, 35 * DPR);
        nucleusGradient.addColorStop(0, "rgba(255,0,0,1)");
        nucleusGradient.addColorStop(0.7, "rgba(255,50,50,0.9)");
        nucleusGradient.addColorStop(1, "rgba(255,100,100,0.7)");
        ctx.fillStyle = nucleusGradient;
        ctx.fill();
      }

      // orbiting particles con velocidad variable
      particles.forEach((p, idx) => {
        let currentSp = p.originalSp;
        if (loadProgress > 0) {
          // Acelerar partículas durante la carga
          currentSp *= 1 + loadProgress * 2;
        }
        
        p.a += currentSp * (reduced ? 0.8 : 1.2);
        const el = p.el * Math.sin(t * 0.004 + idx * 0.15);
        const x = CX + Math.cos(p.a) * (p.r * DPR) * (1 + el);
        const y = CY + Math.sin(p.a) * (p.r * DPR) * (1 - el);

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 95%, 75%, 0.95)`;
        ctx.arc(x, y, p.size * DPR, 0, Math.PI * 2);
        ctx.fill();

        if (!reduced && idx % 4 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue}, 95%, 70%, 0.2)`;
          ctx.lineWidth = 1.5 * DPR;
          ctx.ellipse(CX, CY, p.r * DPR * (1 + el), p.r * DPR * (1 - el), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.min(2000, Math.floor(width * devicePixelRatio));
      canvas.height = Math.min(2000, Math.floor(height * devicePixelRatio));
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isClicked, clickStartTime]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isClicked) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Calcular el centro del canvas
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calcular la distancia desde el centro
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Solo activar si el click está dentro del núcleo (radio de 100px)
      const nucleusRadius = 100;
      
      if (distance <= nucleusRadius) {
        setIsClicked(true);
        setClickStartTime(Date.now());
        playClickSound(); // Reproducir sonido de click
      }
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Efecto de explosión
  React.useEffect(() => {
    if (explosionPhase === 1) {
      playExplosionSound(); // Reproducir sonido de explosión
      // Crear explosión de luz blanca súper intensa y rápida
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0) 100%);
        z-index: 9999;
        pointer-events: none;
        animation: superFlash 2s ease-out forwards;
        filter: brightness(2) contrast(2);
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes superFlash {
          0% { 
            opacity: 0; 
            transform: scale(0.1); 
            filter: brightness(1) contrast(1);
          }
          10% { 
            opacity: 1; 
            transform: scale(1.5); 
            filter: brightness(3) contrast(3);
          }
          30% { 
            opacity: 1; 
            transform: scale(2.5); 
            filter: brightness(4) contrast(4);
          }
          60% { 
            opacity: 0.8; 
            transform: scale(3); 
            filter: brightness(2) contrast(2);
          }
          100% { 
            opacity: 0; 
            transform: scale(4); 
            filter: brightness(1) contrast(1);
          }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(flash);
      
      // Onda expansiva adicional
      const shockwave = document.createElement('div');
      shockwave.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border: 4px solid rgba(255,255,255,0.8);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 9998;
        pointer-events: none;
        animation: shockwave 0.6s ease-out forwards;
      `;
      
      const shockwaveStyle = document.createElement('style');
      shockwaveStyle.textContent = `
        @keyframes shockwave {
          0% { 
            width: 0; 
            height: 0; 
            opacity: 1; 
            border-width: 4px;
          }
          50% { 
            opacity: 0.8; 
            border-width: 2px;
          }
          100% { 
            width: 200vw; 
            height: 200vh; 
            opacity: 0; 
            border-width: 1px;
          }
        }
      `;
      
      document.head.appendChild(shockwaveStyle);
      document.body.appendChild(shockwave);
      
      // Después del flash, mostrar la pantalla final
      setTimeout(() => {
        document.body.removeChild(flash);
        document.body.removeChild(shockwave);
        document.head.removeChild(style);
        document.head.removeChild(shockwaveStyle);
        
        // Crear pantalla final con SHEILY
        const finalScreen = document.createElement('div');
        finalScreen.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        `;
        
        const finalStyle = document.createElement('style');
        finalStyle.textContent = `
          .content-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3rem;
          }
          
          .letter-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5em;
          }
          
          .letter {
            font-family: 'Arial Black', sans-serif;
            font-size: 18vw;
            font-weight: 900;
            text-transform: uppercase;
            color: #e0e0e0;
            text-shadow: 
              /* Sombra interna cromada */
              inset 0 0 20px rgba(255,255,255,0.4),
              inset 0 0 40px rgba(255,255,255,0.3),
              
              /* Sombra externa 3D */
              2px 2px 4px rgba(0,0,0,0.8),
              4px 4px 8px rgba(0,0,0,0.6),
              
              /* Resplandor cromado */
              0 0 20px rgba(224,224,224,0.8),
              0 0 40px rgba(224,224,224,0.6);
            position: relative;
            animation: letterDrop 0.8s ease-in forwards;
            transform: translateY(-100vh);
            filter: contrast(1.4) brightness(1.3) saturate(1.2);
          }
          
          @keyframes letterDrop {
            0% { 
              transform: translateY(-100vh) scale(1.5);
              opacity: 0;
            }
            50% { 
              transform: translateY(0) scale(1.2);
              opacity: 1;
            }
            100% { 
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          .welcome-text {
            text-align: center;
            margin-bottom: 2rem;
            animation: welcomeAppear 1s ease-in forwards 1s;
            opacity: 0;
            transform: translateY(1rem);
          }
          
          @keyframes welcomeAppear {
            0% { 
              opacity: 0;
              transform: translateY(1rem);
            }
            100% { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .buttons-container {
            display: flex;
            gap: 2rem;
            animation: buttonsAppear 1s ease-in forwards 1.5s;
            opacity: 0;
            transform: translateY(2rem);
          }
          
          @keyframes buttonsAppear {
            0% { 
              opacity: 0;
              transform: translateY(2rem);
            }
            100% { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .login-btn, .register-btn {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            font-weight: 600;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .login-btn {
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
          }
          
          .login-btn:hover {
            background: linear-gradient(135deg, #00b8e6, #0088b3);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 212, 255, 0.6);
          }
          
          .register-btn {
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
          }
          
          .register-btn:hover {
            background: linear-gradient(135deg, #7c3aed, #5855eb);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
          }
          
          .info-text {
            text-align: center;
            margin-top: 2rem;
            animation: infoAppear 1s ease-in forwards 2s;
            opacity: 0;
            transform: translateY(1rem);
          }
          
          @keyframes infoAppear {
            0% { 
              opacity: 0;
              transform: translateY(1rem);
            }
            100% { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        
        finalScreen.innerHTML = `
          <div class="content-container">
            <div class="letter-container">
              <div class="letter">S</div>
              <div class="letter">H</div>
              <div class="letter">E</div>
              <div class="letter">I</div>
              <div class="letter">L</div>
              <div class="letter">Y</div>
            </div>
            <div class="welcome-text">
              <h2 class="text-3xl font-bold text-white mb-4">Bienvenido a la Inteligencia Artificial del Futuro</h2>
              <p class="text-lg text-gray-300 mb-8">Selecciona una opción para comenzar tu experiencia</p>
            </div>
            <div class="buttons-container">
              <button class="login-btn" onclick="window.showLoginForm()">
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Iniciar Sesión
                </span>
              </button>
              <button class="register-btn" onclick="window.showRegisterForm()">
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Registrarse
                </span>
              </button>
            </div>
            <div class="info-text">
              <p class="text-sm text-gray-400">💡 Tip: Puedes hacer clic en cualquier parte de la pantalla para reiniciar la animación</p>
            </div>
          </div>
        `;
        
        document.head.appendChild(finalStyle);
        document.body.appendChild(finalScreen);
        
        // Agregar funciones globales para mostrar formularios
        (window as any).showLoginForm = () => {
          setShowLoginForm(true);
          setShowRegisterForm(false);
        };
        
        (window as any).showRegisterForm = () => {
          setShowRegisterForm(true);
          setShowLoginForm(false);
        };

        // Agregar impactos después de que caigan las letras
        setTimeout(() => {
          // Mostrar mensaje de transición
          const transitionMsg = document.createElement('div');
          transitionMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            border: 2px solid #00d4ff;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
          `;
          transitionMsg.innerHTML = `
            <div class="text-2xl font-bold mb-4 text-cyan-400">¡Bienvenido a Sheily AI!</div>
            <div class="text-lg mb-4">Tu experiencia está lista</div>
            <div class="text-sm text-gray-300">Selecciona una opción para continuar</div>
          `;
          document.body.appendChild(transitionMsg);
          
                  // Limpiar todo después de mostrar la pantalla final
        setTimeout(() => {
          if (document.body.contains(finalScreen)) {
            document.body.removeChild(finalScreen);
            document.head.removeChild(finalStyle);
          }
          if (document.body.contains(transitionMsg)) {
            document.body.removeChild(transitionMsg);
          }
          setIsClicked(false);
          setClickStartTime(0);
          setExplosionPhase(0);
          
          // Agregar evento de clic para reiniciar la animación
          const handleRestartClick = () => {
            // Limpiar el evento
            document.removeEventListener('click', handleRestartClick);
            // Reiniciar el estado
            setIsClicked(false);
            setClickStartTime(0);
            setExplosionPhase(0);
          };
          
          // Esperar un poco antes de permitir reiniciar
          setTimeout(() => {
            document.addEventListener('click', handleRestartClick);
          }, 1000);
          
        }, 15000); // Mostrar la pantalla final por 15 segundos
          
        }, 1500); // Esperar a que todas las letras hayan caído
        
      }, 2000); // Esperar 2 segundos para que termine el flash
    }
  }, [explosionPhase]);

  // Función para manejar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    
    try {
      // Usar el email como username para el login
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        console.log("✅ Login exitoso, redirigiendo al dashboard...");
        setShowLoginForm(false);
        // Redirigir al dashboard
        router.push('/dashboard');
      } else {
        setLoginError("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      toast({
        title: "Error de Login",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Función para manejar el registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    // Validaciones básicas
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }
    
    if (!registerData.acceptTerms) {
      setRegisterError("Debes aceptar los términos y condiciones.");
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      // Aquí implementarías la lógica de registro
      // Por ahora solo simulamos el proceso
      console.log("📝 Datos de registro:", registerData);
      
      // Simular delay de registro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar mensaje de éxito y cambiar a login
      setShowRegisterForm(false);
      setShowLoginForm(true);
      setLoginEmail(registerData.email);
      
      // Limpiar formulario de registro
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
      });
      
    } catch (error) {
      console.error("Error durante el registro:", error);
      toast({
        title: "Error de Registro", 
        description: error.message || "No se pudo completar el registro",
        variant: "destructive"
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="hero-orb relative h-screen w-full">
      <canvas 
        ref={ref} 
        className="h-full w-full cursor-pointer" 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Overlay con indicador del núcleo clickeable */}
      {!isClicked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Círculo indicador del núcleo */}
            <div className="w-48 h-48 border-2 border-cyan-400 border-dashed rounded-full animate-pulse bg-cyan-400/10"></div>
            {/* Texto de instrucción */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 text-cyan-400 px-4 py-2 rounded-lg text-lg font-semibold border border-cyan-400">
                {isHovered ? '¡Haz clic para continuar!' : 'Pulsa el núcleo para comenzar'}
              </div>
            </div>
            {/* Indicador adicional de que es clickeable */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm border border-cyan-400/50">
                💫 Experiencia interactiva
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de progreso después del clic */}
      {isClicked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-4 rounded-lg text-center border border-cyan-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mx-auto mb-2"></div>
            <div className="text-lg font-semibold">Preparando experiencia...</div>
            <div className="text-sm text-cyan-400 mt-1">Cargando componentes y animaciones</div>
          </div>
        </div>
      )}

      {/* Formulario de Login */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001]">
          <div className="bg-gray-900 p-8 rounded-2xl border-2 border-cyan-400 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
              <p className="text-gray-400">Accede a tu cuenta de Sheily AI</p>
            </div>
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="tu@email.com"
                  required
                  disabled={loginLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="••••••••"
                  required
                  disabled={loginLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-cyan-400 focus:ring-cyan-400" />
                  <span className="text-sm text-gray-300">Recordarme</span>
                </label>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">¿Olvidaste tu contraseña?</a>
              </div>
              
              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                ¿No tienes cuenta?{' '}
                <button 
                  onClick={() => {
                    setShowLoginForm(false);
                    setShowRegisterForm(true);
                    setLoginError("");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
            
            <button 
              onClick={() => {
                setShowLoginForm(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Formulario de Registro */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001]">
          <div className="bg-gray-900 p-8 rounded-2xl border-2 border-purple-500 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
              <p className="text-gray-400">Únete a Sheily AI</p>
            </div>
            
            {registerError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                {registerError}
              </div>
            )}
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                  <input 
                    type="text" 
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="Tu nombre"
                    required
                    disabled={registerLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
                  <input 
                    type="text" 
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="Tu apellido"
                    required
                    disabled={registerLoading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="tu@email.com"
                  required
                  disabled={registerLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="••••••••"
                  required
                  disabled={registerLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="••••••••"
                  required
                  disabled={registerLoading}
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={registerData.acceptTerms}
                  onChange={(e) => setRegisterData({...registerData, acceptTerms: e.target.checked})}
                  className="mr-2 text-purple-500 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-300">
                  Acepto los{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Términos y Condiciones</a>
                </span>
              </div>
              
              <button 
                type="submit" 
                disabled={registerLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {registerLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear Cuenta"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <button 
                  onClick={() => {
                    setShowRegisterForm(false);
                    setShowLoginForm(true);
                    setRegisterError("");
                  }}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
            
            <button 
              onClick={() => {
                setShowRegisterForm(false);
                setRegisterError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
