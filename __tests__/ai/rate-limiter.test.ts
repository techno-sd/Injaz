// Tests for Rate Limiter

// Mock Upstash Redis to avoid ESM issues in Jest
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
  })),
}))

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({ success: true, remaining: 10, reset: Date.now() + 60000 }),
    resetUsedTokens: jest.fn(),
  })),
}))

// Mock global Response for Node.js environment
global.Response = class MockResponse {
  status: number
  headers: Map<string, string>
  body: string

  constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
} as any

import {
  getRateLimiter,
  rateLimitMiddleware,
  createRateLimitResponse,
  RATE_LIMITS,
  type RateLimitType,
} from '@/lib/ai/rate-limiter'

describe('Rate Limiter', () => {
  // Use unique user IDs per test to avoid cross-test pollution
  let testUserId: string

  beforeEach(async () => {
    // Generate unique user ID for each test
    testUserId = `test-user-${Date.now()}-${Math.random().toString(36).slice(2)}`
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const limiter = getRateLimiter()
      const result = await limiter.checkLimit('chat', testUserId)

      expect(result.success).toBe(true)
      expect(result.remaining).toBeLessThan(RATE_LIMITS.chat.requests)
      expect(result.limit).toBe(RATE_LIMITS.chat.requests)
    })

    it('should track remaining requests correctly', async () => {
      const limiter = getRateLimiter()

      // Make 3 requests
      await limiter.checkLimit('chat', testUserId)
      await limiter.checkLimit('chat', testUserId)
      const result = await limiter.checkLimit('chat', testUserId)

      expect(result.remaining).toBe(RATE_LIMITS.chat.requests - 3)
    })

    it('should block requests after limit exceeded', async () => {
      const limiter = getRateLimiter()

      // Use completion which has 60 req/min limit - exhaust it
      for (let i = 0; i < RATE_LIMITS.codegen.requests; i++) {
        await limiter.checkLimit('codegen', testUserId)
      }

      // Next request should be blocked
      const result = await limiter.checkLimit('codegen', testUserId)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
    })
  })

  describe('getRemaining', () => {
    it('should return full limit for new user', async () => {
      const limiter = getRateLimiter()
      const remaining = await limiter.getRemaining('chat', 'new-user-xyz')

      expect(remaining).toBe(RATE_LIMITS.chat.requests)
    })
  })

  describe('resetLimit', () => {
    it('should reset rate limit for user', async () => {
      const limiter = getRateLimiter()

      // Make some requests
      await limiter.checkLimit('chat', testUserId)
      await limiter.checkLimit('chat', testUserId)

      // Reset
      await limiter.resetLimit('chat', testUserId)

      // Should have full limit again
      const result = await limiter.checkLimit('chat', testUserId)
      expect(result.remaining).toBe(RATE_LIMITS.chat.requests - 1)
    })
  })

  describe('blockUser', () => {
    it('should block user temporarily', async () => {
      const limiter = getRateLimiter()

      await limiter.blockUser(testUserId, 60)

      const isBlocked = await limiter.isBlocked(testUserId)
      expect(isBlocked).toBe(true)
    })
  })

  describe('rateLimitMiddleware', () => {
    it('should return allowed status and headers', async () => {
      const result = await rateLimitMiddleware('chat', testUserId)

      expect(result.allowed).toBe(true)
      expect(result.headers['X-RateLimit-Limit']).toBeDefined()
      expect(result.headers['X-RateLimit-Remaining']).toBeDefined()
      expect(result.headers['X-RateLimit-Reset']).toBeDefined()
    })

    it('should return blocked status for blocked users', async () => {
      const limiter = getRateLimiter()
      await limiter.blockUser('blocked-user', 60)

      const result = await rateLimitMiddleware('chat', 'blocked-user')

      expect(result.allowed).toBe(false)
      expect(result.headers['X-RateLimit-Blocked']).toBe('true')
    })
  })

  describe('createRateLimitResponse', () => {
    it('should create 429 response with correct headers', () => {
      const response = createRateLimitResponse({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000,
        limit: 10,
        retryAfter: 60,
      })

      expect(response.status).toBe(429)
      // Use Map.get() for the mock
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Retry-After')).toBe('60')
    })
  })

  describe('RATE_LIMITS config', () => {
    it('should have correct limits for each type', () => {
      expect(RATE_LIMITS.controller.requests).toBe(10)
      expect(RATE_LIMITS.codegen.requests).toBe(5)
      expect(RATE_LIMITS.chat.requests).toBe(30)
      expect(RATE_LIMITS.completion.requests).toBe(60)
      expect(RATE_LIMITS.debug.requests).toBe(20)
    })

    it('should have 60 second windows', () => {
      for (const config of Object.values(RATE_LIMITS)) {
        expect(config.window).toBe(60)
      }
    })
  })
})
