// Orchestrator Service
// Manages the dual-mode AI system: Controller (planning) → CodeGen (code)

import { Controller, getController } from './controller'
import { CodeGen, getCodeGen } from './codegen'
import type {
  UnifiedAppSchema,
  PlatformType,
  AIMode,
  ControllerOutput,
  CodeGenOutput,
  SSEEventType,
} from '@/types/app-schema'
import type { AIMessage } from './types'

export interface OrchestrationInput {
  userPrompt: string
  platform: PlatformType
  mode?: AIMode
  existingSchema?: Partial<UnifiedAppSchema>
  existingFiles?: { path: string; content: string }[]
  conversationHistory?: AIMessage[]
}

export interface OrchestrationEvent {
  type: SSEEventType
  data: any
  timestamp: number
}

export interface OrchestrationResult {
  schema?: UnifiedAppSchema
  files?: { path: string; content: string; language: string }[]
  dependencies?: Record<string, string>
  reasoning?: string
  suggestions?: string[]
}

export class Orchestrator {
  private controller: Controller
  private codeGen: CodeGen

  constructor() {
    this.controller = getController()
    this.codeGen = getCodeGen()
  }

  // Determine the best mode based on context
  private determineMode(input: OrchestrationInput): AIMode {
    if (input.mode && input.mode !== 'auto') {
      return input.mode
    }

    const prompt = input.userPrompt.toLowerCase()

    // Keywords that suggest planning/schema work
    const planningKeywords = [
      'plan',
      'design',
      'structure',
      'architecture',
      'layout',
      'features',
      'pages',
      'navigation',
      'database',
      'auth',
      'schema',
      'add page',
      'add feature',
      'change design',
      'update colors',
      'modify theme',
    ]

    // Keywords that suggest code generation
    const codeKeywords = [
      'generate',
      'code',
      'build',
      'create',
      'implement',
      'write',
      'make it work',
      'fix',
      'update code',
      'refactor',
    ]

    const hasPlanningIntent = planningKeywords.some((k) => prompt.includes(k))
    const hasCodeIntent = codeKeywords.some((k) => prompt.includes(k))

    // If we have existing schema and it seems complete, prefer codegen
    if (input.existingSchema?.meta?.name && input.existingSchema?.structure?.pages?.length) {
      if (hasCodeIntent && !hasPlanningIntent) {
        return 'codegen'
      }
    }

    // Default to controller first (plan then generate)
    return 'controller'
  }

  // Validate schema completeness
  private isSchemaComplete(schema: Partial<UnifiedAppSchema>): boolean {
    return !!(
      schema.meta?.name &&
      schema.meta?.platform &&
      schema.design?.colors &&
      schema.structure?.pages?.length
    )
  }

