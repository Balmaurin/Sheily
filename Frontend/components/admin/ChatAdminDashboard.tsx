"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface ChatMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  activeUsersCount: number;
  requestsPerMinute: Array<{ minute: number; count: number }>;
  errorsPerMinute: Array<{ minute: number; count: number; errors: Array<any> }>;
  modelStatus: string;
  uptime: number;
  uptimeFormatted: string;
  successRate: string;
  averageTokensPerRequest: string;
}

interface ChatAlert {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: string;
  metrics: any;
}

interface BackupInfo {
  filename: string;
  size: string;
  sizeBytes: number;
  created: string;
  modified: string;
}

export function ChatAdminDashboard() {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [alerts, setAlerts] = useState<ChatAlert[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();
    loadInitialData();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/chat-metrics');
    
    ws.onopen = () => {
      toast({
        title: "Conexión WebSocket",
        description: "Conectado al panel de administración de chat",
      });
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          setMetrics(data.data);
        } else if (data.type === 'alert') {
          setAlerts(prev => [data.data, ...prev.slice(0, 49)]); // Mantener solo las últimas 50
        }
      } catch (error) {
        toast({
          title: "Error de WebSocket",
          description: "No se pudo parsear el mensaje recibido",
          variant: "destructive"
        });
      }
    };
    
    ws.onclose = () => {
      toast({
        title: "Desconexión WebSocket",
        description: "Desconectado del panel de administración de chat",
      });
      setIsConnected(false);
      // Reconectar en 5 segundos
      setTimeout(connectWebSocket, 5000);
    };
    
    ws.onerror = (error) => {
      toast({
        title: "Error de WebSocket",
        description: "Problema en la conexión del panel de administración",
        variant: "destructive"
      });
    };
    
    wsRef.current = ws;
  };

  const loadInitialData = async () => {
    try {
      // Cargar métricas actuales
      const metricsResponse = await fetch('/api/admin/chat/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
      
      // Cargar alertas
      const alertsResponse = await fetch('/api/admin/chat/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }
      
      // Cargar backups
      const backupsResponse = await fetch('/api/admin/chat/backups');
      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json();
        setBackups(backupsData.backups || []);
      }
    } catch (error) {
      toast({
        title: "Error de carga de datos",
        description: "No se pudieron cargar los datos iniciales del panel de administración",
        variant: "destructive"
      });
    }
  };

  const forceBackup = async () => {
    try {
      const response = await fetch('/api/admin/chat/backup', { method: 'POST' });
      if (response.ok) {
        toast({
          title: "Backup iniciado",
          description: "Backup iniciado exitosamente",
        });
        // Recargar lista de backups
        loadInitialData();
      } else {
        toast({
          title: "Error de backup",
          description: "Error iniciando backup",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error de forzado de backup",
        description: "Error forzando backup",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'unavailable': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando métricas del chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Administración - Chat 4-bit</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del sistema de chat
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
          </Badge>
          <Button onClick={forceBackup} variant="outline">
            🔄 Forzar Backup
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
          <TabsTrigger value="metrics">📈 Métricas</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Alertas</TabsTrigger>
          <TabsTrigger value="backups">💾 Backups</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <span className="text-2xl">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.successfulRequests} exitosos, {metrics.failedRequests} fallidos
                </p>
              </CardContent>
            </Card>

            {/* Tasa de Éxito */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                <span className="text-2xl">✅</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.successRate}%</div>
                <Progress value={parseFloat(metrics.successRate)} className="mt-2" />
              </CardContent>
            </Card>

            {/* Tiempo de Respuesta */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <span className="text-2xl">⏱️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Última respuesta: {metrics.uptimeFormatted}
                </p>
              </CardContent>
            </Card>

            {/* Estado del Modelo */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Modelo</CardTitle>
                <span className="text-2xl">🤖</span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.modelStatus)}`}></div>
                  <span className="text-lg font-semibold capitalize">{metrics.modelStatus}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {metrics.uptimeFormatted}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Actividad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad por Minuto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-1">
                  {metrics.requestsPerMinute.slice(-10).map((minute, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(minute.count / Math.max(...metrics.requestsPerMinute.map(m => m.count))) * 200}px`,
                        width: '20px'
                      }}
                      title={`${minute.count} requests`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Últimos 10 minutos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errores por Minuto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-1">
                  {metrics.errorsPerMinute.slice(-10).map((minute, index) => (
                    <div
                      key={index}
                      className="bg-red-500 rounded-t"
                      style={{
                        height: `${(minute.count / Math.max(...metrics.errorsPerMinute.map(m => m.count), 1)) * 200}px`,
                        width: '20px'
                      }}
                      title={`${minute.count} errores`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Últimos 10 minutos
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Métricas Detalladas */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalladas del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Estadísticas de Tokens</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de tokens usados:</span>
                      <span className="font-mono">{metrics.totalTokensUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Promedio por respuesta:</span>
                      <span className="font-mono">{metrics.averageTokensPerRequest}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usuarios Activos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Usuarios activos:</span>
                      <span className="font-mono">{metrics.activeUsersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última actividad:</span>
                      <span className="font-mono">{metrics.uptimeFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sistema de Alertas</h3>
            <Badge variant="outline">
              {alerts.length} alertas activas
            </Badge>
          </div>
          
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Alert>
                <AlertDescription>
                  ✅ No hay alertas activas en este momento
                </AlertDescription>
              </Alert>
            ) : (
              alerts.map((alert, index) => (
                <Alert key={index} className="border-l-4 border-l-red-500">
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-semibold">{alert.type}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab: Backups */}
        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sistema de Backups</h3>
            <Button onClick={forceBackup} variant="outline">
              🔄 Crear Backup Manual
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Backups Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-muted-foreground">No hay backups disponibles</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{backup.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Creado: {new Date(backup.created).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">{backup.size}</p>
                        <p className="text-xs text-muted-foreground">
                          Modificado: {new Date(backup.modified).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
