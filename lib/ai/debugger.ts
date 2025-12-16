// AI-powered debugging service
import { OpenAIProvider } from './providers/openai'
import { parseStackTrace, getErrorContext, type DetectedError } from './error-detector'
import type { File } from '@/types'

export interface DebugContext {
  error: RuntimeError | ConsoleError
  files: File[]
  recentChanges?: string[]
}

export interface RuntimeError {
  message: string
  filename?: string
  lineno?: number
  colno?: number
  stack?: string
}

export interface ConsoleError {
  type: 'error' | 'warn'
  message: string
  timestamp: number
}

export interface DebugSuggestion {
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  fix?: CodeFix
  relatedFiles?: string[]
}

export interface CodeFix {
  file: string
  description: string
  oldCode: string
  newCode: string
  explanation: string
}

export interface DebugResult {
  analysis: string
  rootCause: string
  suggestions: DebugSuggestion[]
  quickFix?: CodeFix
}

const DEBUG_SYSTEM_PROMPT = `You are an expert debugging assistant for web development. Your role is to analyze errors and provide actionable fixes.

When analyzing errors:
1. Identify the root cause precisely
2. Consider common patterns (typos, missing imports, undefined variables, etc.)
3. Look at the code context to understand what went wrong
4. Provide clear, specific fixes with exact code changes

Response Format (JSON):
{
  "analysis": "Brief analysis of what went wrong",
  "rootCause": "The specific root cause of the error",
  "suggestions": [
    {
      "title": "Short fix title",
      "description": "Detailed explanation",
      "confidence": "high|medium|low",
      "fix": {
        "file": "filename.js",
        "description": "What this fix does",
        "oldCode": "exact code to replace",
        "newCode": "corrected code",
        "explanation": "Why this fixes the issue"
      },
      "relatedFiles": ["other.js"]
    }
  ],
  "quickFix": {
    "file": "filename.js",
    "description": "Quick fix description",
    "oldCode": "code to replace",
    "newCode": "fixed code",
    "explanation": "Quick explanation"
  }
}

Common Error Patterns:
- ReferenceError: Usually undefined variables or missing imports
- TypeError: Method called on wrong type, null/undefined access
- SyntaxError: Missing brackets, quotes, semicolons
- RangeError: Array/recursion limits exceeded

Always provide the most likely fix first. If multiple fixes are possible, order by confidence.`

export class AIDebugger {
  private provider: OpenAIProvider

  constructor() {
    this.provider = new OpenAIProvider()
  }

