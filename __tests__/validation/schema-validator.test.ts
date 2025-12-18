// Tests for Schema Validator
import {
  validateSchema,
  validatePartialSchema,
  validateAndRepairSchema,
  getValidationSummary,
} from '@/lib/validation/schema-validator'
import type { UnifiedAppSchema } from '@/types/app-schema'

describe('Schema Validator', () => {
  // Valid schema for testing
  const validSchema: UnifiedAppSchema = {
    meta: {
      name: 'Test App',
      description: 'A test application',
      platform: 'webapp',
      version: '1.0.0',
    },
    design: {
      theme: 'system',
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        foreground: '#0a0a0a',
        muted: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        baseFontSize: 16,
        lineHeight: 1.5,
      },
      spacing: 'normal',
      borderRadius: 'md',
      shadows: true,
    },
    structure: {
      pages: [],
      navigation: { type: 'header', items: [] },
      layouts: [],
    },
    features: {},
    components: [],
    integrations: [],
  }

  describe('validateSchema', () => {
    it('should validate a correct schema', () => {
      const result = validateSchema(validSchema)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    it('should reject schema with missing required fields', () => {
      const invalidSchema = {
        meta: { name: 'Test' }, // Missing required fields
      }
      const result = validateSchema(invalidSchema)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })

    it('should reject invalid platform type', () => {
      const invalidSchema = {
        ...validSchema,
        meta: { ...validSchema.meta, platform: 'invalid' as any },
      }
      const result = validateSchema(invalidSchema)
      expect(result.success).toBe(false)
    })

    it('should reject invalid hex color', () => {
      const invalidSchema = {
        ...validSchema,
        design: {
          ...validSchema.design,
          colors: { ...validSchema.design.colors, primary: 'not-a-color' },
        },
      }
      const result = validateSchema(invalidSchema)
      expect(result.success).toBe(false)
    })

    it('should validate schema with all optional fields', () => {
      const fullSchema = {
        ...validSchema,
        meta: {
          ...validSchema.meta,
          subPlatform: 'dashboard' as const,
          icon: '/icon.png',
          keywords: ['test', 'app'],
        },
        features: {
          auth: {
            enabled: true,
            providers: ['email' as const, 'google' as const],
            requireEmailVerification: true,
            passwordMinLength: 8,
          },
          pwa: {
            enabled: true,
            name: 'Test PWA',
            shortName: 'Test',
            themeColor: '#6366f1',
            backgroundColor: '#ffffff',
            display: 'standalone' as const,
            orientation: 'any' as const,
            startUrl: '/',
            icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }],
            serviceWorker: {
              enabled: true,
              cachingStrategy: 'stale-while-revalidate' as const,
            },
          },
        },
      }
      const result = validateSchema(fullSchema)
      expect(result.success).toBe(true)
    })
  })

  describe('validatePartialSchema', () => {
    it('should validate partial schema', () => {
      const partialSchema = {
        meta: {
          name: 'Partial App',
          description: 'Test',
          platform: 'webapp' as const,
          version: '1.0.0',
        },
      }
      const result = validatePartialSchema(partialSchema)
      expect(result.success).toBe(true)
    })

    it('should still validate field types in partial schema', () => {
      const invalidPartial = {
        meta: {
          name: '', // Empty string should fail
          description: 'Test',
          platform: 'webapp',
          version: '1.0.0',
        },
      }
      const result = validatePartialSchema(invalidPartial)
      expect(result.success).toBe(false)
    })
  })

  describe('validateAndRepairSchema', () => {
    it('should repair missing version', () => {
      const schemaWithoutVersion = {
        ...validSchema,
        meta: { name: 'Test', description: 'Test', platform: 'webapp' as const },
      }
      const result = validateAndRepairSchema(schemaWithoutVersion)
      expect(result.success).toBe(true)
      expect(result.data?.meta.version).toBe('1.0.0')
    })

    it('should repair hex colors without #', () => {
      const schemaWithBadColors = {
        ...validSchema,
        design: {
          ...validSchema.design,
          colors: {
            ...validSchema.design.colors,
            primary: '6366f1', // Missing #
          },
        },
      }
      const result = validateAndRepairSchema(schemaWithBadColors)
      expect(result.success).toBe(true)
      expect(result.data?.design.colors.primary).toBe('#6366f1')
    })

    it('should initialize missing arrays', () => {
      const schemaWithMissingArrays = {
        meta: validSchema.meta,
        design: validSchema.design,
        structure: {
          pages: undefined,
          navigation: { type: 'header' as const, items: [] },
          layouts: undefined,
        },
        features: {},
        components: undefined,
        integrations: undefined,
      }
      const result = validateAndRepairSchema(schemaWithMissingArrays)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data?.components)).toBe(true)
      expect(Array.isArray(result.data?.integrations)).toBe(true)
    })
  })

  describe('getValidationSummary', () => {
    it('should return valid message for no errors', () => {
      const summary = getValidationSummary([])
      expect(summary).toBe('Schema is valid')
    })

    it('should group errors by section', () => {
      const errors = [
        { path: 'meta.name', message: 'Required' },
        { path: 'meta.platform', message: 'Invalid' },
        { path: 'design.colors.primary', message: 'Invalid hex' },
      ]
      const summary = getValidationSummary(errors)
      expect(summary).toContain('meta')
      expect(summary).toContain('design')
    })
  })
})
