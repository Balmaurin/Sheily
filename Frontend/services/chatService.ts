import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

interface ChatResponse {
  response: string;
  model: string;
  timestamp: number;
}

interface ChatRequestParams {
  prompt: string;
  max_length?: number;
  temperature?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SHEILY_GATEWAY_URL = 'http://localhost:8080'; // Gateway Sheily AI
const LLM_SERVER_URL = 'http://localhost:8005'; // LLM Server directo (solo para emergencias)

// Endpoint correcto: Dashboard → Gateway Sheily AI → LLM Server
const CHAT_ENDPOINT = `${SHEILY_GATEWAY_URL}/query`;

export const chatService = {
  handleApiError(error: any, defaultMessage: string = "Error en la operación"): void {
    if (error.response) {
      toast({
        title: "Error de Chat",
        description: `${defaultMessage}: ${error.response.data?.message || error.response.status}`,
        variant: "destructive"
      });
    } else if (error.request) {
      toast({
        title: "Error de Red",
        description: "No se recibió respuesta del servidor de chat",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error de Configuración",
        description: error.message || defaultMessage,
        variant: "destructive"
      });
    }
  },

  async sendMessage(params: ChatRequestParams): Promise<{
    message: string;
    model_used: string;
    response_time: number;
    tokens_used: number;
  }> {
    try {
      const startTime = Date.now();

      // Conectar con el Gateway Sheily AI que maneja el LLM
      const response = await axios.post(CHAT_ENDPOINT, {
        query: params.prompt,
        domain: "general",
        max_tokens: params.max_length || 500,
        temperature: params.temperature || 0.7,
        top_p: 0.9
      }, {
        timeout: 30000, // 30 segundos timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      const responseTime = (endTime - startTime) / 1000;

      // Verificar que tenemos una respuesta del gateway
      if (!response.data || !response.data.response) {
        throw new Error('El gateway Sheily AI no devolvió una respuesta válida');
      }

      console.log('✅ Respuesta del Gateway Sheily AI:', {
        gateway: 'Sheily AI Gateway',
        llm_model: response.data.model_used,
        response_time: response.data.response_time,
        confidence: response.data.confidence,
        domain: response.data.domain,
        tokens_used: response.data.tokens_used,
        quality_score: response.data.quality_score
      });

      // Retornar respuesta del gateway con métricas detalladas
      return {
        message: response.data.response,
        model_used: response.data.model_used || 'Llama-3.2-3B-Instruct-Q8_0',
        response_time: response.data.response_time || responseTime,
        tokens_used: response.data.tokens_used || Math.ceil(response.data.response.length / 4)
      };
    } catch (error: any) {
      console.error('❌ Error conectando con Gateway Sheily AI:', error);

      // Manejar errores específicos del gateway
      if (error.response?.status === 503) {
        chatService.handleApiError(error, "El servidor LLM no está disponible. Por favor, intenta más tarde.");
      } else if (error.response?.status === 504) {
        chatService.handleApiError(error, "El servidor tardó demasiado en responder. Por favor, intenta con una consulta más corta.");
      } else if (error.code === 'ECONNREFUSED') {
        chatService.handleApiError(error, "No se puede conectar con el Gateway Sheily AI. Verifica que esté ejecutándose.");
      } else {
        chatService.handleApiError(error, "Error de conexión con el Gateway Sheily AI");
      }

      throw error; // No fallbacks - el gateway maneja todo
    }
  },

  async checkModelHealth(): Promise<boolean> {
    try {
      // Verificar el Gateway Sheily AI
      const response = await axios.get(`${SHEILY_GATEWAY_URL}/health`);
      const isHealthy = response.status === 200 && response.data.status !== 'degraded';

      console.log('🔍 Estado del Gateway Sheily AI:', {
        status: response.data.status,
        uptime: response.data.uptime,
        requests_processed: response.data.requests_processed,
        llm_connected: response.data.connections?.llm_server,
        backend_connected: response.data.connections?.backend,
        healthy: isHealthy
      });

      return isHealthy;
    } catch (error) {
      console.error('❌ Gateway Sheily AI no disponible:', error);
      chatService.handleApiError(error, "Gateway Sheily AI no disponible");
      return false;
    }
  },

  async getModelInfo() {
    try {
      // Obtener información actual del gateway
      const statusResponse = await axios.get(`${SHEILY_GATEWAY_URL}/status`);

      return {
        name: "Sheily AI Gateway",
        subtitle: "Sistema inteligente con Llama-3.2-3B-Instruct-Q8_0",
        purpose: "Gateway inteligente que conecta el dashboard con el modelo Llama 3.2, proporcionando respuestas contextuales y de alta calidad a través de una arquitectura optimizada.",
        capabilities: [
          "Procesamiento inteligente de consultas vía Gateway",
          "Clasificación automática de dominios",
          "Gestión optimizada de conexiones LLM",
          "Métricas detalladas de rendimiento",
          "Sistema de calidad de respuestas",
          "Arquitectura de microservicios escalable"
        ],
        backend_model: statusResponse.data.connections?.llm_server?.model || "Llama-3.2-3B-Instruct-Q8_0",
        quantization: "Q8_0",
        parameters: "3B parámetros",
        memory: "~2.2GB VRAM",
        context: "4096 tokens",
        gateway_status: statusResponse.data.status,
        connections: statusResponse.data.connections,
        special_features: [
          "Arquitectura Gateway optimizada",
          "Conexión directa con LLM Server",
          "Procesamiento inteligente de dominios",
          "Métricas de calidad y rendimiento",
          "Gestión automática de errores",
          "Logging avanzado de consultas"
        ]
      };
    } catch (error) {
      console.error('Error obteniendo información del Gateway Sheily AI:', error);

      // Fallback con información básica si el gateway no está disponible
      return {
        name: "Sheily AI Gateway",
        subtitle: "Sistema inteligente con Llama-3.2-3B-Instruct-Q8_0",
        purpose: "Gateway inteligente que conecta el dashboard con el modelo Llama 3.2",
        capabilities: [
          "Procesamiento inteligente de consultas",
          "Clasificación automática de dominios",
          "Métricas de rendimiento",
          "Sistema de calidad de respuestas"
        ],
        backend_model: "Llama-3.2-3B-Instruct-Q8_0",
        quantization: "Q8_0",
        parameters: "3B parámetros",
        memory: "~2.2GB VRAM",
        context: "4096 tokens",
        gateway_status: "unavailable",
        special_features: [
          "Arquitectura Gateway optimizada",
          "Conexión con LLM Server",
          "Gestión automática de errores"
        ]
      };
    }
  }
};

export default chatService;
