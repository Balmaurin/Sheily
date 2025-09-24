'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

import BranchExerciseService, {
  BranchExercise,
  BranchExercisesResponse,
  BranchSummary,
  ExerciseType,
  AttemptResponse,
} from '@/services/branchExerciseService';

import { Brain, CheckCircle2, Clock, FileCheck2, GaugeCircle, Target } from 'lucide-react';

interface AnswerState {
  answer: string;
  optionKey: string | null;
}

const exerciseLabels: Record<ExerciseType, string> = {
  yes_no: 'Sí / No',
  true_false: 'Verdadero / Falso',
  multiple_choice: 'Opción múltiple',
};

export function ExerciseRunner(): JSX.Element {
  const { toast } = useToast();
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [exerciseData, setExerciseData] = useState<BranchExercisesResponse | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeExercise, setActiveExercise] = useState<BranchExercise | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>({ answer: '', optionKey: null });
  const [attemptResult, setAttemptResult] = useState<AttemptResponse | null>(null);

  const [filters, setFilters] = useState({
    scope: 'all',
    exerciseType: 'all' as ExerciseType | 'all',
    level: 'all',
  });

  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const [branchList, trainingBranches] = await Promise.all([
          BranchExerciseService.listBranches(true),
          BranchExerciseService.getTrainingBranches().catch(() => []),
        ]);
        const merged = branchList.map((branch) => {
          const trainingInfo = trainingBranches.find((item) => item.branch_key === branch.branch_key);
          return {
            ...branch,
            status: trainingInfo?.status ?? branch.status ?? 'pending',
            metrics: trainingInfo?.metrics ?? branch.metrics,
          };
        });
        setBranches(merged);
        if (!selectedBranch && merged.length > 0) {
          setSelectedBranch(merged[0].branch_key);
        }
      } catch (error) {
        console.error('Error loading branches', error);
        toast({ title: 'No se pudo cargar la lista de ramas', variant: 'destructive' });
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [toast]);

  useEffect(() => {
    if (!selectedBranch) {
      setExerciseData(null);
      setActiveExercise(null);
      return;
    }

    const loadExercises = async () => {
      setLoadingExercises(true);
      try {
        const response = await BranchExerciseService.listExercises(selectedBranch, { limit: 200 });
        setExerciseData(response);
        if (response.exercises.length > 0) {
          setActiveExercise(response.exercises[0]);
          setAnswerState({ answer: '', optionKey: null });
          setAttemptResult(null);
        }
      } catch (error) {
        console.error('Error loading exercises', error);
        toast({
          title: 'No se pudieron obtener ejercicios',
          description: 'Revisa la conexión con el backend.',
          variant: 'destructive',
        });
      } finally {
        setLoadingExercises(false);
      }
    };

    loadExercises();
  }, [selectedBranch, toast]);

  const filteredExercises = useMemo(() => {
    if (!exerciseData) {
      return [] as BranchExercise[];
    }
    return exerciseData.exercises.filter((exercise) => {
      const scopeMatches =
        filters.scope === 'all' || exercise.scope.toLowerCase() === filters.scope.toLowerCase();
      const typeMatches = filters.exerciseType === 'all' || exercise.exercise_type === filters.exerciseType;
      const levelMatches = filters.level === 'all' || exercise.level === Number(filters.level);
      return scopeMatches && typeMatches && levelMatches;
    });
  }, [exerciseData, filters]);

  const availableScopes = useMemo(() => {
    if (!exerciseData) {
      return [];
    }
    const scopes = new Set<string>();
    exerciseData.exercises.forEach((exercise) => scopes.add(exercise.scope));
    return Array.from(scopes).sort();
  }, [exerciseData]);

  const availableLevels = useMemo(() => {
    if (!exerciseData) {
      return [];
    }
    const levels = new Set<number>();
    exerciseData.exercises.forEach((exercise) => levels.add(exercise.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [exerciseData]);

  const setSelectedExercise = (exercise: BranchExercise) => {
    setActiveExercise(exercise);
    setAnswerState({ answer: '', optionKey: null });
    setAttemptResult(null);
  };

  const selectBooleanAnswer = (value: string) => {
    setAnswerState({ answer: value, optionKey: null });
  };

  const selectMultipleChoice = (option: string, optionKey: string | null) => {
    setAnswerState({ answer: option, optionKey });
  };

  const submitAttempt = async () => {
    if (!selectedBranch || !activeExercise) {
      toast({ title: 'Selecciona un ejercicio válido', variant: 'destructive' });
      return;
    }

    const trimmedAnswer = answerState.answer.trim();
    if (!trimmedAnswer) {
      toast({ title: 'Proporciona una respuesta antes de enviar', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await BranchExerciseService.submitAttempt(selectedBranch, activeExercise.id, {
        answer: trimmedAnswer,
        option_key: answerState.optionKey,
      });
      setAttemptResult(response);
      toast({
        title: response.evaluation.is_correct ? 'Respuesta validada' : 'Respuesta registrada',
        description:
          response.evaluation.is_correct
            ? 'Has alcanzado el umbral de calidad del 95% y tus tokens fueron acreditados.'
            : 'Seguiremos evaluando tus iteraciones para mejorar el dataset.',
      });
    } catch (error) {
      console.error('Error sending attempt', error);
      toast({ title: 'No se pudo validar la respuesta', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswerControls = () => {
    if (!activeExercise) {
      return null;
    }

    if (activeExercise.exercise_type === 'yes_no') {
      return (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={answerState.answer.toLowerCase() === 'sí' ? 'default' : 'outline'}
            onClick={() => selectBooleanAnswer('sí')}
          >
            Sí
          </Button>
          <Button
            type="button"
            variant={answerState.answer.toLowerCase() === 'no' ? 'default' : 'outline'}
            onClick={() => selectBooleanAnswer('no')}
          >
            No
          </Button>
        </div>
      );
    }

    if (activeExercise.exercise_type === 'true_false') {
      return (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={answerState.answer.toLowerCase() === 'verdadero' ? 'default' : 'outline'}
            onClick={() => selectBooleanAnswer('verdadero')}
          >
            Verdadero
          </Button>
          <Button
            type="button"
            variant={answerState.answer.toLowerCase() === 'falso' ? 'default' : 'outline'}
            onClick={() => selectBooleanAnswer('falso')}
          >
            Falso
          </Button>
        </div>
      );
    }

    const choiceOptions = activeExercise.options_detail?.length
      ? activeExercise.options_detail.map((option) => ({
          key: option.option_key,
          content: option.content,
        }))
      : Array.isArray(activeExercise.options)
        ? (activeExercise.options as string[]).map((content, index) => ({
            key: String.fromCharCode(65 + index),
            content,
          }))
        : [];

    return (
      <div className="grid gap-3">
        {choiceOptions.map((option) => {
          const isSelected = answerState.optionKey === option.key || answerState.answer === option.content;
          return (
            <Button
              key={`${activeExercise.id}-${option.key ?? option.content}`}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => selectMultipleChoice(option.content, option.key ?? null)}
            >
              <span className="font-semibold mr-3">{option.key}</span>
              {option.content}
            </Button>
          );
        })}
        <Textarea
          rows={3}
          value={answerState.answer}
          placeholder="Argumenta tu selección o redacta la respuesta en tus palabras"
          onChange={(event) =>
            setAnswerState({ answer: event.target.value, optionKey: answerState.optionKey })
          }
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Resolver ejercicios verificados
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Elige una rama, filtra por ámbito o nivel y registra tus respuestas. Cada intento actualiza tu progreso y la
            calidad del dataset para activar los entrenamientos LoRA.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GaugeCircle className="h-4 w-4" />
          {attemptResult ? `Precisión alcanzada: ${attemptResult.progress.accuracy.toFixed(2)}%` : 'Sin intentos'}
        </div>
      </div>

      <Tabs defaultValue="selection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="selection">Seleccionar ejercicio</TabsTrigger>
          <TabsTrigger value="solve" disabled={!activeExercise}>
            Resolver
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!attemptResult}>
            Resultado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Selecciona rama y filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rama</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={(value) => setSelectedBranch(value)}
                  disabled={loadingBranches}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una rama" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.branch_key} value={branch.branch_key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{branch.name}</span>
                          <span className="text-xs text-muted-foreground">{branch.domain}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ámbito</Label>
                <Select
                  value={filters.scope}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, scope: value }))}
                  disabled={!availableScopes.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {availableScopes.map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de ejercicio</Label>
                <Select
                  value={filters.exerciseType}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, exerciseType: value as ExerciseType | 'all' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(exerciseLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nivel</Label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, level: value }))}
                  disabled={!availableLevels.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {availableLevels.map((level) => (
                      <SelectItem key={level} value={String(level)}>
                        Nivel {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5" />
                Ejercicios disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingExercises ? (
                <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>
              ) : filteredExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No se encontraron ejercicios con los filtros actuales. Ajusta los criterios para visualizar más opciones.
                </p>
              ) : (
                <div className="grid gap-3">
                  {filteredExercises.map((exercise) => {
                    const isActive = activeExercise?.id === exercise.id;
                    return (
                      <Button
                        key={exercise.id}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        className="justify-start text-left"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Nivel {exercise.level}</Badge>
                            <Badge>{exercise.exercise_type}</Badge>
                            <Badge variant="outline">{exercise.scope}</Badge>
                          </div>
                          <p className="text-sm font-medium">{exercise.question}</p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solve" className="space-y-4">
          {activeExercise ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {exerciseLabels[activeExercise.exercise_type]} · Nivel {activeExercise.level} · {activeExercise.scope}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base font-semibold">{activeExercise.question}</p>
                {renderAnswerControls()}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cada intento se valida localmente con el 95% como umbral de calidad.
                  </span>
                  <Button type="button" onClick={submitAttempt} disabled={submitting}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Enviar respuesta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>Selecciona un ejercicio para comenzar.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="result" className="space-y-4">
          {attemptResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Resultado del intento #{attemptResult.attempt.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Precisión alcanzada</Label>
                    <Badge variant={attemptResult.evaluation.is_correct ? 'default' : 'outline'}>
                      {attemptResult.evaluation.accuracy}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Tokens obtenidos</Label>
                    <Badge>{attemptResult.tokens.granted}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Respuesta enviada</Label>
                    <p className="text-sm">{attemptResult.evaluation.normalized_answer}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Respuesta oficial</Label>
                    <p className="text-sm">{attemptResult.evaluation.correct_answer}</p>
                  </div>
                </div>
                {attemptResult.evaluation.explanation ? (
                  <Alert>
                    <AlertDescription>{attemptResult.evaluation.explanation}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="text-sm text-muted-foreground">
                  Estado del progreso: {attemptResult.progress.verification_status}. Total de tokens para este nivel:{' '}
                  {attemptResult.progress.tokens_awarded}.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>Resuelve un ejercicio para ver el resultado.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ExerciseRunner;
