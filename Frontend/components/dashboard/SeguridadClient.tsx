"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { redirect } from "next/navigation";

type Device = {
  id: string;
  name: string;
  type: string;
  lastLogin: string;
  isCurrentDevice: boolean;
};

export default function SeguridadClient() {
  const { user, isAuthenticated, token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await axios.get('http://localhost:8000/api/security/devices', {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        setDevices(response.data.devices);
        setLoading(false);
      } catch (err: any) {
        setError("No se pudieron cargar los dispositivos");
        setLoading(false);
      }
    };

    fetchDevices();
  }, [isAuthenticated, token]);

  const revokeDevice = async (deviceId: string) => {
    try {
      await axios.post('http://localhost:8000/api/security/revoke-device', 
        { device_id: deviceId },
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Actualizar lista de dispositivos
      setDevices(prev => prev.filter(device => device.id !== deviceId));
    } catch (err: any) {
      setError("No se pudo revocar el dispositivo");
    }
  };

  const enableTwoFactor = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/security/enable-2fa', 
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Autenticación de dos factores habilitada. Revisa tu correo.");
    } catch (err: any) {
      setError("No se pudo habilitar la autenticación de dos factores");
    }
  };

  if (!isAuthenticated) {
    return <div>Redirigiendo al login...</div>;
  }

  return (
    <div className="min-h-screen bg-bg text-fg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold mb-6">Configuración de Seguridad</h1>

        {error && (
          <div className="bg-red-500/20 text-red-500 p-4 rounded-xl">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dispositivos Conectados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/70">Cargando dispositivos...</div>
            ) : devices.length === 0 ? (
              <div className="text-white/70">No hay dispositivos registrados</div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between bg-card/40 p-4 rounded-xl"
                  >
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-white/70 text-sm">
                        {device.type} • Último inicio: {device.lastLogin}
                      </p>
                      {device.isCurrentDevice && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full ml-2">
                          Dispositivo actual
                        </span>
                      )}
                    </div>
                    {!device.isCurrentDevice && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => revokeDevice(device.id)}
                      >
                        Revocar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Autenticación de Dos Factores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Habilitar 2FA</h3>
                <p className="text-white/70 text-sm">
                  Protege tu cuenta con un código adicional al iniciar sesión
                </p>
              </div>
              <Button onClick={enableTwoFactor}>
                Activar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloqueo de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Intentos de Inicio de Sesión</h3>
                <p className="text-white/70 text-sm">
                  La cuenta se bloquea después de 5 intentos fallidos
                </p>
              </div>
              <div className="text-primary font-bold">
                Protección Activa
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
