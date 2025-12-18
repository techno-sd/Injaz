// AI Types - Simplified (model comes from .env)

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
}

export interface AIStreamChunk {
  type: 'content' | 'done' | 'error'
  content?: string
  error?: string
}

export interface AICompletionResult {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIProvider {
  name: string
  isConfigured(): boolean
  chat(options: AICompletionOptions): Promise<AICompletionResult>
  streamChat(options: AICompletionOptions): AsyncGenerator<AIStreamChunk>
}

// Models are configured via environment variables only
// No hardcoded defaults - use .env.local for configuration
