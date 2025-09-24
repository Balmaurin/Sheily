'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Forzar renderizado dinámico para evitar prerendering
export const dynamic = 'force-dynamic';

// Providers
import { DatasetProvider } from "@/components/providers/DatasetProvider";
import { VaultProvider } from "@/components/providers/VaultProvider";
import { UserProvider } from "@/components/providers/UserProvider";
import { SecurityProvider } from "@/components/providers/SecurityProvider";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importaciones de componentes de dashboard
import { ModelPerformanceDashboard } from "@/components/dashboard/ModelPerformanceDashboard";
import { ProjectsManager } from "@/components/dashboard/projects-manager";
import { TokenVault } from "@/components/dashboard/token-vault";
import { TrainingSessionsManager } from "@/components/dashboard/TrainingSessionsManager";
import { AIChat } from "@/components/dashboard/ai-chat";
import { Overview } from "@/components/dashboard/Overview";
import { Datasets } from "@/components/dashboard/Datasets";
import { Telemetry } from "@/components/dashboard/Telemetry";
import { Security } from "@/components/dashboard/Security";
import { Settings as SettingsComponent } from "@/components/dashboard/Settings";
import { Rewards } from "@/components/dashboard/Rewards";
import { TrainingStudio } from "@/components/dashboard/TrainingStudio";
import { TrainingSection } from "@/components/dashboard/training-section";
import { TrainingManagement } from "@/components/dashboard/TrainingManagement";
import { PromptManager } from "@/components/dashboard/PromptManager";
import { ExerciseCreator } from "@/components/dashboard/exercise-system/ExerciseCreator";
import { ExerciseRunner } from "@/components/dashboard/exercise-system/ExerciseRunner";
import { TrainingController } from "@/components/dashboard/training-control/TrainingController";
import { PersonalMemoryChat } from "@/components/dashboard/personal-memory-chat/PersonalMemoryChat";
import { TokenVaultBlockchain } from "@/components/dashboard/token-vault/TokenVaultBlockchain";
import { PinAccessDialog } from "@/components/dashboard/PinAccessDialog";

// Servicios

