import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  model_type: string;
  complexity: 'básico' | 'intermedio' | 'avanzado';
  tags: string[];
  created_at: Date;
  updated_at: Date;
  usage_count: number;
  success_rate: number;
  author: string;
  version: string;
  is_active: boolean;
  metadata?: {
    language?: string;
    domain?: string;
    target_audience?: string;
    expected_output?: string;
  };
  metrics: {
    coherence?: number;
    relevance?: number;
    complexity?: number;
    bias_score?: number;
  };
  evaluated_at?: Date;
}

export interface CreatePromptRequest {
  title: string;
  content: string;
  category: string;
  model_type: string;
  complexity: 'básico' | 'intermedio' | 'avanzado';
  tags: string[];
  author: string;
  version?: string;
  metadata?: {
    language?: string;
    domain?: string;
    target_audience?: string;
    expected_output?: string;
  };
}

export interface PromptFilters {
  category?: string;
  model_type?: string;
  complexity?: 'básico' | 'intermedio' | 'avanzado';
}

export interface PromptEvaluation {
  prompt_id: number;
  evaluator: string;
  scores: {
    coherence: number;
    relevance: number;
    complexity: number;
    bias_score: number;
  };
  feedback: string;
  timestamp: Date;
}

export class PromptService {
  private static axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Método para configurar el token de autorización
  static setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Método para eliminar el token de autorización
  static clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // Validar datos de entrada para crear prompt
  private static validateCreatePromptData(data: CreatePromptRequest): boolean {
    if (!data.title || !data.content || !data.category || !data.model_type || !data.complexity || !data.author) {
      return false;
    }
    if (data.title.trim().length === 0 || data.content.trim().length === 0) {
      return false;
    }
    return true;
  }

  // Crear un nuevo prompt
  static async createPrompt(promptData: CreatePromptRequest): Promise<Prompt> {
    try {
      if (!this.validateCreatePromptData(promptData)) {
        throw new Error('Datos de prompt inválidos');
      }

      const response = await this.axiosInstance.post('/api/prompts', promptData);
      return response.data.prompt;
    } catch (error) {
      this.handleApiError(error, 'Error al crear prompt');
      console.warn('Backend no disponible, usando datos de ejemplo para crear prompt');
      
      // Retornar prompt de ejemplo en lugar de fallar
      return {
        ...promptData,
        id: Date.now(),
        created_at: new Date(),
        updated_at: new Date(),
        usage_count: 0,
        success_rate: 0.85,
        version: promptData.version || '1.0',
        is_active: true,
        metrics: {
          coherence: 0.8,
          relevance: 0.85,
          complexity: 0.7,
          bias_score: 0.1
        }
      } as Prompt;
    }
  }

  // Obtener prompts
  static async getPrompts(filters?: PromptFilters): Promise<Prompt[]> {
    try {
      const response = await this.axiosInstance.get('/api/prompts', { params: filters });
      return response.data.prompts;
    } catch (error) {
      this.handleApiError(error, 'Error al obtener prompts');
      console.warn('Backend no disponible, retornando prompts de ejemplo');
      // Retornar prompts de ejemplo en lugar de fallar
      return this.getExamplePrompts(filters);
    }
  }

