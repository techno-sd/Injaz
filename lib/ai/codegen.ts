// CodeGen Service - GPT-4.1
// Responsible for converting Unified App Schema to production-ready code

import OpenAI from 'openai'
import type {
  UnifiedAppSchema,
  PlatformType,
  CodeGenInput,
  CodeGenOutput,
} from '@/types/app-schema'
import type { AIMessage } from './types'

// Use GPT-4.1 for powerful code generation (can be overridden via env)
const CODEGEN_MODEL = process.env.CODEGEN_MODEL || 'gpt-4.1'

// Helper to extract JSON from response (handles markdown code blocks)
function extractJSON(content: string): string {
  // Try to parse as-is first
  try {
    JSON.parse(content)
    return content
  } catch {
    // Not valid JSON, try to extract from markdown
  }

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = content
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()

  // Try again
  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    // Still not valid, try to find JSON object
  }

  // Try to find JSON object in the content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0])
      return jsonMatch[0]
    } catch {
      // Not valid JSON object
    }
  }

  // Return original content and let caller handle the error
  return content
}

const getCodeGenSystemPrompt = (platform: PlatformType): string => {
  const basePrompt = `You are an expert code generator that converts application schemas into production-ready code.

YOUR ROLE:
- Receive a Unified App Schema (JSON)
- Generate complete, working code files
- Follow best practices for the target platform
- Output clean, maintainable, production-quality code

OUTPUT FORMAT:
You must respond with a JSON object:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "complete file content as string",
      "language": "typescript | javascript | css | html | json"
    }
  ],
  "dependencies": {
    "package-name": "^version"
  },
  "scripts": {
    "script-name": "command"
  }
}

RULES:
1. Generate ALL necessary files for a complete, working application
2. Include proper imports and exports
3. Use TypeScript where appropriate
4. Include error handling
5. Follow the schema exactly - don't add features not specified
6. Use semantic HTML and accessible patterns
7. Include responsive design considerations
8. Generate package.json with correct dependencies`

  const platformPrompts: Record<PlatformType, string> = {
    website: `
PLATFORM: Static Website (HTML/CSS/JS)

FILE STRUCTURE:
/
├── index.html
├── styles.css
├── script.js
└── assets/

GUIDELINES:
- Use vanilla HTML5, CSS3, JavaScript (ES6+)
- Include proper meta tags and SEO basics
- Make it responsive with CSS Grid/Flexbox
- Add smooth animations where appropriate
- Include favicon and basic assets setup
- No frameworks - pure vanilla code`,

    webapp: `
PLATFORM: Web Application (Next.js 14 + App Router + Supabase)

FILE STRUCTURE:
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── loading.tsx
│   └── [dynamic-routes]/
├── components/
│   └── ui/
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── types/
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json

GUIDELINES:
- Use Next.js 14 App Router with server components where possible
- Use Tailwind CSS for styling
- Set up Supabase client in lib/supabase.ts
- Include proper TypeScript types
- Use 'use client' directive only when needed
- Include loading.tsx for loading states
- Set up proper metadata for SEO
- Use shadcn/ui component patterns
- Include environment variable setup (.env.example)`,

    mobile: `
PLATFORM: Mobile Application (React Native + Expo Router)

FILE STRUCTURE:
/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [other-tabs].tsx
│   └── [screens]/
├── components/
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── constants/
│   └── Colors.ts
├── hooks/
├── app.json
├── package.json
├── tsconfig.json
└── expo-env.d.ts

GUIDELINES:
- Use Expo SDK 50+ with Expo Router
- Use React Native StyleSheet for styling
- Include platform-specific code where needed (Platform.OS)
- Set up Supabase client for mobile
- Use expo-secure-store for sensitive data
- Include proper app.json configuration
- Use Expo Vector Icons
- Follow React Native best practices
- Include safe area handling`,
  }

  return basePrompt + platformPrompts[platform]
}

export interface CodeGenConfig {
  temperature?: number
  maxTokens?: number
}

export class CodeGen {
  private client: OpenAI
  private config: CodeGenConfig

