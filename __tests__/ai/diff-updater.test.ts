// Tests for Diff Updater
import { getDiffUpdater, type FileInfo } from '@/lib/ai/diff-updater'

describe('Diff Updater', () => {
  const oldFiles: FileInfo[] = [
    { path: 'app/page.tsx', content: 'export default function Home() {\n  return <div>Hello</div>\n}', language: 'typescript' },
    { path: 'app/about/page.tsx', content: 'export default function About() {\n  return <div>About</div>\n}', language: 'typescript' },
    { path: 'styles.css', content: '.container { padding: 1rem; }', language: 'css' },
  ]

  const newFiles: FileInfo[] = [
    { path: 'app/page.tsx', content: 'export default function Home() {\n  return <div>Hello World</div>\n}', language: 'typescript' },
    { path: 'app/about/page.tsx', content: 'export default function About() {\n  return <div>About</div>\n}', language: 'typescript' },
    { path: 'app/contact/page.tsx', content: 'export default function Contact() {\n  return <div>Contact</div>\n}', language: 'typescript' },
  ]

  describe('computeDiff', () => {
    it('should detect added files', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      expect(diff.added).toBe(1)
      const addedFile = diff.diffs.find(d => d.type === 'added')
      expect(addedFile?.path).toBe('app/contact/page.tsx')
    })

    it('should detect modified files', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      expect(diff.modified).toBe(1)
      const modifiedFile = diff.diffs.find(d => d.type === 'modified')
      expect(modifiedFile?.path).toBe('app/page.tsx')
    })

    it('should detect deleted files', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      expect(diff.deleted).toBe(1)
      const deletedFile = diff.diffs.find(d => d.type === 'deleted')
      expect(deletedFile?.path).toBe('styles.css')
    })

    it('should detect unchanged files', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      expect(diff.unchanged).toBe(1)
      const unchangedFile = diff.diffs.find(d => d.type === 'unchanged')
      expect(unchangedFile?.path).toBe('app/about/page.tsx')
    })

    it('should calculate correct totals', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      expect(diff.totalFiles).toBe(diff.added + diff.modified + diff.deleted + diff.unchanged)
    })

    it('should include line changes for modified files', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      const modifiedFile = diff.diffs.find(d => d.type === 'modified')
      expect(modifiedFile?.changes).toBeDefined()
      expect(modifiedFile?.changes?.length).toBeGreaterThan(0)
    })
  })

  describe('getIncrementalUpdate', () => {
    it('should return only files that need updating', () => {
      const differ = getDiffUpdater()
      const update = differ.getIncrementalUpdate(oldFiles, newFiles)

      expect(update.filesToUpdate.length).toBe(2) // 1 added + 1 modified
      expect(update.filesToDelete.length).toBe(1)
      expect(update.unchangedFiles.length).toBe(1)
    })

    it('should include correct stats', () => {
      const differ = getDiffUpdater()
      const update = differ.getIncrementalUpdate(oldFiles, newFiles)

      expect(update.stats.updated).toBe(2)
      expect(update.stats.deleted).toBe(1)
      expect(update.stats.unchanged).toBe(1)
      expect(update.stats.total).toBe(4)
    })
  })

  describe('mergeFiles', () => {
    it('should merge updates with existing files', () => {
      const differ = getDiffUpdater()
      const update = differ.getIncrementalUpdate(oldFiles, newFiles)
      const merged = differ.mergeFiles(oldFiles, update)

      expect(merged.length).toBe(3) // About (unchanged) + Home (updated) + Contact (new)

      const paths = merged.map(f => f.path)
      expect(paths).toContain('app/page.tsx')
      expect(paths).toContain('app/about/page.tsx')
      expect(paths).toContain('app/contact/page.tsx')
      expect(paths).not.toContain('styles.css') // Deleted
    })

    it('should use new content for updated files', () => {
      const differ = getDiffUpdater()
      const update = differ.getIncrementalUpdate(oldFiles, newFiles)
      const merged = differ.mergeFiles(oldFiles, update)

      const homePage = merged.find(f => f.path === 'app/page.tsx')
      expect(homePage?.content).toContain('Hello World')
    })
  })

  describe('detectSchemaChanges', () => {
    it('should detect meta changes', () => {
      const differ = getDiffUpdater()
      const oldSchema = { meta: { name: 'Old Name', description: '', platform: 'webapp' as const, version: '1.0.0' } }
      const newSchema = { meta: { name: 'New Name', description: '', platform: 'webapp' as const, version: '1.0.0' } }

      const changes = differ.detectSchemaChanges(oldSchema, newSchema)

      expect(changes).toContain('meta')
    })

    it('should detect design.colors changes', () => {
      const differ = getDiffUpdater()
      const oldSchema = { design: { colors: { primary: '#000000' } } }
      const newSchema = { design: { colors: { primary: '#ffffff' } } }

      const changes = differ.detectSchemaChanges(oldSchema, newSchema)

      expect(changes).toContain('design')
      expect(changes).toContain('design.colors')
    })

    it('should return empty array for identical schemas', () => {
      const differ = getDiffUpdater()
      const schema = { meta: { name: 'Same', description: '', platform: 'webapp' as const, version: '1.0.0' } }

      const changes = differ.detectSchemaChanges(schema, schema)

      expect(changes.length).toBe(0)
    })
  })

  describe('getAffectedFiles', () => {
    it('should return affected file patterns for schema changes', () => {
      const differ = getDiffUpdater()

      const affected = differ.getAffectedFiles(['design.colors'])

      expect(affected).toContain('globals.css')
      expect(affected).toContain('tailwind.config.ts')
    })

    it('should return multiple patterns for multiple changes', () => {
      const differ = getDiffUpdater()

      const affected = differ.getAffectedFiles(['meta', 'structure.pages'])

      expect(affected.length).toBeGreaterThan(1)
      expect(affected).toContain('package.json')
    })
  })

  describe('formatDiffSummary', () => {
    it('should format diff summary with counts', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      const summary = differ.formatDiffSummary(diff)

      expect(summary).toContain('Added:')
      expect(summary).toContain('Modified:')
      expect(summary).toContain('Deleted:')
      expect(summary).toContain('Unchanged:')
    })

    it('should list file paths in summary', () => {
      const differ = getDiffUpdater()
      const diff = differ.computeDiff(oldFiles, newFiles)

      const summary = differ.formatDiffSummary(diff)

      expect(summary).toContain('app/contact/page.tsx')
      expect(summary).toContain('app/page.tsx')
    })
  })
})
