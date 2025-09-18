import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { toast } from "@/components/ui/use-toast";

export const { GET, POST } = NextAuth({
  providers: [
    // Proveedor de Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    // Proveedor de credenciales para desarrollo
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: credentials?.email,
              password: credentials?.password
            })
          });

          if (response.ok) {
            const data = await response.json();
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              role: data.user.role
            };
          } else {
            toast({
              title: "Error de Autenticación",
              description: "Credenciales inválidas",
              variant: "destructive"
            });
            return null;
          }
        } catch (error) {
          toast({
            title: "Error de Conexión",
            description: "No se pudo conectar con el servicio de autenticación",
            variant: "destructive"
          });
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Permitir autenticación con credenciales y Google
      if (account?.provider === 'credentials' || account?.provider === 'google') {
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      // Añadir más información al objeto de sesión
      session.user.id = token.sub || token.id || '';
      session.user.email = token.email || '';
      session.user.role = token.role || 'user';
      
      return session;
    },
    async jwt({ token, user, account }) {
      // Añadir información adicional al token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role || 'user';
      }
      
      // Añadir información de proveedor
      if (account) {
        token.provider = account.provider;
      }
      
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Siempre redirigir al dashboard después del inicio de sesión
      return `${baseUrl}/dashboard`;
    }
  },
  events: {
    async signIn(message) {
      console.log('Inicio de sesión exitoso', message);
    },
    async signOut(message) {
      console.log('Cierre de sesión', message);
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'default-secret-key-for-development-very-long-and-secure-key-2025',
  // Eliminar referencias a páginas de login
  pages: {
    // No hay páginas personalizadas de login
  },
  // Configuración de sesión mejorada
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  }
});
