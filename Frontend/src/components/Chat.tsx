import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { chatAPI } from '../services/api';
import './Chat.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    model: 'llama-3.2-3b-instruct',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'Eres Sheily AI, un asistente inteligente y útil. Responde de manera clara, precisa y amigable en español.'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar historial de chat al iniciar
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await chatAPI.getChatHistory();
      const formattedMessages: Message[] = history.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error cargando historial:', error);
      // Mensaje de bienvenida por defecto
      setMessages([{
        id: 'welcome',
        content: '¡Hola! Soy Sheily AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Mensaje de "escribiendo..."
    const typingMessage: Message = {
      id: 'typing',
      content: 'Escribiendo...',
      sender: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await chatAPI.sendMessage({
        message: userMessage.content,
        settings: settings,
        userId: user?.id
      });

      // Remover mensaje de "escribiendo..."
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const assistantMessage: Message = {
        id: response.id || Date.now().toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Mostrar métricas si están disponibles
      if (response.metrics) {
        console.log('Métricas de respuesta:', response.metrics);
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Remover mensaje de "escribiendo..."
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      showToast('Error al enviar mensaje', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      content: '¡Hola! Soy Sheily AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
      sender: 'assistant',
      timestamp: new Date()
    }]);
    showToast('Chat limpiado', 'success');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      {/* Header del Chat */}
      <div className="chat-header">
        <div className="chat-title">
          <Bot className="chat-icon" />
          <h2>Chat con Sheily AI</h2>
        </div>
        <div className="chat-actions">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="icon-button"
            title="Configuración"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={clearChat}
            className="icon-button"
            title="Limpiar chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Panel de Configuración */}
      {showSettings && (
        <div className="chat-settings">
          <div className="settings-group">
            <label>Temperatura: {settings.temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                temperature: parseFloat(e.target.value)
              }))}
            />
          </div>
          <div className="settings-group">
            <label>Max Tokens:</label>
            <input
              type="number"
              min="100"
              max="4096"
              value={settings.maxTokens}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxTokens: parseInt(e.target.value)
              }))}
            />
          </div>
        </div>
      )}

      {/* Área de Mensajes */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender} ${message.isTyping ? 'typing' : ''}`}
          >
            <div className="message-avatar">
              {message.sender === 'user' ? (
                <User size={20} />
              ) : (
                <Bot size={20} />
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.isTyping ? (
                  <div className="typing-indicator">
                    <Loader2 className="spinning" size={16} />
                    Escribiendo...
                  </div>
                ) : (
                  message.content
                )}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí... (Enter para enviar)"
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
            title="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="spinning" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
