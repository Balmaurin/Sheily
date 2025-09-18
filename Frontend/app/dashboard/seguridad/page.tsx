import Link from 'next/link';

export default async function SeguridadPage() {
  return (
    <div className="min-h-screen bg-bg text-fg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold mb-6">Configuración de Seguridad</h1>
        
        <div className="bg-card/40 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Dispositivos Conectados</h2>
          <p className="text-white/70 mb-4">
            Esta funcionalidad requiere autenticación del cliente.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Volver al Dashboard
          </Link>
        </div>
        
        <div className="bg-card/40 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Autenticación de Dos Factores</h2>
          <p className="text-white/70 mb-4">
            Esta funcionalidad requiere autenticación del cliente.
          </p>
        </div>
        
        <div className="bg-card/40 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Bloqueo de Cuenta</h2>
          <p className="text-white/70 mb-4">
            La cuenta se bloquea después de 5 intentos fallidos.
          </p>
          <div className="text-primary font-bold">
            Protección Activa
          </div>
        </div>
      </div>
    </div>
  );
}
