// Simple AI Generator - Clean, Fast, Reliable
// AI ONLY generates src/ files - base files are fixed templates

import { BASE_FILES, isBaseFile, type TemplateFile } from './base-template'
import { AI_MODELS, OPENROUTER_CONFIG, DEFAULT_SETTINGS, getFallbackModel } from './config'

const OPENROUTER_API_URL = OPENROUTER_CONFIG.baseUrl

// Helper to make API call with timeout
async function callAI(
  prompt: string,
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  timeoutMs: number = 60000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log('[Generator] API call timeout after', timeoutMs, 'ms - aborting')
    controller.abort()
  }, timeoutMs)

  console.log('[Generator] Calling AI with model:', modelId)

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_CONFIG.referer,
        'X-Title': OPENROUTER_CONFIG.title,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: DEFAULT_SETTINGS.temperature,
        max_tokens: 16000,
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Simple system prompt - AI only generates src/ files
const SYSTEM_PROMPT = `You are an expert React/TypeScript code generator.

## OUTPUT FORMAT
Return ONLY a valid JSON object with a "files" array. Each file has "path" and "content":
{
  "files": [
    { "path": "src/App.tsx", "content": "..." },
    { "path": "src/pages/Home.tsx", "content": "..." }
  ]
}

## IMPORTANT: ONLY GENERATE src/ FILES
- The base files (package.json, vite.config.ts, etc.) are already provided
- You ONLY need to generate files in the src/ directory
- ALWAYS generate src/App.tsx as the main component

## AVAILABLE PACKAGES (already in package.json)
- react, react-dom (React 18)
- react-router-dom (routing)
- lucide-react (icons)
- framer-motion (animations)
- tailwindcss (styling via classes)
- react-hot-toast OR sonner (toast notifications)
- zustand (state management)
- @radix-ui/react-dialog (modals)
- @radix-ui/react-dropdown-menu (dropdowns)
- @radix-ui/react-tabs (tab panels)
- @radix-ui/react-toast (toasts)
- @radix-ui/react-tooltip (tooltips)
- @radix-ui/react-slot (composable components)
- clsx, tailwind-merge, class-variance-authority (className utilities)

⚠️ ONLY USE PACKAGES FROM THIS LIST. Do not import any other npm packages.

## PRE-BUILT UTILITIES (already provided)
- src/lib/utils.ts exports: cn(...classes) - use this for merging Tailwind classes
  Example: import { cn } from "@/lib/utils" or import { cn } from "../lib/utils"

DO NOT import packages that are not listed above. If you need other packages, stick to these.

## CODE REQUIREMENTS
1. Use TypeScript with proper types
2. Use functional components with hooks
3. Use Tailwind CSS for ALL styling
4. Use lucide-react for icons: import { Icon } from 'lucide-react'
5. Use framer-motion for animations: import { motion } from 'framer-motion'
6. Use react-router-dom for routing if needed

## DESIGN GUIDELINES
1. Modern, clean aesthetic with good spacing
2. Dark mode by default (gray-900/950 backgrounds)
3. Gradient accents (purple-500 to pink-500)
4. Smooth transitions and hover effects
5. Mobile responsive design

## FILE STRUCTURE
src/
  App.tsx         # Main app (REQUIRED - always generate this)
  pages/          # Page components
  components/     # Reusable components

## CRITICAL RULES
- Start response with { and end with }
- No markdown code blocks, no explanations
- Every import must reference a file you generate
- If you import "./pages/Home", generate "src/pages/Home.tsx"
- No placeholder comments like "// TODO"`

export interface GeneratorFile {
  path: string
  content: string
}

export type EventType = 'start' | 'file' | 'progress' | 'complete' | 'error' | 'chat'

export interface GeneratorEvent {
  type: EventType
  data?: {
    message?: string
    file?: GeneratorFile
    files?: GeneratorFile[]
    content?: string
  }
  timestamp: number
}

// Parse AI response - handles various formats
function parseResponse(response: string): GeneratorFile[] | null {
  // Remove thinking tags
  let cleaned = response
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim()

  // Try direct parse
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.files && Array.isArray(parsed.files)) {
      return parsed.files
    }
  } catch {}

  // Try extracting from markdown
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      if (parsed.files) return parsed.files
    } catch {}
  }

  // Try finding JSON object
  const objectMatch = cleaned.match(/\{\s*"files"\s*:\s*\[[\s\S]*?\]\s*\}/)
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0])
      if (parsed.files) return parsed.files
    } catch {}
  }

  return null
}

