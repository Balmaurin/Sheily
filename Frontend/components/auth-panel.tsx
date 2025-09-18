"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from 'next-auth/react';
import { toast } from "@/components/ui/use-toast";

export function AuthPanel() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Inicio de sesión
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        });

        if (result?.error) {
          toast({
            title: "Error de inicio de sesión",
            description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
          });
        } else {
          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido de vuelta.",
          });
        }
      } else {
        // Registro
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: email.split('@')[0],
            email,
            password,
            full_name: fullName
          })
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Registro exitoso",
            description: "Tu cuenta ha sido creada. Iniciando sesión...",
          });

          // Iniciar sesión automáticamente después del registro
          await signIn('credentials', {
            redirect: false,
            email,
            password
          });
        } else {
          toast({
            title: "Error de registro",
            description: data.error || "No se pudo crear la cuenta. Inténtalo de nuevo.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu solicitud.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      toast({
        title: "Error de Google Sign-In",
        description: "No se pudo iniciar sesión con Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-background/50 backdrop-blur-md rounded-lg">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        {!isLogin && (
          <Input
            type="text"
            placeholder="Nombre Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required={!isLogin}
            disabled={isLoading}
          />
        )}
        
        <Input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
        </Button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">o</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Button 
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Continuar con Google'}
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <Button 
            type="button"
            className="text-primary hover:underline p-0 ml-1 h-auto"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            {isLogin ? 'Regístrate' : 'Iniciar Sesión'}
          </Button>
        </p>
      </form>
    </div>
  );
}
