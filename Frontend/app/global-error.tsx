"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-destructive mb-4">Error</h1>
            <h2 className="text-2xl font-semibold mb-4">Algo salió mal</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={() => reset()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
