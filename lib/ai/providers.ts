// AI Provider - OpenRouter wrapper
// Simplified to work with config.ts models

import { AI_MODELS, OPENROUTER_CONFIG, DEFAULT_SETTINGS } from './config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  type: 'content' | 'error' | 'done'
  content?: string
  error?: string
}

export interface ChatResult {
  content: string
  error?: string
}

export interface Provider {
  name: string
  isConfigured: () => boolean
  chat: (options: {
    model: string
    messages: ChatMessage[]
    temperature?: number
    maxTokens?: number
  }) => Promise<ChatResult>
  streamChat: (options: {
    model: string
    messages: ChatMessage[]
    temperature?: number
  }) => AsyncGenerator<StreamChunk>
}

// OpenRouter provider
const openRouterProvider: Provider = {
  name: 'OpenRouter',

  isConfigured: () => {
    return !!process.env.OPENROUTER_API_KEY
  },

  // Non-streaming chat
  async chat({ model, messages, temperature = DEFAULT_SETTINGS.temperature, maxTokens = 4000 }) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return { content: '', error: 'OpenRouter API key not configured' }
    }

    try {
      const response = await fetch(OPENROUTER_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': OPENROUTER_CONFIG.referer,
          'X-Title': OPENROUTER_CONFIG.title,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { content: '', error: `API error: ${response.status} - ${error}` }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      return { content }
    } catch (error: any) {
      return { content: '', error: error.message || 'Unknown error' }
    }
  },

  // Streaming chat
  async *streamChat({ model, messages, temperature = DEFAULT_SETTINGS.temperature }) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      yield { type: 'error', error: 'OpenRouter API key not configured' }
      return
    }

    try {
      const response = await fetch(OPENROUTER_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': OPENROUTER_CONFIG.referer,
          'X-Title': OPENROUTER_CONFIG.title,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 4000,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        yield { type: 'error', error: `API error: ${response.status} - ${error}` }
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        yield { type: 'error', error: 'No response body' }
        return
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              yield { type: 'done' }
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                yield { type: 'content', content }
              }
            } catch {
              // Ignore parse errors for streaming chunks
            }
          }
        }
      }

      yield { type: 'done' }
    } catch (error: any) {
      yield { type: 'error', error: error.message || 'Unknown error' }
    }
  },
}

// Get provider for a model (all models use OpenRouter)
export function getProviderForModel(model: string): Provider | null {
  // All models go through OpenRouter
  return openRouterProvider
}

// Check if model is available
export function isModelAvailable(model: string): boolean {
  return openRouterProvider.isConfigured()
}

// Export default provider
export const defaultProvider = openRouterProvider
