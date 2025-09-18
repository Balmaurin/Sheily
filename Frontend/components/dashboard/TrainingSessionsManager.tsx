import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { TrainingService, TrainingSession } from '../../services/trainingService';
import { toast } from '../ui/use-toast';

export function TrainingSessionsManager() {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainingSessions();
  }, []);

  const fetchTrainingSessions = async () => {
    setIsLoading(true);
    try {
      const sessions = await TrainingService.getTrainingSessions();
      setTrainingSessions(sessions);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones de entrenamiento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewSessionDetails = (session: TrainingSession) => {
    setSelectedSession(session);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sesiones de Entrenamiento</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Cargando sesiones de entrenamiento...
            </div>
          ) : trainingSessions.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No hay sesiones de entrenamiento
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Conjunto de Datos</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>{session.modelName}</TableCell>
                    <TableCell>{session.datasetName}</TableCell>
                    <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(session.status)}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewSessionDetails(session)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Sesión: {selectedSession.modelName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Información General</h3>
                <p>Conjunto de Datos: {selectedSession.datasetName}</p>
                <p>Inicio: {new Date(selectedSession.startTime).toLocaleString()}</p>
                {selectedSession.endTime && (
                  <p>Fin: {new Date(selectedSession.endTime).toLocaleString()}</p>
                )}
                <p>Épocas: {selectedSession.epochs}</p>
                <p>Tasa de Aprendizaje: {selectedSession.learningRate}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Métricas</h3>
                {selectedSession.metrics ? (
                  <>
                    <p>Loss: {selectedSession.metrics.loss.toFixed(4)}</p>
                    <p>Precisión: {(selectedSession.metrics.accuracy * 100).toFixed(2)}%</p>
                    <p>F1 Score: {(selectedSession.metrics.f1Score * 100).toFixed(2)}%</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Métricas no disponibles</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