  // Full orchestration with streaming
  async *orchestrate(
    input: OrchestrationInput
  ): AsyncGenerator<OrchestrationEvent> {
    const startTime = Date.now()
    const mode = this.determineMode(input)

    yield {
      type: 'planning',
      data: {
        phase: 'start',
        message: `Starting in ${mode} mode...`,
        mode,
      },
      timestamp: Date.now(),
    }

    try {
      if (mode === 'controller' || mode === 'auto') {
        // Phase 1: Controller generates/updates schema
        yield {
          type: 'planning',
          data: { phase: 'controller', message: 'Planning application structure...' },
          timestamp: Date.now(),
        }

        const controllerStream = this.controller.streamPlan(
          input.userPrompt,
          input.platform,
          input.existingSchema,
          input.conversationHistory
        )

        let schema: Partial<UnifiedAppSchema> | undefined
        let reasoning: string | undefined
        let suggestions: string[] | undefined

        for await (const event of controllerStream) {
          if (event.type === 'planning') {
            yield {
              type: 'planning',
              data: event.data,
              timestamp: Date.now(),
            }
          } else if (event.type === 'schema') {
            schema = event.data.schema
            yield {
              type: 'schema',
              data: event.data,
              timestamp: Date.now(),
            }
          } else if (event.type === 'complete') {
            schema = event.data.schema
            reasoning = event.data.reasoning
            suggestions = event.data.suggestions
          }
        }

        // If schema is complete, proceed to code generation
        if (schema && this.isSchemaComplete(schema)) {
          yield {
            type: 'planning',
            data: { phase: 'transition', message: 'Schema ready. Generating code...' },
            timestamp: Date.now(),
          }

          // Phase 2: CodeGen generates files
          const codeGenStream = this.codeGen.streamGenerate({
            schema: schema as UnifiedAppSchema,
            platform: input.platform,
          })

          const files: { path: string; content: string; language: string }[] = []
          let dependencies: Record<string, string> | undefined

          for await (const event of codeGenStream) {
            if (event.type === 'generating') {
              yield {
                type: 'generating',
                data: event.data,
                timestamp: Date.now(),
              }
            } else if (event.type === 'file') {
              files.push({
                path: event.data.path,
                content: event.data.content,
                language: event.data.language,
              })

              // Convert to actions format for compatibility
              yield {
                type: 'actions',
                data: {
                  actions: [
                    {
                      type: 'create_or_update_file',
                      path: event.data.path,
                      content: event.data.content,
                    },
                  ],
                },
                timestamp: Date.now(),
              }
            } else if (event.type === 'complete') {
              dependencies = event.data.dependencies
            }
          }

          yield {
            type: 'complete',
            data: {
              schema,
              files,
              dependencies,
              reasoning,
              suggestions,
              duration: Date.now() - startTime,
            },
            timestamp: Date.now(),
          }
        } else {
          // Schema incomplete - return what we have
          yield {
            type: 'content',
            data: {
              content:
                reasoning ||
                'I need more information to create a complete application plan. Could you provide more details about your requirements?',
            },
            timestamp: Date.now(),
          }

          yield {
            type: 'complete',
            data: {
              schema,
              reasoning,
              suggestions,
              incomplete: true,
              duration: Date.now() - startTime,
            },
            timestamp: Date.now(),
          }
        }
      } else if (mode === 'codegen') {
        // Direct code generation from existing schema
        if (!input.existingSchema || !this.isSchemaComplete(input.existingSchema)) {
          throw new Error('CodeGen mode requires a complete schema')
        }

        const codeGenStream = this.codeGen.streamGenerate({
          schema: input.existingSchema as UnifiedAppSchema,
          platform: input.platform,
        })

        const files: { path: string; content: string; language: string }[] = []
        let dependencies: Record<string, string> | undefined

        for await (const event of codeGenStream) {
          if (event.type === 'generating') {
            yield {
              type: 'generating',
              data: event.data,
              timestamp: Date.now(),
            }
          } else if (event.type === 'file') {
            files.push({
              path: event.data.path,
              content: event.data.content,
              language: event.data.language,
            })

            yield {
              type: 'actions',
              data: {
                actions: [
                  {
                    type: 'create_or_update_file',
                    path: event.data.path,
                    content: event.data.content,
                  },
                ],
              },
              timestamp: Date.now(),
            }
          } else if (event.type === 'complete') {
            dependencies = event.data.dependencies
          }
        }

        yield {
          type: 'complete',
          data: {
            schema: input.existingSchema,
            files,
            dependencies,
            duration: Date.now() - startTime,
          },
          timestamp: Date.now(),
        }
      }
    } catch (error: any) {
      console.error('Orchestration error:', error)
      yield {
        type: 'error',
        data: {
          error: error.message || 'Orchestration failed',
          message: error.message || 'Orchestration failed',
          phase: mode,
        },
        timestamp: Date.now(),
      }
    }
  }

  // Non-streaming orchestration for simpler use cases
  async run(input: OrchestrationInput): Promise<OrchestrationResult> {
    const events: OrchestrationEvent[] = []

    for await (const event of this.orchestrate(input)) {
      events.push(event)

      if (event.type === 'complete') {
        return event.data
      }

      if (event.type === 'error') {
        throw new Error(event.data.message)
      }
    }

    throw new Error('Orchestration ended without completion')
  }
}

// Singleton instance
let orchestratorInstance: Orchestrator | null = null

export function getOrchestrator(): Orchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new Orchestrator()
  }
  return orchestratorInstance
}

// Helper to format SSE events
export function formatSSE(event: OrchestrationEvent): string {
  return `data: ${JSON.stringify({ ...event.data, type: event.type })}\n\n`
}
