import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Different rate limiters for different use cases
export const rateLimiters = {
  // AI requests: 50 per hour for free, 200 for pro
  ai: {
    free: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:free",
    }),
    pro: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:pro",
    }),
    team: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:team",
    }),
  },

  // API requests: 100 per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
  }),

  // Auth attempts: 5 per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // File operations: 30 per minute
  fileOps: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:file",
  }),

  // Deployment: 10 per hour
  deploy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:deploy",
  }),
}

export type RateLimitType = keyof typeof rateLimiters

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Check rate limit for a given identifier and type
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType,
  plan: 'free' | 'pro' | 'team' = 'free'
): Promise<RateLimitResult> {
  let limiter: Ratelimit

  if (type === 'ai') {
    limiter = rateLimiters.ai[plan]
  } else {
    limiter = rateLimiters[type] as Ratelimit
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter)
  }

  return headers
}

/**
 * Rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...createRateLimitHeaders(result),
      },
    }
  )
}

// Track usage for analytics
export async function trackUsage(
  userId: string,
  type: 'ai_request' | 'deployment' | 'file_operation' | 'api_call',
  metadata?: Record<string, any>
) {
  const key = `usage:${userId}:${type}:${new Date().toISOString().slice(0, 10)}`

  await redis.hincrby(key, 'count', 1)
  await redis.expire(key, 60 * 60 * 24 * 30) // Keep for 30 days

  if (metadata) {
    await redis.hset(key, { lastMetadata: JSON.stringify(metadata) })
  }
}

// Get usage stats for a user
export async function getUsageStats(
  userId: string,
  days: number = 30
): Promise<Record<string, number>> {
  const stats: Record<string, number> = {
    ai_request: 0,
    deployment: 0,
    file_operation: 0,
    api_call: 0,
  }

  const types = Object.keys(stats) as Array<keyof typeof stats>

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)

    for (const type of types) {
      const key = `usage:${userId}:${type}:${dateStr}`
      const count = await redis.hget<number>(key, 'count')
      if (count) {
        stats[type] += count
      }
    }
  }

  return stats
}
