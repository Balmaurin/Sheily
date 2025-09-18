// Tipos para el sistema de chat

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  id?: string;
  metadata?: {
    tokens?: number;
    model?: string;
    response_time?: number;
    domain?: string;
  };
}

export interface ChatResponse {
  message: string;
  model_used: string;
  response_time: number;
  tokens_used: number;
  confidence?: number;
  domain?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
  domain?: string;
  metadata?: {
    total_tokens: number;
    average_response_time: number;
    model_used: string;
    lora_files_generated: number;
  };
}

export interface LoRAGenerationRequest {
  conversation: ChatMessage[];
  domain: string;
  model: string;
  target_model: string;
  parameters?: {
    learning_rate?: number;
    epochs?: number;
    batch_size?: number;
    target_modules?: string[];
  };
}

export interface LoRAGenerationResponse {
  lora_file_path: string;
  status: 'success' | 'error' | 'processing';
  message?: string;
  progress?: number;
  estimated_time?: number;
  metadata?: {
    parameters_used: any;
    training_metrics?: any;
    file_size?: number;
  };
}

export interface ChatModelInfo {
  name: string;
  purpose: string;
  quantization: string;
  parameters: string;
  memory: string;
  context: string;
  capabilities: string[];
  restrictions: string[];
  system_architecture?: {
    base_model: string;
    quantization_method: string;
    target_models: string[];
    supported_domains: number;
    lora_adapters: string;
  };
}

export interface ChatUsageStats {
  total_requests: number;
  successful_responses: number;
  lora_files_generated: number;
  average_response_time: number;
  memory_usage: string;
  uptime: string;
  error_rate?: number;
  active_sessions?: number;
}

export interface ChatSettings {
  max_tokens: number;
  temperature: number;
  top_p: number;
  top_k: number;
  repetition_penalty: number;
  model: string;
  auto_generate_lora: boolean;
  save_conversations: boolean;
  export_format: 'json' | 'txt' | 'markdown';
}

export interface ChatError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface ChatMetrics {
  message_count: number;
  total_tokens: number;
  average_response_time: number;
  user_messages: number;
  assistant_messages: number;
  errors: number;
  lora_files_generated: number;
  session_duration: number;
}

// Tipos para el contexto del chat
export interface ChatContext {
  domain?: string;
  user_preferences?: any;
  conversation_history?: ChatMessage[];
  active_session?: ChatSession;
  model_config?: ChatSettings;
}

// Tipos para las respuestas del modelo
export interface ModelResponse {
  content: string;
  confidence: number;
  reasoning?: string;
  suggested_actions?: string[];
  metadata?: {
    model_version: string;
    processing_time: number;
    tokens_consumed: number;
    context_used: number;
  };
}

// Tipos para la gestión de archivos LoRA
export interface LoRAFile {
  id: string;
  filename: string;
  path: string;
  size: number;
  created_at: Date;
  domain: string;
  model_source: string;
  model_target: string;
  parameters: any;
  status: 'ready' | 'training' | 'error';
  metadata?: {
    training_metrics?: any;
    validation_scores?: any;
    usage_count: number;
  };
}

// Tipos para el sistema de dominios
export interface ChatDomain {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  specialized_models: string[];
  lora_templates: string[];
  training_data_sources: string[];
  validation_metrics: string[];
  active: boolean;
}
