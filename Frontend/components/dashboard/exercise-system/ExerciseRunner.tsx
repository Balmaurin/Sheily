'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  RotateCcw,
  Send,
  Clock,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Trophy,
  Brain,
  Database
} from "lucide-react";

interface ExerciseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  maxLength: number;
  minQualityScore: number;
  instructions: string;
  examplePrompt: string;
  tags: string[];
  isActive: boolean;
  datasetValue: number;
}

interface ExerciseSession {
  id: string;
  exerciseId: string;
  startTime: Date;
  endTime?: Date;
  response: string;
  qualityScore?: number;
  status: 'in_progress' | 'completed' | 'submitted';
  timeSpent: number;
  tokensEarned: number;
}

export function ExerciseRunner() {
  const [currentExercise, setCurrentExercise] = useState<ExerciseTemplate | null>(null);
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [response, setResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [availableExercises, setAvailableExercises] = useState<ExerciseTemplate[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Cargar ejercicios disponibles
  useEffect(() => {
    loadAvailableExercises();
  }, []);

  // Timer para el ejercicio
  useEffect(() => {
    if (isRunning && session && currentExercise) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!.getTime()) / 1000);
        const remaining = Math.max(0, (currentExercise.estimatedTime * 60) - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          pauseExercise();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, session, currentExercise]);

  const loadAvailableExercises = async () => {
    try {
      const response = await fetch('/api/exercises/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const startExercise = (exercise: ExerciseTemplate) => {
    const newSession: ExerciseSession = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      startTime: new Date(),
      response: '',
      status: 'in_progress',
      timeSpent: 0,
      tokensEarned: 0
    };

    setCurrentExercise(exercise);
    setSession(newSession);
    setResponse('');
    setTimeLeft(exercise.estimatedTime * 60);
    setIsRunning(true);
    setQualityScore(null);
    setFeedback('');
    startTimeRef.current = new Date();
  };

  const pauseExercise = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeExercise = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
  };

  const resetExercise = () => {
    setCurrentExercise(null);
    setSession(null);
    setResponse('');
    setTimeLeft(0);
    setIsRunning(false);
    setQualityScore(null);
    setFeedback('');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const submitExercise = async () => {
    if (!session || !currentExercise || !response.trim()) {
      alert('Por favor escribe una respuesta antes de enviar');
      return;
    }

    setIsSubmitting(true);
    try {
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

      const submissionData = {
        sessionId: session.id,
        exerciseId: session.exerciseId,
        response: response.trim(),
        timeSpent,
        responseLength: response.length
      };

      const submitResponse = await fetch('/api/exercises/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (submitResponse.ok) {
        const result = await submitResponse.json();

        setQualityScore(result.qualityScore);
        setFeedback(result.feedback);

        // Actualizar sesión
        setSession(prev => prev ? {
          ...prev,
          status: 'submitted',
          endTime,
          timeSpent,
          qualityScore: result.qualityScore,
          tokensEarned: result.tokensEarned
        } : null);

        setIsRunning(false);

        // Mostrar resultado
        if (result.qualityScore >= currentExercise.minQualityScore) {
          alert(`¡Excelente! Has ganado ${result.tokensEarned} tokens. Tu respuesta se agregó al dataset de entrenamiento.`);
        } else {
          alert(`Tu respuesta necesita mejorar. Puntaje: ${result.qualityScore}%. Inténtalo de nuevo para ganar tokens.`);
        }
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      alert('Error al enviar el ejercicio. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!currentExercise) return 0;
    const totalTime = currentExercise.estimatedTime * 60;
    const elapsed = totalTime - timeLeft;
    return Math.min(100, (elapsed / totalTime) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Ejecutor de Ejercicios
          </h2>
          <p className="text-muted-foreground">
            Completa ejercicios de IA y gana tokens mientras generas datasets valiosos
          </p>
        </div>
        {session && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{currentExercise?.datasetValue} tokens</span>
            </div>
          </div>
        )}
      </div>

      {!currentExercise ? (
        // Lista de ejercicios disponibles
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ejercicios Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExercises.filter(ex => ex.isActive).map(exercise => (
              <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {exercise.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exercise.estimatedTime}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {exercise.maxLength} chars
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {exercise.datasetValue} tokens
                      </div>
                    </div>
                    {exercise.tags && exercise.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercise.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={() => startExercise(exercise)}
                      className="w-full mt-3"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Ejercicio
                    </Button>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // Ejercicio en ejecución
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{currentExercise.title}</CardTitle>
                  <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                    {currentExercise.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {isRunning ? (
                    <Button onClick={pauseExercise} variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  ) : (
                    <Button onClick={resumeExercise} variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Reanudar
                    </Button>
                  )}
                  <Button onClick={resetExercise} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reiniciar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiempo restante</Label>
                <div className="flex items-center gap-4">
                  <Progress value={getProgressPercentage()} className="flex-1" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Instrucciones:</h4>
                <p className="text-sm">{currentExercise.instructions}</p>
              </div>

              {currentExercise.examplePrompt && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Ejemplo de respuesta esperada:
                  </h4>
                  <p className="text-sm italic">{currentExercise.examplePrompt}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="response">
                  Tu respuesta ({response.length}/{currentExercise.maxLength} caracteres)
                </Label>
                <Textarea
                  id="response"
                  placeholder="Escribe tu respuesta aquí..."
                  value={response}
                  onChange={(e) => {
                    if (e.target.value.length <= currentExercise.maxLength) {
                      setResponse(e.target.value);
                    }
                  }}
                  rows={8}
                  disabled={!isRunning || session?.status === 'submitted'}
                />
              </div>

              {qualityScore !== null && (
                <Alert className={qualityScore >= currentExercise.minQualityScore ? "border-green-500" : "border-red-500"}>
                  <div className="flex items-center gap-2">
                    {qualityScore >= currentExercise.minQualityScore ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <strong>Puntaje de calidad: {qualityScore}%</strong>
                      {qualityScore >= currentExercise.minQualityScore ? (
                        <span className="text-green-600 ml-2">
                          ¡Felicitaciones! Has ganado {session?.tokensEarned} tokens.
                          Tu respuesta se agregó al dataset de entrenamiento.
                        </span>
                      ) : (
                        <span className="text-red-600 ml-2">
                          Tu respuesta necesita mejorar para alcanzar el mínimo de {currentExercise.minQualityScore}%.
                        </span>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {feedback && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Retroalimentación:</strong> {feedback}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={submitExercise}
                  disabled={!isRunning || !response.trim() || isSubmitting || session?.status === 'submitted'}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Evaluando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Respuesta
                    </>
                  )}
                </Button>
                <Button onClick={resetExercise} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nuevo Ejercicio
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Información del Dataset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentExercise.datasetValue}</div>
                  <div className="text-sm text-muted-foreground">Tokens por respuesta de calidad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentExercise.minQualityScore}%</div>
                  <div className="text-sm text-muted-foreground">Puntaje mínimo requerido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentExercise.totalSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Total de envíos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
