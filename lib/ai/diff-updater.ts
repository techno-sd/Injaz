// Diff-based File Updater
// Only updates changed files, preserving unchanged content

import type { UnifiedAppSchema } from '@/types/app-schema'

// =============================================================================
// TYPES
// =============================================================================

export interface FileInfo {
  path: string
  content: string
  language: string
}

export interface FileDiff {
  path: string
  type: 'added' | 'modified' | 'deleted' | 'unchanged'
  oldContent?: string
  newContent?: string
  language: string
  changes?: LineChange[]
}

export interface LineChange {
  type: 'add' | 'remove' | 'context'
  line: number
  content: string
}

export interface DiffResult {
  totalFiles: number
  added: number
  modified: number
  deleted: number
  unchanged: number
  diffs: FileDiff[]
}

export interface IncrementalUpdate {
  filesToUpdate: FileInfo[]
  filesToDelete: string[]
  unchangedFiles: string[]
  stats: {
    total: number
    updated: number
    deleted: number
    unchanged: number
  }
}

// =============================================================================
// DIFF UTILITIES
// =============================================================================

/**
 * Calculate content hash for quick comparison
 */
function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Normalize content for comparison (remove trailing whitespace, normalize line endings)
 */
function normalizeContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

/**
 * Check if two files have meaningful differences
 */
function hasSignificantChanges(oldContent: string, newContent: string): boolean {
  const normalizedOld = normalizeContent(oldContent)
  const normalizedNew = normalizeContent(newContent)
  return hashContent(normalizedOld) !== hashContent(normalizedNew)
}

/**
 * Simple line-based diff
 */
function computeLineDiff(oldContent: string, newContent: string): LineChange[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const changes: LineChange[] = []

  // Simple LCS-based diff
  const lcs = computeLCS(oldLines, newLines)
  let oldIdx = 0
  let newIdx = 0
  let lcsIdx = 0

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx]) {
      // Line is in LCS (unchanged)
      if (newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        changes.push({ type: 'context', line: newIdx + 1, content: newLines[newIdx] })
        newIdx++
      }
      oldIdx++
      lcsIdx++
    } else if (newIdx < newLines.length && (lcsIdx >= lcs.length || newLines[newIdx] !== lcs[lcsIdx])) {
      // Line added in new
      changes.push({ type: 'add', line: newIdx + 1, content: newLines[newIdx] })
      newIdx++
    } else if (oldIdx < oldLines.length) {
      // Line removed from old
      changes.push({ type: 'remove', line: oldIdx + 1, content: oldLines[oldIdx] })
      oldIdx++
    }
  }

  return changes
}

/**
 * Compute Longest Common Subsequence
 */
function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length
  const n = arr2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}

// =============================================================================
// DIFF UPDATER CLASS
// =============================================================================

export class DiffUpdater {
  /**
   * Compare old and new file sets and compute diff
   */
  computeDiff(oldFiles: FileInfo[], newFiles: FileInfo[]): DiffResult {
    const oldMap = new Map(oldFiles.map(f => [f.path, f]))
    const newMap = new Map(newFiles.map(f => [f.path, f]))
    const diffs: FileDiff[] = []

    let added = 0
    let modified = 0
    let deleted = 0
    let unchanged = 0

    // Check for added and modified files
    for (const [path, newFile] of newMap) {
      const oldFile = oldMap.get(path)

      if (!oldFile) {
        // File added
        diffs.push({
          path,
          type: 'added',
          newContent: newFile.content,
          language: newFile.language,
        })
        added++
      } else if (hasSignificantChanges(oldFile.content, newFile.content)) {
        // File modified
        diffs.push({
          path,
          type: 'modified',
          oldContent: oldFile.content,
          newContent: newFile.content,
          language: newFile.language,
          changes: computeLineDiff(oldFile.content, newFile.content),
        })
        modified++
      } else {
        // File unchanged
        diffs.push({
          path,
          type: 'unchanged',
          language: newFile.language,
        })
        unchanged++
      }
    }

    // Check for deleted files
    for (const [path, oldFile] of oldMap) {
      if (!newMap.has(path)) {
        diffs.push({
          path,
          type: 'deleted',
          oldContent: oldFile.content,
          language: oldFile.language,
        })
        deleted++
      }
    }

    return {
      totalFiles: diffs.length,
      added,
      modified,
      deleted,
      unchanged,
      diffs,
    }
  }

  /**
   * Get only the files that need to be updated
   */
  getIncrementalUpdate(oldFiles: FileInfo[], newFiles: FileInfo[]): IncrementalUpdate {
    const diff = this.computeDiff(oldFiles, newFiles)

    const filesToUpdate: FileInfo[] = []
    const filesToDelete: string[] = []
    const unchangedFiles: string[] = []

    for (const fileDiff of diff.diffs) {
      switch (fileDiff.type) {
        case 'added':
        case 'modified':
          filesToUpdate.push({
            path: fileDiff.path,
            content: fileDiff.newContent!,
            language: fileDiff.language,
          })
          break
        case 'deleted':
          filesToDelete.push(fileDiff.path)
          break
        case 'unchanged':
          unchangedFiles.push(fileDiff.path)
          break
      }
    }

    return {
      filesToUpdate,
      filesToDelete,
      unchangedFiles,
      stats: {
        total: diff.totalFiles,
        updated: diff.added + diff.modified,
        deleted: diff.deleted,
        unchanged: diff.unchanged,
      },
    }
  }

