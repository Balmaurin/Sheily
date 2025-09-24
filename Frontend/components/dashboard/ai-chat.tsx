"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import chatService from "../../services/chatService";
import { toast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  modelInfo?: {
    model_used: string;
    response_time: number;
    tokens_used: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content:
        '¡Hola! Soy Sheily AI, tu asistente inteligente conectado directamente al servidor Llama local. Estoy aquí para ayudarte con consultas, análisis y respuestas detalladas usando el modelo Llama-3.2-3B-Instruct-Q8_0. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      timestamp: Date.now(),
      modelInfo: {
        model_used: 'Servidor LLM local (Llama-3.2-3B-Instruct-Q8_0)',
        response_time: 0.1,
        tokens_used: 45,
        prompt_tokens: 30,
        completion_tokens: 15,
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelInfo, setModelInfo] = useState({
    name: 'Sheily AI LLM local',
    subtitle: 'Asistente inteligente con Llama-3.2-3B-Instruct-Q8_0',
    purpose:
      'El dashboard se comunica directamente con el servidor Llama local para entregar respuestas rápidas y contextuales.',
    capabilities: [
      'Respuestas conversacionales en español',
      'Procesamiento directo desde el dashboard',
      'Pipeline interno draft → critic → fix',
      'Baja latencia al ejecutarse en local',
    ],
    backend_model: 'Llama-3.2-3B-Instruct-Q8_0',
    quantization: 'Q8_0',
    parameters: '3B parámetros',
    memory: '~2.2GB VRAM',
    context: '4096 tokens',
    service_status: 'checking',
    restrictions: [
      'Limitado por contexto de 4096 tokens',
      'Requiere que el servidor LLM local esté activo',
      'Sin pasarelas intermedias',
    ],
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar información del modelo y verificar conexión al montar el componente
  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        const info = await chatService.getModelInfo();
        setModelInfo(info);
        const healthy = await chatService.checkModelHealth();
        setConnectionStatus(healthy ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Error cargando información del modelo:', error);
        setConnectionStatus('disconnected');
        // Mantener la información por defecto si hay error
      }
    };

    loadModelInfo();
  }, []);

  // Verificar conexión periódicamente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await chatService.checkModelHealth();
        setConnectionStatus(isHealthy ? 'connected' : 'disconnected');
      } catch (error) {
        console.warn('Error verificando conexión con el servidor LLM:', error);
        setConnectionStatus('disconnected');
      }
    };

    // Verificar inmediatamente y luego cada 30 segundos
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Función para limpiar el chat
  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      content: '¡Hola! Soy Sheily AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      timestamp: Date.now(),
      modelInfo: {
        model_used: 'Servidor LLM local',
        response_time: 0.1,
        tokens_used: 15,
        prompt_tokens: 8,
        completion_tokens: 7,
      }
    }]);

    toast({
      title: "Chat limpiado",
      description: "Se ha reiniciado la conversación",
    });
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Validar longitud del mensaje
    if (input.trim().length > 2000) {
      toast({
        title: "Mensaje demasiado largo",
        description: "Por favor, limita tu consulta a 2000 caracteres.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage({ prompt: input.trim() });

      // Validar respuesta del servidor
      if (!response || !response.message) {
        throw new Error("Respuesta inválida del servidor");
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: 'ai',
        timestamp: Date.now(),
        modelInfo: {
          model_used: response.model_used || 'Servidor LLM local',
          response_time: response.response_time || 0,
          tokens_used: response.tokens_used || 0,
          prompt_tokens: response.prompt_tokens,
          completion_tokens: response.completion_tokens,
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Notificación de éxito con más detalle
      toast({
        title: "Mensaje enviado correctamente",
        description: `Respuesta generada por ${response.model_used} en ${response.response_time.toFixed(2)}s`,
      });

    } catch (error: any) {
      console.error('Error en chat:', error);

      let errorMessage = "No se pudo enviar el mensaje";
      if (error.message?.includes('timeout')) {
        errorMessage = "Tiempo de espera agotado. El servidor está tardando mucho en responder.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Error de conexión. Verifica tu conexión a internet.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error de Chat",
        description: errorMessage,
        variant: "destructive"
      });

      // Agregar mensaje de error al chat
      const errorAiMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Lo siento, hubo un problema al procesar tu consulta: ${errorMessage}. Por favor, intenta de nuevo.`,
        sender: 'ai',
        timestamp: Date.now(),
        modelInfo: {
          model_used: 'Error Handler',
          response_time: 0,
          tokens_used: 0
        }
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Información del Modelo 4-bit */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <span>🚀 {modelInfo.name}</span>
            {modelInfo.subtitle && (
              <span className="text-sm text-blue-600 font-normal">
                - {modelInfo.subtitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">📋 Propósito:</h4>
              <p className="text-gray-700 mb-4">{modelInfo.purpose}</p>
              
              <h4 className="font-semibold text-blue-800 mb-3">⚡ Capacidades:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {modelInfo.capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">🔧 Especificaciones Técnicas:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Modelo Backend:</span>
                  <span className="text-blue-600">{modelInfo.backend_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cuantización:</span>
                  <span className="text-blue-600">{modelInfo.quantization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Parámetros:</span>
                  <span className="text-blue-600">{modelInfo.parameters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Memoria:</span>
                  <span className="text-blue-600">{modelInfo.memory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contexto:</span>
                  <span className="text-blue-600">{modelInfo.context}</span>
                </div>
                {modelInfo.service_status && (
                  <div className="flex justify-between">
                    <span className="font-medium">Estado del servicio:</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      modelInfo.service_status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {modelInfo.service_status}
                    </span>
                  </div>
                )}
              </div>
              
              <h4 className="font-semibold text-red-800 mb-3 mt-4">🚫 Restricciones:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                {modelInfo.restrictions && modelInfo.restrictions.length > 0 ? (
                  modelInfo.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))
                ) : (
                  <li>No hay restricciones definidas</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-center">💬 Chat con Sheily AI (LLM local)</CardTitle>
            <div className="flex items-center space-x-2">
              {/* Indicador de conexión */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-green-500'
                      : connectionStatus === 'checking'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {connectionStatus === 'connected' && 'Conectado'}
                  {connectionStatus === 'checking' && 'Verificando...'}
                  {connectionStatus === 'disconnected' && 'Desconectado'}
                </span>
              </div>

              {/* Botón de limpiar chat */}
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={messages.length <= 1}
              >
                🗑️ Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[500px]">
            <div className="flex-grow overflow-y-auto space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-white shadow-inner">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${
                    msg.sender === 'ai' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'ai' 
                        ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="mb-2">{msg.content}</div>
                    {msg.modelInfo && msg.sender === 'ai' && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        <span>Modelo: {msg.modelInfo.model_used}</span>
                        <span className="mx-2">•</span>
                        <span>Tiempo: {msg.modelInfo.response_time.toFixed(2)}s</span>
                        <span className="mx-2">•</span>
                        <span>Tokens: {msg.modelInfo.tokens_used}</span>
                        {(msg.modelInfo.prompt_tokens !== undefined || msg.modelInfo.completion_tokens !== undefined) && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              Prompt/Salida: {msg.modelInfo.prompt_tokens ?? '—'} / {msg.modelInfo.completion_tokens ?? '—'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-blue-100 p-3 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-900">Sheily AI está procesando tu consulta...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="mt-4">
              {/* Indicador de caracteres */}
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="text-gray-500">Presiona Enter para enviar</span>
                <span className={`font-medium ${
                  input.length > 1800
                    ? 'text-red-600'
                    : input.length > 1500
                    ? 'text-yellow-600'
                    : 'text-gray-500'
                }`}>
                  {input.length}/2000 caracteres
                  {input.length > 1800 && ' ⚠️'}
                </span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
          placeholder="Escribe tu consulta para Sheily AI (máximo 2000 caracteres)..."
                  className="flex-1 p-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium disabled:bg-gray-100"
                  disabled={isTyping}
                  maxLength={2000}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isTyping || !input.trim() || input.length > 2000}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-6"
                >
                  {isTyping ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
