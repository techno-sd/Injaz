// Incremental Code Generation
// Only regenerate changed parts of the schema for faster updates

import type {
  UnifiedAppSchema,
  PlatformType,
  PageSchema,
  ComponentSchema,
} from '@/types/app-schema'

// ============================================================================
// DIFF DETECTION
// ============================================================================

export interface SchemaDiff {
  type: 'added' | 'modified' | 'removed'
  section: 'meta' | 'design' | 'pages' | 'components' | 'features' | 'navigation'
  path: string
  oldValue?: any
  newValue?: any
}

export interface DiffResult {
  hasChanges: boolean
  diffs: SchemaDiff[]
  affectedFiles: string[]
  canIncremental: boolean // true if we can do incremental update
}

// Deep compare two objects
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object' || a === null || b === null) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}

// Compare two schemas and find differences
export function diffSchemas(
  oldSchema: Partial<UnifiedAppSchema>,
  newSchema: Partial<UnifiedAppSchema>
): DiffResult {
  const diffs: SchemaDiff[] = []
  const affectedFiles: string[] = []

  // Compare meta
  if (!deepEqual(oldSchema.meta, newSchema.meta)) {
    diffs.push({
      type: 'modified',
      section: 'meta',
      path: 'meta',
      oldValue: oldSchema.meta,
      newValue: newSchema.meta,
    })
    // Meta changes affect package.json, manifest, etc.
    affectedFiles.push('package.json', 'app/layout.tsx', 'public/manifest.json')
  }

  // Compare design
  if (!deepEqual(oldSchema.design, newSchema.design)) {
    diffs.push({
      type: 'modified',
      section: 'design',
      path: 'design',
      oldValue: oldSchema.design,
      newValue: newSchema.design,
    })
    // Design changes affect CSS/theme files
    affectedFiles.push('app/globals.css', 'tailwind.config.ts', 'lib/utils.ts')
  }

  // Compare pages
  const oldPages = new Map((oldSchema.structure?.pages || []).map(p => [p.id, p]))
  const newPages = new Map((newSchema.structure?.pages || []).map(p => [p.id, p]))

  // Find added/modified pages
  for (const [id, newPage] of newPages) {
    const oldPage = oldPages.get(id)
    if (!oldPage) {
      diffs.push({
        type: 'added',
        section: 'pages',
        path: `structure.pages.${id}`,
        newValue: newPage,
      })
      affectedFiles.push(`app${newPage.path}/page.tsx`)
    } else if (!deepEqual(oldPage, newPage)) {
      diffs.push({
        type: 'modified',
        section: 'pages',
        path: `structure.pages.${id}`,
        oldValue: oldPage,
        newValue: newPage,
      })
      affectedFiles.push(`app${newPage.path}/page.tsx`)
    }
  }

  // Find removed pages
  for (const [id, oldPage] of oldPages) {
    if (!newPages.has(id)) {
      diffs.push({
        type: 'removed',
        section: 'pages',
        path: `structure.pages.${id}`,
        oldValue: oldPage,
      })
      affectedFiles.push(`app${oldPage.path}/page.tsx`)
    }
  }

  // Compare components
  const oldComponents = new Map((oldSchema.components || []).map(c => [c.id, c]))
  const newComponents = new Map((newSchema.components || []).map(c => [c.id, c]))

  for (const [id, newComp] of newComponents) {
    const oldComp = oldComponents.get(id)
    if (!oldComp) {
      diffs.push({
        type: 'added',
        section: 'components',
        path: `components.${id}`,
        newValue: newComp,
      })
      affectedFiles.push(`components/${newComp.name}.tsx`)
    } else if (!deepEqual(oldComp, newComp)) {
      diffs.push({
        type: 'modified',
        section: 'components',
        path: `components.${id}`,
        oldValue: oldComp,
        newValue: newComp,
      })
      affectedFiles.push(`components/${newComp.name}.tsx`)
    }
  }

  for (const [id, oldComp] of oldComponents) {
    if (!newComponents.has(id)) {
      diffs.push({
        type: 'removed',
        section: 'components',
        path: `components.${id}`,
        oldValue: oldComp,
      })
    }
  }

  // Compare navigation
  if (!deepEqual(oldSchema.structure?.navigation, newSchema.structure?.navigation)) {
    diffs.push({
      type: 'modified',
      section: 'navigation',
      path: 'structure.navigation',
      oldValue: oldSchema.structure?.navigation,
      newValue: newSchema.structure?.navigation,
    })
    affectedFiles.push('components/navigation.tsx', 'app/layout.tsx')
  }

  // Compare features
  if (!deepEqual(oldSchema.features, newSchema.features)) {
    diffs.push({
      type: 'modified',
      section: 'features',
      path: 'features',
      oldValue: oldSchema.features,
      newValue: newSchema.features,
    })
    // Features can affect many files
    if (newSchema.features?.auth) {
      affectedFiles.push('lib/auth.ts', 'app/login/page.tsx', 'middleware.ts')
    }
    if (newSchema.features?.database) {
      affectedFiles.push('lib/db.ts', 'lib/supabase.ts')
    }
  }

  // Determine if incremental is possible
  // Can't do incremental if meta/design/features changed (affects too many files)
  const canIncremental = !diffs.some(d =>
    d.section === 'meta' ||
    d.section === 'design' ||
    d.section === 'features'
  )

  return {
    hasChanges: diffs.length > 0,
    diffs,
    affectedFiles: [...new Set(affectedFiles)],
    canIncremental,
  }
}

