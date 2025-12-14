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

// Default fallback (used if .env not set)
// Prefer GPT-5.2 (Preview) by default; provider will fall back if unavailable.
export const DEFAULT_MODEL = 'gpt-5.2-preview'

// Hard fallback if the preferred/default model isn't available.
export const HARD_FALLBACK_MODEL = 'gpt-4o-mini'
