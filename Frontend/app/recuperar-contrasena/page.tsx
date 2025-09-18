"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

// Forzar renderizado dinámico para evitar prerendering
export const dynamic = 'force-dynamic';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmContrasena, setConfirmContrasena] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [etapa, setEtapa] = useState<'email' | 'codigo' | 'nueva_contrasena'>('email');
  const router = useRouter();

  const enviarCodigoVerificacion = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/recuperar-contrasena', { email });
      setSuccess("Código de verificación enviado a tu correo");
      setEtapa('codigo');
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el código");
    }
  };

  const verificarCodigo = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/verificar-codigo', { 
        email, 
        codigo: codigoVerificacion 
      });
      setSuccess("Código verificado correctamente");
      setEtapa('nueva_contrasena');
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Código de verificación inválido");
    }
  };

  const restablecerContrasena = async () => {
    if (nuevaContrasena !== confirmContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/auth/restablecer-contrasena', { 
        email, 
        codigo: codigoVerificacion,
        nueva_contrasena: nuevaContrasena 
      });
      
      setSuccess("Contraseña restablecida exitosamente");
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al restablecer la contraseña");
    }
  };

  const renderContenido = () => {
    switch (etapa) {
      case 'email':
        return (
          <>
            <div>
              <label htmlFor="email" className="block text-white/70 mb-2">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2 text-fg"
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </div>
            <Button 
              onClick={enviarCodigoVerificacion} 
              className="w-full"
              disabled={!email}
            >
              Enviar Código de Verificación
            </Button>
          </>
        );
      case 'codigo':
        return (
          <>
            <div>
              <label htmlFor="codigo" className="block text-white/70 mb-2">
                Código de Verificación
              </label>
              <input 
                type="text" 
                id="codigo"
                value={codigoVerificacion}
                onChange={(e) => setCodigoVerificacion(e.target.value)}
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2 text-fg"
                placeholder="Ingresa el código recibido"
                required
              />
            </div>
            <Button 
              onClick={verificarCodigo} 
              className="w-full"
              disabled={!codigoVerificacion}
            >
              Verificar Código
            </Button>
          </>
        );
      case 'nueva_contrasena':
        return (
          <>
            <div>
              <label htmlFor="nuevaContrasena" className="block text-white/70 mb-2">
                Nueva Contraseña
              </label>
              <input 
                type="password" 
                id="nuevaContrasena"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2 text-fg"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmContrasena" className="block text-white/70 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input 
                type="password" 
                id="confirmContrasena"
                value={confirmContrasena}
                onChange={(e) => setConfirmContrasena(e.target.value)}
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2 text-fg"
                placeholder="Repite tu nueva contraseña"
                minLength={8}
                required
              />
            </div>
            <Button 
              onClick={restablecerContrasena} 
              className="w-full"
              disabled={!nuevaContrasena || !confirmContrasena}
            >
              Restablecer Contraseña
            </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Recuperar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-500 p-3 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 text-green-500 p-3 rounded-xl text-center">
                {success}
              </div>
            )}
            {renderContenido()}
            <div className="text-center text-white/60 text-sm">
              <a href="/login" className="text-primary hover:underline">Volver a Iniciar Sesión</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
