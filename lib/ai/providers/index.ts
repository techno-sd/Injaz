import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import type { AIProvider, AIProviderType, AIModel } from '../types'
import { AVAILABLE_MODELS, getModelById } from '../types'

// Provider instances (lazy-loaded)
let providers: Map<AIProviderType, AIProvider> | null = null

function getProviders(): Map<AIProviderType, AIProvider> {
  if (!providers) {
    providers = new Map<AIProviderType, AIProvider>([
      ['openai', new OpenAIProvider()],
      ['anthropic', new AnthropicProvider()],
      // Google provider can be added later
    ])
  }
  return providers
}

export function getProvider(type: AIProviderType): AIProvider | undefined {
  return getProviders().get(type)
}

export function getProviderForModel(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  return getProvider(model.provider)
}

export function getConfiguredProviders(): AIProvider[] {
  return Array.from(getProviders().values()).filter(p => p.isConfigured())
}

export function getAvailableModels(): AIModel[] {
  const configuredProviders = new Set(
    getConfiguredProviders().map(p => p.type)
  )
  return AVAILABLE_MODELS.filter(m => configuredProviders.has(m.provider))
}

export function isModelAvailable(modelId: string): boolean {
  const model = getModelById(modelId)
  if (!model) return false
  const provider = getProvider(model.provider)
  return provider?.isConfigured() ?? false
}

// Re-export types and utilities
export * from '../types'
export { OpenAIProvider } from './openai'
export { AnthropicProvider } from './anthropic'
