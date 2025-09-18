'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Square,
  Settings,
  BarChart3,
  Cpu,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Layers,
  GitBranch
} from "lucide-react";

interface TrainingConfig {
  modelName: string;
  baseModel: string;
  trainingMethod: 'full-finetune' | 'lora' | 'qlora';
  dataset: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  maxLength: number;
  loraConfig?: {
    r: number;
    alpha: number;
    dropout: number;
    targetModules: string[];
  };
  quantization?: 'none' | '4bit' | '8bit';
  distributed: boolean;
  mixedPrecision: boolean;
}

interface TrainingSession {
  id: string;
  config: TrainingConfig;
  status: 'idle' | 'preparing' | 'training' | 'evaluating' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  perplexity: number;
  learningRate: number;
  estimatedTimeRemaining: number;
  startTime: Date;
  metrics: {
    trainLoss: number[];
    valLoss: number[];
    perplexity: number[];
    learningRate: number[];
  };
  checkpoints: string[];
  logs: string[];
}

interface ModelBranch {
  id: string;
  name: string;
  parentModel: string;
  creationDate: Date;
  trainingConfig: TrainingConfig;
  performance: {
    perplexity: number;
    accuracy: number;
    quality: number;
  };
  size: number;
  isActive: boolean;
}

export function TrainingController() {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);
  const [modelBranches, setModelBranches] = useState<ModelBranch[]>([]);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    modelName: '',
    baseModel: '',
    trainingMethod: 'lora',
    dataset: '',
    epochs: 3,
    batchSize: 4,
    learningRate: 2e-5,
    maxLength: 512,
    loraConfig: {
      r: 8,
      alpha: 16,
      dropout: 0.1,
      targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj']
    },
    quantization: '4bit',
    distributed: false,
    mixedPrecision: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadAvailableModels();
    loadAvailableDatasets();
    loadModelBranches();
    loadCurrentSession();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/training/models');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadAvailableDatasets = async () => {
    try {
      const response = await fetch('/api/training/datasets');
      if (response.ok) {
        const data = await response.json();
        setAvailableDatasets(data.datasets || []);
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  };

  const loadModelBranches = async () => {
    try {
      const response = await fetch('/api/training/branches');
      if (response.ok) {
        const data = await response.json();
        setModelBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadCurrentSession = async () => {
    try {
      const response = await fetch('/api/training/session/current');
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setCurrentSession(data.session);
        }
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

  const startTraining = async () => {
    if (!trainingConfig.modelName || !trainingConfig.baseModel || !trainingConfig.dataset) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const response = await fetch('/api/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingConfig)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        alert('Entrenamiento iniciado exitosamente');
      } else {
        const error = await response.text();
        alert(`Error al iniciar entrenamiento: ${error}`);
      }
    } catch (error) {
      console.error('Error starting training:', error);
      alert('Error al conectar con el servidor de entrenamiento');
    }
  };

  const pauseTraining = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/training/session/${currentSession.id}/pause`, {
        method: 'POST'
      });

      if (response.ok) {
        loadCurrentSession();
      }
    } catch (error) {
      console.error('Error pausing training:', error);
    }
  };

  const resumeTraining = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/training/session/${currentSession.id}/resume`, {
        method: 'POST'
      });

      if (response.ok) {
        loadCurrentSession();
      }
    } catch (error) {
      console.error('Error resuming training:', error);
    }
  };

  const stopTraining = async () => {
    if (!currentSession) return;

    if (!confirm('¿Estás seguro de que quieres detener el entrenamiento? Se perderá el progreso.')) {
      return;
    }

    try {
      const response = await fetch(`/api/training/session/${currentSession.id}/stop`, {
        method: 'POST'
      });

      if (response.ok) {
        setCurrentSession(null);
        alert('Entrenamiento detenido');
      }
    } catch (error) {
      console.error('Error stopping training:', error);
    }
  };

  const createModelBranch = async () => {
    if (!currentSession) return;

    const branchName = prompt('Nombre de la nueva rama:');
    if (!branchName) return;

    try {
      const response = await fetch('/api/training/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: branchName,
          sessionId: currentSession.id,
          config: trainingConfig
        })
      });

      if (response.ok) {
        loadModelBranches();
        alert('Rama creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'evaluating': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Cpu className="h-8 w-8" />
            Control de Entrenamiento LLM
          </h2>
          <p className="text-muted-foreground">
            Gestiona el entrenamiento completo de tu modelo con Fine-tuning y LoRA
          </p>
        </div>
        {currentSession && (
          <Badge className={getStatusColor(currentSession.status)}>
            {currentSession.status.toUpperCase()}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="control" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
          <TabsTrigger value="branches">Ramas</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-6">
          {currentSession ? (
            // Sesión activa
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Sesión de Entrenamiento Activa</span>
                    <Badge variant="outline">
                      {currentSession.config.modelName}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {currentSession.currentEpoch}/{currentSession.totalEpochs}
                      </div>
                      <div className="text-sm text-muted-foreground">Época</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {currentSession.progress.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Progreso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatTime(currentSession.estimatedTimeRemaining)}
                      </div>
                      <div className="text-sm text-muted-foreground">Tiempo restante</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso de la época</span>
                      <span>{currentSession.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={currentSession.progress} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{currentSession.loss.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{currentSession.perplexity.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Perplexity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{currentSession.learningRate.toExponential(2)}</div>
                      <div className="text-xs text-muted-foreground">Learning Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{currentSession.config.batchSize}</div>
                      <div className="text-xs text-muted-foreground">Batch Size</div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center">
                    {currentSession.status === 'training' ? (
                      <Button onClick={pauseTraining} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </Button>
                    ) : currentSession.status === 'paused' ? (
                      <Button onClick={resumeTraining}>
                        <Play className="h-4 w-4 mr-2" />
                        Reanudar
                      </Button>
                    ) : null}

                    <Button onClick={stopTraining} variant="destructive">
                      <Square className="h-4 w-4 mr-2" />
                      Detener
                    </Button>

                    <Button onClick={createModelBranch} variant="outline">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Crear Rama
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs de Entrenamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                    {currentSession.logs.slice(-20).map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // No hay sesión activa
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Iniciar Nuevo Entrenamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No hay una sesión de entrenamiento activa. Configura los parámetros y comienza un nuevo entrenamiento.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Entrenamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelName">Nombre del Modelo *</Label>
                  <Input
                    id="modelName"
                    placeholder="Mi Modelo Personalizado"
                    value={trainingConfig.modelName}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, modelName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseModel">Modelo Base *</Label>
                  <Select value={trainingConfig.baseModel} onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, baseModel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona modelo base" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Método de Entrenamiento</Label>
                  <Select value={trainingConfig.trainingMethod} onValueChange={(value: any) => setTrainingConfig(prev => ({ ...prev, trainingMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-finetune">Full Fine-tune</SelectItem>
                      <SelectItem value="lora">LoRA</SelectItem>
                      <SelectItem value="qlora">QLoRA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset *</Label>
                  <Select value={trainingConfig.dataset} onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, dataset: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDatasets.map(dataset => (
                        <SelectItem key={dataset} value={dataset}>
                          {dataset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantización</Label>
                  <Select value={trainingConfig.quantization} onValueChange={(value: any) => setTrainingConfig(prev => ({ ...prev, quantization: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin quantización</SelectItem>
                      <SelectItem value="4bit">4-bit</SelectItem>
                      <SelectItem value="8bit">8-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Épocas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={trainingConfig.epochs}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input
                    type="number"
                    min="1"
                    max="32"
                    value={trainingConfig.batchSize}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 4 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={trainingConfig.learningRate}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) || 2e-5 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    min="128"
                    max="2048"
                    value={trainingConfig.maxLength}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 512 }))}
                  />
                </div>
              </div>

              {trainingConfig.trainingMethod === 'lora' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuración LoRA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Rank (r)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="64"
                          value={trainingConfig.loraConfig?.r || 8}
                          onChange={(e) => setTrainingConfig(prev => ({
                            ...prev,
                            loraConfig: { ...prev.loraConfig!, r: parseInt(e.target.value) || 8 }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alpha</Label>
                        <Input
                          type="number"
                          min="1"
                          max="128"
                          value={trainingConfig.loraConfig?.alpha || 16}
                          onChange={(e) => setTrainingConfig(prev => ({
                            ...prev,
                            loraConfig: { ...prev.loraConfig!, alpha: parseInt(e.target.value) || 16 }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dropout</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="0.5"
                          value={trainingConfig.loraConfig?.dropout || 0.1}
                          onChange={(e) => setTrainingConfig(prev => ({
                            ...prev,
                            loraConfig: { ...prev.loraConfig!, dropout: parseFloat(e.target.value) || 0.1 }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={trainingConfig.distributed}
                    onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, distributed: checked }))}
                  />
                  <Label>Entrenamiento distribuido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={trainingConfig.mixedPrecision}
                    onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, mixedPrecision: checked }))}
                  />
                  <Label>Precisión mixta (FP16)</Label>
                </div>
              </div>

              <Button onClick={startTraining} className="w-full" size="lg">
                <Zap className="h-5 w-5 mr-2" />
                Iniciar Entrenamiento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {currentSession && currentSession.metrics ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas de Entrenamiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Training Loss</h4>
                      <div className="h-32 bg-muted rounded flex items-end justify-around p-2">
                        {currentSession.metrics.trainLoss.slice(-10).map((loss, index) => (
                          <div
                            key={index}
                            className="bg-blue-500 rounded-t w-4"
                            style={{ height: `${Math.max(10, (4 - loss) * 25)}px` }}
                            title={`Época ${currentSession.metrics.trainLoss.length - 10 + index + 1}: ${loss.toFixed(4)}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Validation Loss</h4>
                      <div className="h-32 bg-muted rounded flex items-end justify-around p-2">
                        {currentSession.metrics.valLoss.slice(-10).map((loss, index) => (
                          <div
                            key={index}
                            className="bg-green-500 rounded-t w-4"
                            style={{ height: `${Math.max(10, (4 - loss) * 25)}px` }}
                            title={`Época ${currentSession.metrics.valLoss.length - 10 + index + 1}: ${loss.toFixed(4)}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentSession.metrics.perplexity.slice(-1)[0]?.toFixed(2) || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">Perplexity Actual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.min(...currentSession.metrics.trainLoss).toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">Mejor Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentSession.checkpoints.length}</div>
                      <div className="text-sm text-muted-foreground">Checkpoints</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Checkpoints Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentSession.checkpoints.map((checkpoint, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-mono text-sm">{checkpoint}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Descargar</Button>
                          <Button size="sm" variant="outline">Cargar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No hay datos de monitoreo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Inicia una sesión de entrenamiento para ver métricas en tiempo real.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Ramas de Modelos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelBranches.map(branch => (
                  <div key={branch.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">{branch.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Basado en: {branch.parentModel}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs">Perplexity: {branch.performance.perplexity.toFixed(2)}</span>
                        <span className="text-xs">Tamaño: {(branch.size / 1024 / 1024).toFixed(1)}MB</span>
                        <span className="text-xs">Creado: {branch.creationDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Usar</Button>
                      <Button size="sm" variant="outline">Comparar</Button>
                      {branch.isActive && <Badge variant="default">Activa</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
