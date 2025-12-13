// AI Provider Types

export interface AIModel {
  id: string
  name: string
  provider: AIProviderType
  maxTokens: number
  contextWindow: number
  costPer1kInputTokens: number
  costPer1kOutputTokens: number
  supportsStreaming: boolean
  supportsVision: boolean
  description?: string
}

export type AIProviderType = 'openai' | 'anthropic' | 'google'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionOptions {
  model: string
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface AIStreamChunk {
  type: 'content' | 'done' | 'error'
  content?: string
  error?: string
  finishReason?: string
}

export interface AICompletionResult {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
}

export interface AIProvider {
  name: string
  type: AIProviderType
  models: AIModel[]
  isConfigured(): boolean
  chat(options: AICompletionOptions): Promise<AICompletionResult>
  streamChat(options: AICompletionOptions): AsyncGenerator<AIStreamChunk>
}

// Available models configuration
export const AVAILABLE_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    costPer1kInputTokens: 0.01,
    costPer1kOutputTokens: 0.03,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Most capable GPT-4 model with vision support',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    costPer1kInputTokens: 0.005,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Fastest GPT-4 class model',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    maxTokens: 16384,
    contextWindow: 128000,
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Affordable and fast for simple tasks',
  },
  // Anthropic Models
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Best balance of speed and capability',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kInputTokens: 0.001,
    costPer1kOutputTokens: 0.005,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Fastest Claude model for quick tasks',
  },
  // Google Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    maxTokens: 8192,
    contextWindow: 1000000,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Long context with 1M token window',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    maxTokens: 8192,
    contextWindow: 1000000,
    costPer1kInputTokens: 0.000075,
    costPer1kOutputTokens: 0.0003,
    supportsStreaming: true,
    supportsVision: true,
    description: 'Fast and cost-effective',
  },
]

export function getModelById(modelId: string): AIModel | undefined {
  return AVAILABLE_MODELS.find(m => m.id === modelId)
}

export function getModelsByProvider(provider: AIProviderType): AIModel[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider)
}
