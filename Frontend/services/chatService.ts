import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

interface ChatRequestParams {
  prompt: string;
  max_length?: number;
  temperature?: number;
}

interface ChatResponsePayload {
  message: string;
  model_used: string;
  response_time: number;
  tokens_used: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

const LLM_SERVER_URL =
  process.env.NEXT_PUBLIC_LLM_SERVER_URL || 'http://localhost:8005';
const CHAT_ENDPOINT = `${LLM_SERVER_URL}/v1/chat/completions`;

export const chatService = {
  handleApiError(error: any, defaultMessage: string = "Error en la operación"): void {
    if (error.response) {
      const data = error.response.data || {};
      const detail = data.error || data.message || error.response.statusText || error.response.status;
      toast({
        title: "Error de Chat",
        description: `${defaultMessage}: ${detail}`,
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

  async sendMessage(params: ChatRequestParams): Promise<ChatResponsePayload> {
    try {
      const startTime = Date.now();

      const response = await axios.post(
        CHAT_ENDPOINT,
        {
          model: 'Llama-3.2-3B-Instruct-Q8_0',
          messages: [
            {
              role: 'system',
              content:
                'Eres Sheily AI, un asistente inteligente que responde directamente usando el servidor Llama local.',
            },
            { role: 'user', content: params.prompt },
          ],
          temperature: params.temperature ?? 0.7,
          top_p: 0.95,
          max_tokens: params.max_length ?? 500,
          stream: false,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const endTime = Date.now();
      const measuredTime = (endTime - startTime) / 1000;

      const choice = response.data?.choices?.[0];
      const message = choice?.message?.content?.trim();

      if (!message) {
        throw new Error('El servidor LLM local no devolvió una respuesta válida');
      }

      const usage = response.data?.usage || {};
      const serverProcessing = typeof response.data?.processing_time === 'number' ? response.data.processing_time : null;
      const responseTime = serverProcessing ?? measuredTime;
      const promptTokens = typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : undefined;
      const completionTokens = typeof usage.completion_tokens === 'number' ? usage.completion_tokens : undefined;
      const tokensUsed = typeof usage.total_tokens === 'number' ? usage.total_tokens : Math.ceil(message.length / 4);

      console.log('✅ Respuesta del servidor LLM local:', {
        llm_model: response.data.model,
        response_time: responseTime,
        usage,
      });

      return {
        message,
        model_used: response.data.model || 'Llama-3.2-3B-Instruct-Q8_0',
        response_time: responseTime,
        tokens_used: tokensUsed,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
      };
    } catch (error: any) {
      console.error('❌ Error conectando con el servidor LLM local:', error);

      if (error.response?.status === 503) {
        chatService.handleApiError(
          error,
          'El servidor LLM no está disponible. Por favor, intenta más tarde.',
        );
      } else if (error.response?.status === 504) {
        chatService.handleApiError(
          error,
          'El servidor tardó demasiado en responder. Intenta con una consulta más corta.',
        );
      } else if (error.code === 'ECONNREFUSED') {
        chatService.handleApiError(
          error,
          'No se puede conectar con el servidor LLM local. Verifica que esté ejecutándose.',
        );
      } else {
        chatService.handleApiError(error, 'Error de conexión con el servidor LLM local');
      }

      throw error;
    }
  },

  async checkModelHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${LLM_SERVER_URL}/health`);
      const isHealthy = response.status === 200;

      console.log('🔍 Estado del servidor LLM local:', {
        status: response.data.status,
        model: response.data.model,
        healthy: isHealthy,
      });

      return isHealthy;
    } catch (error) {
      console.error('❌ Servidor LLM local no disponible:', error);
      chatService.handleApiError(error, 'Servidor LLM local no disponible');
      return false;
    }
  },

  async getModelInfo() {
    try {
      const response = await axios.get(`${LLM_SERVER_URL}/v1/models`);
      const model = response.data?.data?.[0]?.id || 'Llama-3.2-3B-Instruct-Q8_0';

      return {
        name: 'Sheily AI LLM local',
        subtitle: 'Asistente inteligente con Llama-3.2-3B-Instruct-Q8_0',
        purpose:
          'El dashboard se conecta directamente con el servidor Llama local para proporcionar respuestas en tiempo real sin pasarelas intermedias.',
        capabilities: [
          'Respuestas conversacionales en español',
          'Procesamiento directo de consultas del dashboard',
          'Pipeline draft → critic → fix disponible desde el backend',
          'Baja latencia al ejecutar en local',
        ],
        backend_model: model,
        quantization: 'Q8_0',
        parameters: '3B parámetros',
        memory: '~2.2GB VRAM',
        context: '4096 tokens',
        service_status: 'running',
        restrictions: [
          'Contexto limitado a 4096 tokens',
          'Requiere que el servidor LLM local esté activo',
          'Sin reintentos automáticos externos',
        ],
      };
    } catch (error) {
      console.error('Error obteniendo información del servidor LLM local:', error);

      return {
        name: 'Sheily AI LLM local',
        subtitle: 'Asistente inteligente con Llama-3.2-3B-Instruct-Q8_0',
        purpose:
          'Conexión directa con el servidor Llama local para respuestas inmediatas.',
        capabilities: [
          'Respuestas conversacionales en español',
          'Procesamiento directo de consultas del dashboard',
        ],
        backend_model: 'Llama-3.2-3B-Instruct-Q8_0',
        quantization: 'Q8_0',
        parameters: '3B parámetros',
        memory: '~2.2GB VRAM',
        context: '4096 tokens',
        service_status: 'unavailable',
        restrictions: [
          'Contexto limitado a 4096 tokens',
          'Requiere que el servidor LLM local esté activo',
        ],
      };
    }
  }
};

export default chatService;
