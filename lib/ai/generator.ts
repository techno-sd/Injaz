// Core AI Generator - Simple, Reliable, Fast
// Following Bolt.new / Replit / V0 patterns

import { SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, isGenerationRequest } from './prompts'
import { matchTemplate, templates, type Template, type TemplateFile } from './templates'
import {
  AI_MODELS,
  OPENROUTER_CONFIG,
  DEFAULT_SETTINGS,
  getFallbackModel,
  type ModelConfig,
} from './config'

// OpenRouter API configuration
const OPENROUTER_API_URL = OPENROUTER_CONFIG.baseUrl
const DEFAULT_MODEL = AI_MODELS.primary.id // DeepSeek V3 - Best value for code generation

export interface GeneratorFile {
  path: string
  content: string
}

export type GeneratorEventType =
  | 'start'
  | 'template_match'
  | 'generating'
  | 'file'
  | 'progress'
  | 'complete'
  | 'error'
  | 'chat_response'

export interface GeneratorEvent {
  type: GeneratorEventType
  data?: {
    message?: string
    file?: GeneratorFile
    files?: GeneratorFile[]
    template?: string
    progress?: number
    total?: number
    content?: string
  }
  timestamp: number
}

interface GeneratorOptions {
  apiKey: string
  model?: string
  existingFiles?: GeneratorFile[]
  enableFallback?: boolean // Auto-fallback to alternative model on failure
}

// Parse JSON from AI response (handles markdown code blocks and thinking tags)
function parseAIResponse(response: string): { files: GeneratorFile[] } | null {
  // Remove thinking tags if present (some models output thinking before JSON)
  let cleanedResponse = response
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim()

  try {
    // Try direct JSON parse first
    return JSON.parse(cleanedResponse)
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim())
      } catch {
        // Continue to next attempt
      }
    }

    // Try to find JSON object with files array in response
    const objectMatch = cleanedResponse.match(/\{\s*"files"\s*:\s*\[[\s\S]*?\]\s*\}/)
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0])
      } catch {
        // Continue to next attempt
      }
    }

    // More aggressive: find any JSON object containing "files"
    const anyJsonMatch = cleanedResponse.match(/\{[\s\S]*"files"[\s\S]*\}/)
    if (anyJsonMatch) {
      try {
        // Try to find the balanced JSON object
        const jsonStr = findBalancedJson(anyJsonMatch[0])
        if (jsonStr) {
          return JSON.parse(jsonStr)
        }
      } catch {
        // Failed to parse
      }
    }

    console.error('[Generator] Failed to parse AI response. First 500 chars:', cleanedResponse.slice(0, 500))
    return null
  }
}

// Helper to find balanced JSON object
function findBalancedJson(str: string): string | null {
  let depth = 0
  let start = -1

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (start === -1) start = i
      depth++
    } else if (str[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        return str.slice(start, i + 1)
      }
    }
  }

  return null
}

// Streaming file extractor - extracts complete file objects as they stream in
class StreamingFileExtractor {
  private buffer = ''
  private extractedPaths = new Set<string>()

  // Add chunk to buffer and try to extract files
  addChunk(chunk: string): GeneratorFile[] {
    this.buffer += chunk
    return this.extractFiles()
  }

  // Try to extract complete file objects from buffer
  private extractFiles(): GeneratorFile[] {
    const files: GeneratorFile[] = []

    // Look for file patterns: { "path": "...", "content": "..." }
    // We need to find complete file objects within the "files" array

    // Find all potential file object starts
    const filePattern = /\{\s*"path"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"/g
    let match

    while ((match = filePattern.exec(this.buffer)) !== null) {
      const path = match[1]

      // Skip if already extracted
      if (this.extractedPaths.has(path)) continue

      // Find the end of this file object
      const contentStart = match.index + match[0].length

      // Find the closing of the content string (handling escapes)
      let i = contentStart
      let inEscape = false
      let contentEnd = -1

      while (i < this.buffer.length) {
        if (inEscape) {
          inEscape = false
          i++
          continue
        }
        if (this.buffer[i] === '\\') {
          inEscape = true
          i++
          continue
        }
        if (this.buffer[i] === '"') {
          contentEnd = i
          break
        }
        i++
      }

      if (contentEnd === -1) continue // Content not complete yet

      // Check if we have the closing brace
      const afterContent = this.buffer.slice(contentEnd + 1).match(/^\s*\}/)
      if (!afterContent) continue

      // Extract the file
      const content = this.buffer.slice(contentStart, contentEnd)
      // Unescape the content
      const unescapedContent = content
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')

      files.push({ path, content: unescapedContent })
      this.extractedPaths.add(path)
    }

    return files
  }

