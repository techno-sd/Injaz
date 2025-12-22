import { createClient } from '@/lib/supabase/server'
import { getProviderForModel, isModelAvailable } from '@/lib/ai/providers'
import { buildContext } from '@/lib/ai/context-manager'
import { Generator } from '@/lib/ai/generator'
import type { Message, File, AIAction, PlatformType, AIMode, UnifiedAppSchema } from '@/types'

export const runtime = 'edge'

// Model from env (required)
const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'deepseek/deepseek-chat-v3-0324'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff

/**
 * Retry wrapper for async operations with exponential backoff
 * Handles transient errors like 502, 503, 429 (rate limit)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delays?: number[]
    onRetry?: (attempt: number, error: any) => void
  } = {}
): Promise<T> {
  const { maxRetries = MAX_RETRIES, delays = RETRY_DELAYS, onRetry } = options
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const status = error.status || error.statusCode || (error.message?.includes('502') ? 502 : 0)

      // Only retry on transient errors
      const isRetryable = [502, 503, 504, 429].includes(status) ||
        error.message?.includes('Network') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('timeout')

      if (!isRetryable || attempt >= maxRetries) {
        throw error
      }

      const delay = delays[Math.min(attempt, delays.length - 1)]
      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed with ${status}, retrying in ${delay}ms...`)
      onRetry?.(attempt + 1, error)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Async generator wrapper with retry for streaming operations
 */
