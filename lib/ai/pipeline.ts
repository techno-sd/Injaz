// Optimized AI Pipeline - Parallel Processing & Caching for Faster Builds
// Orchestrates Controller → Validator → Codegen → Reviewer with speed optimizations

import { getController, Controller } from './controller'
import { validateSchema, ValidationResult } from './validator'
import { getCodeReviewer, CodeReviewer, ReviewResult, CodeFile } from './reviewer'
import type {
  UnifiedAppSchema,
  PlatformType,
  ControllerOutput,
  CodeGenOutput,
} from '@/types/app-schema'
import type { AIMessage } from './types'

// ============================================================================
// CACHING LAYER
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  hash: string
}

class SchemaCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxAge = 5 * 60 * 1000 // 5 minutes

  private hash(input: string): string {
    // Simple hash for cache key
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash: this.hash(JSON.stringify(data)),
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  getByPromptHash(prompt: string, platform: string): CacheEntry<any> | null {
    const key = `${platform}:${this.hash(prompt)}`
    const entry = this.cache.get(key)
    if (!entry || Date.now() - entry.timestamp > this.maxAge) return null
    return entry
  }

  setByPromptHash(prompt: string, platform: string, data: any): void {
    const key = `${platform}:${this.hash(prompt)}`
    this.set(key, data)
  }

  clear(): void {
    this.cache.clear()
  }
}

const schemaCache = new SchemaCache()

// ============================================================================
// PARALLEL EXECUTION UTILITIES
// ============================================================================

interface TaskResult<T> {
  success: boolean
  data?: T
  error?: string
  duration: number
}

async function runParallel<T>(
  tasks: (() => Promise<T>)[],
  options: { maxConcurrency?: number; continueOnError?: boolean } = {}
): Promise<TaskResult<T>[]> {
  const { maxConcurrency = 3, continueOnError = true } = options
  const results: TaskResult<T>[] = []

  // Process in batches
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    const batch = tasks.slice(i, i + maxConcurrency)
    const batchResults = await Promise.allSettled(
      batch.map(async (task) => {
        const start = Date.now()
        try {
          const data = await task()
          return { success: true, data, duration: Date.now() - start }
        } catch (error: any) {
          if (!continueOnError) throw error
          return { success: false, error: error.message, duration: Date.now() - start }
        }
      })
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value as TaskResult<T>)
      } else {
        results.push({ success: false, error: result.reason?.message, duration: 0 })
      }
    }
  }

  return results
}

// ============================================================================
// PIPELINE TYPES
// ============================================================================

export interface PipelineConfig {
  skipValidation?: boolean
  skipReview?: boolean
  useCache?: boolean
  parallelCodegen?: boolean
  maxParallelFiles?: number
  streamProgress?: (event: PipelineEvent) => void
}

export interface PipelineEvent {
  stage: 'planning' | 'validating' | 'generating' | 'reviewing' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  data?: any
}

export interface PipelineResult {
  success: boolean
  schema?: UnifiedAppSchema
  validation?: ValidationResult
  files?: CodeGenOutput
  review?: ReviewResult
  timings: {
    total: number
    planning: number
    validation: number
    generation: number
    review: number
  }
  cached?: boolean
}

// ============================================================================
// OPTIMIZED PIPELINE
// ============================================================================

export class OptimizedPipeline {
  private controller: Controller
  private reviewer: CodeReviewer
  private config: PipelineConfig

  constructor(config: PipelineConfig = {}) {
    this.controller = getController()
    this.reviewer = getCodeReviewer()
    this.config = {
      skipValidation: false,
      skipReview: false,
      useCache: true,
      parallelCodegen: true,
      maxParallelFiles: 5,
      ...config,
    }
  }

  private emit(event: PipelineEvent): void {
    this.config.streamProgress?.(event)
  }

