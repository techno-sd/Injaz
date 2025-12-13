import type { File, Message } from '@/types'

// Simple token estimation (roughly 4 chars per token)
// For production, consider using tiktoken library
const CHARS_PER_TOKEN = 4

export interface ContextFile {
  path: string
  content: string
  language: string
  relevanceScore: number
  tokenCount: number
}

export interface ContextManagerConfig {
  maxContextTokens: number
  reserveTokensForResponse: number
  includeFileContents: boolean
  prioritizeActiveFile: boolean
  prioritizeRecentFiles: boolean
  maxFilesInContext: number
}

export interface ContextResult {
  files: ContextFile[]
  systemPrompt: string
  totalTokens: number
  truncated: boolean
}

const DEFAULT_CONFIG: ContextManagerConfig = {
  maxContextTokens: 100000, // 100k tokens for most models
  reserveTokensForResponse: 4000, // Reserve 4k for response
  includeFileContents: true,
  prioritizeActiveFile: true,
  prioritizeRecentFiles: true,
  maxFilesInContext: 50,
}

// Estimate token count for a string
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

// Calculate relevance score for a file based on various factors
function calculateRelevanceScore(
  file: File,
  activeFilePath: string | null,
  recentMessages: Message[],
  config: ContextManagerConfig
): number {
  let score = 0

  // Active file gets highest priority
  if (config.prioritizeActiveFile && file.path === activeFilePath) {
    score += 100
  }

  // Entry point files get high priority
  const entryPointPatterns = [
    /^index\.[jt]sx?$/,
    /^main\.[jt]sx?$/,
    /^app\.[jt]sx?$/,
    /^page\.[jt]sx?$/,
    /^layout\.[jt]sx?$/,
    /package\.json$/,
    /tsconfig\.json$/,
    /next\.config\.[jm]?[st]?$/,
  ]

  const fileName = file.path.split('/').pop() || ''
  if (entryPointPatterns.some(p => p.test(fileName))) {
    score += 30
  }

  // Files mentioned in recent messages get priority
  const recentContent = recentMessages
    .slice(-5)
    .map(m => m.content)
    .join(' ')
    .toLowerCase()

  if (recentContent.includes(file.path.toLowerCase())) {
    score += 50
  }

  // Source files in common directories get higher priority
  const sourceDirs = ['src/', 'app/', 'components/', 'lib/', 'pages/', 'hooks/']
  if (sourceDirs.some(dir => file.path.includes(dir))) {
    score += 10
  }

  // TypeScript/JavaScript files get higher priority
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']
  if (codeExtensions.some(ext => file.path.endsWith(ext))) {
    score += 15
  }

  // Recently modified files (if we had timestamp) would get priority
  // For now, we use the id as a proxy (newer files have later ids)
  // This is a rough heuristic

  return score
}

// Build optimized file context
function buildFileContext(
  files: File[],
  activeFilePath: string | null,
  messages: Message[],
  config: ContextManagerConfig
): ContextFile[] {
  // Calculate relevance scores and token counts
  const contextFiles: ContextFile[] = files.map(file => ({
    path: file.path,
    content: file.content || '',
    language: file.language || 'plaintext',
    relevanceScore: calculateRelevanceScore(file, activeFilePath, messages, config),
    tokenCount: estimateTokens(file.content || ''),
  }))

  // Sort by relevance score (descending)
  contextFiles.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Limit to max files
  return contextFiles.slice(0, config.maxFilesInContext)
}

// Build optimized context for AI
export function buildContext(
  files: File[],
  messages: Message[],
  activeFilePath: string | null = null,
  userConfig: Partial<ContextManagerConfig> = {}
): ContextResult {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const availableTokens = config.maxContextTokens - config.reserveTokensForResponse

  // Get sorted and scored files
  const contextFiles = buildFileContext(files, activeFilePath, messages, config)

  // Build system prompt (pass files to detect project type)
  let systemPrompt = buildSystemPrompt(config, files)
  let systemPromptTokens = estimateTokens(systemPrompt)
  let usedTokens = systemPromptTokens

  // Add files to context, respecting token budget
  const includedFiles: ContextFile[] = []
  let truncated = false

  for (const file of contextFiles) {
    // Check if we can include file content
    const fileEntry = config.includeFileContents
      ? `\n\n### ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``
      : `\n- ${file.path} (${file.language})`

    const fileTokens = estimateTokens(fileEntry)

    if (usedTokens + fileTokens <= availableTokens) {
      usedTokens += fileTokens
      includedFiles.push(file)
    } else {
      truncated = true
      // If we can't include full content, at least list the file
      if (config.includeFileContents) {
        const listEntry = `\n- ${file.path} (${file.language}) [content omitted]`
        const listTokens = estimateTokens(listEntry)
        if (usedTokens + listTokens <= availableTokens) {
          usedTokens += listTokens
          includedFiles.push({
            ...file,
            content: '', // Content omitted
            tokenCount: listTokens,
          })
        }
      }
    }
  }

  // Build final system prompt with file contents
  let finalPrompt = systemPrompt + '\n\n## PROJECT FILES\n'

  if (config.includeFileContents) {
    for (const file of includedFiles) {
      if (file.content) {
        finalPrompt += `\n### ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n`
      } else {
        finalPrompt += `- ${file.path} (${file.language}) [content omitted due to context limits]\n`
      }
    }
  } else {
    finalPrompt += includedFiles.map(f => `- ${f.path} (${f.language})`).join('\n')
  }

  if (truncated) {
    finalPrompt += '\n\n*Note: Some files were omitted due to context length limits.*'
  }

  return {
    files: includedFiles,
    systemPrompt: finalPrompt,
    totalTokens: usedTokens,
    truncated,
  }
}

