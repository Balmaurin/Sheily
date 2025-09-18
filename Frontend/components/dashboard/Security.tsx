"use client";

import { useState, useEffect } from 'react';
import { useSecurity } from '../providers/SecurityProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from "@/components/ui/use-toast";

export function Security() {
  const { security, setBlock, setIssues } = useSecurity();
  const [securityStatus, setSecurityStatus] = useState<'checking' | 'secure' | 'issues'>('checking');

  // Verificar seguridad real del sistema
  const checkRealSecurity = async () => {
    setSecurityStatus('checking');
    
    try {
      // Realizar verificaciones reales de seguridad
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error en verificación de seguridad');
      }
      
      const securityData = await response.json();
      
      if (securityData.issues > 0) {
        setSecurityStatus('issues');
        setIssues(securityData.issues);
      } else {
        setSecurityStatus('secure');
        setIssues(0);
      }
    } catch (error) {
      toast({
        title: "Error de Seguridad",
        description: "No se pudo realizar la verificación de seguridad",
        variant: "destructive"
      });
      setSecurityStatus('issues');
      setIssues(1); // Error de conexión cuenta como un problema
    }
  };

  useEffect(() => {
    checkRealSecurity();
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Seguridad del Sistema</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Estado:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  securityStatus === 'secure' 
                    ? 'bg-green-100 text-green-800' 
                    : securityStatus === 'issues'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {securityStatus === 'secure' && '✅ Seguro'}
                  {securityStatus === 'issues' && '⚠️ Problemas detectados'}
                  {securityStatus === 'checking' && '🔍 Verificando...'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Problemas encontrados:</span>
                <span className="font-mono">{security.lastIssues}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Bloqueo automático:</span>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={security.blockOnIssues}
                    onChange={(e) => setBlock(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Activado</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={checkRealSecurity} 
                className="w-full"
                disabled={securityStatus === 'checking'}
              >
                {securityStatus === 'checking' ? 'Verificando...' : 'Verificar Seguridad'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('/api/security/report', '_blank')}
              >
                Ver Reporte Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
