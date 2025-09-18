import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { TrainingService, ModelPerformance } from '../../services/trainingService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '../ui/badge';
// Iconos removidos temporalmente para evitar errores de tipos

export function ModelPerformanceDashboard() {
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModelPerformance();
  }, []);

  const fetchModelPerformance = async () => {
    setIsLoading(true);
    try {
      const performanceData = await TrainingService.getModelPerformance();
      setModels(performanceData);
      
      // Seleccionar el primer modelo por defecto
      if (performanceData.length > 0) {
        setSelectedModel(performanceData[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el rendimiento de los modelos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar modelos
  const filteredModels = models.filter(model => {
    const matchesType = filterType === 'all' || model.type === filterType;
    const matchesSearch = model.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.modelDetails?.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderChart = (metricType: 'accuracy' | 'loss' | 'f1Score') => {
    if (!selectedModel) return null;

    const chartLabels = {
      accuracy: "Precisión",
      loss: "Loss",
      f1Score: "F1 Score"
    };

    const chartIcons = {
      accuracy: "📈",
      loss: "📉", 
      f1Score: "🎯"
    };

    const chartColors = {
      accuracy: "text-green-500",
      loss: "text-red-500",
      f1Score: "text-blue-500"
    };

    const metrics = selectedModel.metrics[metricType];
    const currentValue = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const previousValue = metrics && metrics.length > 1 ? metrics[metrics.length - 2] : currentValue;
    const improvement = currentValue !== null && previousValue !== null ? currentValue - previousValue : 0;
    const isImproving = improvement > 0;

    if (!currentValue) return null;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {chartIcons[metricType]}
              <CardTitle className="text-lg">{chartLabels[metricType]}</CardTitle>
            </div>
            <Badge variant={isImproving ? "default" : "secondary"}>
              {isImproving ? "↑" : "↓"} {Math.abs(improvement * 100).toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Valor actual */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${chartColors[metricType]}`}>
                {metricType === 'loss' ? currentValue.toFixed(4) : `${(currentValue * 100).toFixed(2)}%`}
              </div>
              <p className="text-sm text-muted-foreground">Valor actual</p>
            </div>

            {/* Gráfico de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Época 1</span>
                <span>Época {metrics.length}</span>
              </div>
              <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-end">
                  {metrics.map((value, index) => {
                    const height = metricType === 'loss' 
                      ? Math.max(5, (1 - value) * 100) 
                      : value * 100;
                    const color = metricType === 'loss' 
                      ? `hsl(${Math.max(0, 120 - height * 1.2)}, 70%, 50%)`
                      : `hsl(${120 + height * 60}, 70%, 50%)`;
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-current"
                        style={{
                          height: `${height}%`,
                          backgroundColor: color,
                          opacity: 0.8
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">Mejor</div>
                <div className={chartColors[metricType]}>
                  {metricType === 'loss' 
                    ? Math.min(...metrics).toFixed(4)
                    : `${(Math.max(...metrics) * 100).toFixed(2)}%`
                  }
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-semibold">Promedio</div>
                <div className={chartColors[metricType]}>
                  {metricType === 'loss'
                    ? (metrics.reduce((a, b) => a + b, 0) / metrics.length).toFixed(4)
                    : `${((metrics.reduce((a, b) => a + b, 0) / metrics.length) * 100).toFixed(2)}%`
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rendimiento de Modelos</h2>
          <p className="text-muted-foreground">
            Sistema de 32 ramas especializadas con métricas en tiempo real
          </p>
        </div>
        
        {/* Contador de modelos */}
        <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-lg">
          <span className="text-xl text-primary">📊</span>
          <span className="font-semibold text-primary">
            {filteredModels.length} / {models.length} modelos
          </span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Cargando rendimiento de modelos...</div>
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay modelos entrenados
        </div>
      ) : (
        <>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Todos ({models.length})
              </button>
              <button
                onClick={() => setFilterType('Branch Adapter')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'Branch Adapter'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Ramas Especializadas ({models.filter(m => m.type === 'Branch Adapter').length})
              </button>
            </div>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o dominio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Selector de modelo mejorado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredModels.map((model) => (
              <button
                key={model.modelName}
                onClick={() => setSelectedModel(model)}
                className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedModel?.modelName === model.modelName
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                    : 'bg-background border-border hover:bg-muted hover:border-primary/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm truncate">
                    {model.modelName.replace('Sheily-', '').replace('-Model', '')}
                  </div>
                  <div className="text-xs opacity-80 truncate">
                    {model.modelDetails?.domain?.replace(/_/g, ' ')}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {model.type}
                    </Badge>
                    <div className="text-xs opacity-60">
                      {(model.metrics.accuracy[model.metrics.accuracy.length - 1] * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedModel && (
            <div className="space-y-6">
              {/* Información del modelo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedModel.modelName}</CardTitle>
                      <p className="text-muted-foreground">
                        Rama especializada en {selectedModel.modelDetails?.domain?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{selectedModel.type}</Badge>
                      <Badge variant="outline">
                        <span className="mr-1">⚙️</span>
                        {selectedModel.modelDetails?.baseModel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">📈</div>
                      <p className="text-sm text-muted-foreground">Precisión</p>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedModel.metrics.accuracy && selectedModel.metrics.accuracy.length > 0 
                          ? `${(selectedModel.metrics.accuracy[selectedModel.metrics.accuracy.length - 1] * 100).toFixed(2)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-red-600">📉</div>
                      <p className="text-sm text-muted-foreground">Loss</p>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedModel.metrics.loss && selectedModel.metrics.loss.length > 0 
                          ? selectedModel.metrics.loss[selectedModel.metrics.loss.length - 1].toFixed(4)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">🎯</div>
                      <p className="text-sm text-muted-foreground">F1 Score</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {selectedModel.metrics.f1Score && selectedModel.metrics.f1Score.length > 0 
                          ? `${(selectedModel.metrics.f1Score[selectedModel.metrics.f1Score.length - 1] * 100).toFixed(2)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">⚡</div>
                      <p className="text-sm text-muted-foreground">Mejor Época</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {selectedModel.performanceDetails?.bestEpoch || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Tipo:</span> {selectedModel.type}
                      </div>
                      <div>
                        <span className="font-semibold">Base Model:</span> {selectedModel.modelDetails?.baseModel || 'Phi-3-mini'}
                      </div>
                      <div>
                        <span className="font-semibold">Cuantización:</span> {selectedModel.modelDetails?.quantization || '4bit'}
                      </div>
                      <div>
                        <span className="font-semibold">Dominio:</span> {selectedModel.modelDetails?.domain?.replace(/_/g, ' ') || 'general'}
                      </div>
                      <div>
                        <span className="font-semibold">Dataset:</span> {selectedModel.trainingDataset}
                      </div>
                      <div>
                        <span className="font-semibold">Tamaño Dataset:</span> {selectedModel.performanceDetails?.datasetSize?.toLocaleString() || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Tiempo Entrenamiento:</span> {selectedModel.performanceDetails?.totalTrainingTime || 'N/A'} min
                      </div>
                      <div>
                        <span className="font-semibold">Último Entrenamiento:</span> {selectedModel.lastTrainingDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráficos de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderChart('accuracy')}
                {renderChart('loss')}
                {renderChart('f1Score')}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
