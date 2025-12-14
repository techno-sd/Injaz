import { NextRequest, NextResponse } from 'next/server'
import { getAIDebugger, type DebugContext, type DebugResult } from '@/lib/ai/debugger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error, files, mode = 'full' } = body as DebugContext & { mode?: 'full' | 'quick' | 'stream' }

    if (!error) {
      return NextResponse.json(
        { error: 'Error information is required' },
        { status: 400 }
      )
    }

    const debugger_ = getAIDebugger()

    if (mode === 'quick') {
      // Quick suggestions without AI call
      const suggestions = await debugger_.getQuickSuggestions(error)
      return NextResponse.json({ suggestions })
    }

    if (mode === 'stream') {
      // Streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of debugger_.streamAnalysis({ error, files: files || [] })) {
              controller.enqueue(encoder.encode(chunk))
            }
            controller.close()
          } catch (err: any) {
            controller.enqueue(encoder.encode(`\n\nError: ${err.message}`))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    // Full analysis
    const result = await debugger_.analyzeError({
      error,
      files: files || [],
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('AI Debug API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze error' },
      { status: 500 }
    )
  }
}
