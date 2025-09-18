'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PromptService, Prompt } from '../../services/promptService';
import { toast } from '../ui/use-toast';

export function PromptManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt>>({
    title: '',
    content: '',
    category: 'general',
    complexity: 'intermedio'
  });
  const [filters, setFilters] = useState<{
    category?: string;
    model_type?: string;
    complexity?: string;
  }>({});

  const categories = [
    'general', 
    'entrenamiento', 
    'evaluación', 
    'análisis', 
    'investigación'
  ];

  const complexityLevels = ['básico', 'intermedio', 'avanzado'];

  const fetchPrompts = async () => {
    try {
      const fetchedPrompts = await PromptService.getPrompts(filters);
      setPrompts(fetchedPrompts);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los prompts",
      });
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [filters]);

  const handleCreatePrompt = async () => {
    try {
      const createdPrompt = await PromptService.createPrompt(newPrompt as Prompt);
      setPrompts([...prompts, createdPrompt]);
      setNewPrompt({
        title: '',
        content: '',
        category: 'general',
        complexity: 'intermedio'
      });
      toast({
        title: "Prompt Creado",
        description: "El prompt se ha creado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el prompt",
      });
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt?.id) return;

    try {
      const updatedPrompt = await PromptService.updatePrompt(selectedPrompt.id, newPrompt);
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      setSelectedPrompt(null);
      setIsEditing(false);
      setNewPrompt({
        title: '',
        content: '',
        category: 'general',
        complexity: 'intermedio'
      });
      toast({
        title: "Prompt Actualizado",
        description: "El prompt se ha actualizado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el prompt",
      });
    }
  };

  const handleDeletePrompt = async (id: number) => {
    try {
      await PromptService.deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      toast({
        title: "Prompt Eliminado",
        description: "El prompt se ha eliminado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el prompt",
      });
    }
  };

  const startEditing = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setNewPrompt(prompt);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setSelectedPrompt(null);
    setIsEditing(false);
    setNewPrompt({
      title: '',
      content: '',
      category: 'general',
      complexity: 'intermedio'
    });
  };

  return (
    <div className="space-y-6">
      {/* Formulario de creación/edición */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span role="img" aria-label="Book" className="text-2xl">📚</span> Gestor de Prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Título del prompt"
              value={newPrompt.title}
              onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
            />
            
            {/* Selector de categoría simplificado */}
            <select
              value={newPrompt.category}
              onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="Contenido del prompt"
            value={newPrompt.content}
            onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de complejidad simplificado */}
            <select
              value={newPrompt.complexity}
              onChange={(e) => setNewPrompt({ ...newPrompt, complexity: e.target.value as 'básico' | 'intermedio' | 'avanzado' })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {complexityLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>

            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleUpdatePrompt} className="flex-1">
                  <span role="img" aria-label="Save">💾</span> Actualizar
                </Button>
                <Button onClick={cancelEditing} variant="outline">
                  <span role="img" aria-label="Cancel">❌</span> Cancelar
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreatePrompt} className="w-full">
                <span role="img" aria-label="Plus">➕</span> Crear Prompt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span role="img" aria-label="Filter">🔍</span> Filtros de Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de categoría */}
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Filtro de complejidad */}
            <select
              value={filters.complexity || ''}
              onChange={(e) => setFilters({ ...filters, complexity: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Todas las complejidades</option>
              {complexityLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>

            {/* Botón de limpiar filtros */}
            <Button 
              onClick={() => setFilters({})} 
              variant="outline"
              className="w-full"
            >
              <span role="img" aria-label="Clear">🧹</span> Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{prompt.title}</CardTitle>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {prompt.category}
                </span>
                <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                  {prompt.complexity}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {prompt.content}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditing(prompt)}
                >
                  <span role="img" aria-label="Edit">✏️</span> Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => prompt.id && handleDeletePrompt(prompt.id)}
                >
                  <span role="img" aria-label="Trash">🗑️</span> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {prompts.length === 0 && !isEditing && (
        <div className="text-center py-12 text-muted-foreground">
          <span className="text-4xl mb-4 block">📝</span>
          <p>No hay prompts disponibles</p>
          <p className="text-sm">Crea tu primer prompt para comenzar</p>
        </div>
      )}
    </div>
  );
}
