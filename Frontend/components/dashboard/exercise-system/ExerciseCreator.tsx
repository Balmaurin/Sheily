'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';

import BranchExerciseService, {
  BranchExercise,
  BranchSummary,
  CreateExercisePayload,
  ExerciseType,
} from '@/services/branchExerciseService';

interface FormState {
  scope: string;
  level: number;
  exerciseType: ExerciseType;
  question: string;
  correctAnswer: string;
  explanation: string;
  validationSource: string;
  referenceUrl: string;
  competency: string;
  difficulty: string;
  objective: string;
  autoLowerScope: boolean;
}

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'yes_no', label: 'Sí / No' },
  { value: 'true_false', label: 'Verdadero / Falso' },
  { value: 'multiple_choice', label: 'Opción múltiple' },
];

const DIFFICULTIES = [
  { value: 'standard', label: 'Estándar' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'expert', label: 'Experto' },
];

const DEFAULT_OPTIONS = ['', ''];

export function ExerciseCreator(): JSX.Element {
  const { toast } = useToast();
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exercises, setExercises] = useState<BranchExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);

  const [form, setForm] = useState<FormState>({
    scope: '',
    level: 1,
    exerciseType: 'yes_no',
    question: '',
    correctAnswer: 'sí',
    explanation: '',
    validationSource: 'curriculum-team',
    referenceUrl: '',
    competency: '',
    difficulty: 'standard',
    objective: '',
    autoLowerScope: true,
  });

  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const [branchList, trainingBranches] = await Promise.all([
          BranchExerciseService.listBranches(),
          BranchExerciseService.getTrainingBranches().catch(() => []),
        ]);

        const branchesWithStatus = branchList.map((branch) => {
          const progressInfo = trainingBranches.find((item) => item.branch_key === branch.branch_key);
          return {
            ...branch,
            status: progressInfo?.status ?? 'pending',
            metrics: progressInfo?.metrics ?? branch.metrics,
          };
        });

        setBranches(branchesWithStatus);
        if (!selectedBranch && branchesWithStatus.length > 0) {
          setSelectedBranch(branchesWithStatus[0].branch_key);
        }
      } catch (error) {
        console.error('Error loading branches', error);
        toast({
          title: 'No se pudieron cargar las ramas',
          description: 'Verifica tu conexión y vuelve a intentarlo.',
          variant: 'destructive',
        });
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [toast]);

  useEffect(() => {
    if (!selectedBranch) {
      setExercises([]);
      return;
    }

    const loadExercises = async () => {
      setLoadingExercises(true);
      try {
        const response = await BranchExerciseService.listExercises(selectedBranch, { limit: 200 });
        setExercises(response.exercises);
      } catch (error) {
        console.error('Error loading exercises', error);
        toast({
          title: 'No se pudieron obtener los ejercicios',
          description: 'El servidor no respondió correctamente.',
          variant: 'destructive',
        });
      } finally {
        setLoadingExercises(false);
      }
    };

    loadExercises();
  }, [selectedBranch, toast]);

  const availableScopes = useMemo(() => {
    const scopes = new Set<string>();
    exercises.forEach((exercise) => scopes.add(exercise.scope));
    return Array.from(scopes).sort();
  }, [exercises]);

  const handleFormChange = (key: keyof FormState, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExerciseTypeChange = (type: ExerciseType) => {
    let correctAnswer = form.correctAnswer;
    if (type === 'yes_no') {
      correctAnswer = correctAnswer === 'no' ? 'no' : 'sí';
    } else if (type === 'true_false') {
      correctAnswer = correctAnswer === 'falso' ? 'falso' : 'verdadero';
    } else {
      correctAnswer = options[correctOptionIndex] || '';
    }
    setForm((prev) => ({ ...prev, exerciseType: type, correctAnswer }));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => {
      if (prev.length <= 2) {
        toast({
          title: 'Debes mantener al menos dos opciones',
          variant: 'destructive',
        });
        return prev;
      }
      const next = prev.filter((_, idx) => idx !== index);
      if (correctOptionIndex >= next.length) {
        setCorrectOptionIndex(0);
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm({
      scope: '',
      level: 1,
      exerciseType: 'yes_no',
      question: '',
      correctAnswer: 'sí',
      explanation: '',
      validationSource: 'curriculum-team',
      referenceUrl: '',
      competency: '',
      difficulty: 'standard',
      objective: '',
      autoLowerScope: true,
    });
    setOptions(DEFAULT_OPTIONS);
    setCorrectOptionIndex(0);
  };

  const createExercise = async () => {
    if (!selectedBranch) {
      toast({ title: 'Selecciona una rama', variant: 'destructive' });
      return;
    }

    const level = Number(form.level);
    if (Number.isNaN(level) || level < 1 || level > 20) {
      toast({
        title: 'Nivel inválido',
        description: 'Cada rama tiene 20 niveles; selecciona un valor entre 1 y 20.',
        variant: 'destructive',
      });
      return;
    }

    const scopeValue = form.autoLowerScope ? form.scope.trim().toLowerCase() : form.scope.trim();
    if (!scopeValue) {
      toast({
        title: 'El ámbito es obligatorio',
        description: 'Define el ámbito concreto dentro de la rama para este ejercicio.',
        variant: 'destructive',
      });
      return;
    }

    const question = form.question.trim();
    if (!question) {
      toast({ title: 'La pregunta no puede estar vacía', variant: 'destructive' });
      return;
    }

    let correctAnswer = form.correctAnswer.trim();
    let optionsPayload: CreateExercisePayload['options'] | undefined;

    if (form.exerciseType === 'yes_no') {
      if (!['sí', 'no'].includes(correctAnswer.toLowerCase())) {
        toast({ title: 'Selecciona una respuesta correcta válida (sí/no)', variant: 'destructive' });
        return;
      }
      correctAnswer = correctAnswer.toLowerCase() === 'no' ? 'no' : 'sí';
    } else if (form.exerciseType === 'true_false') {
      if (!['verdadero', 'falso'].includes(correctAnswer.toLowerCase())) {
        toast({
          title: 'Selecciona una respuesta correcta válida (verdadero/falso)',
          variant: 'destructive',
        });
        return;
      }
      correctAnswer = correctAnswer.toLowerCase() === 'falso' ? 'falso' : 'verdadero';
    } else {
      const sanitizedOptions = options.map((option) => option.trim()).filter((option) => option.length > 0);
      if (sanitizedOptions.length < 2) {
        toast({
          title: 'Configura al menos dos opciones válidas',
          description: 'Los ejercicios de opción múltiple requieren varias alternativas reales.',
          variant: 'destructive',
        });
        return;
      }

      const resolvedIndex = Math.min(correctOptionIndex, sanitizedOptions.length - 1);
      optionsPayload = sanitizedOptions;
      correctAnswer = sanitizedOptions[resolvedIndex];
    }

    setSubmitting(true);
    try {
      await BranchExerciseService.createExercise(selectedBranch, {
        scope: scopeValue,
        level,
        exercise_type: form.exerciseType,
        question,
        correct_answer: correctAnswer,
        explanation: form.explanation.trim() || undefined,
        validation_source: form.validationSource.trim() || undefined,
        reference_url: form.referenceUrl.trim() || undefined,
        competency: form.competency.trim() || undefined,
        difficulty: form.difficulty,
        objective: form.objective.trim() || undefined,
        metadata: {
          created_from: 'dashboard',
          reviewer: form.validationSource.trim() || 'curriculum-team',
          generated_at: new Date().toISOString(),
        },
        options: optionsPayload,
      });

      toast({
        title: 'Ejercicio creado',
        description: 'El ejercicio se registró correctamente en la base de datos.',
      });

      resetForm();
      const response = await BranchExerciseService.listExercises(selectedBranch, { limit: 200 });
      setExercises(response.exercises);
    } catch (error) {
      console.error('Error creating exercise', error);
      toast({
        title: 'No fue posible crear el ejercicio',
        description: 'Verifica tus permisos o revisa los datos enviados.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExercise = async (exerciseId: number) => {
    if (!selectedBranch) {
      return;
    }

    try {
      await BranchExerciseService.deleteExercise(selectedBranch, exerciseId);
      toast({ title: 'Ejercicio eliminado', description: 'El registro se retiró del catálogo.' });
      setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise', error);
      toast({
        title: 'No se pudo eliminar el ejercicio',
        description: 'Confirma tus permisos o vuelve a intentarlo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Gestión de ejercicios oficiales
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Administra el banco de ejercicios reales de las 35 ramas. Cada registro se almacena en PostgreSQL y
            alimenta la generación de datasets verificados para los flujos de entrenamiento LoRA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span className="text-sm font-medium">
            {loadingExercises ? 'Cargando ejercicios…' : `${exercises.length} ejercicios cargados`}
          </span>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Crear ejercicio</TabsTrigger>
          <TabsTrigger value="manage">Catálogo de rama</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <Brain className="h-5 w-5" />
                Nuevo ejercicio por rama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label>Nivel (1-20)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={form.level}
                    onChange={(event) => handleFormChange('level', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ámbito dentro de la rama</Label>
                  <Input
                    value={form.scope}
                    placeholder="Ejemplo: prompting avanzado"
                    onChange={(event) => handleFormChange('scope', event.target.value)}
                    list="exercise-scopes"
                  />
                  <datalist id="exercise-scopes">
                    {availableScopes.map((scope) => (
                      <option value={scope} key={scope} />
                    ))}
                  </datalist>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      id="auto-lower-scope"
                      checked={form.autoLowerScope}
                      onCheckedChange={(value) => handleFormChange('autoLowerScope', value)}
                    />
                    <Label htmlFor="auto-lower-scope">Normalizar ámbito en minúsculas</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de ejercicio</Label>
                  <Select value={form.exerciseType} onValueChange={(value) => handleExerciseTypeChange(value as ExerciseType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pregunta</Label>
                <Textarea
                  rows={4}
                  value={form.question}
                  placeholder="Redacta una pregunta clara y contextualizada al nivel seleccionado"
                  onChange={(event) => handleFormChange('question', event.target.value)}
                />
              </div>

              {form.exerciseType === 'multiple_choice' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Opciones de respuesta</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" /> Añadir opción
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div className="flex items-center gap-2" key={`option-${index}`}>
                        <Button
                          type="button"
                          variant={correctOptionIndex === index ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCorrectOptionIndex(index)}
                        >
                          {String.fromCharCode(65 + index)}
                        </Button>
                        <Input
                          value={option}
                          placeholder={`Respuesta ${String.fromCharCode(65 + index)}`}
                          onChange={(event) => updateOption(index, event.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeOption(index)}
                          disabled={options.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecciona la opción correcta pulsando el identificador A, B, C… El banco de datos registrará todas las
                    alternativas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Respuesta correcta</Label>
                    <Select value={form.correctAnswer} onValueChange={(value) => handleFormChange('correctAnswer', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {form.exerciseType === 'yes_no' ? (
                          <>
                            <SelectItem value="sí">Sí</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="verdadero">Verdadero</SelectItem>
                            <SelectItem value="falso">Falso</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dificultad</Label>
                    <Select value={form.difficulty} onValueChange={(value) => handleFormChange('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Explicación</Label>
                  <Textarea
                    rows={3}
                    value={form.explanation}
                    placeholder="Describe por qué la respuesta es correcta. Esta explicación se mostrará tras la validación."
                    onChange={(event) => handleFormChange('explanation', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo pedagógico</Label>
                  <Textarea
                    rows={3}
                    value={form.objective}
                    placeholder="Resumen del resultado de aprendizaje asociado a este ejercicio"
                    onChange={(event) => handleFormChange('objective', event.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fuente de validación</Label>
                  <Input
                    value={form.validationSource}
                    placeholder="Equipo o referencia que revisó el ejercicio"
                    onChange={(event) => handleFormChange('validationSource', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL de referencia (opcional)</Label>
                  <Input
                    value={form.referenceUrl}
                    placeholder="https://"
                    onChange={(event) => handleFormChange('referenceUrl', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Competencia evaluada</Label>
                  <Input
                    value={form.competency}
                    placeholder="Ejemplo: diseño de prompts seguros"
                    onChange={(event) => handleFormChange('competency', event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={resetForm} disabled={submitting}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar formulario
                </Button>
                <Button type="button" onClick={createExercise} disabled={submitting || loadingExercises}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Registrar ejercicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ejercicios registrados en {selectedBranch || '—'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingExercises ? (
                <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>
              ) : exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay ejercicios para esta rama y nivel. Genera contenido nuevo utilizando el formulario anterior.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ámbito</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pregunta</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercises.map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium">{exercise.scope}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Nivel {exercise.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{exercise.exercise_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={exercise.question}>
                          {exercise.question}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteExercise(exercise.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    {exercises.length} ejercicios reales almacenados para esta rama.
                  </TableCaption>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ExerciseCreator;
