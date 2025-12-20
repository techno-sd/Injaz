// Performance Optimizer
// Pre-warming, metrics tracking, and build optimization

import type { UnifiedAppSchema, PlatformType } from '@/types/app-schema'
import { getPipeline, PipelineResult, PipelineEvent } from './pipeline'
import { generateIncremental, suggestUpdateStrategy, IncrementalResult } from './incremental'

// ============================================================================
// BUILD METRICS
// ============================================================================

export interface BuildMetrics {
  buildId: string
  platform: PlatformType
  mode: 'fast' | 'quality' | 'incremental'
  startTime: number
  endTime: number
  duration: number
  stages: {
    name: string
    duration: number
    status: 'success' | 'warning' | 'error'
  }[]
  filesGenerated: number
  cacheHit: boolean
  validationScore?: number
  reviewScore?: number
}

class MetricsTracker {
  private metrics: BuildMetrics[] = []
  private maxHistory = 100

  record(metrics: BuildMetrics): void {
    this.metrics.push(metrics)
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift()
    }
  }

  getHistory(): BuildMetrics[] {
    return [...this.metrics]
  }

  getAverageTime(): number {
    if (this.metrics.length === 0) return 0
    return this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
  }

  getAverageByPlatform(platform: PlatformType): number {
    const filtered = this.metrics.filter(m => m.platform === platform)
    if (filtered.length === 0) return 0
    return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0
    return this.metrics.filter(m => m.cacheHit).length / this.metrics.length
  }

  clear(): void {
    this.metrics = []
  }
}

const metricsTracker = new MetricsTracker()

// ============================================================================
// PRE-WARMING
// ============================================================================

interface WarmupResult {
  controller: boolean
  codegen: boolean
  reviewer: boolean
  duration: number
}

let isWarmed = false

export async function warmupPipeline(): Promise<WarmupResult> {
  const start = Date.now()
  const results: WarmupResult = {
    controller: false,
    codegen: false,
    reviewer: false,
    duration: 0,
  }

  try {
    // Pre-load all services
    const [controller, codegen, reviewer] = await Promise.allSettled([
      import('./controller').then(m => {
        m.getController()
        return true
      }),
      import('./codegen').then(m => {
        m.getCodeGen()
        return true
      }),
      import('./reviewer').then(m => {
        m.getCodeReviewer()
        return true
      }),
    ])

    results.controller = controller.status === 'fulfilled'
    results.codegen = codegen.status === 'fulfilled'
    results.reviewer = reviewer.status === 'fulfilled'
    results.duration = Date.now() - start

    isWarmed = true
    console.log(`Pipeline warmed up in ${results.duration}ms`)

    return results
  } catch (error) {
    console.error('Warmup failed:', error)
    results.duration = Date.now() - start
    return results
  }
}

export function isPipelineWarmed(): boolean {
  return isWarmed
}

// ============================================================================
// SMART BUILD ORCHESTRATOR
// ============================================================================

export interface SmartBuildOptions {
  prompt: string
  platform: PlatformType
  existingSchema?: Partial<UnifiedAppSchema>
  previousSchema?: Partial<UnifiedAppSchema>
  mode?: 'auto' | 'fast' | 'quality' | 'incremental'
  onProgress?: (event: PipelineEvent) => void
}

export interface SmartBuildResult extends PipelineResult {
  buildId: string
  mode: 'fast' | 'quality' | 'incremental'
  metrics: BuildMetrics
  incrementalResult?: IncrementalResult
}

