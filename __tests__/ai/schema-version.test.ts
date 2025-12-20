// Tests for Schema Versioning
import {
  getSchemaVersionManager,
  compareVersions,
  isVersionSupported,
  getVersionInfo,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_VERSION,
} from '@/lib/ai/schema-version'
import type { UnifiedAppSchema } from '@/types/app-schema'

describe('Schema Versioning', () => {
  const baseSchema: Partial<UnifiedAppSchema> = {
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

  describe('compareVersions', () => {
    it('should return -1 when first version is lower', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1)
      expect(compareVersions('1.0.0', '1.1.0')).toBe(-1)
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
    })

    it('should return 1 when first version is higher', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1)
      expect(compareVersions('1.1.0', '1.0.0')).toBe(1)
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1)
    })

    it('should return 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
      expect(compareVersions('2.1.3', '2.1.3')).toBe(0)
    })
  })

  describe('isVersionSupported', () => {
    it('should return true for supported versions', () => {
      expect(isVersionSupported('1.0.0')).toBe(true)
      expect(isVersionSupported('1.1.0')).toBe(true)
      expect(isVersionSupported(CURRENT_SCHEMA_VERSION)).toBe(true)
    })

    it('should return false for unsupported versions', () => {
      expect(isVersionSupported('0.9.0')).toBe(false)
      expect(isVersionSupported('0.0.1')).toBe(false)
    })
  })

  describe('getVersionInfo', () => {
    it('should return correct info for current version', () => {
      const schema = { ...baseSchema, $schemaVersion: CURRENT_SCHEMA_VERSION }
      const info = getVersionInfo(schema)

      expect(info.current).toBe(CURRENT_SCHEMA_VERSION)
      expect(info.isValid).toBe(true)
      expect(info.needsMigration).toBe(false)
    })

    it('should indicate migration needed for old version', () => {
      const schema = { ...baseSchema, $schemaVersion: '1.0.0' }
      const info = getVersionInfo(schema)

      expect(info.needsMigration).toBe(true)
      expect(info.migrationPath?.length).toBeGreaterThan(0)
    })

    it('should default to 1.0.0 if version not specified', () => {
      const info = getVersionInfo(baseSchema)

      expect(info.current).toBe('1.0.0')
    })
  })

  describe('SchemaVersionManager.migrate', () => {
    it('should migrate old schema to current version', () => {
      const manager = getSchemaVersionManager()
      const oldSchema = { ...baseSchema, $schemaVersion: '1.0.0' }

      const result = manager.migrate(oldSchema)

      expect(result.success).toBe(true)
      expect(result.toVersion).toBe(CURRENT_SCHEMA_VERSION)
      expect(result.changes.length).toBeGreaterThan(0)
    })

    it('should not modify current version schema', () => {
      const manager = getSchemaVersionManager()
      const currentSchema = { ...baseSchema, $schemaVersion: CURRENT_SCHEMA_VERSION }

      const result = manager.migrate(currentSchema)

      expect(result.success).toBe(true)
      expect(result.changes).toContain('No migration needed')
    })

    it('should fail for unsupported versions', () => {
      const manager = getSchemaVersionManager()
      const unsupportedSchema = { ...baseSchema, $schemaVersion: '0.5.0' }

      const result = manager.migrate(unsupportedSchema)

      expect(result.success).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should add responsive config in 1.0.0 -> 1.1.0 migration', () => {
      const manager = getSchemaVersionManager()
      const oldSchema = {
        ...baseSchema,
        $schemaVersion: '1.0.0',
        design: { ...baseSchema.design, responsive: undefined },
      }

      const result = manager.migrate(oldSchema)

      expect(result.success).toBe(true)
      expect(result.schema.design?.responsive).toBeDefined()
    })
  })

  describe('SchemaVersionManager.createVersionedSchema', () => {
    it('should create schema with version metadata', () => {
      const manager = getSchemaVersionManager()

      const versioned = manager.createVersionedSchema(baseSchema, 'webapp')

      expect(versioned.$schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
      expect(versioned.$createdAt).toBeDefined()
      expect(versioned.$updatedAt).toBeDefined()
      expect(versioned.$history?.length).toBe(1)
    })

    it('should include all required fields', () => {
      const manager = getSchemaVersionManager()

      const versioned = manager.createVersionedSchema({}, 'webapp')

      expect(versioned.meta.platform).toBe('webapp')
      expect(versioned.design).toBeDefined()
      expect(versioned.structure).toBeDefined()
      expect(versioned.components).toEqual([])
      expect(versioned.integrations).toEqual([])
    })
  })

  describe('SchemaVersionManager.validateCompatibility', () => {
    it('should validate compatible schema', () => {
      const manager = getSchemaVersionManager()
      const schema = {
        ...baseSchema,
        $schemaVersion: CURRENT_SCHEMA_VERSION,
      }

      const result = manager.validateCompatibility(schema)

      expect(result.compatible).toBe(true)
      expect(result.issues.length).toBe(0)
    })

    it('should detect missing required fields', () => {
      const manager = getSchemaVersionManager()
      const schema = { $schemaVersion: CURRENT_SCHEMA_VERSION }

      const result = manager.validateCompatibility(schema)

      expect(result.compatible).toBe(false)
      expect(result.issues).toContain('Missing required field: meta')
    })

    it('should detect invalid version format', () => {
      const manager = getSchemaVersionManager()
      const schema = { ...baseSchema, $schemaVersion: 'invalid' }

      const result = manager.validateCompatibility(schema)

      expect(result.compatible).toBe(false)
      expect(result.issues.some(i => i.includes('Invalid version format'))).toBe(true)
    })
  })

  describe('SchemaVersionManager.getVersionDiff', () => {
    it('should return changes between versions', () => {
      const manager = getSchemaVersionManager()

      const diff = manager.getVersionDiff('1.0.0', '1.2.0')

      expect(diff.fromVersion).toBe('1.0.0')
      expect(diff.toVersion).toBe('1.2.0')
      expect(diff.changes.length).toBeGreaterThan(0)
    })

    it('should include version-specific changes', () => {
      const manager = getSchemaVersionManager()

      const diff = manager.getVersionDiff('1.0.0', '1.1.0')

      const versionChanges = diff.changes.find(c => c.version === '1.1.0')
      expect(versionChanges?.changes).toContain('Added PWA support')
    })
  })

  describe('SchemaVersionManager.exportSchema', () => {
    it('should strip version metadata', () => {
      const manager = getSchemaVersionManager()
      const versioned = manager.createVersionedSchema(baseSchema, 'webapp')

      const exported = manager.exportSchema(versioned)

      expect((exported as any).$schemaVersion).toBeUndefined()
      expect((exported as any).$createdAt).toBeUndefined()
      expect((exported as any).$updatedAt).toBeUndefined()
      expect((exported as any).$history).toBeUndefined()
    })

    it('should preserve all schema data', () => {
      const manager = getSchemaVersionManager()
      const versioned = manager.createVersionedSchema(baseSchema, 'webapp')

      const exported = manager.exportSchema(versioned)

      expect(exported.meta?.name).toBe(baseSchema.meta?.name)
      expect(exported.design?.theme).toBe(baseSchema.design?.theme)
    })
  })
})
