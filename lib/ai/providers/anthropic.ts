import Anthropic from '@anthropic-ai/sdk'
import type {
  AIProvider,
  AICompletionOptions,
  AICompletionResult,
  AIStreamChunk,
  AIModel
} from '../types'
import { getModelsByProvider } from '../types'

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic'
  type = 'anthropic' as const
  private client: Anthropic | null = null

  get models(): AIModel[] {
    return getModelsByProvider('anthropic')
  }

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY
  }

  private getClient(): Anthropic {
    if (!this.client) {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not configured')
      }
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })
    }
    return this.client
  }

  async chat(options: AICompletionOptions): Promise<AICompletionResult> {
    const client = this.getClient()

    // Extract system message if present
    const systemMessage = options.messages.find(m => m.role === 'system')
    const userMessages = options.messages.filter(m => m.role !== 'system')

    const response = await client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens || 4096,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options.temperature ?? 0.7,
      top_p: options.topP,
    })

    const content = response.content[0]

    return {
      content: content.type === 'text' ? content.text : '',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason || 'end_turn',
    }
  }

  async *streamChat(options: AICompletionOptions): AsyncGenerator<AIStreamChunk> {
    const client = this.getClient()

    // Extract system message if present
    const systemMessage = options.messages.find(m => m.role === 'system')
    const userMessages = options.messages.filter(m => m.role !== 'system')

    try {
      const stream = await client.messages.stream({
        model: options.model,
        max_tokens: options.maxTokens || 4096,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        top_p: options.topP,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta as { type: string; text?: string }
          if (delta.type === 'text_delta' && delta.text) {
            yield {
              type: 'content',
              content: delta.text,
            }
          }
        } else if (event.type === 'message_stop') {
          yield {
            type: 'done',
            finishReason: 'end_turn',
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