async function* withStreamRetry<T>(
  createStream: () => AsyncGenerator<T>,
  maxRetries = MAX_RETRIES
): AsyncGenerator<T> {
  let attempt = 0
  let hasYieldedContent = false

  while (attempt <= maxRetries) {
    try {
      const stream = createStream()
      for await (const chunk of stream) {
        hasYieldedContent = true
        yield chunk
      }
      return // Successfully completed
    } catch (error: any) {
      const status = error.status || error.statusCode || (error.message?.includes('502') ? 502 : 0)
      const isRetryable = [502, 503, 504, 429].includes(status) ||
        error.message?.includes('Network') ||
        error.message?.includes('ECONNRESET')

      // Don't retry if we've already yielded content (partial response)
      if (hasYieldedContent || !isRetryable || attempt >= maxRetries) {
        throw error
      }

      const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
      console.log(`[StreamRetry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      attempt++
    }
  }
}

export async function POST(req: Request) {
  try {
    const {
      projectId,
      messages,
      files,
      model = DEFAULT_MODEL,
      activeFilePath = null,
      temperature = 0.7,
      // New dual-mode parameters
      platform = 'webapp' as PlatformType,
      mode = 'auto' as AIMode,
      schema = null as UnifiedAppSchema | null,
      useDualMode = false,
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

    // Get project info including platform and schema
    let projectPlatform = platform
    let existingSchema = schema

    if (supabase) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, platform, app_schema')
        .eq('id', projectId)
        .eq('user_id', userId!)
        .single()

      if (!project) {
        return new Response('Project not found', { status: 404 })
      }

      // Use project's platform and schema if available
      if (project.platform) {
        projectPlatform = project.platform as PlatformType
      }
      if (project.app_schema) {
        existingSchema = project.app_schema as UnifiedAppSchema
      }
    }

    // Determine if we should use dual-mode AI (Controller + CodeGen)
    // Auto-detect for app generation OR when explicitly requested
    const hasGenerationIntent = detectDualModeIntent(messages)
    const shouldUseDualMode = useDualMode === true || (useDualMode !== false && hasGenerationIntent)

    if (shouldUseDualMode) {
      // Use the new dual-mode orchestrator
      return handleDualModeChat({
        projectId,
        messages,
        files,
        platform: projectPlatform,
        mode,
        existingSchema,
        supabase,
        isDemoProject,
      })
    }

    // Legacy single-mode chat (for backward compatibility)
    return handleLegacyChat({
      projectId,
      messages,
      files,
      model,
      activeFilePath,
      temperature,
      supabase,
      isDemoProject,
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

/**
 * Detect if user intent requires dual-mode processing
 * Trigger for app/feature generation requests
 */
function detectDualModeIntent(messages: Message[]): boolean {
  const lastMessage = messages[messages.length - 1]?.content?.trim().toLowerCase() || ''

  // Very short messages are likely conversational
  if (lastMessage.length < 8) {
    return false
  }

  // Conversational patterns that should NOT trigger generation (check first)
  const conversationalPatterns = [
    /^(hello|hi|hey|yo|sup|greetings|good morning|good afternoon|good evening)\b/i,
    /^(what|how|why|when|where|who|which)\s/i, // Questions starting with these words
    /^(can you|could you|would you|will you|do you|are you|is this|is it|are there)\b/i,
    /^(help|thanks|thank you|please help|ok|okay|yes|no|sure|got it|understood)\b/i,
    /^(explain|tell me about|show me how|describe|what is|what are)\b/i,
    /^(fix|debug|update|modify|change|edit)\s+(the|this|that|my)\s+(bug|error|issue|code|file)/i, // Code editing
  ]

  // If it matches conversational pattern, don't trigger dual mode
  for (const pattern of conversationalPatterns) {
    if (pattern.test(lastMessage)) {
      console.log('[Chat] Conversational/edit message, using legacy chat:', lastMessage.substring(0, 50))
      return false
    }
  }

  // Strong generation keywords that should trigger dual mode
  const generationKeywords = [
    // App creation verbs
    'build app', 'build an app', 'build a website', 'build me',
    'create app', 'create an app', 'create a website', 'create new',
    'make app', 'make an app', 'make a website', 'make me',
    'generate app', 'generate an app', 'generate a website',
    // Specific app types
    'landing page', 'landing site',
    'dashboard', 'admin panel', 'admin dashboard',
    'portfolio', 'portfolio site', 'portfolio website',
    'blog', 'blog site', 'blog website',
    'ecommerce', 'e-commerce', 'online store', 'online shop',
    'saas', 'saas app', 'saas application',
    'web app', 'web application', 'webapp',
    'startup website', 'company website', 'business website',
    'login page', 'signup page', 'auth page',
    'hello world', 'hello world app',
    // Action-oriented phrases
    'new project', 'new website', 'new app',
    'give me a', 'i want a', 'i need a',
  ]

  // Check for generation keywords
  for (const keyword of generationKeywords) {
    if (lastMessage.includes(keyword)) {
      console.log('[Chat] Generation keyword detected, using dual mode:', lastMessage.substring(0, 50))
      return true
    }
  }

  // Pattern-based detection for more complex requests
  const generationPatterns = [
    /\b(build|create|make|generate|develop|implement)\b.*\b(app|website|site|project|page|dashboard|platform)\b/i,
    /\b(landing|home|portfolio|blog|store|shop|admin)\s*(page|site|website|app|panel|dashboard)?\b/i,
    /^(build|create|make|generate)\s+/i,  // Starts with action verb
    /\b(new)\s+(app|website|project|page|dashboard)\b/i,
    /\bi\s+(want|need)\s+(a|an|to build|to create)\s+/i, // "I want/need a..."
  ]

  const shouldTrigger = generationPatterns.some((pattern) => pattern.test(lastMessage))

  if (shouldTrigger) {
    console.log('[Chat] Generation pattern matched, using dual mode:', lastMessage.substring(0, 50))
  } else {
    console.log('[Chat] No generation intent, using legacy chat:', lastMessage.substring(0, 50))
  }

  return shouldTrigger
}

/**
 * Handle dual-mode chat with new simplified Generator
 * Uses templates + AI for custom app generation
 */
async function handleDualModeChat({
  projectId,
  messages,
  files,
  platform,
  mode,
  existingSchema,
  supabase,
  isDemoProject,
}: {
  projectId: string
  messages: Message[]
  files: File[]
  platform: PlatformType
  mode: AIMode
  existingSchema: UnifiedAppSchema | null
  supabase: any
  isDemoProject: boolean
}) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const generator = new Generator({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial mode info
        const modeInfo = JSON.stringify({
          type: 'mode',
          mode: 'dual',
          platform,
        })
        controller.enqueue(encoder.encode(`data: ${modeInfo}\n\n`))

        const lastUserMessage = messages[messages.length - 1]?.content || ''
        console.log('[Chat] Starting app generation with Generator for:', lastUserMessage.substring(0, 50))

        const generatedFiles: { path: string; content: string }[] = []

        // Use new simplified Generator
        for await (const event of generator.generate(lastUserMessage, {
          existingFiles: files?.map(f => ({ path: f.path, content: f.content })),
          forceGeneration: true,
        })) {
          console.log('[Chat] Generator event:', event.type)

          if (event.type === 'start' || event.type === 'generating') {
            // Send planning/status updates
            const statusData = JSON.stringify({
              type: 'planning',
              phase: 'generating',
              message: event.data?.message || 'Generating...',
            })
            controller.enqueue(encoder.encode(`data: ${statusData}\n\n`))
          }

          if (event.type === 'template_match') {
            // Send template match info
            const templateData = JSON.stringify({
              type: 'planning',
              phase: 'template',
              message: `Using ${event.data?.template} template`,
            })
            controller.enqueue(encoder.encode(`data: ${templateData}\n\n`))
          }

          if (event.type === 'progress') {
            // Send progress updates with file info if available
            const message = event.data?.message || 'Creating files...'

            // Send as planning event for phase display
            const planningData = JSON.stringify({
              type: 'planning',
              phase: 'creating',
              message: message,
              progress: event.data?.progress,
              total: event.data?.total,
            })
            controller.enqueue(encoder.encode(`data: ${planningData}\n\n`))

            // Also send raw progress event for review/fix phase handling
            const progressData = JSON.stringify({
              type: 'progress',
              message: message,
              progress: event.data?.progress,
              total: event.data?.total,
            })
            controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
          }

          if (event.type === 'file' && event.data?.file) {
            const file = event.data.file
            generatedFiles.push({ path: file.path, content: file.content })

            // Send file action directly (this marks the file as complete)
            const actionData = JSON.stringify({
              type: 'actions',
              actions: [{
                type: 'create_or_update_file',
                path: file.path,
                content: file.content,
              }],
            })
            controller.enqueue(encoder.encode(`data: ${actionData}\n\n`))

            // Save file to database
            if (supabase && !isDemoProject) {
              await supabase
                .from('files')
                .upsert({
                  project_id: projectId,
                  path: file.path,
                  content: file.content,
                  language: getLanguageFromPath(file.path),
                }, {
                  onConflict: 'project_id,path',
                })
            }
          }

          if (event.type === 'complete') {
            // Save generation history
            if (supabase && !isDemoProject) {
              await supabase.from('generation_history').insert({
                project_id: projectId,
                mode: 'generator',
                input_prompt: lastUserMessage,
                codegen_output: { files: generatedFiles },
                files_generated: generatedFiles.map((f) => f.path),
                status: 'completed',
              })
            }
          }

          if (event.type === 'error') {
            console.error('[Chat] Generator error:', event.data)
            const errorData = JSON.stringify({
              type: 'error',
              error: event.data?.message || 'Generation failed',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          }
        }

        // Save messages to database
        if (supabase && !isDemoProject) {
          // Save user message
          await supabase.from('messages').insert({
            project_id: projectId,
            role: 'user',
            content: lastUserMessage,
          })

          // Save assistant summary
          const summary = `Generated ${generatedFiles.length} files for your ${platform} application.`
          await supabase.from('messages').insert({
            project_id: projectId,
            role: 'assistant',
            content: summary,
          })
        }

        // Send completion message with next steps
        const completionMessage = `✅ Successfully generated ${generatedFiles.length} files for your ${platform} application!\n\n**Next Steps:**\n- Preview your app using the preview panel\n- Click "Run" to start the development server\n- Make changes by chatting with me\n- Deploy when ready using the deploy button`
        
        const completionData = JSON.stringify({
          type: 'content',
          content: completionMessage,
        })
        controller.enqueue(encoder.encode(`data: ${completionData}\n\n`))

        // Send done signal
        const doneData = JSON.stringify({ type: 'done' })
        controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

        controller.close()
      } catch (error: any) {
        console.error('[Chat] Error in generation stream:', error)

        // Determine if this was a network/provider error
        const status = error.status || error.statusCode || 0
        const isProviderError = [502, 503, 504, 429].includes(status) ||
          error.message?.includes('Network') ||
          error.message?.includes('502')

        let errorMessage = error.message || 'An error occurred during generation'
        if (isProviderError) {
          errorMessage = `AI provider temporarily unavailable (${status || 'network error'}). Please try again.`
        }

        const errorData = JSON.stringify({
          type: 'error',
          error: errorMessage,
          retryable: isProviderError,
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
}

/**
 * Handle legacy single-mode chat (backward compatible)
 */
async function handleLegacyChat({
  projectId,
  messages,
  files,
  model,
  activeFilePath,
  temperature,
  supabase,
  isDemoProject,
}: {
  projectId: string
  messages: Message[]
  files: File[]
  model: string
  activeFilePath: string | null
  temperature: number
  supabase: any
  isDemoProject: boolean
}) {
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
      provider: provider.name
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
          mode: 'legacy',
        })
        controller.enqueue(encoder.encode(`data: ${contextInfo}\n\n`))

        // Send initial activity
        const initActivity = JSON.stringify({
          type: 'planning',
          phase: 'init',
          message: 'Processing your request...',
        })
        controller.enqueue(encoder.encode(`data: ${initActivity}\n\n`))

        // Send generating activity
        const genActivity = JSON.stringify({
          type: 'generating',
          message: 'Generating response...',
        })
        controller.enqueue(encoder.encode(`data: ${genActivity}\n\n`))

        // Stream from the provider with retry support
        const streamGenerator = withStreamRetry(() => provider.streamChat({
          model,
          messages: aiMessages,
          temperature,
        }))

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
          }
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

        // Determine if this was a network/provider error
        const status = error.status || error.statusCode || 0
        const isProviderError = [502, 503, 504, 429].includes(status) ||
          error.message?.includes('Network') ||
          error.message?.includes('502')

        let errorMessage = error.message || 'An error occurred while processing your request'
        if (isProviderError) {
          errorMessage = `AI provider temporarily unavailable (${status || 'network error'}). Please try again.`
        }

        const errorData = JSON.stringify({
          type: 'error',
          error: errorMessage,
          retryable: isProviderError,
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
}

// API endpoint to get available models and platform info
export async function GET() {
  const providerName = process.env.OPENROUTER_API_KEY ? 'OpenRouter' : 'OpenAI'

  // Models configured via CUSTOM_MODELS env variable only
  let models: Array<{ id: string; name: string; description: string; category: string }> = []
  if (process.env.CUSTOM_MODELS) {
    try {
      models = JSON.parse(process.env.CUSTOM_MODELS)
    } catch {
      console.warn('Failed to parse CUSTOM_MODELS env var')
    }
  }

  return new Response(JSON.stringify({
    models,
    providers: [{ name: providerName }],
    defaultModel: DEFAULT_MODEL,
    config: {
      controller: process.env.CONTROLLER_MODEL || DEFAULT_MODEL,
      codegen: process.env.CODEGEN_MODEL || DEFAULT_MODEL,
      completion: process.env.COMPLETION_AI_MODEL || DEFAULT_MODEL,
      debugger: process.env.DEFAULT_AI_MODEL || DEFAULT_MODEL,
    },
    supportedPlatforms: ['website', 'webapp', 'mobile'],
    supportedModes: ['auto', 'controller', 'codegen'],
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
