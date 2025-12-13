import OpenAI from 'openai'
import type {
  AIProvider,
  AICompletionOptions,
  AICompletionResult,
  AIStreamChunk,
  AIModel
} from '../types'
import { getModelsByProvider } from '../types'

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  type = 'openai' as const
  private client: OpenAI | null = null

  get models(): AIModel[] {
    return getModelsByProvider('openai')
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured')
      }
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
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
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
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
      finishReason: choice.finish_reason || 'stop',
    }
  }

  async *streamChat(options: AICompletionOptions): AsyncGenerator<AIStreamChunk> {
    const client = this.getClient()

    const stream = await client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stream: true,
    })

    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        const finishReason = chunk.choices[0]?.finish_reason

        if (content) {
          yield {
            type: 'content',
            content,
          }
        }

        if (finishReason) {
          yield {
            type: 'done',
            finishReason,
          }
        }
      }
    } catch (error: any) {
      yield {
        type: 'error',
        error: error.message || 'Unknown error occurred',
      }
    }
  }
}