// ============================================================================
// INCREMENTAL GENERATOR
// ============================================================================

export interface IncrementalOptions {
  oldSchema: Partial<UnifiedAppSchema>
  newSchema: UnifiedAppSchema
  platform: PlatformType
  existingFiles?: Map<string, string>
}

export interface IncrementalResult {
  updatedFiles: { path: string; content: string; action: 'create' | 'update' | 'delete' }[]
  unchangedFiles: string[]
  timeSaved: number // estimated ms saved
}

export async function generateIncremental(options: IncrementalOptions): Promise<IncrementalResult> {
  const { oldSchema, newSchema, platform } = options
  const startTime = Date.now()

  // Get diff
  const diff = diffSchemas(oldSchema, newSchema)

  if (!diff.hasChanges) {
    return {
      updatedFiles: [],
      unchangedFiles: [],
      timeSaved: 5000, // Estimated full build time
    }
  }

  if (!diff.canIncremental) {
    // Fall back to full generation
    return {
      updatedFiles: [],
      unchangedFiles: [],
      timeSaved: 0,
    }
  }

  // Import codegen
  const { getCodeGen } = await import('./codegen')
  const codegen = getCodeGen()

  const updatedFiles: IncrementalResult['updatedFiles'] = []

  // Generate only changed pages
  const pageChanges = diff.diffs.filter(d => d.section === 'pages')
  for (const change of pageChanges) {
    if (change.type === 'removed') {
      updatedFiles.push({
        path: diff.affectedFiles.find(f => f.includes(change.oldValue?.path)) || '',
        content: '',
        action: 'delete',
      })
    } else {
      // Generate single page
      const pageSchema = change.newValue as PageSchema
      const partialSchema: UnifiedAppSchema = {
        ...newSchema,
        structure: {
          ...newSchema.structure,
          pages: [pageSchema],
        },
      }

      const result = await codegen.generate({
        schema: partialSchema,
        platform,
        targetFiles: [pageSchema.path],
      })

      for (const file of result.files) {
        updatedFiles.push({
          path: file.path,
          content: file.content,
          action: change.type === 'added' ? 'create' : 'update',
        })
      }
    }
  }

  // Generate only changed components
  const componentChanges = diff.diffs.filter(d => d.section === 'components')
  for (const change of componentChanges) {
    if (change.type === 'removed') {
      const comp = change.oldValue as ComponentSchema
      updatedFiles.push({
        path: `components/${comp.name}.tsx`,
        content: '',
        action: 'delete',
      })
    } else {
      const comp = change.newValue as ComponentSchema
      // Generate single component (simplified)
      const componentCode = generateComponentStub(comp, platform)
      updatedFiles.push({
        path: `components/${comp.name}.tsx`,
        content: componentCode,
        action: change.type === 'added' ? 'create' : 'update',
      })
    }
  }

  const timeTaken = Date.now() - startTime
  const estimatedFullBuild = 5000 // 5 seconds average

  return {
    updatedFiles,
    unchangedFiles: diff.affectedFiles.filter(
      f => !updatedFiles.some(u => u.path === f)
    ),
    timeSaved: Math.max(0, estimatedFullBuild - timeTaken),
  }
}

// Simple component stub generator for incremental updates
function generateComponentStub(comp: ComponentSchema, platform: PlatformType): string {
  const isWeb = platform !== 'mobile'

  if (isWeb) {
    return `'use client'

import React from 'react'

interface ${comp.name}Props {
${comp.props.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type}`).join('\n')}
}

export function ${comp.name}({ ${comp.props.map(p => p.name).join(', ')} }: ${comp.name}Props) {
  return (
    <div className="${comp.type}-component">
      {/* ${comp.description || comp.name} */}
      <p>${comp.name} Component</p>
    </div>
  )
}
`
  } else {
    return `import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface ${comp.name}Props {
${comp.props.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type}`).join('\n')}
}

export function ${comp.name}({ ${comp.props.map(p => p.name).join(', ')} }: ${comp.name}Props) {
  return (
    <View style={styles.container}>
      <Text>${comp.name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
})
`
  }
}

// ============================================================================
// SMART UPDATE DETECTION
// ============================================================================

export interface UpdateSuggestion {
  type: 'full' | 'incremental' | 'none'
  reason: string
  affectedFiles: string[]
  estimatedTime: number // ms
}

export function suggestUpdateStrategy(
  oldSchema: Partial<UnifiedAppSchema>,
  newSchema: UnifiedAppSchema
): UpdateSuggestion {
  const diff = diffSchemas(oldSchema, newSchema)

  if (!diff.hasChanges) {
    return {
      type: 'none',
      reason: 'No changes detected',
      affectedFiles: [],
      estimatedTime: 0,
    }
  }

  if (!diff.canIncremental) {
    return {
      type: 'full',
      reason: 'Core changes (meta/design/features) require full rebuild',
      affectedFiles: diff.affectedFiles,
      estimatedTime: 5000,
    }
  }

  // Calculate if incremental is worth it
  const changedFileCount = diff.affectedFiles.length
  const totalFiles = 20 // Estimated average project file count

  if (changedFileCount > totalFiles * 0.5) {
    return {
      type: 'full',
      reason: 'Too many changes for incremental update',
      affectedFiles: diff.affectedFiles,
      estimatedTime: 5000,
    }
  }

  return {
    type: 'incremental',
    reason: `Only ${changedFileCount} files changed`,
    affectedFiles: diff.affectedFiles,
    estimatedTime: changedFileCount * 200, // ~200ms per file
  }
}