// Extract files from streaming response
class StreamExtractor {
  private buffer = ''
  private extracted = new Set<string>()

  addChunk(chunk: string): GeneratorFile[] {
    this.buffer += chunk
    const files: GeneratorFile[] = []

    // Match file objects
    const pattern = /\{\s*"path"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"/g
    let match

    while ((match = pattern.exec(this.buffer)) !== null) {
      const path = match[1]
      if (this.extracted.has(path)) continue

      // Find content end
      const start = match.index + match[0].length
      let i = start
      let escaped = false
      let end = -1

      while (i < this.buffer.length) {
        if (escaped) { escaped = false; i++; continue }
        if (this.buffer[i] === '\\') { escaped = true; i++; continue }
        if (this.buffer[i] === '"') { end = i; break }
        i++
      }

      if (end === -1) continue

      // Check for closing brace
      const after = this.buffer.slice(end + 1).match(/^\s*\}/)
      if (!after) continue

      // Extract and unescape content
      const content = this.buffer.slice(start, end)
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')

      files.push({ path, content })
      this.extracted.add(path)
    }

    return files
  }

  getExtractedCount(): number {
    return this.extracted.size
  }
}

// Check if prompt is a generation request
export function isGenerationRequest(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  const genWords = ['create', 'build', 'make', 'generate', 'design', 'develop', 'implement', 'new app', 'landing', 'dashboard', 'todo', 'portfolio', 'blog']
  const chatWords = ['how', 'what', 'why', 'explain', 'help', 'debug', 'fix', 'error', 'problem']

  const hasGen = genWords.some(w => lower.includes(w))
  const hasChat = chatWords.some(w => lower.includes(w))

  return hasGen && !hasChat
}

// ============================================
// AUTO-FIX: Validate and fix missing imports
// ============================================

// Allowed npm packages (must match base-template.ts package.json)
const ALLOWED_NPM_PACKAGES = new Set([
  'react', 'react-dom', 'react-router-dom',
  'lucide-react', 'framer-motion',
  'react-hot-toast', 'sonner', 'zustand',
  '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-slot', '@radix-ui/react-tabs',
  '@radix-ui/react-toast', '@radix-ui/react-tooltip',
  'class-variance-authority', 'clsx', 'tailwind-merge',
])

// ============================================
// CDN URL MAPPING - Direct esm.sh URLs
// This is the REAL fix for "Failed to resolve import" errors
// We rewrite imports directly to CDN URLs in the generated code
// This bypasses Vite's resolution entirely
// ============================================
const NPM_TO_CDN_URL: Record<string, string> = {
  'react': 'https://esm.sh/react@18.2.0',
  'react-dom': 'https://esm.sh/react-dom@18.2.0',
  'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
  'react/jsx-runtime': 'https://esm.sh/react@18.2.0/jsx-runtime',
  'react/jsx-dev-runtime': 'https://esm.sh/react@18.2.0/jsx-dev-runtime',
  'react-router-dom': 'https://esm.sh/react-router-dom@6.20.0?external=react',
  'framer-motion': 'https://esm.sh/framer-motion@10.16.0?external=react',
  'lucide-react': 'https://esm.sh/lucide-react@0.294.0?external=react',
  'react-hot-toast': 'https://esm.sh/react-hot-toast@2.4.1?external=react,react-dom',
  'sonner': 'https://esm.sh/sonner@1.3.1?external=react,react-dom',
  'zustand': 'https://esm.sh/zustand@4.4.7?external=react',
  'clsx': 'https://esm.sh/clsx@2.0.0',
  'tailwind-merge': 'https://esm.sh/tailwind-merge@2.0.0',
  'class-variance-authority': 'https://esm.sh/class-variance-authority@0.7.0',
  '@radix-ui/react-slot': 'https://esm.sh/@radix-ui/react-slot@1.0.2?external=react,react-dom',
  '@radix-ui/react-dialog': 'https://esm.sh/@radix-ui/react-dialog@1.0.5?external=react,react-dom',
  '@radix-ui/react-dropdown-menu': 'https://esm.sh/@radix-ui/react-dropdown-menu@2.0.6?external=react,react-dom',
  '@radix-ui/react-tabs': 'https://esm.sh/@radix-ui/react-tabs@1.0.4?external=react,react-dom',
  '@radix-ui/react-toast': 'https://esm.sh/@radix-ui/react-toast@1.1.5?external=react,react-dom',
  '@radix-ui/react-tooltip': 'https://esm.sh/@radix-ui/react-tooltip@1.0.7?external=react,react-dom',
}

