'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Brain,
  CircuitBoard,
  Layers,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const heroHighlights = [
  'Modelo Llama-3.2-3B-Instruct-Q8_0 operando en nuestro servidor local',
  'Canal directo con el chatbot del dashboard, sin pasarelas intermedias',
  'Orquestación de entrenamiento modular con LoRA y métricas verificables',
];

const capabilityColumns = [
  {
    title: 'Orquestación de IA',
    description:
      'Gestiona sesiones de chat, memoria personal y despliegues de modelos desde una sola interfaz.',
    points: [
      'Chat en vivo conectado al LLM local',
      'Gestión de proyectos y datasets especializados',
      'Control del pipeline draft → critic → fix',
    ],
    icon: Brain,
  },
  {
    title: 'Entrenamiento y ejercicios',
    description:
      'Diseña, ejecuta y evalúa rutinas de entrenamiento y ejercicios personalizados con retroalimentación inmediata.',
    points: [
      'Creador y runner de ejercicios integrados',
      'Training Studio para LoRA y sesiones dirigidas',
      'Supervisión de sesiones y recompensas en tiempo real',
    ],
    icon: Activity,
  },
  {
    title: 'Infraestructura verificable',
    description:
      'Toda la telemetría se alimenta de servicios reales: FastAPI para blockchain, Flask/Node para el backend y Next.js en el front.',
    points: [
      'Servicios de autenticación y vault en el backend Node',
      'Servidor LLM en Flask exponiendo la API OpenAI compatible',
      'Monitorización sin datos falsos ni métricas simuladas',
    ],
    icon: CircuitBoard,
  },
];

const solanaFeatures = [
  {
    icon: Wallet,
    title: 'Wallet Phantom integrada',
    description:
      'Conecta tu wallet Phantom y administra tokens SHEILY dentro del dashboard. Todas las operaciones pasan por nuestro servicio blockchain FastAPI.',
  },
  {
    icon: LineChart,
    title: 'Visor de red Solana',
    description:
      'Consulta saldos, transacciones y estado de la red devnet con endpoints reales del servicio `blockchain_server.py`.',
  },
  {
    icon: Layers,
    title: 'Tokens y staking',
    description:
      'Envío, staking y liberación de tokens con registro completo de movimientos a través de la API `/api/tokens` del backend.',
  },
];

const securityPillars = [
  {
    title: 'PIN cifrado de 6 dígitos',
    description:
      'El acceso a Tokens, Memoria Personal y Wallet exige un PIN cifrado y validado en el navegador antes de renderizar datos sensibles.',
  },
  {
    title: 'Autenticación unificada',
    description:
      'El backend mantiene sesiones JWT, mientras que el front fuerza rutas protegidas y control dinámico de pestañas.',
  },
  {
    title: 'Trazabilidad completa',
    description:
      'Cada interacción queda registrada en los servicios reales: sin mocks, sin métricas inventadas, solo datos provenientes del sistema en ejecución.',
  },
];

