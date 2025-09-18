import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface TrainingBranch {
  id: string;
  name: string;
  domain: string;
  description: string;
  status: 'idle' | 'training' | 'completed' | 'error';
  progress: number;
  created_at: Date;
  updated_at: Date;
  model_path?: string;
  lora_adapters: string[];
  performance_metrics?: {
    accuracy: number;
    loss: number;
    perplexity: number;
    bleu_score?: number;
  };
}

export interface TrainingSession {
  id: string;
  branch_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  start_time: Date;
  end_time?: Date;
  config: TrainingConfig;
  metrics?: any;
  logs?: string[];
}

export interface TrainingConfig {
  learning_rate: number;
  batch_size: number;
  epochs: number;
  max_steps?: number;
  gradient_accumulation_steps: number;
  warmup_steps: number;
  save_steps: number;
  logging_steps: number;
  eval_steps: number;
  target_modules: string[];
  r: number; // LoRA rank
  alpha: number; // LoRA alpha
  dropout: number;
}

export class BranchTrainingService {
  private static axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Mayor timeout para operaciones de entrenamiento
    headers: {
      'Content-Type': 'application/json'
    }
  });

  static setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

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

  // Obtener todas las ramas de entrenamiento REAL
  static async getTrainingBranches(): Promise<TrainingBranch[]> {
    try {
      const response = await this.axiosInstance.get('/api/training/branches');
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error obteniendo ramas de entrenamiento del servidor');
      throw new Error('Error obteniendo ramas de entrenamiento del servidor');
    }
  }

  // Crear nueva rama de entrenamiento REAL
  static async createTrainingBranch(branchData: Partial<TrainingBranch>): Promise<TrainingBranch> {
    try {
      const response = await this.axiosInstance.post('/api/training/branches', branchData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error creando rama de entrenamiento');
      throw new Error('Error creando rama de entrenamiento');
    }
  }

  // Iniciar entrenamiento REAL
  static async startTraining(branchId: string, config: TrainingConfig): Promise<TrainingSession> {
    try {
      const response = await this.axiosInstance.post(`/api/training/branches/${branchId}/start`, {
        config
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error iniciando entrenamiento');
      throw new Error('Error iniciando entrenamiento');
    }
  }

  // Detener entrenamiento REAL
  static async stopTraining(sessionId: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post(`/api/training/sessions/${sessionId}/stop`);
      return response.data.success;
    } catch (error) {
      this.handleApiError(error, 'Error deteniendo entrenamiento');
      throw new Error('Error deteniendo entrenamiento');
    }
  }

  // Obtener progreso de entrenamiento REAL
  static async getTrainingProgress(sessionId: string): Promise<TrainingSession> {
    try {
      const response = await this.axiosInstance.get(`/api/training/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error obteniendo progreso de entrenamiento');
      throw new Error('Error obteniendo progreso de entrenamiento');
    }
  }

  // Generar archivo LoRA para una rama REAL
  static async generateLoRAForBranch(branchId: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post(`/api/training/branches/${branchId}/generate-lora`);
      return response.data.lora_path;
    } catch (error) {
      this.handleApiError(error, 'Error generando archivo LoRA para la rama');
      throw new Error('Error generando archivo LoRA para la rama');
    }
  }

  // Obtener métricas de rendimiento REAL
  static async getBranchMetrics(branchId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/api/training/branches/${branchId}/metrics`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error obteniendo métricas de rendimiento');
      throw new Error('Error obteniendo métricas de rendimiento');
    }
  }

  // Eliminar rama de entrenamiento REAL
  static async deleteTrainingBranch(branchId: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.delete(`/api/training/branches/${branchId}`);
      return response.data.success;
    } catch (error) {
      this.handleApiError(error, 'Error eliminando rama de entrenamiento');
      throw new Error('Error eliminando rama de entrenamiento');
    }
  }

  // Obtener configuración por defecto para una rama
  static getDefaultTrainingConfig(): TrainingConfig {
    return {
      learning_rate: 2e-5,
      batch_size: 4,
      epochs: 3,
      gradient_accumulation_steps: 4,
      warmup_steps: 100,
      save_steps: 500,
      logging_steps: 10,
      eval_steps: 100,
      target_modules: ['q_proj', 'v_proj', 'k_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'],
      r: 16,
      alpha: 32,
      dropout: 0.05
    };
  }

  // Validar configuración de entrenamiento
  static validateTrainingConfig(config: TrainingConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.learning_rate <= 0 || config.learning_rate > 1) {
      errors.push('Learning rate debe estar entre 0 y 1');
    }

    if (config.batch_size < 1 || config.batch_size > 32) {
      errors.push('Batch size debe estar entre 1 y 32');
    }

    if (config.epochs < 1 || config.epochs > 100) {
      errors.push('Epochs debe estar entre 1 y 100');
    }

    if (config.r < 1 || config.r > 256) {
      errors.push('LoRA rank (r) debe estar entre 1 y 256');
    }

    if (config.alpha < 1 || config.alpha > 512) {
      errors.push('LoRA alpha debe estar entre 1 y 512');
    }

    if (config.dropout < 0 || config.dropout > 1) {
      errors.push('Dropout debe estar entre 0 y 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtener información del sistema de entrenamiento
  static getTrainingSystemInfo() {
    return {
      base_model: 'Llama-3.2-3B-Instruct-Q8_0',
      total_branches: 32,
      supported_domains: [
        'medicina', 'programación', 'física', 'matemáticas', 'química',
        'biología', 'historia', 'literatura', 'filosofía', 'psicología',
        'economía', 'finanzas', 'derecho', 'ingeniería', 'arquitectura',
        'arte', 'música', 'deportes', 'gastronomía', 'viajes',
        'tecnología', 'ciencias_sociales', 'educación', 'negocios', 'marketing',
        'diseño', 'fotografía', 'cine', 'teatro', 'danza', 'política', 'general'
      ],
      lora_format: 'Safetensors',
      training_framework: 'HuggingFace Transformers + PEFT',
      quantization: 'LoRA: 0.1-1% parámetros entrenables, base Q8_0'
    };
  }
}