  constructor(config: CodeGenConfig = {}) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.config = {
      temperature: config.temperature ?? 0.2, // Low temperature for consistent code
      maxTokens: config.maxTokens ?? 16384, // High token limit for code generation
    }
  }

  async generate(input: CodeGenInput): Promise<CodeGenOutput> {
    const { schema, platform, targetFiles } = input

    const systemPrompt = getCodeGenSystemPrompt(platform)

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate code for this application schema:\n\n${JSON.stringify(schema, null, 2)}${
          targetFiles?.length
            ? `\n\nOnly generate these specific files: ${targetFiles.join(', ')}`
            : ''
        }`,
      },
    ]

    try {
      const response = await this.client.chat.completions.create({
        model: CODEGEN_MODEL,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from CodeGen')
      }

      const jsonContent = extractJSON(content)
      const parsed = JSON.parse(jsonContent) as CodeGenOutput

      if (!parsed.files || !Array.isArray(parsed.files)) {
        throw new Error('CodeGen did not return files array')
      }

      return parsed
    } catch (error: any) {
      console.error('CodeGen error:', error)
      throw new Error(`CodeGen failed: ${error.message}`)
    }
  }

  async *streamGenerate(
    input: CodeGenInput
  ): AsyncGenerator<{ type: 'generating' | 'file' | 'complete'; data: any }> {
    const { schema, platform, targetFiles } = input

    yield {
      type: 'generating',
      data: { file: 'Initializing code generation...', progress: 0, total: 100 },
    }

    const systemPrompt = getCodeGenSystemPrompt(platform)

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate code for this application schema:\n\n${JSON.stringify(schema, null, 2)}${
          targetFiles?.length
            ? `\n\nOnly generate these specific files: ${targetFiles.join(', ')}`
            : ''
        }`,
      },
    ]

    yield {
      type: 'generating',
      data: { file: 'Generating application files...', progress: 10, total: 100 },
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: CODEGEN_MODEL,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      })

      let fullContent = ''
      let progress = 10

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullContent += content
          progress = Math.min(90, progress + 0.5)

          // Try to detect file being generated from partial JSON
          const fileMatch = fullContent.match(/"path":\s*"([^"]+)"[^}]*$/)
          if (fileMatch) {
            yield {
              type: 'generating',
              data: { file: fileMatch[1], progress: Math.floor(progress), total: 100 },
            }
          }
        }
      }

      yield {
        type: 'generating',
        data: { file: 'Finalizing...', progress: 95, total: 100 },
      }

      // Parse the complete response
      try {
        const jsonContent = extractJSON(fullContent)
        const parsed = JSON.parse(jsonContent) as CodeGenOutput

        if (!parsed.files || !Array.isArray(parsed.files)) {
          throw new Error('CodeGen did not return files array')
        }

        // Yield each file
        for (let i = 0; i < parsed.files.length; i++) {
          const file = parsed.files[i]
          yield {
            type: 'file',
            data: {
              path: file.path,
              content: file.content,
              language: file.language,
              index: i + 1,
              total: parsed.files.length,
            },
          }
        }

        yield {
          type: 'complete',
          data: {
            files: parsed.files,
            dependencies: parsed.dependencies,
            scripts: parsed.scripts,
            totalFiles: parsed.files.length,
          },
        }
      } catch (parseError) {
        console.error('Failed to parse CodeGen response:', fullContent.slice(0, 500))
        throw new Error('CodeGen returned invalid JSON')
      }
    } catch (error: any) {
      console.error('CodeGen stream error:', error)
      const errorMessage = error?.error?.message || error?.message || 'Unknown error'
      const errorCode = error?.error?.code || error?.code || ''
      throw new Error(`CodeGen failed: ${errorMessage}${errorCode ? ` (${errorCode})` : ''}`)
    }
  }

  // Generate a single file (useful for updates)
  async generateFile(
    schema: UnifiedAppSchema,
    platform: PlatformType,
    filePath: string,
    context?: string
  ): Promise<{ path: string; content: string; language: string }> {
    const systemPrompt =
      getCodeGenSystemPrompt(platform) +
      `

SINGLE FILE MODE:
Generate only the file at path: ${filePath}
Return JSON: { "files": [{ "path": "${filePath}", "content": "...", "language": "..." }] }`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Schema:\n${JSON.stringify(schema, null, 2)}${context ? `\n\nContext: ${context}` : ''}`,
      },
    ]

    const response = await this.client.chat.completions.create({
      model: CODEGEN_MODEL,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      temperature: this.config.temperature,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from CodeGen')
    }

    const parsed = JSON.parse(content)
    if (!parsed.files?.[0]) {
      throw new Error('CodeGen did not return file')
    }

    return parsed.files[0]
  }
}

// Singleton instance
let codeGenInstance: CodeGen | null = null

export function getCodeGen(): CodeGen {
  if (!codeGenInstance) {
    codeGenInstance = new CodeGen()
  }
  return codeGenInstance
}
