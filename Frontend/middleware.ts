import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/',
    '/login', 
    '/registro', 
    '/recuperar-contrasena', 
    '/api/auth/signin', 
    '/api/auth/callback'
  ];

  // Rutas protegidas que requieren autenticación
  const protectedPaths = [
    '/dashboard',
    '/perfil',
    '/seguridad',
    '/training',
    '/chat'
  ];

  // Verificar si la ruta es pública
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  );

  // Verificar si la ruta es protegida
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // Por ahora, permitir acceso a todas las rutas
  // La autenticación se manejará en el lado del cliente
  return NextResponse.next();
}

// Configurar qué rutas serán procesadas por el middleware
export const config = {
  matcher: [
    '/', 
    '/dashboard/:path*', 
    '/login', 
    '/registro', 
    '/perfil/:path*', 
    '/seguridad/:path*', 
    '/training/:path*', 
    '/chat/:path*'
  ]
};
