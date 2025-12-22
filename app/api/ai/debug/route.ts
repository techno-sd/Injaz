import { NextRequest, NextResponse } from 'next/server'

// Simplified debug endpoint
// The old AI debugger has been removed as part of the simplified architecture

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error } = body

    if (!error) {
      return NextResponse.json(
        { error: 'Error information is required' },
        { status: 400 }
      )
    }

    // Return basic error analysis
    return NextResponse.json({
      analysis: 'Error debugging is currently simplified. Please check the error message and stack trace.',
      suggestions: [
        'Check the console for more details',
        'Verify all imports are correct',
        'Make sure all dependencies are installed',
      ],
      error: error,
    })
  } catch (err: any) {
    console.error('AI Debug API error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to analyze error' },
      { status: 500 }
    )
  }
}