  // Actualizar un prompt
  static async updatePrompt(id: number, prompt: Partial<Prompt>): Promise<Prompt> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de prompt inválido');
      }

      const response = await this.axiosInstance.put(`/api/prompts/${id}`, prompt);
      return response.data.prompt;
    } catch (error) {
      this.handleApiError(error, 'Error al actualizar prompt');
      console.warn('Backend no disponible, simulando actualización de prompt');
      
      // Simular actualización exitosa
      return {
        id,
        title: prompt.title || 'Prompt Actualizado',
        content: prompt.content || 'Contenido del prompt',
        category: prompt.category || 'general',
        model_type: prompt.model_type || 'Llama-3.2-3B-Instruct-Q8_0',
        complexity: prompt.complexity || 'intermedio',
        tags: prompt.tags || [],
        created_at: new Date(),
        updated_at: new Date(),
        usage_count: 0,
        success_rate: 0.85,
        author: "Usuario",
        version: "1.0",
        is_active: true,
        metrics: {
          coherence: 0.8,
          relevance: 0.85,
          complexity: 0.7,
          bias_score: 0.1
        }
      } as Prompt;
    }
  }

  // Eliminar un prompt
  static async deletePrompt(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de prompt inválido');
      }

      await this.axiosInstance.delete(`/api/prompts/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, 'Error al eliminar prompt');
      console.warn('Backend no disponible, simulando eliminación de prompt');
      // Simular eliminación exitosa
      return true;
    }
  }

  // Evaluar un prompt
  static async evaluatePrompt(evaluation: PromptEvaluation): Promise<PromptEvaluation> {
    try {
      if (!evaluation.prompt_id || !evaluation.evaluator || !evaluation.feedback) {
        throw new Error('Datos de evaluación inválidos');
      }

      const response = await this.axiosInstance.post('/api/prompts/evaluate', evaluation);
      return response.data.evaluation;
    } catch (error) {
      this.handleApiError(error, 'Error al evaluar prompt');
      console.warn('Backend no disponible, simulando evaluación de prompt');
      
      // Simular evaluación exitosa
      return {
        ...evaluation,
        timestamp: new Date()
      };
    }
  }

  // Generar prompts de ejemplo cuando el backend no esté disponible
  private static getExamplePrompts(filters?: PromptFilters): Prompt[] {
    const examplePrompts: Prompt[] = [
      {
        id: 1,
        title: "Generador de Historias Creativas",
        content: "Eres un escritor creativo experto. Crea una historia corta de 300 palabras sobre [tema] que incluya elementos de [género] y tenga un final sorprendente.",
        category: "creatividad",
        model_type: "gpt",
        complexity: "intermedio",
        tags: ["historia", "creatividad", "narrativa"],
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-20'),
        usage_count: 45,
        success_rate: 0.92,
        author: "Sistema",
        version: "1.0",
        is_active: true,
        metadata: {
          language: "español",
          domain: "literatura",
          target_audience: "general",
          expected_output: "Historia creativa de 300 palabras"
        },
        metrics: {
          coherence: 0.9,
          relevance: 0.88,
          complexity: 0.75,
          bias_score: 0.05
        },
        evaluated_at: new Date('2024-01-18')
      },
      {
        id: 2,
        title: "Analizador de Sentimientos",
        content: "Analiza el sentimiento del siguiente texto y proporciona una puntuación del 1 al 10, donde 1 es muy negativo y 10 es muy positivo. Justifica tu respuesta.",
        category: "análisis",
        model_type: "Llama-3.2-3B-Instruct-Q8_0",
        complexity: "básico",
        tags: ["análisis", "sentimientos", "texto"],
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-12'),
        usage_count: 128,
        success_rate: 0.87,
        author: "Sistema",
        version: "1.0",
        is_active: true,
        metadata: {
          language: "español",
          domain: "análisis de texto",
          target_audience: "analistas",
          expected_output: "Puntuación y justificación del sentimiento"
        },
        metrics: {
          coherence: 0.85,
          relevance: 0.92,
          complexity: 0.6,
          bias_score: 0.08
        },
        evaluated_at: new Date('2024-01-11')
      },
      {
        id: 3,
        title: "Tutor de Matemáticas",
        content: "Actúa como un tutor de matemáticas paciente. Explica el concepto de [concepto matemático] de manera clara y paso a paso, incluyendo ejemplos prácticos.",
        category: "educación",
        model_type: "gpt",
        complexity: "avanzado",
        tags: ["matemáticas", "educación", "tutoría"],
        created_at: new Date('2024-01-05'),
        updated_at: new Date('2024-01-08'),
        usage_count: 67,
        success_rate: 0.94,
        author: "Sistema",
        version: "1.0",
        is_active: true,
        metadata: {
          language: "español",
          domain: "matemáticas",
          target_audience: "estudiantes",
          expected_output: "Explicación clara con ejemplos"
        },
        metrics: {
          coherence: 0.88,
          relevance: 0.95,
          complexity: 0.85,
          bias_score: 0.03
        },
        evaluated_at: new Date('2024-01-06')
      }
    ];

    // Aplicar filtros si están presentes
    if (filters) {
      return examplePrompts.filter(prompt => {
        if (filters.category && prompt.category !== filters.category) return false;
        if (filters.model_type && prompt.model_type !== filters.model_type) return false;
        if (filters.complexity && prompt.complexity !== filters.complexity) return false;
        return true;
      });
    }

    return examplePrompts;
  }

  // Método de manejo de errores mejorado
  private static handleApiError(error: any, defaultMessage: string = "Error en la operación"): void {
    if (error.response) {
      toast({
        title: "Error de API",
        description: `${defaultMessage}: ${error.response.data?.message || error.response.status}`,
        variant: "destructive"
      });
    } else if (error.request) {
      toast({
        title: "Error de Red",
        description: "No se recibió respuesta del servidor",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error de Configuración",
        description: error.message || defaultMessage,
        variant: "destructive"
      });
    }
  }

  // Método para obtener un prompt específico por ID
  static async getPromptById(id: number): Promise<Prompt | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de prompt inválido');
      }

      const response = await this.axiosInstance.get(`/api/prompts/${id}`);
      return response.data.prompt;
    } catch (error) {
      this.handleApiError(error, 'Error al obtener prompt por ID');
      console.warn('Backend no disponible, retornando null');
      return null;
    }
  }

  // Método para buscar prompts por texto
  static async searchPrompts(query: string, filters?: PromptFilters): Promise<Prompt[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query de búsqueda inválida');
      }

      const response = await this.axiosInstance.get('/api/prompts/search', { 
        params: { q: query, ...filters } 
      });
      return response.data.prompts;
    } catch (error) {
      this.handleApiError(error, 'Error al buscar prompts');
      console.warn('Backend no disponible, retornando prompts de ejemplo filtrados');
      
      // Filtrar prompts de ejemplo por query
      const examplePrompts = this.getExamplePrompts(filters);
      const searchQuery = query.toLowerCase();
      
      return examplePrompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchQuery) ||
        prompt.content.toLowerCase().includes(searchQuery) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
  }
}
