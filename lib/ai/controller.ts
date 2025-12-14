// Controller Service - GPT-4.1-mini
// Responsible for planning and outputting Unified App Schema (JSON only, no code)

import OpenAI from 'openai'
import type {
  UnifiedAppSchema,
  PlatformType,
  ControllerOutput,
  createEmptySchema,
} from '@/types/app-schema'
import type { AIMessage } from './types'

// Use GPT-4.1-mini for fast, efficient planning (can be overridden via env)
const CONTROLLER_MODEL = process.env.CONTROLLER_MODEL || 'gpt-4.1-mini'

// Helper to extract JSON from response (handles markdown code blocks)
function extractJSON(content: string): string {
  // Try to parse as-is first
  try {
    JSON.parse(content)
    return content
  } catch {
    // Not valid JSON, try to extract from markdown
  }

  // Remove markdown code blocks
  let cleaned = content
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()

  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    // Still not valid
  }

  // Try to find JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0])
      return jsonMatch[0]
    } catch {
      // Not valid
    }
  }

  return content
}

const CONTROLLER_SYSTEM_PROMPT = `You are an AI Controller that plans application architecture for a multi-platform app builder.

YOUR ROLE:
- Analyze user requirements and intent
- Design the application structure
- OUTPUT ONLY VALID JSON following the UnifiedAppSchema specification
- NEVER output code, HTML, CSS, JavaScript, or any programming language
- Only output structured planning data as JSON

PLATFORM SUPPORT:
- "website": Static HTML/CSS/JS sites
- "webapp": Next.js + Supabase + Authentication
- "mobile": React Native + Expo (iOS & Android)

UNIFIED APP SCHEMA STRUCTURE:
{
  "meta": {
    "name": "string - App name",
    "description": "string - App description",
    "platform": "website | webapp | mobile",
    "version": "string - Semantic version"
  },
  "design": {
    "theme": "light | dark | system",
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "foreground": "#hex",
      "muted": "#hex",
      "border": "#hex",
      "error": "#hex",
      "success": "#hex",
      "warning": "#hex"
    },
    "typography": {
      "headingFont": "string",
      "bodyFont": "string",
      "baseFontSize": number,
      "lineHeight": number
    },
    "spacing": "compact | normal | spacious",
    "borderRadius": "none | sm | md | lg | full",
    "shadows": boolean
  },
  "structure": {
    "pages": [{
      "id": "string",
      "name": "string",
      "path": "string - URL path",
      "type": "static | dynamic | protected",
      "title": "string",
      "description": "string",
      "components": ["componentId1", "componentId2"],
      "layout": "layoutId"
    }],
    "navigation": {
      "type": "tabs | drawer | stack | header | sidebar",
      "items": [{
        "id": "string",
        "label": "string",
        "path": "string",
        "icon": "string - icon name"
      }]
    },
    "layouts": [{
      "id": "string",
      "name": "string",
      "type": "default | dashboard | auth | marketing | minimal",
      "header": boolean,
      "footer": boolean,
      "sidebar": boolean
    }]
  },
  "features": {
    "auth": {
      "enabled": boolean,
      "providers": ["email", "google", "github"],
      "requireEmailVerification": boolean,
      "passwordMinLength": number
    },
    "database": {
      "provider": "supabase",
      "tables": [{
        "name": "string",
        "fields": [{
          "name": "string",
          "type": "string | number | boolean | date | json | uuid | text | email",
          "required": boolean,
          "unique": boolean
        }],
        "timestamps": boolean
      }]
    },
    "api": [{
      "name": "string",
      "basePath": "string",
      "endpoints": [{
        "path": "string",
        "method": "GET | POST | PUT | DELETE",
        "protected": boolean
      }]
    }],
    "storage": {
      "provider": "supabase",
      "buckets": [{
        "name": "string",
        "public": boolean
      }]
    }
  },
  "components": [{
    "id": "string",
    "name": "string",
    "type": "button | input | card | modal | nav | header | footer | hero | cta | form | table | list | etc",
    "props": [{
      "name": "string",
      "type": "string | number | boolean",
      "required": boolean
    }]
  }],
  "integrations": [{
    "type": "analytics | payment | email | sms",
    "provider": "string",
    "enabled": boolean
  }]
}

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "schema": { ... UnifiedAppSchema partial or complete ... },
  "reasoning": "Brief explanation of your planning decisions",
  "suggestions": ["Optional suggestions for the user"]
}

RULES:
1. Start with meta, design, and structure - these are essential
2. Add features only if the user mentions auth, database, or API needs
3. Define components based on what pages need
4. Be specific with paths, names, and IDs
5. Use descriptive IDs like "hero-section", "login-form", "nav-header"
6. Match the platform to user's needs (default to webapp if unclear)
7. Keep the schema focused and minimal - don't over-engineer`

