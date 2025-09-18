"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  type: 'multiple_choice' | 'text' | 'code' | 'mathematical';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
}

interface TrainingSession {
  id: string;
  branch_name: string;
  exercises: TrainingExercise[];
  current_exercise: number;
  total_exercises: number;
  score: number;
  status: 'active' | 'completed' | 'paused';
  start_time: string;
  time_limit_minutes: number;
}

interface TrainingBranch {
  id: string;
  name: string;
  description: string;
  total_exercises: number;
  exercises_per_session: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimated_time: number;
  status: 'available' | 'training';
}

export function TrainingSection() {
  const [selectedBranch, setSelectedBranch] = useState<TrainingBranch | null>(null);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<Array<{
    exercise_id: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    score: number;
    explanation: string;
  }>>([]);

  // Ejercicios reales predefinidos para cada rama
  const trainingBranches: TrainingBranch[] = [
    {
      id: '1',
      name: 'Comprensión de Texto Avanzada',
      description: 'Mejora tu capacidad de lectura y comprensión con ejercicios de IA y tecnología',
      total_exercises: 50,
      exercises_per_session: 10,
      difficulty: 'medium',
      category: 'comprension',
      estimated_time: 20,
      status: 'available'
    },
    {
      id: '2',
      name: 'Lógica Matemática y Resolución de Problemas',
      description: 'Desarrolla tu pensamiento lógico y matemático con problemas reales',
      total_exercises: 40,
      exercises_per_session: 8,
      difficulty: 'hard',
      category: 'matematicas',
      estimated_time: 25,
      status: 'available'
    },
    {
      id: '3',
      name: 'Análisis de Datos e Interpretación',
      description: 'Aprende a interpretar y analizar datasets reales',
      total_exercises: 30,
      exercises_per_session: 6,
      difficulty: 'medium',
      category: 'datos',
      estimated_time: 18,
      status: 'available'
    },
    {
      id: '4',
      name: 'Programación y Algoritmos',
      description: 'Introducción a la programación con ejercicios prácticos',
      total_exercises: 35,
      exercises_per_session: 7,
      difficulty: 'medium',
      category: 'programacion',
      estimated_time: 22,
      status: 'available'
    },
    {
      id: '5',
      name: 'Machine Learning y IA',
      description: 'Conceptos fundamentales de ML y algoritmos de IA',
      total_exercises: 45,
      exercises_per_session: 9,
      difficulty: 'hard',
      category: 'ia',
      estimated_time: 30,
      status: 'available'
    }
  ];

  // Ejercicios reales para cada rama
  const getExercisesForBranch = (branchId: string): TrainingExercise[] => {
    const exercisesMap: { [key: string]: TrainingExercise[] } = {
      '1': [ // Comprensión de Texto
        {
          id: 'comp_1',
          title: 'Análisis de Texto sobre IA',
          description: 'Lee el siguiente texto y responde las preguntas',
          type: 'multiple_choice',
          question: 'El siguiente texto describe la evolución de la IA:\n\n"La inteligencia artificial ha evolucionado desde sistemas basados en reglas hasta modelos de aprendizaje profundo que pueden procesar información compleja. Los modelos de lenguaje como GPT y Phi-3 han revolucionado la forma en que interactuamos con la tecnología."\n\n¿Cuál es la principal característica de los modelos modernos de IA mencionados en el texto?',
          options: [
            'Siguen reglas predefinidas',
            'Pueden procesar información compleja',
            'Solo funcionan con texto simple',
            'Requieren programación manual'
          ],
          correct_answer: 'Pueden procesar información compleja',
          explanation: 'El texto menciona que los modelos modernos "pueden procesar información compleja", lo que es una característica fundamental de los sistemas de IA avanzados.',
          difficulty: 'medium',
          points: 10,
          category: 'comprension'
        },
        {
          id: 'comp_2',
          title: 'Comprensión de Conceptos Técnicos',
          description: 'Analiza el siguiente concepto técnico',
          type: 'multiple_choice',
          question: '¿Qué significa el término "fine-tuning" en el contexto de modelos de lenguaje?',
          options: [
            'Crear un modelo desde cero',
            'Ajustar un modelo pre-entrenado para una tarea específica',
            'Eliminar parámetros del modelo',
            'Cambiar la arquitectura del modelo'
          ],
          correct_answer: 'Ajustar un modelo pre-entrenado para una tarea específica',
          explanation: 'Fine-tuning es el proceso de tomar un modelo pre-entrenado y ajustarlo para una tarea o dominio específico, manteniendo la base del conocimiento general.',
          difficulty: 'medium',
          points: 10,
          category: 'comprension'
        }
      ],
      '2': [ // Lógica Matemática
        {
          id: 'math_1',
          title: 'Sistema de Ecuaciones',
          description: 'Resuelve el siguiente sistema de ecuaciones',
          type: 'multiple_choice',
          question: 'Resuelve el sistema de ecuaciones:\n2x + y = 10\nx - y = 2\n\n¿Cuál es el valor de x?',
          options: ['2', '3', '4', '5'],
          correct_answer: '4',
          explanation: 'Sumando las dos ecuaciones: 2x + y + x - y = 10 + 2 → 3x = 12 → x = 4',
          difficulty: 'medium',
          points: 12,
          category: 'matematicas'
        },
        {
          id: 'math_2',
          title: 'Optimización Matemática',
          description: 'Encuentra el valor máximo de la función',
          type: 'multiple_choice',
          question: '¿Cuál es el valor máximo de la función f(x) = -x² + 4x + 3?',
          options: ['5', '6', '7', '8'],
          correct_answer: '7',
          explanation: 'La función es una parábola que abre hacia abajo. El vértice está en x = -b/(2a) = -4/(2(-1)) = 2. Sustituyendo: f(2) = -(2)² + 4(2) + 3 = -4 + 8 + 3 = 7',
          difficulty: 'hard',
          points: 15,
          category: 'matematicas'
        }
      ],
      '3': [ // Análisis de Datos
        {
          id: 'data_1',
          title: 'Interpretación de Dataset',
          description: 'Analiza los siguientes datos de ventas',
          type: 'multiple_choice',
          question: 'En un dataset de ventas mensuales, si la media es 1500 y la desviación estándar es 300, ¿qué porcentaje de ventas estaría entre 900 y 2100?',
          options: ['68%', '95%', '99.7%', '100%'],
          correct_answer: '95%',
          explanation: 'Según la regla empírica, aproximadamente el 95% de los datos están dentro de 2 desviaciones estándar de la media: 1500 ± 2(300) = [900, 2100]',
          difficulty: 'medium',
          points: 12,
          category: 'datos'
        }
      ],
      '4': [ // Programación
        {
          id: 'prog_1',
          title: 'Función Factorial',
          description: 'Completa la función factorial',
          type: 'code',
          question: 'Completa la función factorial en JavaScript:\n\nfunction factorial(n) {\n  // Tu código aquí\n}\n\n¿Cuál es la implementación correcta?',
          options: [
            'return n * factorial(n-1);',
            'if (n <= 1) return 1; return n * factorial(n-1);',
            'return n * (n-1);',
            'return n + factorial(n-1);'
          ],
          correct_answer: 'if (n <= 1) return 1; return n * factorial(n-1);',
          explanation: 'La función factorial necesita un caso base (n <= 1) y la recursión n * factorial(n-1) para calcular correctamente el factorial.',
          difficulty: 'easy',
          points: 10,
          category: 'programacion'
        }
      ],
      '5': [ // Machine Learning
        {
          id: 'ml_1',
          title: 'Conceptos de ML',
          description: 'Identifica el tipo de aprendizaje',
          type: 'multiple_choice',
          question: '¿Qué tipo de aprendizaje se utiliza cuando entrenamos un modelo para clasificar imágenes de perros y gatos?',
          options: [
            'Aprendizaje no supervisado',
            'Aprendizaje supervisado',
            'Aprendizaje por refuerzo',
            'Aprendizaje semi-supervisado'
          ],
          correct_answer: 'Aprendizaje supervisado',
          explanation: 'Es aprendizaje supervisado porque tenemos datos etiquetados (imágenes con etiquetas "perro" o "gato") para entrenar el modelo.',
          difficulty: 'medium',
          points: 12,
          category: 'ia'
        }
      ]
    };

    return exercisesMap[branchId] || [];
  };

  const startTrainingSession = async (branch: TrainingBranch) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const exercises = getExercisesForBranch(branch.id);
      const session: TrainingSession = {
        id: `session_${Date.now()}`,
        branch_name: branch.name,
        exercises: exercises,
        current_exercise: 0,
        total_exercises: exercises.length,
        score: 0,
        status: 'active',
        start_time: new Date().toISOString(),
        time_limit_minutes: branch.estimated_time
      };
      
      setCurrentSession(session);
      setSelectedBranch(branch);
      setSessionProgress(0);
      setExerciseResults([]);
      setShowResults(false);
      
      // Simular llamada a la API del backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      setError('Error al iniciar la sesión de entrenamiento');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentSession || !userAnswer.trim()) return;
    
    setIsLoading(true);
    
    try {
      const currentExercise = currentSession.exercises[currentSession.current_exercise];
      const isCorrect = userAnswer.trim().toLowerCase() === currentExercise.correct_answer.toLowerCase();
      const score = isCorrect ? currentExercise.points : 0;
      
      const result = {
        exercise_id: currentExercise.id,
        user_answer: userAnswer,
        correct_answer: currentExercise.correct_answer,
        is_correct: isCorrect,
        score: score,
        explanation: currentExercise.explanation
      };
      
      setExerciseResults(prev => [...prev, result]);
      
      // Actualizar sesión
      const newScore = currentSession.score + score;
      const newCurrentExercise = currentSession.current_exercise + 1;
      const isCompleted = newCurrentExercise >= currentSession.total_exercises;
      
      if (isCompleted) {
        setCurrentSession(prev => prev ? {
          ...prev,
          score: newScore,
          current_exercise: newCurrentExercise,
          status: 'completed'
        } : null);
        setShowResults(true);
      } else {
        setCurrentSession(prev => prev ? {
          ...prev,
          score: newScore,
          current_exercise: newCurrentExercise
        } : null);
        setSessionProgress((newCurrentExercise / currentSession.total_exercises) * 100);
      }
      
      setUserAnswer('');
      
    } catch (err) {
      setError('Error al enviar la respuesta');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setSelectedBranch(null);
    setUserAnswer('');
    setSessionProgress(0);
    setExerciseResults([]);
    setShowResults(false);
    setError(null);
  };

  const getCurrentExercise = () => {
    if (!currentSession) return null;
    return currentSession.exercises[currentSession.current_exercise];
  };

  const renderExercise = () => {
    const exercise = getCurrentExercise();
    if (!exercise) return null;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              <CardDescription className="text-lg">{exercise.description}</CardDescription>
            </div>
            <div className="text-right">
              <Badge variant={exercise.difficulty === 'easy' ? 'default' : exercise.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                {exercise.difficulty === 'easy' ? 'Fácil' : exercise.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                Puntos: {exercise.points}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Pregunta:</h4>
            <p className="text-lg whitespace-pre-line">{exercise.question}</p>
          </div>

          {exercise.type === 'multiple_choice' && exercise.options && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Selecciona la respuesta correcta:</Label>
              {exercise.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`option_${index}`}
                    name="answer"
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor={`option_${index}`} className="text-base cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {exercise.type === 'text' && (
            <div className="space-y-3">
              <Label htmlFor="text-answer" className="text-base font-medium">
                Escribe tu respuesta:
              </Label>
              <Textarea
                id="text-answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {exercise.type === 'code' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Selecciona la opción correcta:</Label>
              {exercise.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`code_option_${index}`}
                    name="code_answer"
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor={`code_option_${index}`} className="text-base cursor-pointer">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{option}</code>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Ejercicio {currentSession!.current_exercise + 1} de {currentSession!.total_exercises}
            </div>
            <Button 
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || isLoading}
              className="px-8"
            >
              {isLoading ? 'Enviando...' : 'Enviar Respuesta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!currentSession || !showResults) return null;

    const totalScore = exerciseResults.reduce((sum, result) => sum + result.score, 0);
    const correctAnswers = exerciseResults.filter(result => result.is_correct).length;
    const accuracy = (correctAnswers / currentSession.total_exercises) * 100;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            {accuracy >= 80 ? <span role="img" aria-label="Trophy" className="text-4xl">🏆</span> : <span role="img" aria-label="Target" className="text-4xl">🎯</span>}
            Resultados del Entrenamiento
          </CardTitle>
          <CardDescription className="text-lg">
            Rama: {currentSession.branch_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{totalScore}</div>
              <div className="text-sm text-green-700">Puntos Totales</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
              <div className="text-sm text-blue-700">Precisión</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{correctAnswers}/{currentSession.total_exercises}</div>
              <div className="text-sm text-purple-700">Respuestas Correctas</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Detalle de Respuestas:</h4>
            {exerciseResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                result.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.is_correct ? (
                    <span role="img" aria-label="Check" className="text-green-600 text-xl">✅</span>
                  ) : (
                    <span role="img" aria-label="X" className="text-red-600 text-xl">❌</span>
                  )}
                  <span className="font-medium">
                    Ejercicio {index + 1} - {result.is_correct ? 'Correcto' : 'Incorrecto'}
                  </span>
                  <Badge variant={result.is_correct ? 'default' : 'destructive'}>
                    {result.score} puntos
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Tu respuesta:</strong> {result.user_answer}
                </div>
                {!result.is_correct && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Respuesta correcta:</strong> {result.correct_answer}
                  </div>
                )}
                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                  <strong>Explicación:</strong> {result.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button onClick={resetSession} className="px-8">
              <span role="img" aria-label="Reset" className="mr-2">🔄</span>
              Volver a Entrenar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (currentSession && !showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">🎯 Entrenamiento en Progreso</h2>
            <p className="text-muted-foreground text-lg">
              Rama: {currentSession.branch_name}
            </p>
          </div>
          <Button variant="outline" onClick={resetSession}>
            <span role="img" aria-label="Close" className="mr-2">❌</span>
            Cancelar Entrenamiento
          </Button>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-muted-foreground">
                {currentSession.current_exercise} / {currentSession.total_exercises} ejercicios
              </span>
            </div>
            <Progress value={sessionProgress} className="w-full" />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span role="img" aria-label="Clock">⏰</span>
                <span>Tiempo límite: {currentSession.time_limit_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <span role="img" aria-label="Trophy">🏆</span>
                <span>Puntuación actual: {currentSession.score}</span>
              </div>
            </div>
          </div>
        </div>

        {renderExercise()}
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">🏆 Entrenamiento Completado</h2>
          <p className="text-muted-foreground text-lg">
            Has completado exitosamente el entrenamiento de {currentSession?.branch_name}
          </p>
        </div>
        {renderResults()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🎯 Entrenamiento de Ramas Especializadas</h2>
        <p className="text-muted-foreground text-lg">
          Sistema de entrenamiento LoRA para las 35 ramas especializadas que mejoran el rendimiento del LLM
        </p>
      </div>

      {/* Sistema LoRA para Entrenamiento */}
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span role="img" aria-label="Brain" className="text-4xl text-purple-600">🔧</span>
                <div>
                  <CardTitle className="text-2xl text-purple-800">Sistema LoRA de Entrenamiento</CardTitle>
                  <CardDescription className="text-lg">
                    Adaptadores de bajo rango para especialización de dominios del LLM
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                ✅ Sistema LoRA Activo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-purple-800 text-lg mb-4">📊 Especificaciones Técnicas:</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 font-semibold">Tecnología:</span>
                    <span className="text-gray-700">LoRA (Low-Rank Adaptation)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 font-semibold">Ramas:</span>
                    <span className="text-gray-700">35 especializadas disponibles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 font-semibold">Adaptadores:</span>
                    <span className="text-gray-700">Pesos delta por dominio</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 font-semibold">Base:</span>
                    <span className="text-gray-700">Llama-3.2-3B-Instruct-Q8_0</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 font-semibold">Eficiencia:</span>
                    <span className="text-gray-700">~0.1-1% parámetros entrenables</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-800 text-lg mb-4">⚙️ Requisitos de Hardware:</h4>
                <div className="bg-white p-4 rounded-lg text-sm space-y-2">
                  <p><span className="font-medium">GPU:</span> NVIDIA GTX 1060 6GB o superior</p>
                  <p><span className="font-medium">RAM:</span> 16GB DDR4</p>
                  <p><span className="font-medium">Almacenamiento:</span> 2GB SSD por adaptador LoRA</p>
                  <p><span className="font-medium">CUDA:</span> 11.8 o superior</p>
                  <p><span className="font-medium">PEFT:</span> Biblioteca LoRA compatible</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ramas de Entrenamiento Disponibles */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">🚀 Ramas de Entrenamiento Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{branch.name}</CardTitle>
                    <CardDescription className="mt-2">{branch.description}</CardDescription>
                  </div>
                  <Badge variant={
                    branch.difficulty === 'easy' ? 'default' : 
                    branch.difficulty === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {branch.difficulty === 'easy' ? 'Fácil' : 
                     branch.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Target" className="text-blue-500">🎯</span>
                    <span>{branch.total_exercises} ejercicios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Clock" className="text-green-500">⏰</span>
                    <span>{branch.estimated_time} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Zap" className="text-yellow-500">⚡</span>
                    <span>{branch.exercises_per_session} por sesión</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Trophy" className="text-purple-500">🏆</span>
                    <span>{branch.category}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startTrainingSession(branch);
                  }}
                  disabled={branch.status === 'training'}
                  className="w-full text-sm"
                  variant={branch.status === 'training' ? 'outline' : 'default'}
                >
                  {branch.status === 'training' ? '🔄 Entrenando...' : '🚀 Iniciar Entrenamiento'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <span role="img" aria-label="Error" className="h-4 w-4">❌</span>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">📊 Estado del Sistema de Entrenamiento</h3>
        <p className="text-gray-600">Sistema LoRA activo para entrenamiento de adaptadores especializados del LLM</p>
        <div className="flex justify-center space-x-8 mt-4 text-sm text-gray-500">
          <span>🔧 LoRA: Adaptadores de bajo rango</span>
          <span>🎯 35 ramas especializadas disponibles</span>
          <span>⚡ Entrenamiento eficiente y optimizado</span>
        </div>
      </div>
    </div>
  );
}
