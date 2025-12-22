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
  // Qwen3 Coder - Excellent code generation, follows instructions well
  primary: {
    id: 'qwen/qwen3-coder',
    name: 'Qwen3 Coder 480B',
    provider: 'openrouter' as const,
    costPer1MInput: 0.20,
    costPer1MOutput: 0.60,
    maxTokens: 131072,
    strengths: ['code generation', 'instruction following', 'complete outputs'] as const,
  },

  // Premium quality fallback (when primary fails)
  fallback: {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter' as const,
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
    maxTokens: 200000,
    strengths: ['best code quality', 'complex reasoning', 'nuanced understanding'] as const,
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
  })
}
