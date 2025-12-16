import OpenAI from 'openai'
import type {
  AIProvider,
  AICompletionOptions,
  AICompletionResult,
  AIStreamChunk,
} from '../types'

// Determine which provider to use based on environment variables
const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const providerName = useOpenRouter ? 'OpenRouter' : 'OpenAI'

export class OpenAIProvider implements AIProvider {
  name = providerName
  private client: OpenAI | null = null

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

    const response = await client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: false,
    })

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

    const stream = await client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    })

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
