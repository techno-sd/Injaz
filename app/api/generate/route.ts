// Simple API endpoint for app generation
// Following Bolt.new / V0 patterns - streaming SSE response

import { generate, type GeneratorEvent } from '@/lib/ai/simple-generator'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, forceGeneration } = body

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of generate(prompt, apiKey, { forceGeneration })) {
            const data = `data: ${JSON.stringify(event)}\n\n`
            controller.enqueue(encoder.encode(data))
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          const errorEvent: GeneratorEvent = {
            type: 'error',
            data: { message: errorMessage },
            timestamp: Date.now(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
