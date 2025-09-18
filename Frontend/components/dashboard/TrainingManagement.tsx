import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { TrainingService, TrainingSession, TrainingRequest, SystemStatus } from '../../services/trainingService';
import { toast } from '../ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function TrainingManagement() {
  const { user, isAuthenticated, token } = useAuth();
  const [trainingJobs, setTrainingJobs] = useState<TrainingSession[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedTrainingType, setSelectedTrainingType] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedQuantization, setSelectedQuantization] = useState<'4bit' | '8bit' | 'none'>('4bit');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const domains = [
    'lengua_y_lingüística',
    'matemáticas',
    'computación_y_programación',
    'medicina_y_salud',
    'física',
    'química',
    'biología',
    'historia',
    'geografía_y_geo_política',
    'economía_y_finanzas',
    'derecho_y_políticas_públicas',
    'educación_y_pedagogía',
    'ingeniería',
    'empresa_y_emprendimiento',
    'arte_música_y_cultura',
    'literatura_y_escritura',
    'medios_y_comunicación',
    'deportes_y_esports',
    'juegos_y_entretenimiento',
    'cocina_y_nutrición',
    'hogar_diy_y_reparaciones',
    'viajes_e_idiomas',
    'vida_diaria_legal_práctico_y_trámites',
    'sociología_y_antropología',
    'neurociencia_y_psicología',
    'astronomía_y_espacio',
    'ciencias_de_la_tierra_y_clima',
    'ciencia_de_datos_e_ia',
    'ciberseguridad_y_criptografía',
    'electrónica_y_iot',
    'sistemas_devops_redes',
    'diseño_y_ux'
  ];

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

  const fetchAvailableModels = useCallback(async () => {
    try {
      const models = await TrainingService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los modelos disponibles",
      });
    }
  }, []);

  useEffect(() => {
    fetchTrainingJobs();
    fetchSystemStatus();
    fetchAvailableModels();

    // Configurar auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      fetchTrainingJobs();
      fetchSystemStatus();
    }, 30000);

    setAutoRefreshInterval(interval);

    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [fetchTrainingJobs, fetchSystemStatus, fetchAvailableModels, autoRefreshInterval]);

  const startTraining = async () => {
    if (!selectedTrainingType || !selectedDomain) {
      toast({
        title: "Error",
        description: "Por favor selecciona el tipo de entrenamiento y dominio",
      });
      return;
    }

    setIsLoading(true);
    try {
      const trainingRequest: TrainingRequest = {
        modelName: `modelo_${selectedDomain}_${Date.now()}`,
        datasetPath: `/datasets/${selectedDomain}`,
        trainingMode: 'fine_tune',
        modelDetails: {
          baseModel: 'Phi-3-mini',
          quantization: selectedQuantization,
          domain: selectedDomain
        }
      };

      const session = await TrainingService.startTraining(trainingRequest);
      setTrainingJobs([...trainingJobs, session]);
      
      toast({
        title: "Entrenamiento Iniciado",
        description: `Se ha iniciado el entrenamiento para ${selectedDomain}`,
      });

      // Resetear selecciones
      setSelectedTrainingType(null);
      setSelectedDomain(null);
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
      // Simular detención del entrenamiento
      setTrainingJobs(trainingJobs.map(job => 
        job.id === jobId ? { ...job, status: 'stopped' as any } : job
      ));
      
      toast({
        title: "Entrenamiento Detenido",
        description: "El entrenamiento se ha detenido exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo detener el entrenamiento",
      });
    }
  };

  const deleteTraining = async (jobId: string) => {
    try {
      // Simular eliminación del entrenamiento
      setTrainingJobs(trainingJobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Entrenamiento Eliminado",
        description: "El entrenamiento se ha eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado del Sistema */}
      {systemStatus && (
        <Card>
          <CardHeader>
                    <CardTitle className="flex items-center gap-2">
          <span role="img" aria-label="System" className="text-2xl">🖥️</span>
          Estado del Sistema
          {systemStatus.warnings && systemStatus.warnings.length > 0 && (
            <span role="img" aria-label="Warning" className="text-2xl">⚠️</span>
          )}
        </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="CPU">💻</span>
              <span>CPU: {systemStatus.performance.cpuUsage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Memory">🧠</span>
              <span>Memoria: {systemStatus.performance.memoryUsage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Clock">⏰</span>
              <span>Estado: {systemStatus.status}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración de Entrenamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de tipo de entrenamiento simplificado */}
            <select
              value={selectedTrainingType || ''}
              onChange={(e) => setSelectedTrainingType(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Seleccionar tipo</option>
              <option value="fine_tune">Fine-tuning</option>
              <option value="continuous">Continuo</option>
              <option value="consolidated">Consolidado</option>
            </select>

            {/* Selector de dominio simplificado */}
            <select
              value={selectedDomain || ''}
              onChange={(e) => setSelectedDomain(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Seleccionar dominio</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Selector de cuantización simplificado */}
            <select
              value={selectedQuantization}
              onChange={(e) => setSelectedQuantization(e.target.value as '4bit' | '8bit' | 'none')}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="4bit">4-bit</option>
              <option value="8bit">8-bit</option>
              <option value="none">Sin cuantización</option>
            </select>
          </div>

          <Button 
            onClick={startTraining} 
            disabled={isLoading || !selectedTrainingType || !selectedDomain}
            className="w-full"
          >
            {isLoading ? (
              <>
                <span role="img" aria-label="Loading" className="animate-spin mr-2">⏳</span>
                Iniciando...
              </>
            ) : (
              <>
                <span role="img" aria-label="Start" className="mr-2">🚀</span>
                Iniciar Entrenamiento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modelos Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModels.map((model, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <h3 className="font-semibold mb-2">{model.name || `Modelo ${index + 1}`}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Database">💾</span>
                    <span>Base: {model.base_model?.split('/').pop() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Hard Drive">💾</span>
                    <span>Dataset: {model.training_dataset}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trabajos de Entrenamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Trabajos de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{job.modelName}</h3>
                    <p className="text-sm text-muted-foreground">{job.datasetName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)} {job.status}
                    </span>
                    <div className="flex gap-1">
                      {job.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => job.id && stopTraining(job.id)}
                        >
                          <span role="img" aria-label="Stop">⏹️</span> Detener
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => job.id && deleteTraining(job.id)}
                      >
                        <span role="img" aria-label="Delete">🗑️</span> Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Database">💾</span>
                    <span>Dataset: {job.additionalInfo?.datasetSize || 'N/A'} registros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Hard Drive">💾</span>
                    <span>Hardware: {job.additionalInfo?.hardwareUsed || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="Clock">⏰</span>
                    <span>Tiempo: {job.additionalInfo?.trainingTime || 'N/A'} min</span>
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso</span>
                      <span>{job.epochs} épocas</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {trainingJobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span role="img" aria-label="Empty" className="text-4xl mb-4 block">📝</span>
                <p>No hay trabajos de entrenamiento</p>
                <p className="text-sm">Inicia un nuevo entrenamiento para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