  /**
   * Analyze a runtime error and suggest fixes
   */
  async analyzeError(context: DebugContext): Promise<DebugResult> {
    const { error, files } = context

    // Build context message
    const errorInfo = this.formatErrorInfo(error)
    const codeContext = this.buildCodeContext(error, files)

    const userMessage = `
## Error Information
${errorInfo}

## Relevant Code
${codeContext}

## Project Files
${files.map(f => f.path).join('\n')}

Analyze this error and provide specific fixes. Return valid JSON only.`

    try {
      const result = await this.provider.chat({
        model: process.env.DEFAULT_AI_MODEL || 'qwen/qwen3-coder-plus',
        messages: [
          { role: 'system', content: DEBUG_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      })

      // Parse the JSON response
      const content = result.content.trim()
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return this.validateDebugResult(parsed)
      }

      // Fallback if JSON parsing fails
      return {
        analysis: content,
        rootCause: 'Unable to determine root cause',
        suggestions: [],
      }
    } catch (error: any) {
      console.error('AI debugging failed:', error)
      return {
        analysis: 'Failed to analyze error',
        rootCause: error.message || 'Unknown error',
        suggestions: [],
      }
    }
  }

  /**
   * Stream debug analysis for real-time feedback
   */
  async *streamAnalysis(context: DebugContext): AsyncGenerator<string> {
    const { error, files } = context
    const errorInfo = this.formatErrorInfo(error)
    const codeContext = this.buildCodeContext(error, files)

    const userMessage = `
## Error
${errorInfo}

## Code Context
${codeContext}

Analyze this error step by step:
1. What type of error is this?
2. What is the likely cause?
3. How can it be fixed?
4. Provide the exact code fix.`

    try {
      const stream = this.provider.streamChat({
        model: process.env.DEFAULT_AI_MODEL || 'qwen/qwen3-coder-plus',
        messages: [
          {
            role: 'system',
            content: 'You are a debugging expert. Analyze errors concisely and provide actionable fixes.',
          },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content' && chunk.content) {
          yield chunk.content
        }
      }
    } catch (error: any) {
      yield `\n\nError during analysis: ${error.message}`
    }
  }

  /**
   * Get quick suggestions without full analysis (faster)
   */
  async getQuickSuggestions(error: RuntimeError | ConsoleError): Promise<string[]> {
    const errorMessage = 'message' in error ? error.message : String(error)

    // Common quick fixes based on error patterns
    const suggestions: string[] = []

    // ReferenceError patterns
    if (errorMessage.includes('is not defined')) {
      const varMatch = errorMessage.match(/(\w+) is not defined/)
      if (varMatch) {
        suggestions.push(`Check if '${varMatch[1]}' is imported or declared`)
        suggestions.push(`Verify spelling of '${varMatch[1]}'`)
        suggestions.push(`Add missing import statement`)
      }
    }

    // TypeError patterns
    if (errorMessage.includes('Cannot read properties of undefined') ||
        errorMessage.includes('Cannot read property')) {
      const propMatch = errorMessage.match(/reading '(\w+)'/) ||
                        errorMessage.match(/property '(\w+)'/)
      if (propMatch) {
        suggestions.push(`Add null check before accessing '${propMatch[1]}'`)
        suggestions.push(`Verify the object exists before property access`)
        suggestions.push(`Use optional chaining (?.) operator`)
      }
    }

    // Null errors
    if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
      suggestions.push('Check for null/undefined values')
      suggestions.push('Add default values or fallbacks')
      suggestions.push('Verify data is loaded before use')
    }

    // Syntax errors
    if (errorMessage.includes('SyntaxError') || errorMessage.includes('Unexpected')) {
      suggestions.push('Check for missing brackets, parentheses, or quotes')
      suggestions.push('Verify proper JavaScript syntax')
      suggestions.push('Look for unclosed strings or template literals')
    }

    // If no specific pattern matched
    if (suggestions.length === 0) {
      suggestions.push('Check the browser console for more details')
      suggestions.push('Review recent code changes')
      suggestions.push('Verify all dependencies are properly imported')
    }

    return suggestions.slice(0, 5)
  }

  /**
   * Apply a suggested fix to the files
   */
  applyFix(files: File[], fix: CodeFix): File[] {
    return files.map(file => {
      if (file.path === fix.file) {
        return {
          ...file,
          content: file.content.replace(fix.oldCode, fix.newCode),
        }
      }
      return file
    })
  }

  private formatErrorInfo(error: RuntimeError | ConsoleError): string {
    if ('lineno' in error && error.lineno) {
      return `
Type: Runtime Error
Message: ${error.message}
File: ${error.filename || 'Unknown'}
Line: ${error.lineno}
Column: ${error.colno || 'Unknown'}
${error.stack ? `Stack: ${error.stack}` : ''}`
    }

    return `
Type: Console ${(error as ConsoleError).type}
Message: ${error.message}
Timestamp: ${new Date((error as ConsoleError).timestamp).toISOString()}`
  }

  private buildCodeContext(
    error: RuntimeError | ConsoleError,
    files: File[]
  ): string {
    const contexts: string[] = []

    // If we have file info, get that file's content
    if ('filename' in error && error.filename) {
      const file = files.find(f =>
        error.filename?.includes(f.path) || f.path.includes(error.filename!)
      )

      if (file && 'lineno' in error && error.lineno) {
        const { before, errorLine, after } = getErrorContext(
          file.content,
          error.lineno,
          3
        )

        contexts.push(`
### ${file.path}
\`\`\`javascript
${before.map((l, i) => `${error.lineno! - 3 + i}: ${l}`).join('\n')}
${error.lineno}: ${errorLine} // <-- ERROR HERE
${after.map((l, i) => `${error.lineno! + 1 + i}: ${l}`).join('\n')}
\`\`\``)
      } else if (file) {
        // Show first 30 lines of the file
        const lines = file.content.split('\n').slice(0, 30)
        contexts.push(`
### ${file.path}
\`\`\`javascript
${lines.map((l, i) => `${i + 1}: ${l}`).join('\n')}
\`\`\``)
      }
    }

    // Also include index.html and main JS file for context
    const indexHtml = files.find(f => f.path === 'index.html')
    const mainJs = files.find(f =>
      f.path === 'script.js' ||
      f.path === 'main.js' ||
      f.path === 'app.js' ||
      f.path === 'index.js'
    )
    const mainCss = files.find(f =>
      f.path === 'style.css' ||
      f.path === 'styles.css' ||
      f.path === 'main.css'
    )

    if (indexHtml && !contexts.some(c => c.includes('index.html'))) {
      contexts.push(`
### index.html (first 20 lines)
\`\`\`html
${indexHtml.content.split('\n').slice(0, 20).join('\n')}
\`\`\``)
    }

    if (mainJs && !contexts.some(c => c.includes(mainJs.path))) {
      contexts.push(`
### ${mainJs.path}
\`\`\`javascript
${mainJs.content.split('\n').slice(0, 40).join('\n')}
\`\`\``)
    }

    return contexts.join('\n\n') || 'No relevant code context found.'
  }

  private validateDebugResult(data: any): DebugResult {
    return {
      analysis: data.analysis || 'No analysis provided',
      rootCause: data.rootCause || 'Unknown root cause',
      suggestions: Array.isArray(data.suggestions)
        ? data.suggestions.map((s: any) => ({
            title: s.title || 'Suggestion',
            description: s.description || '',
            confidence: s.confidence || 'medium',
            fix: s.fix
              ? {
                  file: s.fix.file || '',
                  description: s.fix.description || '',
                  oldCode: s.fix.oldCode || '',
                  newCode: s.fix.newCode || '',
                  explanation: s.fix.explanation || '',
                }
              : undefined,
            relatedFiles: s.relatedFiles || [],
          }))
        : [],
      quickFix: data.quickFix
        ? {
            file: data.quickFix.file || '',
            description: data.quickFix.description || '',
            oldCode: data.quickFix.oldCode || '',
            newCode: data.quickFix.newCode || '',
            explanation: data.quickFix.explanation || '',
          }
        : undefined,
    }
  }
}

// Singleton instance
let debuggerInstance: AIDebugger | null = null

export function getAIDebugger(): AIDebugger {
  if (!debuggerInstance) {
    debuggerInstance = new AIDebugger()
  }
  return debuggerInstance
}