// Fix file extensions - ensure JSX files have .tsx extension
// AI sometimes generates 'src/App' instead of 'src/App.tsx'
function fixFileExtensions(files: GeneratorFile[]): GeneratorFile[] {
  return files.map(file => {
    // Skip files that already have extensions
    if (file.path.match(/\.(tsx?|jsx?|css|json|html|js|ts|md|svg)$/)) {
      return file
    }

    // Check if content looks like React/JSX
    const hasJSX = file.content.includes('</') ||
                   file.content.includes('/>') ||
                   file.content.includes('React') ||
                   file.content.includes('export default function') ||
                   file.content.includes('export function')

    // Check if it's in src/ directory
    if (file.path.startsWith('src/') && hasJSX) {
      // Add .tsx extension for React components
      const newPath = file.path + '.tsx'
      console.log(`[Generator] Fixed extension: ${file.path} → ${newPath}`)
      return { ...file, path: newPath }
    }

    // For non-src files that look like TypeScript/JavaScript
    if (file.content.includes('export ') || file.content.includes('import ')) {
      const newPath = file.path + '.ts'
      console.log(`[Generator] Fixed extension: ${file.path} → ${newPath}`)
      return { ...file, path: newPath }
    }

    return file
  })
}

// Rewrite npm package imports to direct CDN URLs
// This is the KEY fix - bypasses Vite resolution entirely
function rewriteNpmImportsToCDN(files: GeneratorFile[]): GeneratorFile[] {
  return files.map(file => {
    // Only process TypeScript/JavaScript files
    if (!file.path.match(/\.(tsx?|jsx?)$/)) return file

    let content = file.content

    // Find and replace all npm imports with CDN URLs
    for (const [pkg, cdnUrl] of Object.entries(NPM_TO_CDN_URL)) {
      // Escape special characters for regex
      const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      // Match: from 'package' or from "package"
      const fromPattern = new RegExp(`(from\\s+)(['"])${escaped}\\2`, 'g')
      content = content.replace(fromPattern, `$1$2${cdnUrl}$2`)

      // Match: import 'package' or import "package" (side-effect imports)
      const importPattern = new RegExp(`(import\\s+)(['"])${escaped}\\2`, 'g')
      content = content.replace(importPattern, `$1$2${cdnUrl}$2`)
    }

    return { ...file, content }
  })
}

interface MissingImport {
  from: string
  importPath: string
  resolvedPath: string
}

interface UnknownNpmPackage {
  from: string
  packageName: string
  fullImport: string
}

// Find unknown npm packages that aren't in our allowed list
function findUnknownNpmPackages(files: GeneratorFile[]): UnknownNpmPackage[] {
  const unknown: UnknownNpmPackage[] = []
  const found = new Set<string>()

  for (const file of files) {
    if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

    // Match all imports - find quoted strings after 'from' or 'import'
    const importPattern = /(?:from|import)\s+['"]([^'"]+)['"]/g
    const matches = file.content.matchAll(importPattern)

    for (const match of matches) {
      const fullImport = match[1]

      // Skip local imports (relative paths and @/ alias)
      if (fullImport.startsWith('.') || fullImport.startsWith('/') || fullImport.startsWith('@/')) {
        continue
      }

      // Skip CDN URLs (already resolved to esm.sh or other CDNs)
      if (fullImport.startsWith('https://') || fullImport.startsWith('http://')) {
        continue
      }

      // Get package name (handle scoped packages like @radix-ui/react-dialog)
      const packageName = fullImport.startsWith('@')
        ? fullImport.split('/').slice(0, 2).join('/')
        : fullImport.split('/')[0]

      if (found.has(packageName)) continue
      if (ALLOWED_NPM_PACKAGES.has(packageName)) continue
      // Skip Node builtins
      if (['path', 'fs', 'crypto', 'util', 'stream', 'events', 'buffer'].includes(packageName)) continue

      found.add(packageName)
      unknown.push({ from: file.path, packageName, fullImport })
    }
  }

  return unknown
}