function buildSystemPrompt(config: ContextManagerConfig, files: File[] = []): string {
  // Detect project type from files
  const hasPackageJson = files.some(f => f.path === 'package.json')
  const hasIndexHtml = files.some(f => f.path === 'index.html')
  const hasTsx = files.some(f => f.path.endsWith('.tsx'))

  const isVanillaProject = hasIndexHtml && !hasPackageJson && !hasTsx

  if (isVanillaProject) {
    return `You are an expert web developer. Your job is to BUILD complete, working applications based on user requests.

## CRITICAL: YOU MUST OUTPUT CODE
Every response MUST include a JSON block with file changes. DO NOT just describe what you'll do - WRITE THE ACTUAL CODE.

## OUTPUT FORMAT (REQUIRED)
After a brief explanation, output this JSON block:
\`\`\`json
{
  "actions": [
    {
      "type": "create_or_update_file",
      "path": "index.html",
      "content": "<!DOCTYPE html>\\n<html>... COMPLETE HTML HERE ...</html>"
    },
    {
      "type": "create_or_update_file",
      "path": "styles.css",
      "content": "/* Complete CSS */\\nbody { ... }"
    },
    {
      "type": "create_or_update_file",
      "path": "app.js",
      "content": "// Complete JavaScript\\nconsole.log('App ready');"
    }
  ]
}
\`\`\`

## PROJECT TYPE: Vanilla HTML/CSS/JavaScript
- index.html: Main HTML structure
- styles.css: All CSS styles (use modern CSS, animations, gradients)
- app.js: JavaScript functionality

## DESIGN REQUIREMENTS
- Use modern, beautiful design with gradients, shadows, smooth animations
- Make it responsive (works on mobile and desktop)
- Use CSS custom properties for colors
- Add hover effects and transitions
- Use a professional color scheme

## RULES
1. ALWAYS output complete file contents - never partial code
2. NEVER use placeholders like "// rest of code here"
3. ALWAYS include the JSON block with actions
4. Create visually stunning, modern designs
5. Make sure code is working and complete

NOW BUILD THE APP. Write the code immediately.`
  }

  // Default: Next.js/React project
  return `You are an expert full-stack developer helping build web applications. You MUST respond with actual code changes, not just acknowledgments.

## CRITICAL: ALWAYS OUTPUT JSON WITH CODE
Every response MUST include the JSON block with actual file changes. Do NOT just say you'll help - ACTUALLY DO THE WORK.

**REQUIRED FORMAT:**
\`\`\`json
{
  "actions": [
    {
      "type": "create_or_update_file",
      "path": "app/page.tsx",
      "content": "COMPLETE working code here"
    }
  ],
  "explanation": "What you changed and why"
}
\`\`\`

**EXAMPLE USER REQUEST:** "Add a hero section"
**YOUR RESPONSE:** Brief explanation, then immediately the JSON block with the complete updated file content.

## TECHNOLOGY STACK
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## RULES
1. Output COMPLETE file contents (never partial code)
2. NO "// rest of the code" placeholders
3. Use "use client" for components with hooks/events
4. Always include all imports
5. Provide working, production-ready code

Start coding immediately - analyze the request, write the code, output the JSON.`
}

// Utility to extract file references from messages
export function extractFileReferences(messages: Message[]): string[] {
  const filePatterns = [
    /`([^`]+\.[a-z]+)`/gi, // Files in backticks
    /(?:in|from|file|path)\s+["']?([^\s"']+\.[a-z]+)["']?/gi, // File references
    /(?:components?|pages?|lib|hooks?|utils?)\/[^\s]+\.[a-z]+/gi, // Path patterns
  ]

  const references = new Set<string>()

  for (const message of messages) {
    for (const pattern of filePatterns) {
      const matches = message.content.matchAll(pattern)
      for (const match of matches) {
        const ref = match[1] || match[0]
        if (ref && !ref.includes(' ')) {
          references.add(ref)
        }
      }
    }
  }

  return Array.from(references)
}
