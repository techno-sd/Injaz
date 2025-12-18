import { createClient } from '@/lib/supabase/server'
import { getProviderForModel } from '@/lib/ai/providers'
import type { File } from '@/types'

export const runtime = 'edge'

// Model from env (required)
const COMPLETION_MODEL = process.env.COMPLETION_AI_MODEL || 'deepseek/deepseek-chat-v3-0324'

interface CompletionRequest {
  projectId: string
  filePath: string
  fileContent: string
  cursorPosition: number
  prefix: string // Text before cursor
  suffix: string // Text after cursor
  language: string
}

export async function POST(req: Request) {
  try {
    const {
      projectId,
      filePath,
      fileContent,
      cursorPosition,
      prefix,
      suffix,
      language,
    }: CompletionRequest = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return new Response('Project not found', { status: 404 })
    }

    // Get provider
    const provider = getProviderForModel(COMPLETION_MODEL)
    if (!provider || !provider.isConfigured()) {
      return new Response(JSON.stringify({ completion: '' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build context for completion
    const systemPrompt = `You are an intelligent code completion assistant. Your task is to predict what the developer wants to type next based on the context.

RULES:
1. Only output the completion text, nothing else
2. Do not repeat the prefix
3. Keep completions concise (1-3 lines max)
4. Match the existing code style
5. If unsure, output empty string
6. Complete function calls, variable assignments, imports, etc.

Language: ${language}
File: ${filePath}`

    const userPrompt = `Complete the code after the cursor position.

PREFIX (code before cursor):
\`\`\`${language}
${prefix.slice(-500)}
\`\`\`

SUFFIX (code after cursor):
\`\`\`${language}
${suffix.slice(0, 200)}
\`\`\`

Output ONLY the completion text (what should come right after the cursor). If no completion is appropriate, output nothing.`

    const result = await provider.chat({
      model: COMPLETION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2, // Low temperature for more deterministic completions
      maxTokens: 150,
    })

    // Clean up the completion
    let completion = result.content.trim()

    // Remove markdown code blocks if present
    if (completion.startsWith('```')) {
      completion = completion.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
    }

    // Don't return completions that are too short or too long
    if (completion.length < 2 || completion.length > 500) {
      completion = ''
    }

    return new Response(JSON.stringify({
      completion,
      model: COMPLETION_MODEL,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in completion API:', error)
    return new Response(JSON.stringify({
      completion: '',
      error: error.message,
    }), {
      status: 200, // Return 200 even on error to not disrupt the editor
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
