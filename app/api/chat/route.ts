import { createClient } from '@/lib/supabase/server'
import { getProviderForModel, isModelAvailable } from '@/lib/ai/providers'
import { buildContext } from '@/lib/ai/context-manager'
import { DEFAULT_MODEL as FALLBACK_MODEL } from '@/lib/ai/types'
import type { Message, File, AIAction } from '@/types'

export const runtime = 'edge'

// Model from .env (or fallback)
const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || FALLBACK_MODEL

export async function POST(req: Request) {
  try {
    const {
      projectId,
      messages,
      files,
      model = DEFAULT_MODEL,
      activeFilePath = null,
      temperature = 0.7,
    } = await req.json()

    const isDemoProject = projectId === 'demo' || projectId === 'new' || projectId.startsWith('new-')
    const supabase = isDemoProject ? null : await createClient()
    let userId: string | null = null

    if (supabase) {
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id ?? null
    }

    if (!isDemoProject && !userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (supabase) {
      // Verify user owns the project
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId!)
        .single()

      if (!project) {
        return new Response('Project not found', { status: 404 })
      }
    }

    // Get the provider for the selected model
    const provider = getProviderForModel(model)
    if (!provider) {
      return new Response(JSON.stringify({ error: 'Invalid model selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!provider.isConfigured()) {
      return new Response(JSON.stringify({
        error: `${provider.name} API key is not configured`,
        provider: provider.type
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build optimized context
    const context = buildContext(files, messages, activeFilePath, {
      maxContextTokens: 100000,
      includeFileContents: true,
      prioritizeActiveFile: true,
    })

    // Prepare messages for the AI
    const aiMessages = [
      { role: 'system' as const, content: context.systemPrompt },
      ...messages.map((m: Message) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Save user message to database for authenticated projects
    if (supabase && !isDemoProject) {
      await supabase.from('messages').insert({
        project_id: projectId,
        role: 'user',
        content: messages[messages.length - 1].content,
      })
    }

    let fullResponse = ''
    let actions: AIAction[] = []

    // Create a transform stream to process the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send context info to client
          const contextInfo = JSON.stringify({
            type: 'context',
            filesIncluded: context.files.length,
            totalTokens: context.totalTokens,
            truncated: context.truncated,
            model: model,
          })
          controller.enqueue(encoder.encode(`data: ${contextInfo}\n\n`))

          // Stream from the provider
          const streamGenerator = provider.streamChat({
            model,
            messages: aiMessages,
            temperature,
          })

          for await (const chunk of streamGenerator) {
            if (chunk.type === 'content' && chunk.content) {
              fullResponse += chunk.content

              // Send content to client
              const data = JSON.stringify({ type: 'content', content: chunk.content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (chunk.type === 'error') {
              const errorData = JSON.stringify({ type: 'error', error: chunk.error })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
              break
            }
          }

          // Try to extract JSON actions from the response
          // Support multiple formats: ```json, ``` or just raw JSON
          let jsonContent = null

          // Try ```json format first
          const jsonBlockMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonBlockMatch) {
            jsonContent = jsonBlockMatch[1].trim()
          } else {
            // Try plain ``` code block
            const codeBlockMatch = fullResponse.match(/```\s*([\s\S]*?)\s*```/)
            if (codeBlockMatch) {
              const content = codeBlockMatch[1].trim()
              if (content.startsWith('{')) {
                jsonContent = content
              }
            }
          }

          // If still no match, try to find raw JSON object
          if (!jsonContent) {
            const rawJsonMatch = fullResponse.match(/\{[\s\S]*"actions"[\s\S]*\}/)
            if (rawJsonMatch) {
              jsonContent = rawJsonMatch[0]
            }
          }

          if (jsonContent) {
            try {
              const parsed = JSON.parse(jsonContent)
              if (parsed.actions && Array.isArray(parsed.actions)) {
                actions = parsed.actions
                console.log(`[Chat API] Parsed ${actions.length} actions from AI response`)

                // Apply actions to database
                if (supabase && !isDemoProject) {
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
                }

                // Send actions to client
                const actionsData = JSON.stringify({ type: 'actions', actions })
                controller.enqueue(encoder.encode(`data: ${actionsData}\n\n`))
              }
            } catch (error) {
              console.error('Error parsing actions JSON:', error)
              console.error('JSON content was:', jsonContent?.substring(0, 500))
            }
          } else {
            console.log('[Chat API] No JSON actions found in response')
          }

          // Save assistant message to database for authenticated projects
          if (supabase && !isDemoProject) {
            await supabase.from('messages').insert({
              project_id: projectId,
              role: 'assistant',
              content: fullResponse,
            })
          }

          // Send done signal
          const doneData = JSON.stringify({ type: 'done' })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

          controller.close()
        } catch (error: any) {
          console.error('Error in stream:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: error.message || 'An error occurred while processing your request'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
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
  } catch (error: any) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({
      error: error.message || 'Internal Server Error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// API endpoint to get available models
export async function GET(req: Request) {
  const { getAvailableModels, getConfiguredProviders } = await import('@/lib/ai/providers')

  const models = getAvailableModels()
  const providers = getConfiguredProviders().map(p => ({
    type: p.type,
    name: p.name,
  }))

  return new Response(JSON.stringify({
    models,
    providers,
    defaultModel: DEFAULT_MODEL,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
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
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    vue: 'vue',
    svelte: 'svelte',
  }
  return languageMap[ext || ''] || 'plaintext'
}
