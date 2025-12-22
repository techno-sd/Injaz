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

// Parse JSON from AI response (handles markdown code blocks)
function parseAIResponse(response: string): { files: GeneratorFile[] } | null {
  try {
    // Try direct JSON parse first
    return JSON.parse(response)
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim())
      } catch {
        // Continue to next attempt
      }
    }

    // Try to find JSON object in response
    const objectMatch = response.match(/\{[\s\S]*"files"[\s\S]*\}/)
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0])
      } catch {
        // Failed to parse
      }
    }

    return null
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

  for (const { resolvedPath, importPath } of missingImports) {
    // Determine the actual file path
    let filePath = resolvedPath
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
      // Check if it looks like a component (capitalized)
      const lastPart = importPath.split('/').pop() || ''
      const isComponent = /^[A-Z]/.test(lastPart)
      filePath = resolvedPath + (isComponent ? '.tsx' : '.ts')
    }

    // Skip if we already generated this stub
    if (generatedPaths.has(filePath)) continue
    generatedPaths.add(filePath)

    // Generate stub content based on what's being imported
    const componentName = filePath.split('/').pop()?.replace(/\.(tsx|ts)$/, '') || 'Component'
    const isPage = filePath.includes('/pages/')
    const isHook = componentName.startsWith('use')
    const isUtil = filePath.includes('/lib/') || filePath.includes('/utils/')

    let content: string
    if (isHook) {
      content = `// Auto-generated stub for missing hook
export function ${componentName}() {
  console.warn('${componentName} is a stub - implement this hook')
  return null
}
`
    } else if (isUtil) {
      content = `// Auto-generated stub for missing utility
export function ${componentName.charAt(0).toLowerCase() + componentName.slice(1)}(...args: unknown[]) {
  console.warn('${componentName} is a stub - implement this utility')
  return null
}
`
    } else {
      // Component stub
      content = `// Auto-generated stub for missing component
export function ${componentName}() {
  return (
    <div className="p-8 text-center">
      <div className="text-yellow-500 mb-2">⚠️ Missing Component</div>
      <p className="text-gray-400 text-sm">
        ${componentName} was not generated. ${isPage ? 'This page needs to be implemented.' : 'This component needs to be implemented.'}
      </p>
    </div>
  )
}

export default ${componentName}
`
    }

    stubFiles.push({ path: filePath, content })
    console.log(`[Generator] Created stub file: ${filePath}`)
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

  // Generate app using AI
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
          // Limit to 10 files for context
          contextMessage += `\n--- ${file.path} ---\n${file.content.slice(0, 500)}...\n`
        }
      }

      // Use fallback-enabled API call
      const response = await this.callAPIWithFallback(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt + contextMessage },
        ],
        { maxTokens: 16000 }
      )

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in API response')
      }

      yield {
        type: 'progress',
        data: { message: 'Parsing generated code...' },
        timestamp: Date.now(),
      }

      // Parse the response
      const parsed = parseAIResponse(content)

      if (!parsed || !parsed.files || !Array.isArray(parsed.files)) {
        throw new Error('Invalid response format from AI')
      }

      // Validate files
      const validation = validateFiles(parsed.files)
      if (!validation.valid) {
        console.warn('File validation errors:', validation.errors)
      }

      // Auto-generate stub files for missing imports
      let allFiles = parsed.files
      if (validation.missingImports.length > 0) {
        console.warn('Missing imports detected:', validation.warnings)
        const stubFiles = generateStubFiles(validation.missingImports)
        if (stubFiles.length > 0) {
          console.log(`[Generator] Generated ${stubFiles.length} stub files for missing imports`)
          allFiles = [...parsed.files, ...stubFiles]
        }
      }

      // Yield each file
      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i]

        yield {
          type: 'progress',
          data: { progress: i + 1, total: allFiles.length, message: `Creating ${file.path}` },
          timestamp: Date.now(),
        }

        yield {
          type: 'file',
          data: { file },
          timestamp: Date.now(),
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
