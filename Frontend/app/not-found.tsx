import Link from 'next/link';

// Forzar renderizado dinámico para evitar prerendering
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-muted-foreground mb-6">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
            Volver al Inicio
          </Link>
          <Link href="/dashboard" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md">
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
