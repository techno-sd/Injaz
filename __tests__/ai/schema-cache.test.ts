// Tests for Schema Cache

// Mock Upstash Redis to avoid ESM issues in Jest
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
  })),
}))

import { getSchemaCache } from '@/lib/ai/schema-cache'
import type { UnifiedAppSchema, PlatformType } from '@/types/app-schema'

describe('Schema Cache', () => {
  const testSchema: Partial<UnifiedAppSchema> = {
    meta: {
      name: 'Test App',
      description: 'A test application',
      platform: 'webapp',
      version: '1.0.0',
    },
    structure: {
      pages: [{ id: '1', name: 'Home', path: '/', type: 'static', title: 'Home', components: [] }],
      navigation: { type: 'header', items: [] },
      layouts: [],
    },
    components: [{ id: 'btn1', name: 'Button', type: 'button', props: [] }],
    features: {},
    design: undefined as any,
    integrations: [],
  }

  beforeEach(async () => {
    const cache = getSchemaCache()
    await cache.clear()
  })

  describe('Schema Caching', () => {
    it('should cache and retrieve schema', async () => {
      const cache = getSchemaCache()
      const prompt = 'Build a dashboard app'
      const platform: PlatformType = 'webapp'

      // Cache the schema
      await cache.setSchema(prompt, platform, testSchema)

      // Retrieve from cache
      const cached = await cache.getSchema(prompt, platform)

      expect(cached).toBeDefined()
      expect(cached?.meta?.name).toBe('Test App')
    })

    it('should return null for uncached prompts', async () => {
      const cache = getSchemaCache()
      const cached = await cache.getSchema('random uncached prompt', 'webapp')

      expect(cached).toBeNull()
    })

    it('should match similar prompts with fuzzy matching', async () => {
      const cache = getSchemaCache()

      // Cache with original prompt
      await cache.setSchema(
        'Build a modern dashboard for analytics',
        'webapp',
        testSchema
      )

      // Try to retrieve with similar prompt
      const cached = await cache.getSchema(
        'Create a modern analytics dashboard',
        'webapp'
      )

      // Should find a match due to word overlap
      expect(cached).toBeDefined()
    })

    it('should not match prompts for different platforms', async () => {
      const cache = getSchemaCache()

      await cache.setSchema('Build a dashboard', 'webapp', testSchema)

      const cached = await cache.getSchema('Build a dashboard', 'mobile')

      expect(cached).toBeNull()
    })
  })

  describe('CodeGen Caching', () => {
    it('should cache and retrieve code generation output', async () => {
      const cache = getSchemaCache()
      const files = [
        { path: 'app/page.tsx', content: 'export default function Home() {}', language: 'typescript' },
      ]

      await cache.setCodeGen(testSchema, 'webapp', files)

      const cached = await cache.getCodeGen(testSchema, 'webapp')

      expect(cached).toBeDefined()
      expect(cached?.[0].path).toBe('app/page.tsx')
    })

    it('should return null for uncached schemas', async () => {
      const cache = getSchemaCache()
      const differentSchema = {
        ...testSchema,
        meta: { ...testSchema.meta!, name: 'Different App' },
      }

      const cached = await cache.getCodeGen(differentSchema, 'webapp')

      expect(cached).toBeNull()
    })
  })

  describe('Cache Management', () => {
    it('should clear all caches', async () => {
      const cache = getSchemaCache()

      await cache.setSchema('test prompt', 'webapp', testSchema)
      await cache.setCodeGen(testSchema, 'webapp', [])

      await cache.clear()

      const schemaCache = await cache.getSchema('test prompt', 'webapp')
      const codeGenCache = await cache.getCodeGen(testSchema, 'webapp')

      expect(schemaCache).toBeNull()
      expect(codeGenCache).toBeNull()
    })

    it('should return cache statistics', () => {
      const cache = getSchemaCache()
      const stats = cache.getStats()

      expect(stats).toHaveProperty('schemaEntries')
      expect(stats).toHaveProperty('codeGenEntries')
      expect(stats).toHaveProperty('config')
    })

    it('should invalidate platform-specific cache', async () => {
      const cache = getSchemaCache()

      await cache.setSchema('webapp prompt', 'webapp', testSchema)
      await cache.setSchema('mobile prompt', 'mobile', testSchema)

      await cache.invalidatePlatform('webapp')

      const webappCache = await cache.getSchema('webapp prompt', 'webapp')
      const mobileCache = await cache.getSchema('mobile prompt', 'mobile')

      expect(webappCache).toBeNull()
      expect(mobileCache).toBeDefined()
    })
  })
})