const PROTECTED_TABS: Record<string, string> = {
  tokens: "la caja fuerte de tokens",
  "memory-chat": "tu memoria personal",
  wallet: "la wallet Phantom del proyecto",
};

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [unlockedTabs, setUnlockedTabs] = useState<Record<string, boolean>>({});
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pendingProtectedTab, setPendingProtectedTab] = useState<string | null>(null);

  const pendingLabel = useMemo(() => {
    if (!pendingProtectedTab) return 'esta sección protegida';
    return PROTECTED_TABS[pendingProtectedTab] ?? 'esta sección protegida';
  }, [pendingProtectedTab]);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleTabChange = (value: string) => {
    const requiresPin = Boolean(PROTECTED_TABS[value]);
    if (requiresPin && !unlockedTabs[value]) {
      setPendingProtectedTab(value);
      setPinDialogOpen(true);
      return;
    }
    setActiveTab(value);
  };

  const handlePinSuccess = () => {
    if (!pendingProtectedTab) {
      return;
    }

    setUnlockedTabs((prev) => ({ ...prev, [pendingProtectedTab]: true }));
    setActiveTab(pendingProtectedTab);
    setPendingProtectedTab(null);
    setPinDialogOpen(false);
  };

  const handlePinDialogChange = (open: boolean) => {
    setPinDialogOpen(open);
    if (!open) {
      setPendingProtectedTab(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        <p className="ml-2">Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <SecurityProvider>
      <UserProvider>
        <VaultProvider>
          <DatasetProvider>
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">
                  🧠 Panel de Control de Sheily AI
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium">
                    Bienvenido, {user?.username || 'Usuario'}
                  </span>
                  <Button variant="outline">
                    ⚙️ Configuración
                  </Button>
                </div>
              </div>

              {/* Dashboard Principal con Pestañas */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="inline-flex w-full flex-wrap justify-between gap-2 text-xs">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <span role="img" aria-label="Brain">🧠</span>
                    <span>Visión General</span>
                  </TabsTrigger>
                  <TabsTrigger value="models" className="flex items-center space-x-2">
                    <span role="img" aria-label="Cpu">💻</span>
                    <span>Modelos</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <span role="img" aria-label="MessageCircle">💬</span>
                    <span>Chat IA</span>
                  </TabsTrigger>
                  <TabsTrigger value="training" className="flex items-center space-x-2">
                    <span role="img" aria-label="Target">🎯</span>
                    <span>Entrenamiento</span>
                  </TabsTrigger>
                  <TabsTrigger value="datasets" className="flex items-center space-x-2">
                    <span role="img" aria-label="Database">🗄️</span>
                    <span>Datasets</span>
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex items-center space-x-2">
                    <span role="img" aria-label="Code">💻</span>
                    <span>Proyectos</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center space-x-2">
                    <span role="img" aria-label="Shield">🛡️</span>
                    <span>Seguridad</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center space-x-2">
                    <span role="img" aria-label="Settings">⚙️</span>
                    <span>Ajustes</span>
                  </TabsTrigger>
                  <TabsTrigger value="exercises" className="flex items-center space-x-2">
                    <span role="img" aria-label="Target">🎯</span>
                    <span>Ejercicios</span>
                  </TabsTrigger>
                  <TabsTrigger value="training-control" className="flex items-center space-x-2">
                    <span role="img" aria-label="Cpu">🚀</span>
                    <span>Control LLM</span>
                  </TabsTrigger>
                  <TabsTrigger value="memory-chat" className="flex items-center space-x-2">
                    <span role="img" aria-label="Lock">🔒</span>
                    <span>Memoria Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="flex items-center space-x-2">
                    <span role="img" aria-label="Coins">💰</span>
                    <span>Tokens SHEILY</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex items-center space-x-2">
                    <span role="img" aria-label="Wallet">👛</span>
                    <span>Wallet Phantom</span>
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña: Visión General */}
                <TabsContent value="overview" className="space-y-6">
                  <Overview onGoTraining={() => handleTabChange('training')} />
                </TabsContent>

                {/* Pestaña: Modelos - Sistema LoRA con 35 Ramas Especializadas */}
                <TabsContent value="models" className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-2">🔧 Sistema LoRA de Sheily AI</h2>
                      <p className="text-muted-foreground">
                        Modelo Llama-3.2-3B-Instruct-Q8_0 con sistema LoRA para 35 ramas especializadas de dominio
                      </p>
                    </div>
                    
                    {/* Arquitectura del Sistema LoRA */}
                    <div className="max-w-4xl mx-auto">
                      <Card className="border-2 border-purple-200">
                        <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                          <CardTitle className="flex items-center space-x-2 text-purple-800">
                            <span role="img" aria-label="Target">🎯</span>
                            <span>Llama-3.2-3B-Instruct-Q8_0 + Sistema LoRA</span>
                          </CardTitle>
                          <CardDescription>
                            Modelo base con adaptadores LoRA para especialización de dominios sin modificar el modelo original
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-semibold text-purple-800 mb-3">📊 Especificaciones del Modelo:</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">Arquitectura:</span>
                                  <span className="text-purple-600">LoRA + Modelo Base</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Cuantización Base:</span>
                                  <span className="text-purple-600">Q8_0 (4-bit optimizado)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Parámetros Base:</span>
                                  <span className="text-purple-600">3B (Llama-3.2)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Memoria Base:</span>
                                  <span className="text-purple-600">~2.2GB VRAM</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Adaptadores LoRA:</span>
                                  <span className="text-purple-600">0.1-1% parámetros entrenables</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Ramas Especializadas:</span>
                                  <span className="text-green-600">35 disponibles</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-purple-800 mb-3">🚀 Capacidades de Entrenamiento:</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">Fine-tuning:</span>
                                  <span className="text-green-600">✅ Habilitado</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">LoRA:</span>
                                  <span className="text-green-600">✅ Soporte completo</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Aprendizaje Continuo:</span>
                                  <span className="text-green-600">✅ Activo</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Optimización:</span>
                                  <span className="text-green-600">✅ Automática</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Monitoreo:</span>
                                  <span className="text-green-600">✅ Tiempo real</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Backup:</span>
                                  <span className="text-green-600">✅ Automático</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                              🚀 Gestionar Modelo LLM
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Dashboard de Rendimiento de Modelos */}
                    <ModelPerformanceDashboard />
                  </div>
                </TabsContent>

                {/* Pestaña: Chat IA */}
                <TabsContent value="chat" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">💬 Chat IA Inteligente</h2>
                    <p className="text-muted-foreground">
                      Interactúa con el modelo Llama-3.2-3B-Instruct-Q8_0 para consultas y asistencia
                    </p>
                  </div>
                  <AIChat />
                </TabsContent>

                {/* Pestaña: Entrenamiento */}
                <TabsContent value="training" className="space-y-6">
                  <TrainingSection />
                </TabsContent>

                {/* Pestaña: Datasets */}
                <TabsContent value="datasets" className="space-y-6">
                  <Datasets />
                </TabsContent>

                {/* Pestaña: Proyectos */}
                <TabsContent value="projects" className="space-y-6">
                  <ProjectsManager />
                </TabsContent>

                {/* Pestaña: Seguridad */}
                <TabsContent value="security" className="space-y-6">
                  <Security />
                </TabsContent>

                {/* Pestaña: Ajustes */}
                <TabsContent value="settings" className="space-y-6">
                  <SettingsComponent />
                </TabsContent>

                {/* Pestaña: Ejercicios */}
                <TabsContent value="exercises" className="space-y-6">
                  <Tabs defaultValue="create-exercise" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="create-exercise">Crear Ejercicio</TabsTrigger>
                      <TabsTrigger value="run-exercise">Completar Ejercicio</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create-exercise">
                      <ExerciseCreator />
                    </TabsContent>
                    <TabsContent value="run-exercise">
                      <ExerciseRunner />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Pestaña: Control de Entrenamiento LLM */}
                <TabsContent value="training-control" className="space-y-6">
                  <TrainingController />
                </TabsContent>

                {/* Pestaña: Chat con Memoria Personal */}
                <TabsContent value="memory-chat" className="space-y-6">
                  <PersonalMemoryChat />
                </TabsContent>

                {/* Pestaña: Tokens SHEILY */}
                <TabsContent value="tokens" className="space-y-6">
                  <TokenVault />
                </TabsContent>

                {/* Pestaña: Wallet Phantom & Blockchain */}
                <TabsContent value="wallet" className="space-y-6">
                  <TokenVaultBlockchain />
                </TabsContent>
              </Tabs>
            </div>
            <PinAccessDialog
              open={pinDialogOpen}
              onOpenChange={handlePinDialogChange}
              sectionLabel={pendingLabel}
              onUnlock={handlePinSuccess}
            />
          </DatasetProvider>
        </VaultProvider>
      </UserProvider>
    </SecurityProvider>
  );
}
    