// Generate stub modules for unknown npm packages
function generateNpmStubs(unknownPackages: UnknownNpmPackage[]): GeneratorFile[] {
  const stubs: GeneratorFile[] = []
  const generated = new Set<string>()

  for (const { packageName, fullImport } of unknownPackages) {
    if (generated.has(packageName)) continue
    generated.add(packageName)

    // Create a stub in src/stubs/ that re-exports mock implementations
    const stubPath = `src/stubs/${packageName.replace('@', '').replace('/', '-')}.ts`

    // Common stub patterns based on package name
    let content: string
    if (packageName.includes('toast') || packageName.includes('notification')) {
      content = `// Stub for ${packageName}
export const toast = (msg: string) => console.log('Toast:', msg)
export const Toaster = () => null
export default { toast, Toaster }
`
    } else if (packageName.includes('icon')) {
      content = `// Stub for ${packageName}
export const Icon = () => null
export default Icon
`
    } else if (packageName.includes('chart') || packageName.includes('graph')) {
      content = `// Stub for ${packageName}
export const Chart = () => null
export const LineChart = () => null
export const BarChart = () => null
export default Chart
`
    } else if (packageName.includes('date') || packageName.includes('moment') || packageName.includes('dayjs')) {
      content = `// Stub for ${packageName}
export const format = (d: Date) => d.toLocaleDateString()
export const parse = (s: string) => new Date(s)
export default { format, parse }
`
    } else if (packageName.includes('form') || packageName.includes('hook-form')) {
      content = `// Stub for ${packageName}
export const useForm = () => ({ register: () => ({}), handleSubmit: (fn: any) => fn, watch: () => {}, formState: { errors: {} } })
export default useForm
`
    } else if (packageName.includes('query') || packageName.includes('swr')) {
      content = `// Stub for ${packageName}
export const useQuery = () => ({ data: null, isLoading: false, error: null })
export const useMutation = () => ({ mutate: () => {}, isLoading: false })
export default { useQuery, useMutation }
`
    } else if (packageName.includes('axios') || packageName.includes('fetch')) {
      content = `// Stub for ${packageName}
const axios = { get: async () => ({ data: {} }), post: async () => ({ data: {} }), put: async () => ({ data: {} }), delete: async () => ({ data: {} }) }
export default axios
`
    } else {
      // Generic stub - export common patterns
      content = `// Stub for ${packageName}
// This package is not available - using mock implementation
export const ${packageName.split('/').pop()?.replace(/-/g, '')} = () => null
export default () => null
`
    }

    stubs.push({ path: stubPath, content })
  }

  return stubs
}

