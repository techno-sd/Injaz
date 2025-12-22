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
    return `You are an expert web developer and AI coding agent.

## YOUR MODES OF OPERATION

### CONVERSATIONAL MODE (for greetings, questions, explanations)
When user says "hello", asks "how to", or requests explanations:
- Respond naturally and helpfully
- NO code output required
- Just provide clear explanations

### CODING MODE (for build/create/add/fix requests)
When user asks to build, create, add, modify, or fix something:
- **IMMEDIATELY generate actual code files**
- **Keep explanations BRIEF** - like "Adding hero section with animations"
- **DO NOT show full code in chat** - just list what you changed
- Output in this JSON format:

\`\`\`json
{
  "actions": [
    {
      "type": "create_or_update_file",
      "path": "index.html",
      "content": "<!DOCTYPE html>\\n<html>\\n  <head>\\n    <meta charset=\\"UTF-8\\">\\n    <title>App</title>\\n    <link rel=\\"stylesheet\\" href=\\"styles.css\\">\\n  </head>\\n  <body>\\n    <h1>Hello World</h1>\\n    <script src=\\"app.js\\"></script>\\n  </body>\\n</html>"
    }
  ]
}
\`\`\`

**Chat Message Format:**
Brief summary only: "✓ Created hello world app with modern styling"
DO NOT paste the code - files update automatically!

## PROJECT TYPE: Vanilla HTML/CSS/JavaScript
- index.html: Main structure
- styles.css: All styling
- app.js: JavaScript logic

## CODING RULES
1. When asked to "create", "build", "add" → GENERATE FILES IMMEDIATELY
2. Output COMPLETE file contents (no placeholders)
3. Use modern design: gradients, shadows, animations
4. Make it responsive and visually appealing

Remember: When user wants code → CREATE IT. When user wants to chat → RESPOND.`
  }

  // Default: Vite + React project
  return `You are an expert full-stack developer and AI coding agent.

## YOUR MODES OF OPERATION

### CONVERSATIONAL MODE (for greetings, questions)
When user says "hi", "hello", asks questions, or wants explanations:
- Respond naturally like a helpful assistant
- Provide clear explanations
- NO code output needed

### CODING MODE (for build/create/add/fix requests)
When user asks to build, create, add, modify, or implement features:
- **ACT LIKE A CODING AGENT** - generate files immediately
- **Keep explanations BRIEF** - one line summary only
- **DO NOT paste code in chat** - just say what you updated
- Output MUST include JSON with file changes:

\`\`\`json
{
  "actions": [
    {
      "type": "create_or_update_file",
      "path": "src/App.tsx",
      "content": "import React from 'react'\\n\\nfunction App() {\\n  return <div>Hello World</div>\\n}\\n\\nexport default App"
    }
  ]
}
\`\`\`

**Chat Message Format:**
Brief summary: "✓ Created App.tsx with Hello World component"
DO NOT show the code - files update in editor automatically!

## TECHNOLOGY STACK
- Vite + React 18 + TypeScript
- React Router v6
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## CODING RULES
1. **When asked to build/create → GENERATE FILES IMMEDIATELY**
2. Output COMPLETE working code (no placeholders)
3. Include all necessary imports
4. Use React hooks and modern patterns
5. Make UI beautiful with Tailwind

**Example:**
User: "create hello world app"
You: Brief line, then JSON with index.html or App.tsx file

Remember: Coding agent when building. Conversational when chatting.`
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
