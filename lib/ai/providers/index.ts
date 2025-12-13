import { OpenAIProvider } from './openai'
import type { AIProvider } from '../types'

// Single OpenAI provider (model comes from .env)
const openaiProvider = new OpenAIProvider()

export function getProviderForModel(_modelId: string): AIProvider {
  // All models use OpenAI provider (model ID passed to OpenAI API)
  return openaiProvider
}

export function isModelAvailable(_modelId: string): boolean {
  return openaiProvider.isConfigured()
}

// Re-export
export * from '../types'
export { OpenAIProvider } from './openai'
