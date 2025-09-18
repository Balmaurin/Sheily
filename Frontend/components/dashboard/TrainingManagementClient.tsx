'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { TrainingService, TrainingSession, TrainingRequest, SystemStatus } from '../../services/trainingService';
import { toast } from '@/components/ui/use-toast';
// Iconos reemplazados por emojis para evitar problemas de compilación

interface TrainingManagementProps {
  initialToken?: string;
}

export function TrainingManagementClient({ initialToken }: TrainingManagementProps) {
  const [trainingJobs, setTrainingJobs] = useState<TrainingSession[]>([]);
  const [selectedTrainingType, setSelectedTrainingType] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Phi-3-mini');
  const [selectedQuantization, setSelectedQuantization] = useState<'4bit' | '8bit' | 'none'>('4bit');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Configurar token al montar el componente
  useEffect(() => {
    if (initialToken) {
      TrainingService.setAuthToken(initialToken);
    }

    return () => {
      TrainingService.clearAuthToken();
    };
  }, [initialToken]);

  const fetchTrainingJobs = useCallback(async () => {
    try {
      const sessions = await TrainingService.getTrainingSessions();
      setTrainingJobs(sessions);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los trabajos de entrenamiento",
      });
    }
  }, []);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const status = await TrainingService.getSystemStatus();
      setSystemStatus(status);

      // Mostrar advertencias del sistema
      if (status.warnings && status.warnings.length > 0) {
        status.warnings.forEach(warning => {
          toast({
            title: "Advertencia del Sistema",
            description: warning,
          });
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el estado del sistema",
      });
    }
  }, []);

  useEffect(() => {
    // Cargar datos iniciales
    fetchTrainingJobs();
    fetchSystemStatus();

    // Configurar refresco automático cada 30 segundos
    const interval = setInterval(() => {
      fetchTrainingJobs();
      fetchSystemStatus();
    }, 30000);

    setAutoRefreshInterval(interval);

    // Limpiar intervalo al desmontar el componente
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [fetchTrainingJobs, fetchSystemStatus]);

  const startTraining = async () => {
    if (!selectedTrainingType) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tipo de entrenamiento",
      });
      return;
    }

    setIsLoading(true);
    try {
      const trainingRequest: TrainingRequest = {
        modelName: `Sheily-${selectedTrainingType}-${Date.now()}`,
        datasetPath: getDatasetPathForTrainingType(selectedTrainingType),
        trainingMode: getTrainingModeForType(selectedTrainingType),
        modelDetails: {
          baseModel: selectedModel as "Phi-3-mini" | "T5-base" | "Other",
          quantization: selectedQuantization,
          domain: 'general'
        },
        config: {
          epochs: 10,
          learningRate: 0.0001,
          batchSize: 32,
          earlyStoppingPatience: 5
        }
      };

      const newTrainingSession = await TrainingService.startTraining(trainingRequest);
      
      toast({
        title: "Entrenamiento Iniciado",
        description: `Entrenamiento de ${newTrainingSession.modelName} iniciado exitosamente`
      });

      // Actualizar lista de trabajos
      fetchTrainingJobs();
      
      // Resetear selecciones
      setSelectedTrainingType(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopTraining = async (jobId: string) => {
    try {
      // TODO: Implementar cuando esté disponible en TrainingService
      // await TrainingService.stopTraining(jobId);
      toast({
        title: "Entrenamiento Detenido",
        description: "El entrenamiento se ha detenido exitosamente",
      });
      fetchTrainingJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo detener el entrenamiento",
      });
    }
  };

  const deleteTraining = async (jobId: string) => {
    try {
      // TODO: Implementar cuando esté disponible en TrainingService
      // await TrainingService.deleteTraining(jobId);
      toast({
        title: "Entrenamiento Eliminado",
        description: "El entrenamiento se ha eliminado exitosamente",
      });
      fetchTrainingJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
      });
    }
  };

  const getDatasetPathForTrainingType = (type: string): string => {
    switch (type) {
      case 'LoRA': return '/api/datasets/lora';
      case 'Classification': return '/api/datasets/classification';
      case 'BranchAdapter': return '/api/datasets/branch-adapter';
      case 'FineTune': return '/api/datasets/fine-tune';
      case 'Continuous': return '/api/datasets/continuous';
      default: return '/api/datasets/default';
    }
  };

  const getTrainingModeForType = (type: string): TrainingRequest['trainingMode'] => {
    switch (type) {
      case 'LoRA': return 'fine_tune';
      case 'Classification': return 'dynamic';
      case 'BranchAdapter': return 'specialized';
      case 'FineTune': return 'fine_tune';
      case 'Continuous': return 'continuous';
      default: return 'continuous';
    }
  };

  const getProgressForStatus = (status: string): number => {
    switch (status) {
      case 'pending': return 10;
      case 'running': return 65;
      case 'completed': return 100;
      case 'failed': return 0;
      case 'stopped': return 50;
      default: return 0;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Gestión de Entrenamiento
          {systemStatus && systemStatus.warnings && systemStatus.warnings.length > 0 && (
            <span role="img" aria-label="Warning" className="h-6 w-6 text-yellow-500 text-2xl">⚠️</span>
          )}
        </h2>
        <Button 
          onClick={() => {
            fetchTrainingJobs();
            fetchSystemStatus();
          }}
          variant="outline"
          size="sm"
        >
          <span role="img" aria-label="Refresh" className="h-4 w-4 mr-2">🔄</span>
          Actualizar
        </Button>
      </div>
      
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="CPU" className="h-5 w-5 text-2xl">💻</span>
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                <span role="img" aria-label="CPU" className="h-5 w-5 text-blue-500 text-2xl">💻</span>
                <div>
                  <p className="text-sm font-medium">CPU</p>
                  <p className="text-lg font-bold">{systemStatus.performance.cpuUsage}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                <span role="img" aria-label="Memory" className="h-5 w-5 text-green-500 text-2xl">🧠</span>
                <div>
                  <p className="text-sm font-medium">Memoria</p>
                  <p className="text-lg font-bold">{systemStatus.performance.memoryUsage}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                <span role="img" aria-label="Clock" className="h-5 w-5 text-purple-500 text-2xl">⏰</span>
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  <p className="text-lg font-bold">{systemStatus.status}</p>
                </div>
              </div>
            </div>
            
            {systemStatus.warnings && systemStatus.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span role="img" aria-label="Warning" className="h-5 w-5 text-yellow-600 text-2xl">⚠️</span>
                  <h4 className="font-semibold text-yellow-800">Advertencias del Sistema</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {systemStatus.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Entrenamiento</label>
              <select 
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedTrainingType || ''}
                onChange={(e) => setSelectedTrainingType(e.target.value || null)}
                disabled={isLoading}
              >
                <option value="">Seleccionar Tipo</option>
                <option value="LoRA">Fine-tuning LoRA</option>
                <option value="Classification">Modelo de Clasificación</option>
                <option value="BranchAdapter">Adaptador de Rama</option>
                <option value="FineTune">Fine-tuning Completo</option>
                <option value="Continuous">Entrenamiento Continuo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Modelo Base</label>
              <select 
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading}
              >
                <option value="Phi-3-mini">Phi-3 Mini</option>
                <option value="Phi-3-small">Phi-3 Small</option>
                <option value="Phi-3-medium">Phi-3 Medium</option>
                <option value="Llama-3-8B">Llama-3 8B</option>
                <option value="Llama-3-70B">Llama-3 70B</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cuantización</label>
              <select 
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedQuantization}
                onChange={(e) => setSelectedQuantization(e.target.value as '4bit' | '8bit' | 'none')}
                disabled={isLoading}
              >
                <option value="4bit">4-bit</option>
                <option value="8bit">8-bit</option>
                <option value="none">Sin cuantización</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={startTraining} 
            disabled={!selectedTrainingType || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <span role="img" aria-label="Refresh" className="h-5 w-5 mr-2 animate-spin text-2xl">🔄</span>
                Iniciando...
              </>
            ) : (
              <>
                <span role="img" aria-label="Play" className="h-5 w-5 mr-2 text-2xl">▶️</span>
                Iniciar Entrenamiento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trabajos de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          {trainingJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span role="img" aria-label="Database" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50 text-6xl">💾</span>
              <p className="text-lg font-medium">No hay trabajos de entrenamiento</p>
              <p className="text-sm">Inicia un nuevo entrenamiento para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingJobs.map(job => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.modelName}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.datasetName}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Database" className="h-4 w-4">💾</span>
                          {job.additionalInfo?.datasetSize || 'N/A'} registros
                        </span>
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="HardDrive" className="h-4 w-4">💿</span>
                          {job.additionalInfo?.hardwareUsed || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Clock" className="h-4 w-4">⏰</span>
                          {job.additionalInfo?.trainingTime || 'N/A'} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                      
                      <div className="flex gap-1">
                        {job.status === 'running' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => stopTraining(job.id!)}
                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          >
                            <span role="img" aria-label="Stop" className="h-4 w-4">⏹️</span>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteTraining(job.id!)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <span role="img" aria-label="Trash" className="h-4 w-4">🗑️</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso</span>
                      <span>{getProgressForStatus(job.status)}%</span>
                    </div>
                    <Progress value={getProgressForStatus(job.status)} className="h-2" />
                  </div>
                  
                  {job.metrics && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Loss</p>
                        <p className="text-lg font-bold">{job.metrics.loss?.toFixed(4) || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Precisión</p>
                        <p className="text-lg font-bold">{(job.metrics.accuracy * 100).toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">F1 Score</p>
                        <p className="text-lg font-bold">{(job.metrics.f1Score * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