export interface ControllerConfig {
  temperature?: number
  maxTokens?: number
}

export class Controller {
  private client: OpenAI
  private config: ControllerConfig

  constructor(config: ControllerConfig = {}) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.config = {
      temperature: config.temperature ?? 0.3, // Lower temperature for consistent JSON
      maxTokens: config.maxTokens ?? 4096,
    }
  }

  async plan(
    userPrompt: string,
    platform: PlatformType,
    existingSchema?: Partial<UnifiedAppSchema>,
    conversationHistory: AIMessage[] = []
  ): Promise<ControllerOutput> {
    const messages: AIMessage[] = [
      { role: 'system', content: CONTROLLER_SYSTEM_PROMPT },
      ...conversationHistory,
    ]

    // Add context about existing schema if updating
    if (existingSchema) {
      messages.push({
        role: 'system',
        content: `EXISTING SCHEMA (update this based on user request):\n${JSON.stringify(existingSchema, null, 2)}`,
      })
    }

    // Add platform context
    messages.push({
      role: 'system',
      content: `TARGET PLATFORM: ${platform}\nGenerate schema appropriate for this platform.`,
    })

    // Add user's request
    messages.push({
      role: 'user',
      content: userPrompt,
    })

    try {
      const response = await this.client.chat.completions.create({
        model: CONTROLLER_MODEL,
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
        throw new Error('No response from Controller')
      }

      const jsonContent = extractJSON(content)
      const parsed = JSON.parse(jsonContent) as ControllerOutput

      // Validate that we got a schema
      if (!parsed.schema) {
        throw new Error('Controller did not return a schema')
      }

      // Ensure platform is set correctly
      if (parsed.schema.meta) {
        parsed.schema.meta.platform = platform
      }

      return parsed
    } catch (error: any) {
      console.error('Controller error:', error)
      throw new Error(`Controller failed: ${error.message}`)
    }
  }

  async *streamPlan(
    userPrompt: string,
    platform: PlatformType,
    existingSchema?: Partial<UnifiedAppSchema>,
    conversationHistory: AIMessage[] = []
  ): AsyncGenerator<{ type: 'planning' | 'schema' | 'complete'; data: any }> {
    yield {
      type: 'planning',
      data: { phase: 'analyzing', message: 'Analyzing your requirements...' },
    }

    const messages: AIMessage[] = [
      { role: 'system', content: CONTROLLER_SYSTEM_PROMPT },
      ...conversationHistory,
    ]

    if (existingSchema) {
      messages.push({
        role: 'system',
        content: `EXISTING SCHEMA:\n${JSON.stringify(existingSchema, null, 2)}`,
      })
    }

    messages.push({
      role: 'system',
      content: `TARGET PLATFORM: ${platform}`,
    })

    messages.push({
      role: 'user',
      content: userPrompt,
    })

    yield {
      type: 'planning',
      data: { phase: 'designing', message: 'Designing application structure...' },
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: CONTROLLER_MODEL,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      })

      let fullContent = ''

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullContent += content
        }
      }

      // Parse the complete response
      try {
        const jsonContent = extractJSON(fullContent)
        const parsed = JSON.parse(jsonContent) as ControllerOutput

        if (parsed.schema?.meta) {
          parsed.schema.meta.platform = platform
        }

        yield {
          type: 'schema',
          data: { schema: parsed.schema, complete: true },
        }

        yield {
          type: 'complete',
          data: {
            schema: parsed.schema,
            reasoning: parsed.reasoning,
            suggestions: parsed.suggestions,
          },
        }
      } catch (parseError) {
        console.error('Failed to parse Controller response:', fullContent)
        throw new Error('Controller returned invalid JSON')
      }
    } catch (error: any) {
      console.error('Controller stream error:', error)
      // Provide more detailed error message
      const errorMessage = error?.error?.message || error?.message || 'Unknown error'
      const errorCode = error?.error?.code || error?.code || ''
      throw new Error(`Controller failed: ${errorMessage}${errorCode ? ` (${errorCode})` : ''}`)
    }
  }
}

// Singleton instance
let controllerInstance: Controller | null = null

export function getController(): Controller {
  if (!controllerInstance) {
    controllerInstance = new Controller()
  }
  return controllerInstance
}
