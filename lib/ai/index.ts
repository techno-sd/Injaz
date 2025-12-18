// AI Module Exports
// This file provides a centralized export for all AI-related utilities

// Rate Limiting
export {
  getRateLimiter,
  rateLimitMiddleware,
  createRateLimitResponse,
  RATE_LIMITS,
  type RateLimitType,
  type RateLimitResult,
  type RateLimitMiddlewareResult,
} from './rate-limiter'

// Schema Caching
export {
  getSchemaCache,
  withSchemaCache,
} from './schema-cache'

// Diff-based Updates
export {
  getDiffUpdater,
  type FileInfo,
  type FileDiff,
  type DiffResult,
  type IncrementalUpdate,
} from './diff-updater'

// Schema Versioning
export {
  getSchemaVersionManager,
  compareVersions,
  isVersionSupported,
  getVersionInfo,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_VERSION,
  VERSION_HISTORY,
  type VersionedSchema,
  type SchemaHistoryEntry,
  type MigrationResult,
  type VersionInfo,
} from './schema-version'

// Types
export {
  type AIMessage,
  type AICompletionOptions,
  type AIStreamChunk,
  type AICompletionResult,
  type AIProvider,
} from './types'

// Schema Validation
export {
  validateSchema,
  isValidSchema,
  getValidationSummary,
  type ValidationResult,
  type ValidationError,
} from './validator'

// Code Review
export {
  getCodeReviewer,
  formatReviewResult,
  securityCheck,
  type CodeReviewer,
  type ReviewResult,
  type CodeIssue,
  type CodeFile,
} from './reviewer'

// Optimized Pipeline
export {
  OptimizedPipeline,
  getPipeline,
  quickBuild,
  fullBuild,
  streamPipeline,
  type PipelineConfig,
  type PipelineEvent,
  type PipelineResult,
} from './pipeline'

// Incremental Generation
export {
  diffSchemas,
  generateIncremental,
  suggestUpdateStrategy,
  type SchemaDiff,
  type DiffResult as IncrementalDiffResult,
  type IncrementalOptions,
  type IncrementalResult,
  type UpdateSuggestion,
} from './incremental'

// Performance Optimizer
export {
  warmupPipeline,
  isPipelineWarmed,
  smartBuild,
  getPerformanceReport,
  optimizer,
  metricsTracker,
  type SmartBuildOptions,
  type SmartBuildResult,
  type BuildMetrics,
  type PerformanceReport,
} from './optimizer'

// Modern Templates & Design Patterns
export {
  modernDesignTokens,
  modernComponents,
  mobilePatterns,
  industryTemplates,
} from './modern-templates'

// Enhanced Prompts
export {
  controllerEnhancements,
  codegenEnhancements,
  buildControllerPrompt,
  buildCodegenPrompt,
  getIndustryTemplate,
  getComponentPatterns,
} from './enhanced-prompts'
