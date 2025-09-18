'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrainingService } from '../../services/trainingService';
import { toast } from '../ui/use-toast';
// import { 
//   Activity, 
//   Server, 
//   Database, 
//   Cpu, 
//   MemoryStick, 
//   HardDrive 
// } from 'lucide-react';

type SystemStatus = {
  performance: {
    cpuUsage: number;
    memoryUsage: number;
  };
  status: string;
  components: {
    modelTraining: boolean;
  };
  warnings?: string[];
};

export function Telemetry() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStatus = async () => {
    setIsLoading(true);
    try {
      const status = await TrainingService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      toast({
        title: "Error de Telemetría",
        description: "No se pudo obtener el estado del sistema",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span role="img" aria-label="Server" className="text-2xl">🖥️</span> Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span role="img" aria-label="CPU">💻</span>
              <span className="ml-2">Uso de CPU: {systemStatus?.performance?.cpuUsage || 'N/A'}%</span>
            </div>
            <div className="flex items-center">
              <span role="img" aria-label="Memory">🧠</span>
              <span className="ml-2">Uso de Memoria: {systemStatus?.performance?.memoryUsage || 'N/A'}%</span>
            </div>
            <div className="flex items-center">
              <span role="img" aria-label="HardDrive">💾</span>
              <span className="ml-2">Estado: {systemStatus?.status || 'Desconocido'}</span>
            </div>
            <div className="flex items-center">
              <span role="img" aria-label="Database">💾</span>
              <span className="ml-2">Componentes: {systemStatus?.components?.modelTraining ? 'Activos' : 'Inactivos'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {systemStatus?.warnings && systemStatus.warnings.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <span role="img" aria-label="Activity">⚠️</span> Advertencias del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-yellow-800">
              {systemStatus.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <Button onClick={fetchSystemStatus} variant="outline">
          <span role="img" aria-label="Refresh">🔄</span> Actualizar
        </Button>
        <span className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