// Rewrite imports to use stubs
function rewriteImportsToStubs(files: GeneratorFile[], unknownPackages: UnknownNpmPackage[]): GeneratorFile[] {
  if (unknownPackages.length === 0) return files

  const packageToStub = new Map<string, string>()
  for (const { packageName } of unknownPackages) {
    const stubPath = `@/stubs/${packageName.replace('@', '').replace('/', '-')}`
    packageToStub.set(packageName, stubPath)
  }

  return files.map(file => {
    if (!file.path.match(/\.(tsx?|jsx?)$/)) return file

    let content = file.content
    for (const [pkg, stub] of packageToStub) {
      // Replace import statements
      const patterns = [
        new RegExp(`from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        new RegExp(`from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^'"]+['"]`, 'g'),
      ]
      for (const pattern of patterns) {
        content = content.replace(pattern, `from '${stub}'`)
      }
    }

    return { ...file, content }
  })
}

// Find missing local imports in files
function findMissingImports(files: GeneratorFile[]): MissingImport[] {
  const missing: MissingImport[] = []
  const filePaths = new Set(files.map(f => f.path))

  // Create normalized paths for matching (with and without extensions)
  const normalizedPaths = new Set<string>()
  for (const f of files) {
    normalizedPaths.add(f.path)
    // Add without extension
    for (const ext of ['.tsx', '.ts', '.js', '.jsx', '.css', '.json']) {
      if (f.path.endsWith(ext)) {
        normalizedPaths.add(f.path.slice(0, -ext.length))
        break
      }
    }
    // Add without src/ prefix for @/ alias
    if (f.path.startsWith('src/')) {
      const withoutSrc = f.path.slice(4)
      normalizedPaths.add(withoutSrc)
      for (const ext of ['.tsx', '.ts', '.js', '.jsx', '.css']) {
        if (f.path.endsWith(ext)) {
          normalizedPaths.add(withoutSrc.slice(0, -ext.length))
          break
        }
      }
    }
  }

  for (const file of files) {
    if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

    // Find all local imports
    const importPatterns = [
      /from\s+['"]([.@\/][^'"]+)['"]/g,
      /import\s+['"]([.@\/][^'"]+)['"]/g,
    ]

    for (const pattern of importPatterns) {
      const matches = file.content.matchAll(pattern)
      for (const match of matches) {
        const importPath = match[1]

        // Skip npm packages
        if (!importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('/')) {
          continue
        }

        // Skip CDN URLs (already resolved)
        if (importPath.startsWith('https://') || importPath.startsWith('http://')) {
          continue
        }

        // Resolve path
        const dir = file.path.split('/').slice(0, -1).join('/') || ''
        let resolvedPath = ''

        if (importPath.startsWith('@/')) {
          resolvedPath = 'src/' + importPath.slice(2)
        } else if (importPath.startsWith('./')) {
          resolvedPath = dir ? dir + '/' + importPath.slice(2) : importPath.slice(2)
        } else if (importPath.startsWith('../')) {
          let path = importPath
          let currentDir = dir
          while (path.startsWith('../')) {
            const parts = currentDir.split('/')
            parts.pop()
            currentDir = parts.join('/')
            path = path.slice(3)
          }
          resolvedPath = currentDir ? currentDir + '/' + path : path
        }

        // Clean path
        resolvedPath = resolvedPath.replace(/\/+/g, '/').replace(/^\//, '')

        // Check if file exists
        const possiblePaths = [
          resolvedPath,
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '.js',
          resolvedPath + '.jsx',
          resolvedPath + '.css',
          resolvedPath + '/index.ts',
          resolvedPath + '/index.tsx',
        ]

        const exists = possiblePaths.some(p => normalizedPaths.has(p) || filePaths.has(p))
        if (!exists) {
          missing.push({ from: file.path, importPath, resolvedPath })
        }
      }
    }
  }

  return missing
}

// Generate stub files for missing imports
function generateStubs(missingImports: MissingImport[]): GeneratorFile[] {
  const stubs: GeneratorFile[] = []
  const generated = new Set<string>()

  for (const { resolvedPath, importPath, from } of missingImports) {
    // Determine file type
    const isCss = importPath.endsWith('.css') || resolvedPath.endsWith('.css')

    let filePath = resolvedPath
    if (isCss) {
      if (!filePath.endsWith('.css')) filePath = resolvedPath + '.css'
    } else if (!filePath.match(/\.(tsx?|jsx?)$/)) {
      // Determine if component or utility
      const lastPart = importPath.split('/').pop() || ''
      const isComponent = /^[A-Z]/.test(lastPart) ||
                         filePath.includes('/pages/') ||
                         filePath.includes('/components/')
      filePath = resolvedPath + (isComponent ? '.tsx' : '.ts')
    }

    // Ensure src/ prefix
    if (!filePath.startsWith('src/') && !filePath.startsWith('public/')) {
      filePath = 'src/' + filePath
    }
    filePath = filePath.replace(/^src\/src\//, 'src/')

    if (generated.has(filePath)) continue
    generated.add(filePath)

    // Generate stub content
    let content: string
    if (isCss) {
      content = `/* Auto-generated stub CSS */\n/* Imported from: ${from} */\n`
    } else {
      const name = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'Component'
      const isHook = name.startsWith('use')
      const isPage = filePath.includes('/pages/')

      if (isHook) {
        content = `// Auto-generated stub hook
import { useState } from 'react'

export function ${name}() {
  const [data] = useState(null)
  return data
}

export default ${name}
`
      } else {
        content = `// Auto-generated stub component
export function ${name}() {
  return (
    <div className="p-8 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-white mb-2">${name}</h2>
      <p className="text-gray-400">${isPage ? 'This page' : 'This component'} is under construction</p>
    </div>
  )
}

export default ${name}
`
      }
    }

    stubs.push({ path: filePath, content })
  }

  return stubs
}

// Main generator function
export async function* generate(
  prompt: string,
  apiKey: string,
  options?: { forceGeneration?: boolean }
): AsyncGenerator<GeneratorEvent> {

  // Check if this is a chat request
  if (!options?.forceGeneration && !isGenerationRequest(prompt)) {
    yield* chat(prompt, apiKey)
    return
  }

  yield {
    type: 'start',
    data: { message: 'Starting generation...' },
    timestamp: Date.now(),
  }

  // Don't yield base files yet - wait until all files are validated
  yield {
    type: 'progress',
    data: { message: 'Connecting to AI...' },
    timestamp: Date.now(),
  }

  try {
    // Call AI to generate ONLY src/ files
    // Try primary model first, then fallback if it fails
    console.log('[Generator] Prompt:', prompt.substring(0, 100) + '...')

    let response: Response | null = null
    let currentModelId = AI_MODELS.primary.id
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts && !response?.ok) {
      attempts++

      try {
        response = await callAI(prompt, apiKey, currentModelId, SYSTEM_PROMPT, 60000)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          console.error('[Generator] API error response:', response.status, errorText.substring(0, 200))

          // Try fallback model
          const fallback = getFallbackModel(currentModelId)
          if (fallback && attempts < maxAttempts) {
            console.log('[Generator] Trying fallback model:', fallback.id)
            yield {
              type: 'progress',
              data: { message: `Primary model unavailable, trying ${fallback.name}...` },
              timestamp: Date.now(),
            }
            currentModelId = fallback.id
            response = null // Reset to try again
          } else {
            throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`)
          }
        }
      } catch (error: any) {
        console.error('[Generator] API call failed:', error.message)

        // Try fallback on error
        const fallback = getFallbackModel(currentModelId)
        if (fallback && attempts < maxAttempts) {
          console.log('[Generator] Trying fallback model after error:', fallback.id)
          yield {
            type: 'progress',
            data: { message: `Model error, trying ${fallback.name}...` },
            timestamp: Date.now(),
          }
          currentModelId = fallback.id
        } else {
          throw error
        }
      }
    }

    if (!response?.ok) {
      throw new Error('All AI models failed to respond')
    }

    console.log('[Generator] API responded with status:', response.status, 'using model:', currentModelId)

    yield {
      type: 'progress',
      data: { message: 'Generating components...' },
      timestamp: Date.now(),
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    const extractor = new StreamExtractor()
    let fullContent = ''

    // Collect all AI-generated files FIRST (don't yield yet)
    // This ensures we can validate and fix before sending to preview
    const collectedSrcFiles: GeneratorFile[] = []

    // Stream and collect files (but don't yield yet)
    let chunkCount = 0
    let lastProgressTime = Date.now()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log('[Generator] Stream complete, received', chunkCount, 'chunks')
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      chunkCount++

      // Send periodic progress updates
      const now = Date.now()
      if (now - lastProgressTime > 3000) {
        lastProgressTime = now
        yield {
          type: 'progress',
          data: { message: `Generating code... (${chunkCount} chunks received)` },
          timestamp: now,
        }
      }

      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content

            // Extract files as they stream (but collect, don't yield)
            const files = extractor.addChunk(content)
            for (const file of files) {
              if (isBaseFile(file.path)) continue
              if (!collectedSrcFiles.some(f => f.path === file.path)) {
                collectedSrcFiles.push(file)
                console.log('[Generator] Extracted file:', file.path)
                // Show progress but don't send file yet
                yield {
                  type: 'progress',
                  data: { message: `Generating ${file.path}...` },
                  timestamp: Date.now(),
                }
              }
            }
          }
        } catch {}
      }
    }

    console.log('[Generator] Total content length:', fullContent.length)
    console.log('[Generator] Collected', collectedSrcFiles.length, 'src files during streaming')

    // Parse complete response for any missed files
    const allSrcFiles = parseResponse(fullContent)
    if (allSrcFiles) {
      for (const file of allSrcFiles) {
        if (isBaseFile(file.path)) continue
        if (!collectedSrcFiles.some(f => f.path === file.path)) {
          collectedSrcFiles.push(file)
        }
      }
    }

    // ============================================
    // AUTO-FIX: Validate and create stubs BEFORE sending files
    // ============================================
    yield {
      type: 'progress',
      data: { message: 'Validating imports...' },
      timestamp: Date.now(),
    }

    // CRITICAL: Fix file extensions first (AI sometimes generates 'src/App' instead of 'src/App.tsx')
    const fixedSrcFiles = fixFileExtensions(collectedSrcFiles)

    // Combine base files + AI-generated files for validation
    let allFiles: GeneratorFile[] = [...BASE_FILES, ...fixedSrcFiles]
    const yieldedFiles = new Set<string>()

    // Step 1: Find and fix unknown npm packages
    const unknownNpmPackages = findUnknownNpmPackages(allFiles)
    if (unknownNpmPackages.length > 0) {
      console.log(`[Generator] Found ${unknownNpmPackages.length} unknown npm packages:`, unknownNpmPackages.map(p => p.packageName))

      yield {
        type: 'progress',
        data: { message: `Fixing ${unknownNpmPackages.length} unknown package${unknownNpmPackages.length > 1 ? 's' : ''}...` },
        timestamp: Date.now(),
      }

      // Rewrite imports to point to our stubs
      allFiles = rewriteImportsToStubs(allFiles, unknownNpmPackages)

      // Generate and add stub files
      const npmStubs = generateNpmStubs(unknownNpmPackages)
      for (const stub of npmStubs) {
        allFiles.push(stub)
        console.log(`[Generator] Created npm stub: ${stub.path}`)
      }
    }

    // Step 2: Multi-pass validation for local imports (stubs may have their own imports)
    for (let pass = 0; pass < 3; pass++) {
      const missingImports = findMissingImports(allFiles)

      if (missingImports.length === 0) {
        console.log(`[Generator] Pass ${pass + 1}: All imports resolved`)
        break
      }

      console.log(`[Generator] Pass ${pass + 1}: Found ${missingImports.length} missing imports`)

      yield {
        type: 'progress',
        data: { message: `Fixing ${missingImports.length} missing import${missingImports.length > 1 ? 's' : ''}...` },
        timestamp: Date.now(),
      }

      const stubs = generateStubs(missingImports)
      for (const stub of stubs) {
        if (!allFiles.some(f => f.path === stub.path)) {
          allFiles.push(stub)
          console.log(`[Generator] Created stub: ${stub.path}`)
        }
      }
    }

    // ============================================
    // CRITICAL: Rewrite npm imports to CDN URLs
    // This is the REAL fix for "Failed to resolve import" errors
    // ============================================
    yield {
      type: 'progress',
      data: { message: 'Optimizing imports for CDN...' },
      timestamp: Date.now(),
    }

    // Rewrite all npm package imports to direct CDN URLs
    // This bypasses Vite's resolution - packages load directly from esm.sh
    allFiles = rewriteNpmImportsToCDN(allFiles)
    console.log('[Generator] Rewrote npm imports to CDN URLs')

    // NOW yield all files (base + AI + stubs) - all validated and CDN-ready
    yield {
      type: 'progress',
      data: { message: 'Sending files to preview...' },
      timestamp: Date.now(),
    }

    for (const file of allFiles) {
      if (!yieldedFiles.has(file.path)) {
        yieldedFiles.add(file.path)
        yield {
          type: 'file',
          data: { file },
          timestamp: Date.now(),
        }
      }
    }

    yield {
      type: 'complete',
      data: {
        message: 'Generation complete!',
        files: allFiles,
      },
      timestamp: Date.now(),
    }

  } catch (error) {
    console.error('[Generator] Error in generate:', error)

    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The AI is taking too long to respond. Please try again.'
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else {
        errorMessage = error.message
      }
    }

    yield {
      type: 'error',
      data: { message: errorMessage },
      timestamp: Date.now(),
    }
  }
}

// Simple chat function
async function* chat(
  message: string,
  apiKey: string
): AsyncGenerator<GeneratorEvent> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_CONFIG.referer,
        'X-Title': OPENROUTER_CONFIG.title,
      },
      body: JSON.stringify({
        model: AI_MODELS.primary.id,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant. Be concise and helpful.' },
          { role: 'user', content: message },
        ],
        temperature: DEFAULT_SETTINGS.temperature,
        max_tokens: 2000,
        stream: true,
      }),
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            yield {
              type: 'chat',
              data: { content: fullContent },
              timestamp: Date.now(),
            }
          }
        } catch {}
      }
    }

    yield {
      type: 'complete',
      data: { content: fullContent },
      timestamp: Date.now(),
    }

  } catch (error) {
    yield {
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: Date.now(),
    }
  }
}

// Export for API route
export { BASE_FILES }