const workflowSteps = [
  'Inicia sesión con credenciales empresariales protegidas por el backend Node.',
  'Desbloquea módulos sensibles mediante el PIN cifrado y accede a memoria personal y token vault.',
  'Interactúa con el LLM local, diseña entrenamientos y ejecuta rutinas de ejercicio personalizadas.',
  'Gestiona la economía del proyecto sobre Solana: consulta balances, lanza transacciones y visualiza la actividad de la red.',
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_60%)]" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-sky-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-300">Plataforma integral</p>
              <p className="text-xl font-semibold">Sheily AI Enterprise</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="#capacidades" className="transition hover:text-white">
              Capacidades
            </Link>
            <Link href="#arquitectura" className="transition hover:text-white">
              Arquitectura
            </Link>
            <Link href="#solana" className="transition hover:text-white">
              Solana &amp; Wallet
            </Link>
            <Link href="#seguridad" className="transition hover:text-white">
              Seguridad
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-200 hover:text-white"
              onClick={() => router.push('/login')}
            >
              Iniciar sesión
            </Button>
            <Button
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/40"
              onClick={() => router.push('/dashboard')}
            >
              Ir al dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 pb-24 pt-20 md:flex-row md:items-center">
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm uppercase tracking-wide text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Operación 100% local y verificable
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
              La suite definitiva para operar tu inteligencia artificial, entrenar equipos y administrar la economía del proyecto.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Cada módulo del ecosistema Sheily AI está conectado a servicios reales: el LLM corre en nuestros servidores locales,
              el backend Node gestiona autenticación y tokens, y el servicio FastAPI expone la actividad blockchain sobre Solana.
            </p>

            <ul className="space-y-3 text-base text-slate-200">
              {heroHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-8 py-6 text-lg shadow-lg shadow-sky-500/30 hover:shadow-sky-400/40"
                onClick={() => router.push('/dashboard')}
              >
                Entrar al panel operativo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-500/60 bg-transparent px-8 py-6 text-lg text-slate-100 hover:border-slate-400"
                onClick={() => router.push('/docs')}
              >
                Revisar documentación
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-sky-500/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20">
                  <Lock className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">Acceso seguro</p>
                  <p className="text-lg font-semibold text-white">Protección con PIN y autenticación JWT</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  • Validación de PIN cifrado en el navegador para módulos sensibles.
                </p>
                <p>
                  • Gestión de sesiones y permisos a través del backend Node.
                </p>
                <p>
                  • Auditoría permanente de operaciones de tokens y memoria personal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="capacidades" className="bg-slate-900/40 py-20">
          <div className="mx-auto max-w-6xl space-y-16 px-6">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-widest text-slate-400">Capacidades clave</p>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Todo lo que necesitas para desplegar una IA empresarial sin artificios
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-300">
                No hay demos ficticias ni datos simulados: cada botón del dashboard consume servicios reales desplegados en esta plataforma.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {capabilityColumns.map(({ title, description, points, icon: Icon }) => (
                <article
                  key={title}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-8 transition-transform hover:-translate-y-2 hover:border-sky-500/40"
                >
                  <div className="space-y-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-white">{title}</h3>
                      <p className="text-sm text-slate-300">{description}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-200">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-sky-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="arquitectura" className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row">
          <div className="flex-1 space-y-6">
            <p className="text-sm uppercase tracking-widest text-slate-400">Arquitectura comprobada</p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Servicios coordinados para ofrecer experiencia de nivel enterprise
            </h2>
            <p className="text-base text-slate-300">
              Los servicios backend se distribuyen en micro-servicios especializados. El servidor LLM ejecuta el modelo Llama-3.2-3B-Instruct-Q8_0 y expone endpoints compatibles con OpenAI. El backend Node resuelve autenticación, vault de tokens y operaciones de entrenamiento. La capa de monitoreo certifica el estado de todo el stack.
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              <li>• Health-checks reales para LLM, blockchain y pipelines de entrenamiento.</li>
              <li>• Telemetría disponible desde el dashboard sin valores inventados.</li>
              <li>• Documentación operacional accesible desde <code className="rounded bg-white/10 px-1">/docs</code>.</li>
            </ul>
          </div>
          <div className="flex-1 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white">Flujo operativo</h3>
              <ol className="mt-4 space-y-4 text-sm text-slate-200">
                {workflowSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white">Integraciones activas</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>• Dashboard Next.js con rutas protegidas y contextos de seguridad.</li>
                <li>• Backend Node (`backend/server.js`) sirviendo los endpoints `/api` utilizados por el front.</li>
                <li>• Servicio blockchain FastAPI (`blockchain_server.py`) para operaciones en Solana devnet.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="solana" className="bg-slate-900/40 py-20">
          <div className="mx-auto max-w-6xl space-y-12 px-6">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-widest text-slate-400">Solana &amp; Tokenomics</p>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Wallet Phantom, tokens SHEILY y telemetría on-chain en un solo lugar
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-300">
                El dashboard consume los endpoints blockchain expuestos por FastAPI y las rutas `/api/tokens` del backend Node para ofrecer datos coherentes y verificables.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {solanaFeatures.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-sky-500/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="seguridad" className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-widest text-slate-400">Seguridad sin atajos</p>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Control absoluto de acceso con PIN cifrado y auditoría completa
              </h2>
              <p className="text-base text-slate-300">
                Eliminamos mocks, fallbacks y métricas falsas. La seguridad se implementa con datos reales y políticas estrictas en el frontend y backend.
              </p>
              <ul className="space-y-4">
                {securityPillars.map(({ title, description }) => (
                  <li key={title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <h3 className="text-lg font-semibold text-white">Protección con PIN</h3>
              <p className="mt-4 text-sm text-slate-300">
                El dashboard solicita un PIN de 6 dígitos cifrado antes de mostrar información sensible como tokens SHEILY, memoria personal o la wallet Phantom. El hash del PIN se guarda en el navegador mediante Web Crypto y cada pestaña se desbloquea de forma independiente por sesión.
              </p>
              <p className="mt-4 text-sm text-slate-300">
                Puedes actualizar el PIN en cualquier momento desde las secciones protegidas; las validaciones se realizan completamente en el lado del cliente sin almacenar el valor plano.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Listo para desplegar una experiencia impecable para tus usuarios y equipo
            </h2>
            <p className="max-w-3xl text-base text-slate-300">
              Arranca servicios, ejecuta entrenamientos, gestiona tokens y conversa con el LLM local sin abandonar el dashboard. Todo el sistema ha sido depurado para operar con datos reales y componentes productivos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-8 py-6 text-lg shadow-lg shadow-sky-500/30 hover:shadow-sky-400/40"
                onClick={() => router.push('/dashboard')}
              >
                Abrir dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-500/60 bg-transparent px-8 py-6 text-lg text-slate-100 hover:border-slate-400"
                onClick={() => router.push('/docs/arquitectura')}
              >
                Ver arquitectura completa
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sheily AI. Plataforma operativa sin simulaciones.</p>
          <div className="flex items-center gap-6">
            <Link href="/docs">Documentación</Link>
            <Link href="/docs/llm">Servidor LLM</Link>
            <Link href="/docs/blockchain">Blockchain</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
