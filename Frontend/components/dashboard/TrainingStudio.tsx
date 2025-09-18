'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrainingService } from '../../services/trainingService';
import { toast } from '@/components/ui/use-toast';
// Iconos reemplazados por emojis para evitar problemas de compilación

export interface BranchStats {
  branch: string;
  modelCount: number;
  datasetCount: number;
  averageAccuracy: number;
  lastTrainingDate: string;
  activeTrainings: number;
  totalTokens: number;
  performance: {
    trainingSpeed: number;
    memoryEfficiency: number;
    gpuUtilization: number;
  };
}

export function TrainingStudio() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Phi-3-mini');
  const [selectedQuantization, setSelectedQuantization] = useState<'4bit' | '8bit' | 'none'>('4bit');
  const [isLoading, setIsLoading] = useState(false);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);

  const branches = [
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

  const datasets = [
    'Corpus de Conversaciones en Español',
    'Datos de Dominio Específico',
    'Corpus Científico',
    'Corpus de Programación',
    'Corpus de Noticias',
    'Corpus Literario',
    'Corpus Médico',
    'Corpus Legal',
    'Corpus Educativo',
    'Corpus Técnico'
  ];

  const models = [
    'Phi-3-mini',
    'Phi-3-small',
    'Phi-3-medium',
    'Llama-3-8B',
    'Llama-3-70B',
    'Mistral-7B',
    'CodeLlama-7B',
    'Gemma-2B',
    'Gemma-7B'
  ];

  const fetchBranchStats = async () => {
    try {
      const stats = await TrainingService.getBranchTrainingStats();
      setBranchStats(stats);
    } catch (error) {
      toast({
        title: "Error de Training Studio",
        description: "No se pudieron obtener las estadísticas de las ramas",
      });
    }
  };

  const fetchTrainingHistory = async () => {
    try {
      const history = await TrainingService.getTrainingHistory();
      setTrainingHistory(history);
    } catch (error) {
      toast({
        title: "Error de Historial",
        description: "No se pudo cargar el historial de entrenamiento",
        variant: "destructive"
      });
      setTrainingHistory([]);
    }
  };

  useEffect(() => {
    fetchBranchStats();
    fetchTrainingHistory();
  }, []);

  const startTraining = async () => {
    if (!selectedBranch || !selectedDataset) {
      toast({
        title: "Datos Incompletos",
        description: "Por favor, selecciona una rama y un conjunto de datos",
      });
      return;
    }

    setIsLoading(true);
    try {
      const trainingRequest = {
        modelName: `Sheily-${selectedBranch}-${Date.now()}`,
        datasetPath: `/api/datasets/${selectedDataset.toLowerCase().replace(/\s+/g, '_')}`,
        trainingMode: 'specialized' as const,
        modelDetails: {
          baseModel: selectedModel as "Phi-3-mini" | "T5-base" | "Other",
          quantization: selectedQuantization,
          domain: selectedBranch,
          architecture: 'transformer',
          attentionHeads: 32,
          hiddenSize: 768,
          numLayers: 12
        },
        config: {
          epochs: 15,
          learningRate: 0.0001,
          batchSize: 16,
          earlyStoppingPatience: 5,
          validationSplit: 0.2,
          gradientAccumulationSteps: 4,
          warmupSteps: 100,
          maxGradNorm: 1.0
        }
      };

      const newTrainingSession = await TrainingService.startTraining(trainingRequest);
      
      toast({
        title: "Entrenamiento Iniciado",
        description: `Entrenamiento de ${newTrainingSession.modelName} iniciado exitosamente`,
      });

      // Actualizar estadísticas y historial
      fetchBranchStats();
      fetchTrainingHistory();
      
      // Resetear selecciones
      setSelectedBranch(null);
      setSelectedDataset(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (value: number): string => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span role="img" aria-label="Brain" className="h-8 w-8 text-primary text-4xl">🧠</span>
          Training Studio
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              fetchBranchStats();
              fetchTrainingHistory();
            }}
          >
            <span role="img" aria-label="BarChart" className="h-4 w-4 mr-2">📊</span>
            Actualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          <span role="img" aria-label="Play" className="h-5 w-5 text-green-500 text-2xl">▶️</span>
          Configuración de Entrenamiento
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rama de Conocimiento</label>
              <select 
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedBranch || ''}
                onChange={(e) => setSelectedBranch(e.target.value || null)}
                disabled={isLoading}
              >
                <option value="">Seleccionar Rama</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Conjunto de Datos</label>
              <select 
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value || null)}
                disabled={isLoading || !selectedBranch}
              >
                <option value="">Seleccionar Dataset</option>
                {datasets.map(dataset => (
                  <option key={dataset} value={dataset}>
                    {dataset}
                  </option>
                ))}
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
                {models.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
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
                <option value="4bit">4-bit (Recomendado)</option>
                <option value="8bit">8-bit</option>
                <option value="none">Sin cuantización</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={startTraining} 
            disabled={!selectedBranch || !selectedDataset || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando Entrenamiento...
              </>
            ) : (
              <>
                <span role="img" aria-label="Zap" className="h-5 w-5 mr-2 text-2xl">⚡</span>
                Iniciar Entrenamiento Especializado
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          <span role="img" aria-label="Database" className="h-5 w-5 text-blue-500 text-2xl">💾</span>
          Estadísticas de Ramas
        </CardTitle>
        </CardHeader>
        <CardContent>
          {branchStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span role="img" aria-label="Database" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50 text-6xl">💾</span>
              <p className="text-lg font-medium">No hay estadísticas disponibles</p>
              <p className="text-sm">Inicia un entrenamiento para generar estadísticas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchStats.map((stat, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:bg-muted/20 transition-colors hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">
                      {stat.branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                      {stat.modelCount} modelos
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span role="img" aria-label="BookOpen" className="h-4 w-4">📚</span>
                        Datasets
                      </span>
                      <span className="font-semibold">{stat.datasetCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span role="img" aria-label="Target" className="h-4 w-4">🎯</span>
                        Precisión
                      </span>
                      <span className={`font-semibold ${getPerformanceColor(stat.averageAccuracy * 100)}`}>
                        {(stat.averageAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span role="img" aria-label="Users" className="h-4 w-4">👥</span>
                        Activos
                      </span>
                      <span className="font-semibold text-blue-600">{stat.activeTrainings}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span role="img" aria-label="TrendingUp" className="h-4 w-4">📈</span>
                        Tokens
                      </span>
                      <span className="font-semibold text-green-600">{stat.totalTokens.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span role="img" aria-label="Calendar" className="h-4 w-4">📅</span>
                        Último
                      </span>
                      <span className="text-sm">{new Date(stat.lastTrainingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Rendimiento</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className={`font-bold ${getPerformanceColor(stat.performance.trainingSpeed)}`}>
                          {stat.performance.trainingSpeed}%
                        </div>
                        <div className="text-muted-foreground">Velocidad</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${getPerformanceColor(stat.performance.memoryEfficiency)}`}>
                          {stat.performance.memoryEfficiency}%
                        </div>
                        <div className="text-muted-foreground">Memoria</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${getPerformanceColor(stat.performance.gpuUtilization)}`}>
                          {stat.performance.gpuUtilization}%
                        </div>
                        <div className="text-muted-foreground">GPU</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {trainingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="BarChart" className="h-5 w-5 text-purple-500 text-2xl">📊</span>
              Historial de Entrenamientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainingHistory.slice(0, 5).map((training, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{training.modelName}</p>
                      <p className="text-sm text-muted-foreground">{training.branch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{training.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(training.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
