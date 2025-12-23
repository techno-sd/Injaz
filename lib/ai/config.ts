// AI Model Configuration - Single Source of Truth
// Updated December 2025
//
// ARCHITECTURE:
// 1. .env.local → API keys + optional model overrides
// 2. This file → Default models + reads env overrides
// 3. generator.ts → Uses this config only (no hardcoding)

export interface ModelConfig {
  id: string
  name: string
  provider: 'openrouter'
  costPer1MInput: number  // USD
  costPer1MOutput: number // USD
  maxTokens: number
  strengths: readonly string[]
}

// ============================================
// DEFAULT MODEL DEFINITIONS
// These are used if .env doesn't specify overrides
// ============================================
export const MODEL_DEFAULTS = {
  // DeepSeek Chat - Best value for code generation
  // Using standard OpenRouter model ID
  primary: {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'openrouter' as const,
    costPer1MInput: 0.14,
    costPer1MOutput: 0.28,
    maxTokens: 128000,
    strengths: ['code generation', 'excellent quality', 'best value'] as const,
  },

  // Claude 3.5 Sonnet as fallback (reliable, good quality)
  fallback: {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter' as const,
    costPer1MInput: 3.0,
    costPer1MOutput: 15.0,
    maxTokens: 200000,
    strengths: ['reliable', 'high quality', 'good code'] as const,
  },

  // DeepSeek Chat for code review
  reviewer: {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'openrouter' as const,
    costPer1MInput: 0.14,
    costPer1MOutput: 0.28,
    maxTokens: 128000,
    strengths: ['code review', 'bug detection', 'fix suggestions'] as const,
  },
} as const

// ============================================
// ENVIRONMENT-AWARE MODEL RESOLUTION
// Reads from .env with fallback to defaults
// ============================================
function getEnvModel(envKey: string, defaultModel: typeof MODEL_DEFAULTS[keyof typeof MODEL_DEFAULTS]): ModelConfig {
  const envValue = process.env[envKey]
  if (envValue) {
    // Return env override with default metadata
    return {
      ...defaultModel,
      id: envValue,
      name: envValue.split('/').pop() || envValue,
    }
  }
  return defaultModel
}
export const AI_MODELS = {
  // Primary model for all generation (code + chat)
  // Env: CODEGEN_MODEL
  primary: getEnvModel('CODEGEN_MODEL', MODEL_DEFAULTS.primary),

  // Fallback when primary fails
  // Env: FALLBACK_MODEL
  fallback: getEnvModel('FALLBACK_MODEL', MODEL_DEFAULTS.fallback),

  // Reviewer model for code review and fixing
  // Env: REVIEWER_MODEL
  reviewer: getEnvModel('REVIEWER_MODEL', MODEL_DEFAULTS.reviewer),
}

// ============================================
// FALLBACK CHAIN
// ============================================
export function getFallbackModel(currentModelId: string): ModelConfig | null {
  // Simple fallback: primary → fallback → null
  if (currentModelId === AI_MODELS.primary.id) {
    return AI_MODELS.fallback
  }
  // No fallback for fallback model
  return null
}

// ============================================
// OPENROUTER CONFIGURATION
// ============================================
export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  referer: process.env.NEXT_PUBLIC_APP_URL || 'https://ieditor.app',
  title: 'iEditor',
}

// ============================================
// DEFAULT SETTINGS
// ============================================
export const DEFAULT_SETTINGS = {
  temperature: 0.7,
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000],
  streamTimeout: 60000,
}

// ============================================
// EXPORTS
// ============================================
export const MODEL_IDS = {
  PRIMARY: AI_MODELS.primary.id,
  FALLBACK: AI_MODELS.fallback.id,
} as const

// Debug: Log active models in development
if (process.env.NODE_ENV === 'development') {
  console.log('[AI Config] Active models:', {
    primary: AI_MODELS.primary.id,
    fallback: AI_MODELS.fallback.id,
    reviewer: AI_MODELS.reviewer.id,
  })
}
