// Rate Limiter for AI API calls
// Uses Upstash Redis for distributed rate limiting

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// =============================================================================
// CONFIGURATION
// =============================================================================

interface RateLimitConfig {
  // Requests per window
  requests: number
  // Window duration in seconds
  window: number
  // Optional prefix for Redis keys
  prefix?: string
}

// Default rate limits for different operations
export const RATE_LIMITS = {
  // Controller: Planning requests (heavier, more expensive)
  controller: {
    requests: 10,
    window: 60, // 10 requests per minute
    prefix: 'rl:controller',
  },
  // CodeGen: Code generation (very heavy)
  codegen: {
    requests: 5,
    window: 60, // 5 requests per minute
    prefix: 'rl:codegen',
  },
  // Chat: General chat completions
  chat: {
    requests: 30,
    window: 60, // 30 requests per minute
    prefix: 'rl:chat',
  },
  // Completion: Autocomplete (lightweight, high frequency)
  completion: {
    requests: 60,
    window: 60, // 60 requests per minute
    prefix: 'rl:completion',
  },
  // Debug: AI debugging
  debug: {
    requests: 20,
    window: 60, // 20 requests per minute
    prefix: 'rl:debug',
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

// =============================================================================
// RATE LIMITER CLASS
// =============================================================================

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // Unix timestamp when limit resets
  limit: number
  retryAfter?: number // Seconds until retry allowed
}

class AIRateLimiter {
  private redis: Redis | null = null
  private limiters: Map<RateLimitType, Ratelimit> = new Map()
  private inMemoryState: Map<string, { count: number; resetAt: number }> = new Map()

  constructor() {
    this.initializeRedis()
  }

  private initializeRedis() {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (redisUrl && redisToken) {
      try {
        this.redis = new Redis({
          url: redisUrl,
          token: redisToken,
        })

        // Initialize rate limiters for each type
        for (const [type, config] of Object.entries(RATE_LIMITS)) {
          this.limiters.set(type as RateLimitType, new Ratelimit({
            redis: this.redis,
            limiter: Ratelimit.slidingWindow(config.requests, `${config.window}s`),
            prefix: config.prefix,
            analytics: true,
          }))
        }

        console.log('[RateLimiter] Initialized with Upstash Redis')
      } catch (error) {
        console.warn('[RateLimiter] Failed to initialize Redis, using in-memory fallback')
        this.redis = null
      }
    } else {
      console.log('[RateLimiter] No Redis credentials, using in-memory rate limiting')
    }
  }

  /**
   * Check rate limit for a specific operation type and user
   */
  async checkLimit(
    type: RateLimitType,
    identifier: string
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[type]
    const key = `${config.prefix}:${identifier}`

    // Use Redis if available
    if (this.redis && this.limiters.has(type)) {
      const limiter = this.limiters.get(type)!
      const result = await limiter.limit(identifier)

      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        limit: config.requests,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      }
    }

    // Fallback to in-memory rate limiting
    return this.checkInMemoryLimit(key, config)
  }

  /**
   * In-memory rate limiting fallback
   */
  private checkInMemoryLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowMs = config.window * 1000
    const state = this.inMemoryState.get(key)

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanupInMemoryState()
    }

    if (!state || now >= state.resetAt) {
      // New window
      this.inMemoryState.set(key, {
        count: 1,
        resetAt: now + windowMs,
      })
      return {
        success: true,
        remaining: config.requests - 1,
        reset: now + windowMs,
        limit: config.requests,
      }
    }

    if (state.count >= config.requests) {
      // Rate limited
      return {
        success: false,
        remaining: 0,
        reset: state.resetAt,
        limit: config.requests,
        retryAfter: Math.ceil((state.resetAt - now) / 1000),
      }
    }

    // Increment count
    state.count++
    return {
      success: true,
      remaining: config.requests - state.count,
      reset: state.resetAt,
      limit: config.requests,
    }
  }

  /**
   * Clean up expired in-memory rate limit entries
   */
  private cleanupInMemoryState() {
    const now = Date.now()
    for (const [key, state] of this.inMemoryState.entries()) {
      if (now >= state.resetAt) {
        this.inMemoryState.delete(key)
      }
    }
  }

  /**
   * Get remaining requests for a user
   */
  async getRemaining(type: RateLimitType, identifier: string): Promise<number> {
    const config = RATE_LIMITS[type]
    const key = `${config.prefix}:${identifier}`

    if (this.redis && this.limiters.has(type)) {
      const limiter = this.limiters.get(type)!
      const result = await limiter.limit(identifier)
      // Reset the limit check (don't count this as a request)
      await limiter.resetUsedTokens(identifier)
      return result.remaining
    }

    const state = this.inMemoryState.get(key)
    if (!state || Date.now() >= state.resetAt) {
      return config.requests
    }
    return Math.max(0, config.requests - state.count)
  }

  /**
   * Reset rate limit for a user (admin use)
   */
  async resetLimit(type: RateLimitType, identifier: string): Promise<void> {
    const config = RATE_LIMITS[type]
    const key = `${config.prefix}:${identifier}`

    if (this.redis && this.limiters.has(type)) {
      const limiter = this.limiters.get(type)!
      await limiter.resetUsedTokens(identifier)
    }

    this.inMemoryState.delete(key)
  }

  /**
   * Block a user temporarily (abuse protection)
   */
  async blockUser(identifier: string, durationSeconds: number): Promise<void> {
    const key = `block:${identifier}`

    if (this.redis) {
      await this.redis.set(key, '1', { ex: durationSeconds })
    } else {
      this.inMemoryState.set(key, {
        count: 999999,
        resetAt: Date.now() + durationSeconds * 1000,
      })
    }
  }

  /**
   * Check if user is blocked
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const key = `block:${identifier}`

    if (this.redis) {
      const blocked = await this.redis.get(key)
      return !!blocked
    }

    const state = this.inMemoryState.get(key)
    return !!state && Date.now() < state.resetAt
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let rateLimiterInstance: AIRateLimiter | null = null

export function getRateLimiter(): AIRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new AIRateLimiter()
  }
  return rateLimiterInstance
}

// =============================================================================
// MIDDLEWARE HELPER
// =============================================================================

export interface RateLimitMiddlewareResult {
  allowed: boolean
  result: RateLimitResult
  headers: Record<string, string>
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  type: RateLimitType,
  identifier: string
): Promise<RateLimitMiddlewareResult> {
  const limiter = getRateLimiter()

  // Check if blocked first
  if (await limiter.isBlocked(identifier)) {
    return {
      allowed: false,
      result: {
        success: false,
        remaining: 0,
        reset: 0,
        limit: 0,
        retryAfter: 3600,
      },
      headers: {
        'X-RateLimit-Blocked': 'true',
        'Retry-After': '3600',
      },
    }
  }

  const result = await limiter.checkLimit(type, identifier)

  return {
    allowed: result.success,
    result,
    headers: {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
      ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
    },
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please wait ${result.retryAfter} seconds before retrying.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.reset),
        'Retry-After': String(result.retryAfter || 60),
      },
    }
  )
}
