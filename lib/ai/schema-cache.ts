// Schema Cache - Reduces AI calls for similar requests
// Uses LRU cache with optional Redis backing

import { Redis } from '@upstash/redis'
import type { UnifiedAppSchema, PlatformType } from '@/types/app-schema'
import type { CodeGenOutput } from '@/types/app-schema'

// =============================================================================
// CONFIGURATION
// =============================================================================

interface CacheConfig {
  // Maximum entries in memory cache
  maxSize: number
  // TTL in seconds
  ttlSeconds: number
  // Similarity threshold (0-1) for matching prompts
  similarityThreshold: number
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  ttlSeconds: 3600, // 1 hour
  similarityThreshold: 0.85,
}

// =============================================================================
// CACHE ENTRY TYPES
// =============================================================================

interface SchemaCacheEntry {
  prompt: string
  promptHash: string
  platform: PlatformType
  schema: Partial<UnifiedAppSchema>
  timestamp: number
  hits: number
}

interface CodeGenCacheEntry {
  schemaHash: string
  platform: PlatformType
  files: CodeGenOutput['files']
  timestamp: number
  hits: number
}

// =============================================================================
// HASH UTILITIES
// =============================================================================

/**
 * Generate a hash for a prompt (simple but fast)
 */
function hashPrompt(prompt: string): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ')
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `p_${Math.abs(hash).toString(36)}`
}

/**
 * Generate a hash for a schema
 */
function hashSchema(schema: Partial<UnifiedAppSchema>): string {
  // Create a deterministic string from key schema properties
  const key = JSON.stringify({
    name: schema.meta?.name,
    platform: schema.meta?.platform,
    subPlatform: schema.meta?.subPlatform,
    pages: schema.structure?.pages?.map(p => ({ name: p.name, path: p.path })),
    components: schema.components?.map(c => ({ name: c.name, type: c.type })),
    features: {
      auth: !!schema.features?.auth?.enabled,
      db: !!schema.features?.database,
      pwa: !!schema.features?.pwa?.enabled,
    },
  })

  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `s_${Math.abs(hash).toString(36)}`
}

/**
 * Calculate similarity between two prompts (Jaccard similarity on word sets)
 */
function calculateSimilarity(prompt1: string, prompt2: string): number {
  const words1 = new Set(prompt1.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const words2 = new Set(prompt2.toLowerCase().split(/\s+/).filter(w => w.length > 2))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

// =============================================================================
// LRU CACHE IMPLEMENTATION
// =============================================================================

class LRUCache<T> {
  private cache: Map<string, T> = new Map()
  private maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (item) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, item)
    }
    return item
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first in map)
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    this.cache.set(key, value)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  entries(): IterableIterator<[string, T]> {
    return this.cache.entries()
  }

  size(): number {
    return this.cache.size
  }
}

// =============================================================================
// SCHEMA CACHE CLASS
// =============================================================================

