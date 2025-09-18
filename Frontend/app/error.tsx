"use client";

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">Error del Servidor</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Ocurrió un error interno del servidor'}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => reset()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md"
          >
            Intentar de nuevo
          </button>
          <Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
