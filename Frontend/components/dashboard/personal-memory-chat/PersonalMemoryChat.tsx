'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Unlock, MessageCircle, Brain, Eye, EyeOff, Trash2, Download, Upload, Search, Key } from "lucide-react";

interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'user_message' | 'ai_response' | 'system_note' | 'personal_fact';
  content: string;
  tags: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  isEncrypted: boolean;
}

interface PersonalMemory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  lastAccessed: Date;
  entryCount: number;
  isLocked: boolean;
  passwordHash?: string;
  entries: MemoryEntry[];
}

export function PersonalMemoryChat() {
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [currentMemory, setCurrentMemory] = useState<PersonalMemory | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [newMemoryName, setNewMemoryName] = useState('');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<MemoryEntry[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cargar memorias disponibles
  useEffect(() => {
    loadMemories();
  }, []);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Filtrar entradas cuando cambia la búsqueda
  useEffect(() => {
    if (currentMemory && isUnlocked) {
      const filtered = currentMemory.entries.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEntries(filtered);
    }
  }, [searchQuery, currentMemory, isUnlocked]);

  const loadMemories = async () => {
    try {
      const response = await fetch('/api/memory/personal');
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const createMemory = async () => {
    if (!newMemoryName.trim()) {
      alert('Por favor ingresa un nombre para la memoria');
      return;
    }

    try {
      const response = await fetch('/api/memory/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemoryName.trim(),
          description: newMemoryDesc.trim(),
          password: password || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMemories(prev => [...prev, data.memory]);
        setNewMemoryName('');
        setNewMemoryDesc('');
        setPassword('');
        alert('Memoria personal creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Error al crear la memoria');
    }
  };

  const unlockMemory = async (memoryId: string) => {
    if (!password.trim()) {
      alert('Por favor ingresa la contraseña');
      return;
    }

    try {
      const response = await fetch(`/api/memory/personal/${memoryId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentMemory(data.memory);
        setIsUnlocked(true);
        setChatHistory([]);
        setPassword('');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error unlocking memory:', error);
      alert('Error al desbloquear la memoria');
    }
  };

  const lockMemory = () => {
    setCurrentMemory(null);
    setIsUnlocked(false);
    setChatHistory([]);
    setSearchQuery('');
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentMemory || !isUnlocked) return;

    const userMessage = {
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/memory/personal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryId: currentMemory.id,
          message: userMessage.content,
          includeMemory: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: 'assistant' as const,
          content: data.response,
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, aiMessage]);

        // Actualizar entradas de memoria si se agregaron nuevas
        if (data.newEntries && data.newEntries.length > 0) {
          setCurrentMemory(prev => prev ? {
            ...prev,
            entries: [...prev.entries, ...data.newEntries],
            entryCount: prev.entryCount + data.newEntries.length
          } : null);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta memoria? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/memory/personal/${memoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
        if (currentMemory?.id === memoryId) {
          lockMemory();
        }
        alert('Memoria eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Error al eliminar la memoria');
    }
  };

  const exportMemory = async () => {
    if (!currentMemory || !isUnlocked) return;

    try {
      const dataStr = JSON.stringify(currentMemory, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `${currentMemory.name}_backup.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting memory:', error);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Chat con Memoria Personal
          </h2>
          <p className="text-muted-foreground">
            Conversaciones privadas protegidas por contraseña que mejoran tu IA personal
          </p>
        </div>
        {currentMemory && (
          <div className="flex items-center gap-2">
            <Badge variant={isUnlocked ? "default" : "secondary"}>
              {isUnlocked ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
            </Badge>
            <span className="font-medium">{currentMemory.name}</span>
          </div>
        )}
      </div>

      {!currentMemory ? (
        // Lista de memorias disponibles
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tus Memorias Personales</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Crear Memoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Memoria Personal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memoryName">Nombre de la memoria *</Label>
                    <Input
                      id="memoryName"
                      placeholder="Mi memoria personal"
                      value={newMemoryName}
                      onChange={(e) => setNewMemoryName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryDesc">Descripción</Label>
                    <Textarea
                      id="memoryDesc"
                      placeholder="Describe el propósito de esta memoria..."
                      value={newMemoryDesc}
                      onChange={(e) => setNewMemoryDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryPassword">Contraseña (opcional)</Label>
                    <Input
                      id="memoryPassword"
                      type="password"
                      placeholder="Contraseña para proteger la memoria"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={createMemory} className="w-full">
                    Crear Memoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map(memory => (
              <Card key={memory.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {memory.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        {memory.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{memory.description}</p>
                    </div>
                    <Badge variant="outline">
                      {memory.entryCount} entradas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Creado: {memory.createdAt.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Último acceso: {memory.lastAccessed.toLocaleDateString()}
                    </div>

                    {memory.isLocked ? (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                          onClick={() => unlockMemory(memory.id)}
                          className="w-full"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Desbloquear
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentMemory(memory)}
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Abrir Chat
                        </Button>
                        <Button
                          onClick={() => deleteMemory(memory.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // Chat activo
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat con {currentMemory.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {currentMemory.description} • {currentMemory.entryCount} recuerdos almacenados
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportMemory} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  <Button onClick={lockMemory} variant="outline" size="sm">
                    <Lock className="h-4 w-4 mr-1" />
                    Bloquear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en la memoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Memoria
                </Button>
              </div>

              {/* Chat */}
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="flex gap-2">
                <Input
                  placeholder="Pregunta a tu IA personal... (¿Recuerdas cuando...?)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isUnlocked}
                />
                <Button onClick={sendMessage} disabled={!message.trim() || !isUnlocked || isTyping}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Memoria Personal Activa:</strong> Todas tus conversaciones se guardan y mejoran tu IA personal.
                  Solo tú puedes acceder preguntando por contraseña.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Vista de memoria */}
          {searchQuery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Resultados de búsqueda: "{searchQuery}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getImportanceColor(entry.importance)}>
                          {entry.importance}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
