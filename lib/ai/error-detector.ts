// Error detection and parsing utilities

export interface DetectedError {
  type: 'syntax' | 'type' | 'runtime' | 'lint' | 'build'
  severity: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  column?: number
  source?: string // eslint, typescript, runtime, etc.
  suggestion?: string
  code?: string // Error code like TS2322
}

export interface ParsedStackFrame {
  file: string
  line: number
  column?: number
  function?: string
  isProjectFile: boolean
}

export interface ParsedStackTrace {
  errorType: string
  message: string
  frames: ParsedStackFrame[]
}

// Common error patterns
const ERROR_PATTERNS = {
  // TypeScript errors: src/file.ts(10,5): error TS2322: ...
  typescript: /^(.+)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/m,

  // ESLint errors: /path/file.ts:10:5 - error rule-name: message
  eslint: /^(.+):(\d+):(\d+)\s*-\s*(error|warning)\s+(.+?):\s*(.+)$/m,

  // Next.js/Webpack errors
  nextjs: /^error\s*-\s*(.+)$/im,

  // Runtime errors (Node.js style)
  runtime: /^(\w+Error):\s*(.+)$/m,

  // Vite errors
  vite: /^\[vite\]\s*(error|warning):\s*(.+)$/im,

  // Generic file:line:col pattern
  generic: /^(.+):(\d+):(\d+):\s*(error|warning|Error|Warning):\s*(.+)$/m,
}

// Stack frame pattern
const STACK_FRAME_PATTERN = /at\s+(?:(.+?)\s+\()?(.+?):(\d+)(?::(\d+))?\)?/g

/**
 * Parse terminal output for errors
 */
export function parseTerminalOutput(output: string): DetectedError[] {
  const errors: DetectedError[] = []
  const lines = output.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check TypeScript errors
    const tsMatch = trimmed.match(ERROR_PATTERNS.typescript)
    if (tsMatch) {
      errors.push({
        type: 'type',
        severity: tsMatch[4] as 'error' | 'warning',
        message: tsMatch[6],
        file: tsMatch[1],
        line: parseInt(tsMatch[2]),
        column: parseInt(tsMatch[3]),
        source: 'typescript',
        code: tsMatch[5],
      })
      continue
    }

    // Check ESLint errors
    const eslintMatch = trimmed.match(ERROR_PATTERNS.eslint)
    if (eslintMatch) {
      errors.push({
        type: 'lint',
        severity: eslintMatch[4] as 'error' | 'warning',
        message: eslintMatch[6],
        file: eslintMatch[1],
        line: parseInt(eslintMatch[2]),
        column: parseInt(eslintMatch[3]),
        source: 'eslint',
        code: eslintMatch[5],
      })
      continue
    }

    // Check Vite errors
    const viteMatch = trimmed.match(ERROR_PATTERNS.vite)
    if (viteMatch) {
      errors.push({
        type: 'build',
        severity: viteMatch[1].toLowerCase() as 'error' | 'warning',
        message: viteMatch[2],
        source: 'vite',
      })
      continue
    }

    // Check generic file:line:col errors
    const genericMatch = trimmed.match(ERROR_PATTERNS.generic)
    if (genericMatch) {
      errors.push({
        type: 'syntax',
        severity: genericMatch[4].toLowerCase().includes('error') ? 'error' : 'warning',
        message: genericMatch[5],
        file: genericMatch[1],
        line: parseInt(genericMatch[2]),
        column: parseInt(genericMatch[3]),
        source: 'generic',
      })
      continue
    }

    // Check runtime errors
    const runtimeMatch = trimmed.match(ERROR_PATTERNS.runtime)
    if (runtimeMatch) {
      errors.push({
        type: 'runtime',
        severity: 'error',
        message: runtimeMatch[2],
        source: runtimeMatch[1],
      })
      continue
    }
  }

  return errors
}

/**
 * Parse a stack trace string into structured data
 */
export function parseStackTrace(stackTrace: string): ParsedStackTrace | null {
  const lines = stackTrace.split('\n')

  // Find the error message (usually first line)
  const errorLine = lines[0]
  const errorMatch = errorLine.match(/^(\w+(?:Error)?):?\s*(.*)$/)

  if (!errorMatch) return null

  const frames: ParsedStackFrame[] = []

  // Parse stack frames
  for (const line of lines.slice(1)) {
    const frameMatches = [...line.matchAll(STACK_FRAME_PATTERN)]
    for (const match of frameMatches) {
      const file = match[2]
      const isProjectFile = !file.includes('node_modules') &&
                           !file.startsWith('internal/') &&
                           !file.startsWith('<')

      frames.push({
        function: match[1] || '<anonymous>',
        file,
        line: parseInt(match[3]),
        column: match[4] ? parseInt(match[4]) : undefined,
        isProjectFile,
      })
    }
  }

  return {
    errorType: errorMatch[1],
    message: errorMatch[2] || 'Unknown error',
    frames,
  }
}

/**
 * Get project-relevant frames from a stack trace
 */
export function getProjectFrames(stackTrace: ParsedStackTrace): ParsedStackFrame[] {
  return stackTrace.frames.filter(f => f.isProjectFile)
}

/**
 * Format an error for display
 */
export function formatError(error: DetectedError): string {
  let formatted = ''

  if (error.file) {
    formatted += `${error.file}`
    if (error.line) {
      formatted += `:${error.line}`
      if (error.column) {
        formatted += `:${error.column}`
      }
    }
    formatted += ' - '
  }

  formatted += `${error.severity}: ${error.message}`

  if (error.code) {
    formatted += ` (${error.code})`
  }

  return formatted
}

/**
 * Group errors by file
 */
export function groupErrorsByFile(errors: DetectedError[]): Map<string, DetectedError[]> {
  const grouped = new Map<string, DetectedError[]>()

  for (const error of errors) {
    const file = error.file || 'Unknown'
    const existing = grouped.get(file) || []
    existing.push(error)
    grouped.set(file, existing)
  }

  return grouped
}

/**
 * Extract error context from code
 */
export function getErrorContext(
  code: string,
  line: number,
  contextLines: number = 2
): { before: string[]; errorLine: string; after: string[] } {
  const lines = code.split('\n')
  const lineIndex = line - 1 // Convert to 0-based index

  return {
    before: lines.slice(Math.max(0, lineIndex - contextLines), lineIndex),
    errorLine: lines[lineIndex] || '',
    after: lines.slice(lineIndex + 1, lineIndex + 1 + contextLines),
  }
}
