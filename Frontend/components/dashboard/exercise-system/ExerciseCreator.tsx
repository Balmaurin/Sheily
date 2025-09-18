'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, Save, Play, Target, Brain, Database, Zap } from "lucide-react";

interface ExerciseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // minutos
  maxLength: number; // caracteres máximo
  minQualityScore: number; // 0-100
  instructions: string;
  examplePrompt: string;
  tags: string[];
  isActive: boolean;
  datasetValue: number; // tokens por respuesta de calidad
  totalSubmissions: number;
  qualitySubmissions: number;
}

interface ExerciseSubmission {
  id: string;
  userId: string;
  exerciseId: string;
  response: string;
  qualityScore: number;
  timestamp: Date;
  metadata: {
    responseLength: number;
    processingTime: number;
    modelUsed?: string;
    tokensEarned: number;
  };
}

export function ExerciseCreator() {
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<ExerciseTemplate>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimatedTime: 5,
    maxLength: 500,
    minQualityScore: 90,
    instructions: '',
    examplePrompt: '',
    tags: [],
    isActive: true,
    datasetValue: 10,
    totalSubmissions: 0,
    qualitySubmissions: 0
  });
  const [newTag, setNewTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Cargar templates existentes
  useEffect(() => {
    loadExerciseTemplates();
  }, []);

  const loadExerciseTemplates = async () => {
    try {
      const response = await fetch('/api/exercises/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const createTemplate = async () => {
    if (!currentTemplate.title || !currentTemplate.description || !currentTemplate.instructions) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/exercises/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentTemplate,
          id: Date.now().toString(),
          tags: currentTemplate.tags || []
        })
      });

      if (response.ok) {
        alert('Template creado exitosamente');
        setCurrentTemplate({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          estimatedTime: 5,
          maxLength: 500,
          minQualityScore: 90,
          instructions: '',
          examplePrompt: '',
          tags: [],
          isActive: true,
          datasetValue: 10,
          totalSubmissions: 0,
          qualitySubmissions: 0
        });
        loadExerciseTemplates();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error al crear el template');
    } finally {
      setIsCreating(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !currentTemplate.tags?.includes(newTag.trim())) {
      setCurrentTemplate(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Creador de Ejercicios de IA
          </h2>
          <p className="text-muted-foreground">
            Crea ejercicios que generen datasets valiosos para el entrenamiento de tu LLM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span className="text-sm font-medium">
            {templates.filter(t => t.isActive).length} ejercicios activos
          </span>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Crear Ejercicio</TabsTrigger>
          <TabsTrigger value="manage">Gestionar Ejercicios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Ejercicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del ejercicio *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Describe una escena futurista..."
                    value={currentTemplate.title || ''}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={currentTemplate.category} onValueChange={(value) => setCurrentTemplate(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative">Creativo</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="analytical">Analítico</SelectItem>
                      <SelectItem value="educational">Educativo</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe qué debe hacer el usuario en este ejercicio..."
                  value={currentTemplate.description || ''}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Configuración del ejercicio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select value={currentTemplate.difficulty} onValueChange={(value: any) => setCurrentTemplate(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="expert">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tiempo estimado (min)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={currentTemplate.estimatedTime || 5}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 5 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud máxima (chars)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="5000"
                    value={currentTemplate.maxLength || 500}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 500 }))}
                  />
                </div>
              </div>

              {/* Puntaje mínimo y recompensa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Puntaje mínimo de calidad (%)</Label>
                  <Slider
                    value={[currentTemplate.minQualityScore || 90]}
                    onValueChange={(value) => setCurrentTemplate(prev => ({ ...prev, minQualityScore: value[0] }))}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {currentTemplate.minQualityScore || 90}%
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tokens por respuesta de calidad</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={currentTemplate.datasetValue || 10}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, datasetValue: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>

              {/* Instrucciones y ejemplo */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instrucciones para el usuario *</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Explica claramente qué debe hacer el usuario..."
                    rows={4}
                    value={currentTemplate.instructions || ''}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="example">Prompt de ejemplo</Label>
                  <Textarea
                    id="example"
                    placeholder="Ejemplo de cómo debería ser una buena respuesta..."
                    rows={3}
                    value={currentTemplate.examplePrompt || ''}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, examplePrompt: e.target.value }))}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTemplate.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer"
                           onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Estado del ejercicio */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentTemplate.isActive || false}
                  onCheckedChange={(checked) => setCurrentTemplate(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Ejercicio activo</Label>
              </div>

              <Button onClick={createTemplate} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Ejercicio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Categoría:</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Calidad mín:</span>
                      <span className="font-medium">{template.minQualityScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tokens:</span>
                      <span className="font-medium">{template.datasetValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envíos:</span>
                      <span className="font-medium">{template.totalSubmissions}</span>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Probar
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analytics de Ejercicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{templates.length}</div>
                    <div className="text-sm text-muted-foreground">Ejercicios creados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {templates.filter(t => t.isActive).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ejercicios activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {templates.reduce((sum, t) => sum + t.totalSubmissions, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total envíos</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Distribución por dificultad</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map(difficulty => {
                      const count = templates.filter(t => t.difficulty === difficulty).length;
                      const percentage = templates.length > 0 ? (count / templates.length) * 100 : 0;
                      return (
                        <div key={difficulty} className="text-center">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground capitalize">{difficulty}</div>
                          <Progress value={percentage} className="h-2 mt-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
