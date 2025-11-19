import { createClient } from '@/lib/supabase/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import type { Message, File, AIAction } from '@/types'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { projectId, messages, files } = await req.json()

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

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(files)

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: Message) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ]

    // Stream response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: openAIMessages,
      stream: true,
      temperature: 0.7,
    })

    // Save user message to database
    await supabase.from('messages').insert({
      project_id: projectId,
      role: 'user',
      content: messages[messages.length - 1].content,
    })

    let fullResponse = ''
    let actions: AIAction[] = []

    // Create a transform stream to process the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullResponse += content

            // Send content to client
            const data = JSON.stringify({ type: 'content', content })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Try to extract JSON actions from the response
          const actionsMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/)
          if (actionsMatch) {
            try {
              const parsed = JSON.parse(actionsMatch[1])
              if (parsed.actions) {
                actions = parsed.actions

                // Apply actions to database
                for (const action of actions) {
                  if (action.type === 'create_or_update_file') {
                    await supabase
                      .from('files')
                      .upsert({
                        project_id: projectId,
                        path: action.path,
                        content: action.content,
                        language: getLanguageFromPath(action.path),
                      }, {
                        onConflict: 'project_id,path',
                      })
                  } else if (action.type === 'delete_file') {
                    await supabase
                      .from('files')
                      .delete()
                      .eq('project_id', projectId)
                      .eq('path', action.path)
                  }
                }

                // Send actions to client
                const actionsData = JSON.stringify({ type: 'actions', actions })
                controller.enqueue(encoder.encode(`data: ${actionsData}\n\n`))
              }
            } catch (error) {
              console.error('Error parsing actions:', error)
            }
          }

          // Save assistant message to database
          await supabase.from('messages').insert({
            project_id: projectId,
            role: 'assistant',
            content: fullResponse,
          })

          controller.close()
        } catch (error) {
          console.error('Error in stream:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function buildSystemPrompt(files: File[]): string {
  const filesList = files.map(f => `${f.path} (${f.language})`).join('\n')

  return `You are an expert full-stack developer and AI assistant helping users build web applications.

CURRENT PROJECT FILES:
${filesList}

You can see and modify all project files. When the user asks you to create or update code, you should:

1. Analyze the request and the current project structure
2. Provide a helpful explanation of what you're doing
3. Output the file changes in this exact JSON format:

\`\`\`json
{
  "actions": [
    {
      "type": "create_or_update_file",
      "path": "path/to/file.tsx",
      "content": "FULL FILE CONTENT HERE"
    }
  ],
  "messages": [
    "Explanation of what was changed"
  ]
}
\`\`\`

CRITICAL RULES:
- Always provide COMPLETE file contents, never partial or truncated
- Never use placeholders or comments like "// rest of the code"
- Always use proper TypeScript/JavaScript syntax
- For Next.js 14, use App Router conventions
- Use "use client" directive when needed (event handlers, hooks, etc.)
- Ensure all imports are correct and complete
- Follow React and Next.js best practices
- Make code production-ready

When creating new components:
- Use TypeScript with proper types
- Use Tailwind CSS for styling
- Follow shadcn/ui patterns if creating UI components
- Ensure accessibility (ARIA attributes, keyboard navigation)

Be concise but thorough. Focus on writing clean, working code.`
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    html: 'html',
    md: 'markdown',
  }
  return languageMap[ext || ''] || 'plaintext'
}
