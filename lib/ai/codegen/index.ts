// Code Generation Templates Index
// Exports all platform-specific template generators

export { generateStaticTemplate, type StaticFile } from './static-template'
export { generateWebAppTemplate, type WebAppFile } from './web-template'

import type { UnifiedAppSchema, PlatformType } from '@/types/app-schema'
import { generateStaticTemplate } from './static-template'
import { generateWebAppTemplate } from './web-template'

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

/**
 * Generate files for a given platform from a Unified App Schema
 * Note: Both website and webapp use Vite + React + React Router (same stack as Lovable)
 */
export function generateFilesFromSchema(
  schema: UnifiedAppSchema,
  platform?: PlatformType
): GeneratedFile[] {
  const targetPlatform = platform || schema.meta.platform

  switch (targetPlatform) {
    case 'website':
      // Websites use Vite + React (same stack as Lovable)
      return generateWebAppTemplate(schema)
    case 'webapp':
      return generateWebAppTemplate(schema)
    default:
      throw new Error(`Unknown platform: ${targetPlatform}`)
  }
}

/**
 * Get file extension mapping for syntax highlighting
 */
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    html: 'html',
    md: 'markdown',
  }

  return languageMap[ext || ''] || 'plaintext'
}
