'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '../ui/card';
import { Button } from '../ui/button';
import { TrainingService } from '../../services/trainingService';
import { ModelPerformanceDashboard } from './ModelPerformanceDashboard';
import { ProjectsManager } from './projects-manager';
import { TokenVault } from './token-vault';
import { TrainingSessionsManager } from './TrainingSessionsManager';
import { AIChat } from './ai-chat';
import { Badge } from '../ui/badge';
import { toast } from "@/components/ui/use-toast";

export function TrainingDashboard() {
  const [trainingSummary, setTrainingSummary] = useState<{
    totalModels: number;
    completedTrainings: number;
    activeTrainings: number;
    tokens: number;
  } | null>(null);

  const [selectedTab, setSelectedTab] = useState('overview');

  // Obtener datos reales del entrenamiento
  useEffect(() => {
    const fetchRealTrainingData = async () => {
      try {
        const response = await fetch('/api/training/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTrainingSummary(data);
        } else {
          throw new Error('Error obteniendo datos de entrenamiento');
        }
      } catch (error) {
        toast({
          title: "Error de Entrenamiento",
          description: "No se pudieron cargar los datos de entrenamiento",
          variant: "destructive"
        });
      } finally {
        // setLoading(false); // This line was not in the new_code, so it's removed.
      }
    };

    fetchRealTrainingData();
  }, []);

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Modelos Entrenados</CardTitle>
          <CardDescription>Total de modelos en tu sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {trainingSummary?.totalModels || 0}
          </div>
          <span role="img" aria-label="Trophy" className="h-8 w-8 text-primary text-4xl">🏆</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos Completados</CardTitle>
          <CardDescription>Sesiones de entrenamiento finalizadas</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {trainingSummary?.completedTrainings || 0}
          </div>
          <span role="img" aria-label="Code" className="h-8 w-8 text-green-500 text-4xl">✅</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos Activos</CardTitle>
          <CardDescription>Sesiones en progreso</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {trainingSummary?.activeTrainings || 0}
          </div>
          <span role="img" aria-label="Brain" className="h-8 w-8 text-yellow-500 text-4xl">🧠</span>
        </CardContent>
      </Card>
    </div>
  );

  // Navegación simplificada sin Tabs
  const renderNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { value: 'overview', label: '🏆 Resumen' },
        { value: 'models', label: '🧮 Modelos' },
        { value: 'projects', label: '👨‍💻 Proyectos' },
        { value: 'sessions', label: '💾 Sesiones' },
        { value: 'tokens', label: '🧪 Tokens' },
        { value: 'chat', label: '💬 IA Chat' },
        { value: 'settings', label: '⚙️ Configuración' },
        { value: 'security', label: '🛡️ Seguridad' }
      ].map(tab => (
        <button
          key={tab.value}
          onClick={() => setSelectedTab(tab.value)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            selectedTab === tab.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:bg-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {renderOverview()}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Configuración de Cuenta</h2>
                <span role="img" aria-label="Settings" className="h-8 w-8 text-4xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Estado del Sistema</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>CPU</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memoria</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GPU</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'models':
        return <ModelPerformanceDashboard />;
      case 'projects':
        return <ProjectsManager />;
      case 'sessions':
        return <TrainingSessionsManager />;
      case 'tokens':
        return <TokenVault />;
      case 'chat':
        return <AIChat />;
      case 'settings':
        return (
          <div className="text-center py-20">
            <span role="img" aria-label="Settings" className="text-6xl mb-4 block">⚙️</span>
            <h2 className="text-2xl font-semibold mb-4">Configuración</h2>
            <p className="text-muted-foreground">
              Panel de configuración en desarrollo
            </p>
          </div>
        );
      case 'security':
        return (
          <div className="text-center py-20">
            <span role="img" aria-label="Security" className="text-6xl mb-4 block">🛡️</span>
            <h2 className="text-2xl font-semibold mb-4">Seguridad</h2>
            <p className="text-muted-foreground">
              Panel de seguridad en desarrollo
            </p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Entrenamiento</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            Tokens: {trainingSummary?.tokens || 0}
          </Badge>
          <Button variant="outline">
            <span role="img" aria-label="Refresh" className="mr-2">🔄</span>
            Actualizar
          </Button>
        </div>
      </div>

      {renderNavigation()}
      {renderContent()}
    </div>
  );
}