  // Get all extracted files (for final validation)
  getExtractedCount(): number {
    return this.extractedPaths.size
  }
}

// Validate generated files and check for missing imports
function validateFiles(files: GeneratorFile[]): { valid: boolean; errors: string[]; warnings: string[]; missingImports: Array<{ from: string; importPath: string; resolvedPath: string }> } {
  const errors: string[] = []
  const warnings: string[] = []
  const missingImports: Array<{ from: string; importPath: string; resolvedPath: string }> = []
  const filePaths = new Set(files.map(f => f.path))

  // Also track normalized paths (without src/ prefix, with extensions)
  const normalizedPaths = new Set<string>()
  for (const f of files) {
    normalizedPaths.add(f.path)
    // Add variants without extension for matching
    if (f.path.endsWith('.tsx')) {
      normalizedPaths.add(f.path.slice(0, -4))
    } else if (f.path.endsWith('.ts')) {
      normalizedPaths.add(f.path.slice(0, -3))
    }
  }

  for (const file of files) {
    // Check for empty content
    if (!file.content || file.content.trim().length === 0) {
      errors.push(`Empty file: ${file.path}`)
    }

    // Check for invalid imports (basic check)
    if (file.path.endsWith('.tsx') || file.path.endsWith('.ts')) {
      const importMatches = file.content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)
      for (const match of importMatches) {
        const importPath = match[1]
        // Convert relative import to file path
        const dir = file.path.split('/').slice(0, -1).join('/')
        let resolvedPath = ''

        if (importPath.startsWith('./')) {
          resolvedPath = dir + '/' + importPath.slice(2)
        } else if (importPath.startsWith('../')) {
          const parts = dir.split('/')
          parts.pop()
          resolvedPath = parts.join('/') + '/' + importPath.slice(3)
        }

        // Clean up path (remove double slashes)
        resolvedPath = resolvedPath.replace(/\/+/g, '/')

        // Check if file exists (with or without extension)
        const possiblePaths = [
          resolvedPath,
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '/index.ts',
          resolvedPath + '/index.tsx',
        ]

        const exists = possiblePaths.some(p => normalizedPaths.has(p) || filePaths.has(p))
        if (!exists && !importPath.includes('@/')) {
          warnings.push(`Missing import in ${file.path}: "${importPath}" (resolved to ${resolvedPath})`)
          missingImports.push({ from: file.path, importPath, resolvedPath })
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, missingImports }
}

// Generate stub files for missing imports
function generateStubFiles(missingImports: Array<{ from: string; importPath: string; resolvedPath: string }>): GeneratorFile[] {
  const stubFiles: GeneratorFile[] = []
  const generatedPaths = new Set<string>()

  for (const { resolvedPath, importPath, from } of missingImports) {
    // Determine the actual file path
    let filePath = resolvedPath
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
      // Check if it looks like a component (capitalized)
      const lastPart = importPath.split('/').pop() || ''
      const isComponent = /^[A-Z]/.test(lastPart)
      filePath = resolvedPath + (isComponent ? '.tsx' : '.ts')
    }

    // Ensure path starts with src/ if it doesn't have a directory
    if (!filePath.startsWith('src/') && !filePath.includes('/')) {
      filePath = 'src/' + filePath
    }

    // Skip if we already generated this stub
    if (generatedPaths.has(filePath)) continue
    generatedPaths.add(filePath)

    // Generate stub content based on what's being imported
    const componentName = filePath.split('/').pop()?.replace(/\.(tsx|ts)$/, '') || 'Component'
    const isPage = filePath.includes('/pages/')
    const isHook = componentName.startsWith('use')
    const isUtil = filePath.includes('/lib/') || filePath.includes('/utils/')

    console.log(`[Generator] Creating stub: ${filePath} (imported from ${from})`)

    let content: string
    if (isHook) {
      content = `// Auto-generated stub for missing hook: ${componentName}
// Imported from: ${from}

export function ${componentName}() {
  console.warn('[Stub] ${componentName} is a placeholder - implement this hook')
  return null
}

export default ${componentName}
`
    } else if (isUtil) {
      content = `// Auto-generated stub for missing utility: ${componentName}
// Imported from: ${from}

export function ${componentName.charAt(0).toLowerCase() + componentName.slice(1)}(...args: unknown[]) {
  console.warn('[Stub] ${componentName} is a placeholder - implement this utility')
  return null
}

export default ${componentName.charAt(0).toLowerCase() + componentName.slice(1)}
`
    } else {
      // Component/Page stub - must be a valid React component
      const title = isPage ? 'Page Not Generated' : 'Component Not Generated'
      const description = isPage
        ? 'This page was imported but not generated by the AI.'
        : 'This component was imported but not generated by the AI.'

      content = `// Auto-generated stub for missing ${isPage ? 'page' : 'component'}: ${componentName}
// Imported from: ${from}

export function ${componentName}() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-white mb-2">${title}</h1>
        <p className="text-gray-400 mb-4">${description}</p>
        <p className="text-sm text-gray-500">
          Component: <code className="bg-gray-800 px-2 py-1 rounded">${componentName}</code>
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Ask the AI to regenerate or implement this ${isPage ? 'page' : 'component'}.
        </p>
      </div>
    </div>
  )
}

export default ${componentName}
`
    }

    stubFiles.push({ path: filePath, content })
  }

  if (stubFiles.length > 0) {
    console.log(`[Generator] Created ${stubFiles.length} stub file(s):`, stubFiles.map(f => f.path))
  }

  return stubFiles
}

// Main generator class
export class Generator {
  private apiKey: string
  private model: string
  private enableFallback: boolean

  constructor(options: GeneratorOptions) {
    this.apiKey = options.apiKey
    this.model = options.model || DEFAULT_MODEL
    this.enableFallback = options.enableFallback ?? true // Enable fallback by default
  }

  // Get current model config
  getModelConfig(): ModelConfig {
    for (const config of Object.values(AI_MODELS)) {
      if (config.id === this.model) {
        return config
      }
    }
    return AI_MODELS.primary
  }

  // Try API call with fallback support
  private async callAPIWithFallback(
    messages: Array<{ role: string; content: string }>,
    options: { temperature?: number; maxTokens?: number; stream?: boolean } = {}
  ): Promise<Response> {
    const { temperature = DEFAULT_SETTINGS.temperature, maxTokens = 16000, stream = false } = options
    let currentModel = this.model
    let attempts = 0
    const maxAttempts = this.enableFallback ? 3 : 1

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': OPENROUTER_CONFIG.referer,
            'X-Title': OPENROUTER_CONFIG.title,
          },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream,
          }),
        })

        if (response.ok) {
          return response
        }

        // Check if we should fallback
        const status = response.status
        const isRetryable = [429, 502, 503, 504].includes(status)

        if (!isRetryable || !this.enableFallback) {
          const error = await response.text()
          throw new Error(`API error: ${status} - ${error}`)
        }

        // Try fallback model
        const fallback = getFallbackModel(currentModel)
        if (fallback) {
          console.log(`[Generator] Model ${currentModel} failed (${status}), falling back to ${fallback.id}`)
          currentModel = fallback.id
          attempts++
        } else {
          throw new Error(`API error: ${status} - No fallback available`)
        }
      } catch (error: any) {
        // Network errors - try fallback
        if (this.enableFallback && error.message?.includes('fetch')) {
          const fallback = getFallbackModel(currentModel)
          if (fallback) {
            console.log(`[Generator] Network error with ${currentModel}, falling back to ${fallback.id}`)
            currentModel = fallback.id
            attempts++
            continue
          }
        }
        throw error
      }
    }

    throw new Error('All models failed')
  }

  // Check if prompt matches a template
  matchTemplate(prompt: string): Template | null {
    return matchTemplate(prompt)
  }

  // Generate app from template
  async *generateFromTemplate(template: Template): AsyncGenerator<GeneratorEvent> {
    yield {
      type: 'start',
      data: { message: `Using ${template.name} template` },
      timestamp: Date.now(),
    }

    yield {
      type: 'template_match',
      data: { template: template.name, message: `Matched template: ${template.name}` },
      timestamp: Date.now(),
    }

    // Yield each file
    for (let i = 0; i < template.files.length; i++) {
      const file = template.files[i]

      yield {
        type: 'progress',
        data: { progress: i + 1, total: template.files.length, message: `Creating ${file.path}` },
        timestamp: Date.now(),
      }

      yield {
        type: 'file',
        data: { file: { path: file.path, content: file.content } },
        timestamp: Date.now(),
      }
    }

    yield {
      type: 'complete',
      data: { message: 'Template applied successfully', files: template.files },
      timestamp: Date.now(),
    }
  }

  // Generate app using AI with streaming for real-time file display
  async *generateWithAI(prompt: string, existingFiles?: GeneratorFile[]): AsyncGenerator<GeneratorEvent> {
    yield {
      type: 'start',
      data: { message: 'Starting AI generation...' },
      timestamp: Date.now(),
    }

    yield {
      type: 'generating',
      data: { message: 'Generating code...' },
      timestamp: Date.now(),
    }

    try {
      // Build context from existing files if provided
      let contextMessage = ''
      if (existingFiles && existingFiles.length > 0) {
        contextMessage = '\n\nExisting files in the project:\n'
        for (const file of existingFiles.slice(0, 10)) {
          contextMessage += `\n--- ${file.path} ---\n${file.content.slice(0, 500)}...\n`
        }
      }

      // Use streaming API call for real-time file extraction
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': OPENROUTER_CONFIG.referer,
          'X-Title': OPENROUTER_CONFIG.title,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt + contextMessage },
          ],
          temperature: DEFAULT_SETTINGS.temperature,
          max_tokens: 16000,
          stream: true, // Enable streaming
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API error: ${response.status} - ${error}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      const extractor = new StreamingFileExtractor()
      const yieldedFiles = new Set<string>()
      let fullContent = ''
      let fileCount = 0

      // Stream and extract files in real-time
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content

                // Try to extract files from the stream
                const newFiles = extractor.addChunk(content)

                for (const file of newFiles) {
                  if (!yieldedFiles.has(file.path)) {
                    yieldedFiles.add(file.path)
                    fileCount++

                    // Yield progress
                    yield {
                      type: 'progress',
                      data: { progress: fileCount, total: 0, message: `Creating ${file.path}` },
                      timestamp: Date.now(),
                    }

                    // Yield file immediately
                    yield {
                      type: 'file',
                      data: { file },
                      timestamp: Date.now(),
                    }
                  }
                }
              }
            } catch {
              // Ignore parse errors for streaming chunks
            }
          }
        }
      }

      // After streaming, parse the complete response for any missed files
      yield {
        type: 'progress',
        data: { message: 'Validating files...' },
        timestamp: Date.now(),
      }

      // Clean and parse complete response
      const parsed = parseAIResponse(fullContent)
      let allFiles: GeneratorFile[] = []

      if (parsed?.files && Array.isArray(parsed.files)) {
        // Add any files that weren't extracted during streaming
        for (const file of parsed.files) {
          if (!yieldedFiles.has(file.path)) {
            yieldedFiles.add(file.path)
            fileCount++

            yield {
              type: 'progress',
              data: { progress: fileCount, total: parsed.files.length, message: `Creating ${file.path}` },
              timestamp: Date.now(),
            }

            yield {
              type: 'file',
              data: { file },
              timestamp: Date.now(),
            }
          }
        }
        allFiles = parsed.files
      } else if (yieldedFiles.size === 0) {
        // No files extracted at all
        const preview = fullContent.slice(0, 300).replace(/\n/g, '\\n')
        console.error(`[Generator] AI response preview: ${preview}...`)
        throw new Error(`Invalid response format from AI. Response starts with: "${fullContent.slice(0, 100)}..."`)
      } else {
        // Use files extracted during streaming
        allFiles = Array.from(yieldedFiles).map(path => ({
          path,
          content: '' // Content was already yielded
        }))
      }

      // Validate and generate stubs for missing imports
      const validation = validateFiles(allFiles.length > 0 ? allFiles : Array.from(yieldedFiles).map(p => ({ path: p, content: '' })))

      if (validation.missingImports.length > 0) {
        console.warn('Missing imports detected:', validation.warnings)
        const stubFiles = generateStubFiles(validation.missingImports)

        for (const stub of stubFiles) {
          if (!yieldedFiles.has(stub.path)) {
            yieldedFiles.add(stub.path)
            fileCount++

            yield {
              type: 'progress',
              data: { progress: fileCount, total: fileCount, message: `Creating stub: ${stub.path}` },
              timestamp: Date.now(),
            }

            yield {
              type: 'file',
              data: { file: stub },
              timestamp: Date.now(),
            }
          }
        }
      }

      yield {
        type: 'complete',
        data: { message: 'Generation complete', files: allFiles },
        timestamp: Date.now(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      yield {
        type: 'error',
        data: { message: errorMessage },
        timestamp: Date.now(),
      }
    }
  }

  // Handle chat messages (non-generation) - uses primary model
  async *chat(message: string, history: Array<{ role: string; content: string }>): AsyncGenerator<GeneratorEvent> {
    try {
      // Use primary model for all tasks (simplified 2-model architecture)
      const chatModel = AI_MODELS.primary.id

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': OPENROUTER_CONFIG.referer,
          'X-Title': OPENROUTER_CONFIG.title,
        },
        body: JSON.stringify({
          model: chatModel,
          messages: [
            { role: 'system', content: CHAT_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message },
          ],
          temperature: DEFAULT_SETTINGS.temperature,
          max_tokens: 2000,
          stream: true,
        }),
      })

      if (!response.ok) {
        // Try fallback model if primary fails
        if (this.enableFallback && [429, 502, 503, 504].includes(response.status)) {
          console.log(`[Generator] Chat model failed (${response.status}), using fallback model`)
          // Retry with fallback model (Claude Sonnet)
          const fallbackResponse = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
              'HTTP-Referer': OPENROUTER_CONFIG.referer,
              'X-Title': OPENROUTER_CONFIG.title,
            },
            body: JSON.stringify({
              model: AI_MODELS.fallback.id,
              messages: [
                { role: 'system', content: CHAT_SYSTEM_PROMPT },
                ...history,
                { role: 'user', content: message },
              ],
              temperature: DEFAULT_SETTINGS.temperature,
              max_tokens: 2000,
              stream: true,
            }),
          })

          if (!fallbackResponse.ok) {
            throw new Error(`API error: ${fallbackResponse.status}`)
          }

          // Continue with fallback response
          const reader = fallbackResponse.body?.getReader()
          if (!reader) throw new Error('No response body')

          const decoder = new TextDecoder()
          let fullContent = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    fullContent += content
                    yield {
                      type: 'chat_response',
                      data: { content: fullContent },
                      timestamp: Date.now(),
                    }
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }

          yield { type: 'complete', data: { content: fullContent }, timestamp: Date.now() }
          return
        }

        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                yield {
                  type: 'chat_response',
                  data: { content: fullContent },
                  timestamp: Date.now(),
                }
              }
            } catch {
              // Ignore parse errors for streaming chunks
            }
          }
        }
      }

      yield {
        type: 'complete',
        data: { content: fullContent },
        timestamp: Date.now(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      yield {
        type: 'error',
        data: { message: errorMessage },
        timestamp: Date.now(),
      }
    }
  }

  // Main entry point - decides between template, generation, or chat
  async *generate(
    prompt: string,
    options?: {
      existingFiles?: GeneratorFile[]
      forceGeneration?: boolean
      history?: Array<{ role: string; content: string }>
    }
  ): AsyncGenerator<GeneratorEvent> {
    // Check if this is a generation request or chat
    if (!options?.forceGeneration && !isGenerationRequest(prompt)) {
      // This is a chat/question, not a generation request
      yield* this.chat(prompt, options?.history || [])
      return
    }

    // Check for template match first (unless forced generation)
    if (!options?.forceGeneration) {
      const template = this.matchTemplate(prompt)
      if (template) {
        yield* this.generateFromTemplate(template)
        return
      }
    }

    // Fall back to AI generation
    yield* this.generateWithAI(prompt, options?.existingFiles)
  }
}

// Singleton instance
let generatorInstance: Generator | null = null

export function getGenerator(apiKey?: string): Generator {
  if (!generatorInstance) {
    const key = apiKey || process.env.OPENROUTER_API_KEY || ''
    if (!key) {
      throw new Error('OpenRouter API key is required')
    }
    generatorInstance = new Generator({ apiKey: key })
  }
  return generatorInstance
}

// Export templates and config for external use
export { templates, type Template, type TemplateFile }
export { AI_MODELS, MODEL_IDS, type ModelConfig } from './config'
