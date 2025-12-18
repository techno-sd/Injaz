// Schema Versioning System
// Handles schema migrations and backwards compatibility

import type { UnifiedAppSchema, PlatformType } from '@/types/app-schema'

// =============================================================================
// VERSION CONSTANTS
// =============================================================================

// Current schema version
export const CURRENT_SCHEMA_VERSION = '2.0.0'

// Minimum supported version for migration
export const MIN_SUPPORTED_VERSION = '1.0.0'

// Version history for reference
export const VERSION_HISTORY = [
  { version: '1.0.0', date: '2024-01-01', changes: ['Initial schema structure'] },
  { version: '1.1.0', date: '2024-03-01', changes: ['Added PWA support', 'Added responsive config'] },
  { version: '1.2.0', date: '2024-06-01', changes: ['Added integrations', 'Enhanced auth schema'] },
  { version: '2.0.0', date: '2024-12-01', changes: ['Unified schema format', 'Added subPlatform types', 'Enhanced validation'] },
] as const

// =============================================================================
// TYPES
// =============================================================================

export interface VersionedSchema extends UnifiedAppSchema {
  $schemaVersion: string
  $createdAt: string
  $updatedAt: string
  $history?: SchemaHistoryEntry[]
}

export interface SchemaHistoryEntry {
  version: string
  timestamp: string
  changes: string[]
  previousHash?: string
}

export interface MigrationResult {
  success: boolean
  fromVersion: string
  toVersion: string
  schema: Partial<UnifiedAppSchema>
  warnings: string[]
  changes: string[]
}

export interface VersionInfo {
  current: string
  minimum: string
  isValid: boolean
  needsMigration: boolean
  migrationPath?: string[]
}

// =============================================================================
// VERSION UTILITIES
// =============================================================================

/**
 * Parse semantic version string
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number)
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  }
}

/**
 * Compare two version strings
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const vA = parseVersion(a)
  const vB = parseVersion(b)

  if (vA.major !== vB.major) return vA.major < vB.major ? -1 : 1
  if (vA.minor !== vB.minor) return vA.minor < vB.minor ? -1 : 1
  if (vA.patch !== vB.patch) return vA.patch < vB.patch ? -1 : 1
  return 0
}

/**
 * Check if version is supported
 */
export function isVersionSupported(version: string): boolean {
  return compareVersions(version, MIN_SUPPORTED_VERSION) >= 0
}

/**
 * Get version info for a schema
 */
export function getVersionInfo(schema: Partial<VersionedSchema>): VersionInfo {
  const schemaVersion = schema.$schemaVersion || '1.0.0'

  return {
    current: schemaVersion,
    minimum: MIN_SUPPORTED_VERSION,
    isValid: isVersionSupported(schemaVersion),
    needsMigration: compareVersions(schemaVersion, CURRENT_SCHEMA_VERSION) < 0,
    migrationPath: getMigrationPath(schemaVersion, CURRENT_SCHEMA_VERSION),
  }
}

/**
 * Get migration path between versions
 */
