import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Forzar renderizado dinámico para evitar prerendering
export const dynamic = 'force-dynamic';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessages: { [key: string]: string } = {
    'Configuration': 'Error de configuración del proveedor de autenticación.',
    'AccessDenied': 'Acceso denegado. Verifica tus permisos.',
    'Verification': 'El token de verificación ha expirado o es inválido.',
    'Default': 'Ha ocurrido un error desconocido durante la autenticación.'
  };

  const errorMessage = errorMessages[error || 'Default'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de Autenticación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>
        
        <div className="rounded-md shadow-sm space-y-4">
          <Link href="/login">
            <Button 
              variant="outline" 
              className="w-full"
            >
              Volver a Iniciar Sesión
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="destructive" 
              className="w-full"
            >
              Ir a Página Principal
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta con soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