  /**
   * Merge incremental changes with existing files
   */
  mergeFiles(existingFiles: FileInfo[], update: IncrementalUpdate): FileInfo[] {
    const result = new Map<string, FileInfo>()

    // Add existing files (except deleted ones)
    for (const file of existingFiles) {
      if (!update.filesToDelete.includes(file.path)) {
        result.set(file.path, file)
      }
    }

    // Add/update changed files
    for (const file of update.filesToUpdate) {
      result.set(file.path, file)
    }

    return Array.from(result.values())
  }

  /**
   * Detect which parts of the schema changed
   */
  detectSchemaChanges(
    oldSchema: Partial<UnifiedAppSchema>,
    newSchema: Partial<UnifiedAppSchema>
  ): string[] {
    const changes: string[] = []

    // Compare meta
    if (JSON.stringify(oldSchema.meta) !== JSON.stringify(newSchema.meta)) {
      changes.push('meta')
    }

    // Compare design
    if (JSON.stringify(oldSchema.design) !== JSON.stringify(newSchema.design)) {
      changes.push('design')
      if (JSON.stringify(oldSchema.design?.colors) !== JSON.stringify(newSchema.design?.colors)) {
        changes.push('design.colors')
      }
      if (JSON.stringify(oldSchema.design?.typography) !== JSON.stringify(newSchema.design?.typography)) {
        changes.push('design.typography')
      }
    }

    // Compare structure
    if (JSON.stringify(oldSchema.structure) !== JSON.stringify(newSchema.structure)) {
      changes.push('structure')
      if (JSON.stringify(oldSchema.structure?.pages) !== JSON.stringify(newSchema.structure?.pages)) {
        changes.push('structure.pages')
      }
      if (JSON.stringify(oldSchema.structure?.navigation) !== JSON.stringify(newSchema.structure?.navigation)) {
        changes.push('structure.navigation')
      }
    }

    // Compare features
    if (JSON.stringify(oldSchema.features) !== JSON.stringify(newSchema.features)) {
      changes.push('features')
      if (JSON.stringify(oldSchema.features?.auth) !== JSON.stringify(newSchema.features?.auth)) {
        changes.push('features.auth')
      }
      if (JSON.stringify(oldSchema.features?.database) !== JSON.stringify(newSchema.features?.database)) {
        changes.push('features.database')
      }
    }

    // Compare components
    if (JSON.stringify(oldSchema.components) !== JSON.stringify(newSchema.components)) {
      changes.push('components')
    }

    // Compare integrations
    if (JSON.stringify(oldSchema.integrations) !== JSON.stringify(newSchema.integrations)) {
      changes.push('integrations')
    }

    return changes
  }

  /**
   * Determine which files need regeneration based on schema changes
   */
  getAffectedFiles(schemaChanges: string[]): string[] {
    const affectedPatterns: Record<string, string[]> = {
      'meta': ['package.json', 'app.json', 'index.html'],
      'design': ['globals.css', 'tailwind.config.ts', 'styles.css', 'constants/Colors.ts'],
      'design.colors': ['globals.css', 'tailwind.config.ts', 'styles.css'],
      'design.typography': ['globals.css', 'styles.css'],
      'structure': ['app/**/*', 'pages/**/*'],
      'structure.pages': ['app/**/*', 'pages/**/*'],
      'structure.navigation': ['components/nav/**/*', 'app/(tabs)/**/*'],
      'features': ['lib/**/*'],
      'features.auth': ['app/(auth)/**/*', 'lib/supabase.ts', 'middleware.ts'],
      'features.database': ['lib/supabase.ts', 'types/database.ts'],
      'components': ['components/**/*'],
      'integrations': ['lib/**/*', 'components/**/*'],
    }

    const affected = new Set<string>()

    for (const change of schemaChanges) {
      const patterns = affectedPatterns[change] || []
      for (const pattern of patterns) {
        affected.add(pattern)
      }
    }

    return Array.from(affected)
  }

  /**
   * Format diff for display
   */
  formatDiffSummary(diff: DiffResult): string {
    const lines: string[] = []

    lines.push(`📊 File Changes Summary`)
    lines.push(`─────────────────────────`)
    lines.push(`  Added:     ${diff.added}`)
    lines.push(`  Modified:  ${diff.modified}`)
    lines.push(`  Deleted:   ${diff.deleted}`)
    lines.push(`  Unchanged: ${diff.unchanged}`)
    lines.push(`  Total:     ${diff.totalFiles}`)

    if (diff.added > 0) {
      lines.push(`\n✅ Added Files:`)
      for (const d of diff.diffs.filter(d => d.type === 'added')) {
        lines.push(`  + ${d.path}`)
      }
    }

    if (diff.modified > 0) {
      lines.push(`\n📝 Modified Files:`)
      for (const d of diff.diffs.filter(d => d.type === 'modified')) {
        const changeCount = d.changes?.filter(c => c.type !== 'context').length || 0
        lines.push(`  ~ ${d.path} (${changeCount} changes)`)
      }
    }

    if (diff.deleted > 0) {
      lines.push(`\n🗑️ Deleted Files:`)
      for (const d of diff.diffs.filter(d => d.type === 'deleted')) {
        lines.push(`  - ${d.path}`)
      }
    }

    return lines.join('\n')
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let diffUpdaterInstance: DiffUpdater | null = null

export function getDiffUpdater(): DiffUpdater {
  if (!diffUpdaterInstance) {
    diffUpdaterInstance = new DiffUpdater()
  }
  return diffUpdaterInstance
}
