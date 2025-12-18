import OpenAI from 'openai'
import type {
  AIProvider,
  AICompletionOptions,
  AICompletionResult,
  AIStreamChunk,
} from '../types'

// Fallback model for retry logic (required - no fallback, must be configured in .env.local)
if (!process.env.FALLBACK_MODEL) {
  throw new Error('FALLBACK_MODEL environment variable is required. Set it in .env.local')
}
const HARD_FALLBACK_MODEL: string = process.env.FALLBACK_MODEL

// Determine which provider to use based on environment variables
const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const providerName = useOpenRouter ? 'OpenRouter' : 'OpenAI'

export class OpenAIProvider implements AIProvider {
  name = providerName
  private client: OpenAI | null = null

  private shouldRetryWithFallback(error: any): boolean {
    const message = (error?.message || '').toLowerCase()
    const code = (error?.code || error?.error?.code || '').toLowerCase()
    const status = error?.status || error?.response?.status

    // Common OpenAI-ish error signals
    if (status === 404) return true
    if (status === 401 || status === 403) return true
    if (code.includes('model') && code.includes('not')) return true
    if (message.includes('model') && (message.includes('not found') || message.includes('does not exist'))) return true
    if (message.includes('you do not have access') && message.includes('model')) return true
    if (message.includes('model_not_found')) return true

    return false
  }

  isConfigured(): boolean {
    return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
  }

  private getClient(): OpenAI {
    if (!this.client) {
      // Prefer OpenRouter if configured, fallback to OpenAI
      if (process.env.OPENROUTER_API_KEY) {
        this.client = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Injaz.ai',
          },
        })
      } else if (process.env.OPENAI_API_KEY) {
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_BASE_URL, // Optional custom base URL
        })
      } else {
        throw new Error('No AI API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY')
      }
    }
    return this.client
  }

  async chat(options: AICompletionOptions): Promise<AICompletionResult> {
    const client = this.getClient()

    const run = async (model: string) =>
      client.chat.completions.create({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: false,
      })

    let response: any
    try {
      response = await run(options.model)
    } catch (error: any) {
      if (options.model !== HARD_FALLBACK_MODEL && this.shouldRetryWithFallback(error)) {
        response = await run(HARD_FALLBACK_MODEL)
      } else {
        throw error
      }
    }

    const choice = response.choices[0]

    return {
      content: choice.message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    }
  }

  async *streamChat(options: AICompletionOptions): AsyncGenerator<AIStreamChunk> {
    const client = this.getClient()

    const run = async (model: string) =>
      client.chat.completions.create({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true,
      })

    let stream: any
    try {
      stream = await run(options.model)
    } catch (error: any) {
      if (options.model !== HARD_FALLBACK_MODEL && this.shouldRetryWithFallback(error)) {
        stream = await run(HARD_FALLBACK_MODEL)
      } else {
        yield { type: 'error', error: error.message || 'Unknown error' }
        return
      }
    }

    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        const finishReason = chunk.choices[0]?.finish_reason

        if (content) {
          yield { type: 'content', content }
        }

        if (finishReason) {
          yield { type: 'done' }
        }
      }
    } catch (error: any) {
      yield { type: 'error', error: error.message || 'Unknown error' }
    }
  }
}