export async function smartBuild(options: SmartBuildOptions): Promise<SmartBuildResult> {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const startTime = Date.now()
  const stages: BuildMetrics['stages'] = []

  // Ensure warmed up
  if (!isWarmed) {
    const warmStart = Date.now()
    await warmupPipeline()
    stages.push({ name: 'warmup', duration: Date.now() - warmStart, status: 'success' })
  }

  // Determine best mode
  let mode: 'fast' | 'quality' | 'incremental' = options.mode === 'auto' || !options.mode
    ? determineOptimalMode(options)
    : options.mode as 'fast' | 'quality' | 'incremental'

  // Track mode selection
  stages.push({ name: 'mode_selection', duration: 0, status: 'success' })

  let result: PipelineResult
  let incrementalResult: IncrementalResult | undefined

  // Execute build based on mode
  if (mode === 'incremental' && options.previousSchema && options.existingSchema) {
    // Try incremental first
    const incStart = Date.now()
    const suggestion = suggestUpdateStrategy(options.previousSchema, options.existingSchema as UnifiedAppSchema)

    if (suggestion.type === 'incremental') {
      incrementalResult = await generateIncremental({
        oldSchema: options.previousSchema,
        newSchema: options.existingSchema as UnifiedAppSchema,
        platform: options.platform,
      })

      stages.push({ name: 'incremental_gen', duration: Date.now() - incStart, status: 'success' })

      // Create a partial result for incremental
      result = {
        success: true,
        schema: options.existingSchema as UnifiedAppSchema,
        files: {
          files: incrementalResult.updatedFiles.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') ? 'tsx' : 'ts',
          })),
        },
        timings: {
          total: Date.now() - startTime,
          planning: 0,
          validation: 0,
          generation: Date.now() - incStart,
          review: 0,
        },
      }
    } else {
      // Fall back to full build
      mode = 'fast'
      stages.push({ name: 'incremental_fallback', duration: Date.now() - incStart, status: 'warning' })
    }
  }

  // Full build if not incremental
  if (!result!) {
    const pipeline = getPipeline({
      skipValidation: mode === 'fast',
      skipReview: mode === 'fast',
      useCache: true,
      streamProgress: (event) => {
        options.onProgress?.(event)
        if (event.stage !== 'complete' && event.stage !== 'error') {
          stages.push({
            name: event.stage,
            duration: 0, // Will be calculated from timings
            status: 'success',
          })
        }
      },
    })

    result = await pipeline.run(
      options.prompt,
      options.platform,
      options.existingSchema
    )

    // Update stage durations from result
    if (result.timings) {
      const stageMap: Record<string, keyof typeof result.timings> = {
        planning: 'planning',
        validating: 'validation',
        generating: 'generation',
        reviewing: 'review',
      }
      for (const stage of stages) {
        const timingKey = stageMap[stage.name]
        if (timingKey && result.timings[timingKey]) {
          stage.duration = result.timings[timingKey]
        }
      }
    }
  }

  // Build metrics
  const metrics: BuildMetrics = {
    buildId,
    platform: options.platform,
    mode,
    startTime,
    endTime: Date.now(),
    duration: Date.now() - startTime,
    stages,
    filesGenerated: result.files?.files.length || 0,
    cacheHit: result.cached || false,
    validationScore: result.validation?.score,
    reviewScore: result.review?.score,
  }

  // Record metrics
  metricsTracker.record(metrics)

  return {
    ...result,
    buildId,
    mode,
    metrics,
    incrementalResult,
  }
}

function determineOptimalMode(options: SmartBuildOptions): 'fast' | 'quality' | 'incremental' {
  // If we have previous schema, try incremental
  if (options.previousSchema && options.existingSchema) {
    const suggestion = suggestUpdateStrategy(
      options.previousSchema,
      options.existingSchema as UnifiedAppSchema
    )
    if (suggestion.type === 'incremental') {
      return 'incremental'
    }
  }

  // For new builds, use fast mode for prototyping
  // Could add more logic here based on user preferences
  return 'fast'
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

export interface PerformanceReport {
  totalBuilds: number
  averageBuildTime: number
  averageByPlatform: Record<PlatformType, number>
  cacheHitRate: number
  modeDistribution: Record<string, number>
  bottlenecks: { stage: string; avgDuration: number }[]
  recommendations: string[]
}

export function getPerformanceReport(): PerformanceReport {
  const history = metricsTracker.getHistory()

  if (history.length === 0) {
    return {
      totalBuilds: 0,
      averageBuildTime: 0,
      averageByPlatform: { website: 0, webapp: 0 },
      cacheHitRate: 0,
      modeDistribution: {},
      bottlenecks: [],
      recommendations: ['No build history available. Run some builds to get recommendations.'],
    }
  }

  // Calculate mode distribution
  const modeDistribution: Record<string, number> = {}
  for (const m of history) {
    modeDistribution[m.mode] = (modeDistribution[m.mode] || 0) + 1
  }

  // Find bottlenecks (slowest stages)
  const stageDurations: Record<string, number[]> = {}
  for (const m of history) {
    for (const stage of m.stages) {
      if (!stageDurations[stage.name]) stageDurations[stage.name] = []
      stageDurations[stage.name].push(stage.duration)
    }
  }

  const bottlenecks = Object.entries(stageDurations)
    .map(([stage, durations]) => ({
      stage,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 3)

  // Generate recommendations
  const recommendations: string[] = []

  if (metricsTracker.getCacheHitRate() < 0.3) {
    recommendations.push('Cache hit rate is low. Consider reusing prompts or enabling caching.')
  }

  if (bottlenecks[0]?.stage === 'planning') {
    recommendations.push('Planning is the slowest stage. Consider using a faster model for CONTROLLER_MODEL.')
  }

  if (bottlenecks[0]?.stage === 'reviewing') {
    recommendations.push('Code review is slow. Consider skipping review for prototypes (mode: "fast").')
  }

  const avgTime = metricsTracker.getAverageTime()
  if (avgTime > 10000) {
    recommendations.push('Average build time is over 10s. Use incremental mode for iterations.')
  }

  if (modeDistribution['quality'] > (history.length * 0.5)) {
    recommendations.push('Using quality mode frequently. Consider fast mode for prototyping.')
  }

  return {
    totalBuilds: history.length,
    averageBuildTime: avgTime,
    averageByPlatform: {
      website: metricsTracker.getAverageByPlatform('website'),
      webapp: metricsTracker.getAverageByPlatform('webapp'),
    },
    cacheHitRate: metricsTracker.getCacheHitRate(),
    modeDistribution,
    bottlenecks,
    recommendations,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { metricsTracker }

// Quick access functions
export const optimizer = {
  warmup: warmupPipeline,
  isWarmed: isPipelineWarmed,
  build: smartBuild,
  getReport: getPerformanceReport,
  clearMetrics: () => metricsTracker.clear(),
}

export default optimizer