class SchemaCache {
  private schemaCache: LRUCache<SchemaCacheEntry>
  private codeGenCache: LRUCache<CodeGenCacheEntry>
  private redis: Redis | null = null
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.schemaCache = new LRUCache(this.config.maxSize)
    this.codeGenCache = new LRUCache(this.config.maxSize)
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
        console.log('[SchemaCache] Initialized with Redis backing')
      } catch {
        console.warn('[SchemaCache] Redis init failed, using memory only')
      }
    }
  }

  // ===========================================================================
  // SCHEMA CACHING (Controller output)
  // ===========================================================================

  /**
   * Get cached schema for a prompt
   */
  async getSchema(
    prompt: string,
    platform: PlatformType
  ): Promise<Partial<UnifiedAppSchema> | null> {
    const promptHash = hashPrompt(prompt)
    const cacheKey = `schema:${platform}:${promptHash}`

    // Check memory cache first
    const memoryEntry = this.schemaCache.get(cacheKey)
    if (memoryEntry && Date.now() - memoryEntry.timestamp < this.config.ttlSeconds * 1000) {
      memoryEntry.hits++
      console.log(`[SchemaCache] Memory hit for ${cacheKey}`)
      return memoryEntry.schema
    }

    // Check Redis cache
    if (this.redis) {
      try {
        const redisEntry = await this.redis.get<SchemaCacheEntry>(cacheKey)
        if (redisEntry && Date.now() - redisEntry.timestamp < this.config.ttlSeconds * 1000) {
          // Populate memory cache
          this.schemaCache.set(cacheKey, redisEntry)
          console.log(`[SchemaCache] Redis hit for ${cacheKey}`)
          return redisEntry.schema
        }
      } catch (error) {
        console.warn('[SchemaCache] Redis get error:', error)
      }
    }

    // Try fuzzy matching on similar prompts
    const similarEntry = this.findSimilarSchema(prompt, platform)
    if (similarEntry) {
      console.log(`[SchemaCache] Fuzzy match found (similarity > ${this.config.similarityThreshold})`)
      return similarEntry.schema
    }

    return null
  }

  /**
   * Cache a schema
   */
  async setSchema(
    prompt: string,
    platform: PlatformType,
    schema: Partial<UnifiedAppSchema>
  ): Promise<void> {
    const promptHash = hashPrompt(prompt)
    const cacheKey = `schema:${platform}:${promptHash}`

    const entry: SchemaCacheEntry = {
      prompt,
      promptHash,
      platform,
      schema,
      timestamp: Date.now(),
      hits: 0,
    }

    // Save to memory cache
    this.schemaCache.set(cacheKey, entry)

    // Save to Redis
    if (this.redis) {
      try {
        await this.redis.set(cacheKey, entry, { ex: this.config.ttlSeconds })
      } catch (error) {
        console.warn('[SchemaCache] Redis set error:', error)
      }
    }

    console.log(`[SchemaCache] Cached schema for ${cacheKey}`)
  }

  /**
   * Find similar cached schema using fuzzy matching
   */
  private findSimilarSchema(
    prompt: string,
    platform: PlatformType
  ): SchemaCacheEntry | null {
    let bestMatch: SchemaCacheEntry | null = null
    let bestSimilarity = 0

    for (const [, entry] of this.schemaCache.entries()) {
      if (entry.platform !== platform) continue

      const similarity = calculateSimilarity(prompt, entry.prompt)
      if (similarity > bestSimilarity && similarity >= this.config.similarityThreshold) {
        bestSimilarity = similarity
        bestMatch = entry
      }
    }

    return bestMatch
  }

  // ===========================================================================
  // CODE GENERATION CACHING
  // ===========================================================================

  /**
   * Get cached code generation output for a schema
   */
  async getCodeGen(
    schema: Partial<UnifiedAppSchema>,
    platform: PlatformType
  ): Promise<CodeGenOutput['files'] | null> {
    const schemaHash = hashSchema(schema)
    const cacheKey = `codegen:${platform}:${schemaHash}`

    // Check memory cache
    const memoryEntry = this.codeGenCache.get(cacheKey)
    if (memoryEntry && Date.now() - memoryEntry.timestamp < this.config.ttlSeconds * 1000) {
      memoryEntry.hits++
      console.log(`[SchemaCache] CodeGen memory hit for ${cacheKey}`)
      return memoryEntry.files
    }

    // Check Redis
    if (this.redis) {
      try {
        const redisEntry = await this.redis.get<CodeGenCacheEntry>(cacheKey)
        if (redisEntry && Date.now() - redisEntry.timestamp < this.config.ttlSeconds * 1000) {
          this.codeGenCache.set(cacheKey, redisEntry)
          console.log(`[SchemaCache] CodeGen Redis hit for ${cacheKey}`)
          return redisEntry.files
        }
      } catch (error) {
        console.warn('[SchemaCache] Redis get error:', error)
      }
    }

    return null
  }

  /**
   * Cache code generation output
   */
  async setCodeGen(
    schema: Partial<UnifiedAppSchema>,
    platform: PlatformType,
    files: CodeGenOutput['files']
  ): Promise<void> {
    const schemaHash = hashSchema(schema)
    const cacheKey = `codegen:${platform}:${schemaHash}`

    const entry: CodeGenCacheEntry = {
      schemaHash,
      platform,
      files,
      timestamp: Date.now(),
      hits: 0,
    }

    this.codeGenCache.set(cacheKey, entry)

    if (this.redis) {
      try {
        await this.redis.set(cacheKey, entry, { ex: this.config.ttlSeconds })
      } catch (error) {
        console.warn('[SchemaCache] Redis set error:', error)
      }
    }

    console.log(`[SchemaCache] Cached codegen for ${cacheKey}`)
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.schemaCache.clear()
    this.codeGenCache.clear()

    if (this.redis) {
      try {
        // Clear all cache keys (be careful in production!)
        const keys = await this.redis.keys('schema:*')
        const codegenKeys = await this.redis.keys('codegen:*')
        const allKeys = [...keys, ...codegenKeys]

        if (allKeys.length > 0) {
          await this.redis.del(...allKeys)
        }
      } catch (error) {
        console.warn('[SchemaCache] Redis clear error:', error)
      }
    }

    console.log('[SchemaCache] Cleared all caches')
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    schemaEntries: number
    codeGenEntries: number
    config: CacheConfig
  } {
    return {
      schemaEntries: this.schemaCache.size(),
      codeGenEntries: this.codeGenCache.size(),
      config: this.config,
    }
  }

  /**
   * Invalidate cache for a specific platform
   */
  async invalidatePlatform(platform: PlatformType): Promise<void> {
    // Clear from memory
    for (const [key] of this.schemaCache.entries()) {
      if (key.includes(`:${platform}:`)) {
        this.schemaCache.delete(key)
      }
    }
    for (const [key] of this.codeGenCache.entries()) {
      if (key.includes(`:${platform}:`)) {
        this.codeGenCache.delete(key)
      }
    }

    // Clear from Redis
    if (this.redis) {
      try {
        const schemaKeys = await this.redis.keys(`schema:${platform}:*`)
        const codegenKeys = await this.redis.keys(`codegen:${platform}:*`)
        const allKeys = [...schemaKeys, ...codegenKeys]

        if (allKeys.length > 0) {
          await this.redis.del(...allKeys)
        }
      } catch (error) {
        console.warn('[SchemaCache] Redis invalidate error:', error)
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let cacheInstance: SchemaCache | null = null

export function getSchemaCache(): SchemaCache {
  if (!cacheInstance) {
    cacheInstance = new SchemaCache()
  }
  return cacheInstance
}

// =============================================================================
// CACHE DECORATOR
// =============================================================================

/**
 * Decorator function for caching async operations
 */
export function withSchemaCache<T>(
  key: string,
  ttlSeconds: number = 3600
) {
  const cache = getSchemaCache()

  return async function (
    fn: () => Promise<T>,
    shouldCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (shouldCache) {
      // For now, just execute the function
      // In a real implementation, we'd store arbitrary data
    }

    // Execute function
    const result = await fn()

    return result
  }
}