function getMigrationPath(from: string, to: string): string[] {
  const path: string[] = []
  const versions = VERSION_HISTORY.map(v => v.version)

  let startIdx = versions.findIndex(v => v === from)
  const endIdx = versions.findIndex(v => v === to)

  if (startIdx === -1) startIdx = 0
  if (endIdx === -1 || startIdx >= endIdx) return []

  for (let i = startIdx + 1; i <= endIdx; i++) {
    path.push(versions[i])
  }

  return path
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

type MigrationFn = (schema: Partial<UnifiedAppSchema>) => {
  schema: Partial<UnifiedAppSchema>
  changes: string[]
}

/**
 * Migration registry
 */
const migrations: Record<string, MigrationFn> = {
  // Migration from 1.0.0 to 1.1.0
  '1.0.0->1.1.0': (schema) => {
    const changes: string[] = []

    // Add responsive config if missing
    if (schema.design && !schema.design.responsive) {
      schema.design.responsive = {
        strategy: 'mobile-first',
        breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
      }
      changes.push('Added default responsive configuration')
    }

    // Add PWA config for webapps
    if (schema.meta?.platform === 'webapp' && !schema.features?.pwa) {
      if (!schema.features) schema.features = {}
      schema.features.pwa = {
        enabled: false,
        name: schema.meta.name || '',
        shortName: schema.meta.name?.substring(0, 12) || '',
        themeColor: schema.design?.colors?.primary || '#6366f1',
        backgroundColor: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        startUrl: '/',
        icons: [],
        serviceWorker: {
          enabled: false,
          cachingStrategy: 'stale-while-revalidate',
        },
      }
      changes.push('Added PWA configuration (disabled by default)')
    }

    return { schema, changes }
  },

  // Migration from 1.1.0 to 1.2.0
  '1.1.0->1.2.0': (schema) => {
    const changes: string[] = []

    // Ensure integrations array exists
    if (!Array.isArray(schema.integrations)) {
      schema.integrations = []
      changes.push('Added empty integrations array')
    }

    // Enhance auth schema
    if (schema.features?.auth) {
      if (!schema.features.auth.redirectAfterLogin) {
        schema.features.auth.redirectAfterLogin = '/'
        changes.push('Added default redirectAfterLogin')
      }
      if (!schema.features.auth.redirectAfterLogout) {
        schema.features.auth.redirectAfterLogout = '/login'
        changes.push('Added default redirectAfterLogout')
      }
    }

    return { schema, changes }
  },

  // Migration from 1.2.0 to 2.0.0
  '1.2.0->2.0.0': (schema) => {
    const changes: string[] = []

    // Ensure meta has all required fields
    if (schema.meta) {
      if (!schema.meta.version) {
        schema.meta.version = '1.0.0'
        changes.push('Added default meta.version')
      }
    }

    // Ensure structure has all required arrays
    if (schema.structure) {
      if (!Array.isArray(schema.structure.pages)) {
        schema.structure.pages = []
        changes.push('Initialized empty pages array')
      }
      if (!Array.isArray(schema.structure.layouts)) {
        schema.structure.layouts = []
        changes.push('Initialized empty layouts array')
      }
    }

    // Ensure components is an array
    if (!Array.isArray(schema.components)) {
      schema.components = []
      changes.push('Initialized empty components array')
    }

    // Add default spacing if missing
    if (schema.design && !schema.design.spacing) {
      schema.design.spacing = 'normal'
      changes.push('Added default spacing mode')
    }

    return { schema, changes }
  },
}

/**
 * Run a single migration
 */
function runMigration(
  schema: Partial<UnifiedAppSchema>,
  fromVersion: string,
  toVersion: string
): MigrationFn | null {
  const key = `${fromVersion}->${toVersion}`
  return migrations[key] || null
}

// =============================================================================
// SCHEMA VERSION MANAGER
// =============================================================================

export class SchemaVersionManager {
  /**
   * Migrate schema to current version
   */
  migrate(schema: Partial<VersionedSchema>): MigrationResult {
    const currentVersion = schema.$schemaVersion || '1.0.0'
    const warnings: string[] = []
    const allChanges: string[] = []

    // Check if version is supported
    if (!isVersionSupported(currentVersion)) {
      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        schema,
        warnings: [`Version ${currentVersion} is not supported. Minimum: ${MIN_SUPPORTED_VERSION}`],
        changes: [],
      }
    }

    // Check if migration needed
    if (compareVersions(currentVersion, CURRENT_SCHEMA_VERSION) >= 0) {
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: currentVersion,
        schema,
        warnings: [],
        changes: ['No migration needed'],
      }
    }

    // Get migration path
    const path = getMigrationPath(currentVersion, CURRENT_SCHEMA_VERSION)
    if (path.length === 0) {
      warnings.push('No migration path found, applying defaults')
    }

    // Apply migrations in order
    let migratedSchema = JSON.parse(JSON.stringify(schema)) as Partial<UnifiedAppSchema>
    let lastVersion = currentVersion

    for (const targetVersion of path) {
      const migration = runMigration(migratedSchema, lastVersion, targetVersion)

      if (migration) {
        const result = migration(migratedSchema)
        migratedSchema = result.schema
        allChanges.push(...result.changes.map(c => `[${lastVersion}→${targetVersion}] ${c}`))
      } else {
        warnings.push(`No migration handler for ${lastVersion}→${targetVersion}`)
      }

      lastVersion = targetVersion
    }

    // Update version metadata
    const versionedResult = migratedSchema as Partial<VersionedSchema>
    versionedResult.$schemaVersion = CURRENT_SCHEMA_VERSION
    versionedResult.$updatedAt = new Date().toISOString()

    // Add to history
    if (!versionedResult.$history) {
      versionedResult.$history = []
    }
    versionedResult.$history.push({
      version: CURRENT_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      changes: allChanges,
    })

    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      schema: migratedSchema,
      warnings,
      changes: allChanges,
    }
  }

  /**
   * Create a new versioned schema
   */
  createVersionedSchema(
    schema: Partial<UnifiedAppSchema>,
    platform: PlatformType
  ): VersionedSchema {
    const now = new Date().toISOString()

    return {
      ...schema,
      meta: {
        name: schema.meta?.name || '',
        description: schema.meta?.description || '',
        platform,
        subPlatform: schema.meta?.subPlatform,
        version: schema.meta?.version || '1.0.0',
        ...schema.meta,
      },
      design: schema.design || {
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
      structure: schema.structure || {
        pages: [],
        navigation: { type: 'header', items: [] },
        layouts: [],
      },
      features: schema.features || {},
      components: schema.components || [],
      integrations: schema.integrations || [],
      $schemaVersion: CURRENT_SCHEMA_VERSION,
      $createdAt: now,
      $updatedAt: now,
      $history: [{
        version: CURRENT_SCHEMA_VERSION,
        timestamp: now,
        changes: ['Initial schema creation'],
      }],
    } as VersionedSchema
  }

  /**
   * Validate schema version compatibility
   */
  validateCompatibility(schema: Partial<VersionedSchema>): {
    compatible: boolean
    issues: string[]
  } {
    const issues: string[] = []
    const version = schema.$schemaVersion || '1.0.0'

    // Check version format
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      issues.push(`Invalid version format: ${version}`)
    }

    // Check if version is supported
    if (!isVersionSupported(version)) {
      issues.push(`Version ${version} is below minimum supported (${MIN_SUPPORTED_VERSION})`)
    }

    // Check for future versions (might have incompatible changes)
    if (compareVersions(version, CURRENT_SCHEMA_VERSION) > 0) {
      issues.push(`Schema version ${version} is newer than current ${CURRENT_SCHEMA_VERSION}`)
    }

    // Check required fields
    if (!schema.meta) issues.push('Missing required field: meta')
    if (!schema.design) issues.push('Missing required field: design')
    if (!schema.structure) issues.push('Missing required field: structure')

    return {
      compatible: issues.length === 0,
      issues,
    }
  }

  /**
   * Get schema diff between versions
   */
  getVersionDiff(oldVersion: string, newVersion: string): {
    fromVersion: string
    toVersion: string
    changes: { version: string; changes: readonly string[] }[]
  } {
    const changes: { version: string; changes: readonly string[] }[] = []

    for (const entry of VERSION_HISTORY) {
      if (compareVersions(entry.version, oldVersion) > 0 &&
          compareVersions(entry.version, newVersion) <= 0) {
        changes.push({
          version: entry.version,
          changes: entry.changes,
        })
      }
    }

    return {
      fromVersion: oldVersion,
      toVersion: newVersion,
      changes,
    }
  }

  /**
   * Export schema with version metadata stripped (for external use)
   */
  exportSchema(schema: VersionedSchema): UnifiedAppSchema {
    const { $schemaVersion, $createdAt, $updatedAt, $history, ...clean } = schema
    return clean as UnifiedAppSchema
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let versionManagerInstance: SchemaVersionManager | null = null

export function getSchemaVersionManager(): SchemaVersionManager {
  if (!versionManagerInstance) {
    versionManagerInstance = new SchemaVersionManager()
  }
  return versionManagerInstance
}
