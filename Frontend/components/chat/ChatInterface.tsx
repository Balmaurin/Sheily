'use client';

import React, { useState, useRef, useEffect } from 'react';
import chatService from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  className?: string;
  showLoRAGeneration?: boolean;
}

export default function ChatInterface({ className = '', showLoRAGeneration = true }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar información del modelo
    chatService.getModelInfo().then(info => setModelInfo(info)).catch(console.error);
    // Por ahora no tenemos usageStats
    setUsageStats(null);
  }, []);

  useEffect(() => {
    // Auto-scroll al último mensaje
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "Mensaje enviado",
        description: `Respuesta del modelo ${response.model_used} en ${response.response_time.toFixed(2)}s`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateLoRA = async () => {
    if (messages.length === 0) {
      toast({
        title: "Sin conversación",
        description: "Necesitas tener una conversación para generar un archivo LoRA",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Por ahora, simulamos la generación del LoRA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Archivo LoRA generado",
        description: "Archivo creado exitosamente (simulado)",
      });

      // Simular descarga (en un caso real, esto descargaría el archivo)
      console.log('Archivo LoRA generado (simulado)');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header con información del modelo */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🤖</span>
            Chat con Llama-3.2-3B-Instruct-Q8_0
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Badge variant="secondary" className="text-xs">Parámetros</Badge>
              <p className="font-mono">{modelInfo?.parameters}</p>
            </div>
            <div>
              <Badge variant="secondary" className="text-xs">Memoria</Badge>
              <p className="font-mono">{modelInfo?.memory}</p>
            </div>
            <div>
              <Badge variant="secondary" className="text-xs">Contexto</Badge>
              <p className="font-mono">{modelInfo?.context}</p>
            </div>
            <div>
              <Badge variant="secondary" className="text-xs">Uptime</Badge>
              <p className="font-mono">{usageStats?.uptime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de mensajes */}
      <Card className="flex-1 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Conversación</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {messages.length} mensajes
              </Badge>
              {showLoRAGeneration && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLoRA}
                  disabled={isLoading || messages.length === 0}
                  className="h-7 px-2"
                >
                  📥 LoRA
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea ref={scrollAreaRef} className="h-96">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <span className="text-6xl block mb-4">🤖</span>
                  <p>Inicia una conversación con el modelo Llama-3.2-3B-Instruct-Q8_0</p>
                  <p className="text-sm mt-2">
                    Puedo ayudarte con consultas y generar archivos LoRA para entrenamiento
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm">👤</span>
                      ) : (
                        <span className="text-sm">🤖</span>
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span className="text-sm">Generando respuesta...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input de mensaje */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              📤
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Presiona Enter para enviar</span>
            <span>{inputMessage.length} caracteres</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