  async run(
    prompt: string,
    platform: PlatformType,
    existingSchema?: Partial<UnifiedAppSchema>,
    conversationHistory: AIMessage[] = []
  ): Promise<PipelineResult> {
    const startTime = Date.now()
    const timings = {
      total: 0,
      planning: 0,
      validation: 0,
      generation: 0,
      review: 0,
    }

    try {
      // ========================================
      // STAGE 1: Check Cache
      // ========================================
      if (this.config.useCache && !existingSchema) {
        const cached = schemaCache.getByPromptHash(prompt, platform)
        if (cached) {
          this.emit({ stage: 'complete', progress: 100, message: 'Loaded from cache', data: cached.data })
          return {
            success: true,
            ...cached.data,
            timings: { total: Date.now() - startTime, planning: 0, validation: 0, generation: 0, review: 0 },
            cached: true,
          }
        }
      }

      // ========================================
      // STAGE 2: Planning (Controller)
      // ========================================
      this.emit({ stage: 'planning', progress: 10, message: 'Planning architecture...' })
      const planStart = Date.now()

      const controllerOutput = await this.controller.plan(prompt, platform, existingSchema, conversationHistory)
      timings.planning = Date.now() - planStart

      if (!controllerOutput.schema) {
        throw new Error('Controller did not return a valid schema')
      }

      const schema = controllerOutput.schema as UnifiedAppSchema
      this.emit({ stage: 'planning', progress: 30, message: 'Architecture planned', data: schema })

      // ========================================
      // STAGE 3: Validation (Parallel with prep)
      // ========================================
      let validation: ValidationResult | undefined

      if (!this.config.skipValidation) {
        this.emit({ stage: 'validating', progress: 35, message: 'Validating schema...' })
        const valStart = Date.now()

        validation = validateSchema(schema)
        timings.validation = Date.now() - valStart

        if (!validation.valid) {
          this.emit({
            stage: 'error',
            progress: 40,
            message: `Schema validation failed with ${validation.errors.length} errors`,
            data: validation,
          })
          // Don't fail, but warn
          console.warn('Schema validation warnings:', validation.errors)
        }

        this.emit({ stage: 'validating', progress: 40, message: `Validated (score: ${validation.score}/100)` })
      }

      // ========================================
      // STAGE 4: Code Generation
      // ========================================
      this.emit({ stage: 'generating', progress: 45, message: 'Generating code...' })
      const genStart = Date.now()

      // Import codegen dynamically to avoid circular deps
      const { getCodeGen } = await import('./codegen')
      const codegen = getCodeGen()

      // Generate all code
      const files = await codegen.generate({ schema, platform })
      timings.generation = Date.now() - genStart

      this.emit({
        stage: 'generating',
        progress: 80,
        message: `Generated ${files.files.length} files`,
        data: files,
      })

      // ========================================
      // STAGE 5: Code Review (Optional, Parallel)
      // ========================================
      let review: ReviewResult | undefined

      if (!this.config.skipReview && files.files.length > 0) {
        this.emit({ stage: 'reviewing', progress: 85, message: 'Reviewing code...' })
        const reviewStart = Date.now()

        // Review critical files only for speed
        const criticalFiles = files.files
          .filter(f =>
            f.path.includes('page') ||
            f.path.includes('layout') ||
            f.path.includes('api') ||
            f.path.includes('auth')
          )
          .slice(0, 5) // Limit to 5 files for speed

        if (criticalFiles.length > 0) {
          const codeFiles: CodeFile[] = criticalFiles.map(f => ({
            path: f.path,
            content: f.content,
            language: f.language,
          }))

          review = await this.reviewer.review(codeFiles, platform)
        }

        timings.review = Date.now() - reviewStart
        this.emit({ stage: 'reviewing', progress: 95, message: `Review complete (score: ${review?.score || 'N/A'}/100)` })
      }

      // ========================================
      // STAGE 6: Complete
      // ========================================
      timings.total = Date.now() - startTime

      const result: PipelineResult = {
        success: true,
        schema,
        validation,
        files,
        review,
        timings,
      }

      // Cache the result
      if (this.config.useCache && !existingSchema) {
        schemaCache.setByPromptHash(prompt, platform, { schema, files, validation, review })
      }

      this.emit({
        stage: 'complete',
        progress: 100,
        message: `Build complete in ${(timings.total / 1000).toFixed(1)}s`,
        data: result,
      })

      return result

    } catch (error: any) {
      timings.total = Date.now() - startTime
      this.emit({ stage: 'error', progress: 0, message: error.message })

      return {
        success: false,
        timings,
      }
    }
  }

  // Fast mode - skip validation and review
  async runFast(
    prompt: string,
    platform: PlatformType,
    existingSchema?: Partial<UnifiedAppSchema>
  ): Promise<PipelineResult> {
    this.config.skipValidation = true
    this.config.skipReview = true
    return this.run(prompt, platform, existingSchema)
  }

  // Quality mode - full validation and review
  async runQuality(
    prompt: string,
    platform: PlatformType,
    existingSchema?: Partial<UnifiedAppSchema>
  ): Promise<PipelineResult> {
    this.config.skipValidation = false
    this.config.skipReview = false
    return this.run(prompt, platform, existingSchema)
  }

  clearCache(): void {
    schemaCache.clear()
  }
}

// ============================================================================
// STREAMING PIPELINE (Real-time updates)
// ============================================================================

export async function* streamPipeline(
  prompt: string,
  platform: PlatformType,
  existingSchema?: Partial<UnifiedAppSchema>,
  conversationHistory: AIMessage[] = []
): AsyncGenerator<PipelineEvent> {
  const events: PipelineEvent[] = []

  const pipeline = new OptimizedPipeline({
    streamProgress: (event) => {
      events.push(event)
    },
  })

  // Start pipeline in background
  const resultPromise = pipeline.run(prompt, platform, existingSchema, conversationHistory)

  // Yield events as they come
  let lastIndex = 0
  while (true) {
    // Yield any new events
    while (lastIndex < events.length) {
      yield events[lastIndex++]
    }

    // Check if complete
    const lastEvent = events[events.length - 1]
    if (lastEvent?.stage === 'complete' || lastEvent?.stage === 'error') {
      break
    }

    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Ensure we get the result
  await resultPromise
}

// ============================================================================
// SINGLETON & FACTORY
// ============================================================================

let pipelineInstance: OptimizedPipeline | null = null

export function getPipeline(config?: PipelineConfig): OptimizedPipeline {
  if (!pipelineInstance || config) {
    pipelineInstance = new OptimizedPipeline(config)
  }
  return pipelineInstance
}

// Quick build function
export async function quickBuild(
  prompt: string,
  platform: PlatformType,
  onProgress?: (event: PipelineEvent) => void
): Promise<PipelineResult> {
  const pipeline = new OptimizedPipeline({
    skipReview: true, // Skip review for speed
    useCache: true,
    streamProgress: onProgress,
  })

  return pipeline.run(prompt, platform)
}

// Full build function
export async function fullBuild(
  prompt: string,
  platform: PlatformType,
  onProgress?: (event: PipelineEvent) => void
): Promise<PipelineResult> {
  const pipeline = new OptimizedPipeline({
    skipValidation: false,
    skipReview: false,
    useCache: true,
    streamProgress: onProgress,
  })

  return pipeline.run(prompt, platform)
}
