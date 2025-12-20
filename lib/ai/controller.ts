// Controller Service - DeepSeek V3.2 via OpenRouter
// Responsible for planning and outputting Unified App Schema (JSON only, no code)

import OpenAI from 'openai'
import type {
  UnifiedAppSchema,
  PlatformType,
  ControllerOutput,
  createEmptySchema,
} from '@/types/app-schema'
import type { AIMessage } from './types'

// Model from env (required - no fallback, must be configured in .env.local)
if (!process.env.CONTROLLER_MODEL) {
  throw new Error('CONTROLLER_MODEL environment variable is required. Set it in .env.local')
}
const CONTROLLER_MODEL: string = process.env.CONTROLLER_MODEL

// Helper to repair truncated or malformed JSON
function repairTruncatedJSON(content: string): string {
  let repaired = content.trim()

  // Fix common JSON syntax issues
  // 1. Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1')

  // 2. Fix missing commas between properties (e.g., "key": "value" "key2")
  repaired = repaired.replace(/(")\s*\n\s*(")/g, '$1,\n$2')
  repaired = repaired.replace(/(})\s*\n\s*(")/g, '$1,\n$2')
  repaired = repaired.replace(/(])\s*\n\s*(")/g, '$1,\n$2')
  repaired = repaired.replace(/(")\s+(")/g, '$1, $2')

  // 3. Fix unescaped newlines in strings (common with code content)
  // This is tricky - we need to escape newlines that are inside strings

  // 4. Remove any control characters except \n, \r, \t
  repaired = repaired.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')

  // Count open/close braces and brackets, tracking if we're in a string
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === '{') braceCount++
      else if (char === '}') braceCount--
      else if (char === '[') bracketCount++
      else if (char === ']') bracketCount--
    }
  }

  // If we're in the middle of a string, close it
  if (inString) {
    // Try to find the last complete property and truncate there
    const lastCompleteProperty = repaired.lastIndexOf('",')
    if (lastCompleteProperty > repaired.length * 0.8) {
      // If we're near the end, truncate at the last complete property
      repaired = repaired.substring(0, lastCompleteProperty + 2)
      // Recount braces
      braceCount = 0
      bracketCount = 0
      for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '{') braceCount++
        else if (repaired[i] === '}') braceCount--
        else if (repaired[i] === '[') bracketCount++
        else if (repaired[i] === ']') bracketCount--
      }
    } else {
      repaired += '"'
    }
  }

  // Close unclosed brackets first, then braces
  while (bracketCount > 0) {
    repaired += ']'
    bracketCount--
  }

  while (braceCount > 0) {
    repaired += '}'
    braceCount--
  }

  return repaired
}

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
    .replace(/^```(?:json)?\s*\n?/gim, '')
    .replace(/\n?```\s*$/gim, '')
    .trim()

  // Try again
  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    // Still not valid, try to find JSON object
  }

  // Try to find the first complete JSON object using bracket counting
  let braceDepth = 0
  let startIdx = -1
  let endIdx = -1

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (braceDepth === 0) startIdx = i
      braceDepth++
    } else if (content[i] === '}') {
      braceDepth--
      if (braceDepth === 0 && startIdx !== -1) {
        endIdx = i
        break
      }
    }
  }

  if (startIdx !== -1 && endIdx !== -1) {
    const extracted = content.slice(startIdx, endIdx + 1)
    try {
      JSON.parse(extracted)
      return extracted
    } catch {
      // Not valid JSON
    }
  }

  // Last resort: try regex match
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0])
      return jsonMatch[0]
    } catch {
      // Not valid JSON object
    }
  }

  // Try to repair truncated JSON
  if (startIdx !== -1) {
    const partialJSON = content.slice(startIdx)
    const repaired = repairTruncatedJSON(partialJSON)
    try {
      JSON.parse(repaired)
      console.warn('Controller response was truncated but successfully repaired')
      return repaired
    } catch {
      // Repair failed
    }
  }

  // Return original content and let caller handle the error
  return content
}

const CONTROLLER_SYSTEM_PROMPT = `You are an elite AI Controller that designs world-class application architectures rivaling Lovable, Bolt.new, and v0.dev outputs.

YOUR ROLE:
- Transform user ideas into comprehensive, production-ready application blueprints
- Design with modern 2024-2025 UI/UX patterns (glassmorphism, gradients, micro-interactions)
- Create architectures that result in STUNNING, FUNCTIONAL applications
- OUTPUT ONLY VALID JSON following the UnifiedAppSchema specification

CRITICAL REQUIREMENTS:
- Design for VISUAL EXCELLENCE - every app should look professionally designed
- Include REALISTIC sample content - no Lorem Ipsum, real headlines and descriptions
- Plan for COMPLETE functionality - not just UI shells
- Consider mobile-first responsive design
- Include loading states, error states, and empty states in your planning

IMPORTANT: Return ONLY raw JSON. Do NOT wrap in markdown code blocks like \`\`\`json. Do NOT include any text before or after the JSON.

PLATFORM SUPPORT:
- "website": Vite + React + Tailwind CSS (SPA)
- "webapp": Vite + React + Supabase + Authentication (same stack as Lovable)

SUB-PLATFORM CATEGORIES (Use to specialize the app):
Website sub-platforms: "portfolio", "blog", "landing", "business"
Webapp sub-platforms: "dashboard", "ecommerce", "saas", "social"

Always set the appropriate subPlatform in meta based on user's request.

UNIFIED APP SCHEMA STRUCTURE:
{
  "meta": {
    "name": "string - App name",
    "description": "string - App description",
    "platform": "website | webapp",
    "subPlatform": "string - portfolio | blog | landing | business | dashboard | ecommerce | saas | social",
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
    "shadows": boolean,
    "responsive": {
      "strategy": "mobile-first | desktop-first",
      "breakpoints": { "sm": 640, "md": 768, "lg": 1024, "xl": 1280, "2xl": 1536 },
      "defaultPadding": { "mobile": "1rem", "tablet": "1.5rem", "desktop": "2rem" }
    }
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
    },
    "pwa": {
      "enabled": boolean,
      "name": "string - PWA app name",
      "shortName": "string - Short name for home screen",
      "themeColor": "#hex",
      "backgroundColor": "#hex",
      "display": "standalone | fullscreen | minimal-ui",
      "serviceWorker": {
        "enabled": boolean,
        "cachingStrategy": "cache-first | network-first | stale-while-revalidate"
      }
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
7. Keep the schema focused and minimal - don't over-engineer
8. ALWAYS set subPlatform based on the app type (portfolio, dashboard, ecommerce, etc.)
9. ALWAYS include responsive config with mobile-first strategy
10. For webapps: ALWAYS enable PWA in features for installability and offline support
11. Plan navigation for both desktop (header) and mobile (hamburger/drawer)

INDUSTRY BEST PRACTICES - Apply these when planning:

UI/UX DESIGN:
- Mobile-first responsive design approach
- Consistent 8px spacing grid system
- Accessible color contrast (WCAG 2.1 AA minimum - 4.5:1 for text)
- Clear visual hierarchy with modular typography scale (1.25 ratio)
- Intuitive navigation (max 7 items, clear labels)
- Include loading states and skeleton screens for async content
- Plan error states with helpful recovery messages
- Design empty states with clear calls-to-action

USER EXPERIENCE:
- Maximum 3 clicks to reach any content
- Form validation with inline real-time feedback
- Optimistic UI updates for better perceived performance
- Progressive disclosure for complex features
- Clear feedback for all user actions (hover, active, focus states)
- Keyboard navigation support for all interactive elements
- Touch-friendly tap targets (minimum 44x44px)
- Smooth micro-interactions (200-300ms transitions)

ARCHITECTURE:
- Separation of concerns (UI components, business logic, data layer)
- Component-based architecture with reusable primitives
- Design tokens for colors, spacing, typography, shadows
- Consistent BEM-style naming conventions
- Logical file organization by feature or type
- API-first data design with proper endpoints

SECURITY BY DEFAULT:
- Mark sensitive routes as "protected" type
- Plan input validation for all form fields
- Use environment variables for any secrets/keys
- Include CSRF considerations for forms
- Plan secure data storage patterns

ACCESSIBILITY (A11Y):
- Semantic HTML structure in component hierarchy
- ARIA labels for all interactive elements
- Focus management for modals and dialogs
- Screen reader friendly content flow
- Color-blind friendly palette (avoid red/green only indicators)
- Reduced motion support (respect prefers-reduced-motion)

PERFORMANCE:
- Lazy loading for images and below-fold content
- Code splitting at route level
- Optimized asset loading strategy
- Caching strategies for static content
- Minimal external dependencies

SAMPLE CONTENT - Always include realistic placeholder content:
- Use descriptive, industry-appropriate text (not Lorem Ipsum)
- Include realistic product names, descriptions, prices
- Add sample user testimonials with names and roles
- Plan for sample images using Unsplash URLs: https://images.unsplash.com/photo-{id}?w={width}&h={height}
- Include sample navigation items relevant to the app type
- Add realistic CTA button text (not "Click Here")
- Use appropriate sample data for forms, tables, and lists

MODERN UI/UX DESIGN TRENDS (2024-2025):

VISUAL DESIGN:
- Glassmorphism: Frosted glass effects with backdrop-blur and subtle transparency
- Gradient meshes: Multi-color gradients for backgrounds and accents
- Bento grid layouts: Asymmetric card-based layouts inspired by Apple
- Soft shadows: Large, diffused shadows (0 25px 50px -12px rgba(0,0,0,0.15))
- Rounded corners: Generous border-radius (16-24px for cards, 12px for buttons)
- Subtle borders: Very light borders (1px solid rgba(255,255,255,0.1))
- Dark mode first: Design for dark mode, adapt for light
- Vibrant accent colors on dark backgrounds

TYPOGRAPHY:
- Large, bold headlines (48-72px on desktop)
- Variable fonts for performance and flexibility
- High contrast between heading and body weights
- Generous line-height (1.5-1.7 for body text)
- Letter-spacing: tight for headlines (-0.02em), normal for body

MICRO-INTERACTIONS:
- Hover lift effects with shadow increase
- Button press animations (scale 0.98)
- Smooth page transitions (fade, slide)
- Loading skeleton animations with shimmer
- Success/error state animations
- Scroll-triggered reveal animations

MODERN LAYOUTS:
- Full-width hero sections with centered content
- Sticky navigation with blur background on scroll
- Floating action buttons for mobile
- Card-based content organization
- Asymmetric grids for visual interest
- Generous whitespace (padding 80-120px between sections)

COMPONENT PATTERNS:
- Floating labels for form inputs
- Toast notifications (bottom-right or top-center)
- Command palette (Cmd+K) for power users
- Inline editing for data
- Drag and drop interactions
- Infinite scroll with skeleton loading
- Pull-to-refresh on mobile

COLOR SCHEMES (Modern Palettes):
- Primary: Deep purples (#7c3aed), Electric blues (#3b82f6), Vibrant greens (#10b981)
- Backgrounds: Near-black (#0a0a0f), Dark gray (#18181b), Off-white (#fafafa)
- Accents: Gradient combinations (purple-to-pink, blue-to-cyan)
- Text: High contrast (#fafafa on dark, #18181b on light)

ANIMATION TIMING:
- Micro-interactions: 150-200ms
- Page transitions: 300-400ms
- Content reveals: 400-600ms with stagger
- Easing: cubic-bezier(0.4, 0, 0.2, 1) for smooth motion`

export interface ControllerConfig {
  temperature?: number
  maxTokens?: number
}

export class Controller {
  private client: OpenAI
  private config: ControllerConfig

  constructor(config: ControllerConfig = {}) {
    // Prefer OpenRouter, fallback to OpenAI
    if (process.env.OPENROUTER_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Injaz.ai',
        },
      })
    } else if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } else {
      throw new Error('No AI API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY')
    }
    this.config = {
      temperature: config.temperature ?? 0.3, // Lower temperature for consistent JSON
      maxTokens: config.maxTokens ?? 8192, // Increased for complex schemas
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
    // Emit detailed subtasks for Bolt-style activity log
    yield {
      type: 'planning',
      data: {
        phase: 'analyzing',
        message: 'Analyzing requirements',
        subtask: 'requirements',
        status: 'running',
      },
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

    // Mark requirements as complete, start platform analysis
    yield {
      type: 'planning',
      data: {
        phase: 'analyzing',
        message: 'Setting up platform',
        subtask: 'requirements',
        status: 'complete',
      },
    }

    yield {
      type: 'planning',
      data: {
        phase: 'analyzing',
        message: 'Configuring platform',
        subtask: 'platform',
        status: 'running',
        detail: platform,
      },
    }

    messages.push({
      role: 'system',
      content: `TARGET PLATFORM: ${platform}`,
    })

    messages.push({
      role: 'user',
      content: userPrompt,
    })

    // Mark platform as complete, start designing
    yield {
      type: 'planning',
      data: {
        phase: 'designing',
        message: 'Planning architecture',
        subtask: 'platform',
        status: 'complete',
      },
    }

    yield {
      type: 'planning',
      data: {
        phase: 'designing',
        message: 'Designing app structure',
        subtask: 'structure',
        status: 'running',
      },
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
      let lastYieldTime = Date.now()
      let hasEmittedDesign = false
      let hasEmittedComponents = false
      let hasEmittedFeatures = false

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullContent += content

          // Emit subtask updates based on content being generated
          const now = Date.now()
          if (now - lastYieldTime > 500) {
            // Check what section is being generated and emit relevant subtasks
            if (fullContent.includes('"design"') && !hasEmittedDesign) {
              hasEmittedDesign = true
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Configuring design system',
                  subtask: 'structure',
                  status: 'complete',
                },
              }
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Setting up colors & typography',
                  subtask: 'design',
                  status: 'running',
                },
              }
            } else if (fullContent.includes('"components"') && !hasEmittedComponents) {
              hasEmittedComponents = true
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Planning components',
                  subtask: 'design',
                  status: 'complete',
                },
              }
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Defining UI components',
                  subtask: 'components',
                  status: 'running',
                },
              }
            } else if (fullContent.includes('"features"') && !hasEmittedFeatures) {
              hasEmittedFeatures = true
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Configuring features',
                  subtask: 'components',
                  status: 'complete',
                },
              }
              yield {
                type: 'planning',
                data: {
                  phase: 'designing',
                  message: 'Setting up app features',
                  subtask: 'features',
                  status: 'running',
                },
              }
            }
            lastYieldTime = now
          }
        }
      }

      // Mark all subtasks complete
      yield {
        type: 'planning',
        data: {
          phase: 'finalizing',
          message: 'Finalizing schema',
          subtask: hasEmittedFeatures ? 'features' : hasEmittedComponents ? 'components' : hasEmittedDesign ? 'design' : 'structure',
          status: 'complete',
        },
      }

      yield {
        type: 'planning',
        data: {
          phase: 'finalizing',
          message: 'Validating configuration',
          subtask: 'validation',
          status: 'running',
        },
      }

      // Parse the complete response
      try {
        // Check if we got any content at all
        if (!fullContent || fullContent.trim() === '') {
          throw new Error('Controller returned empty response - check API key and model availability')
        }

        const jsonContent = extractJSON(fullContent)
        const parsed = JSON.parse(jsonContent) as ControllerOutput

        if (parsed.schema?.meta) {
          parsed.schema.meta.platform = platform
        }

        // Mark validation complete
        yield {
          type: 'planning',
          data: {
            phase: 'finalizing',
            message: 'Schema ready',
            subtask: 'validation',
            status: 'complete',
          },
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
      } catch (parseError: any) {
        console.error('Failed to parse Controller response:', fullContent)
        console.error('Parse error details:', parseError.message)

        // Check for specific issues
        const hasOpenBrace = fullContent?.includes('{')
        const openBraces = (fullContent?.match(/{/g) || []).length
        const closeBraces = (fullContent?.match(/}/g) || []).length
        const isTruncated = openBraces > closeBraces

        // Provide more helpful error message
        let errorDetail: string
        if (!hasOpenBrace) {
          errorDetail = 'AI did not return JSON (check model/API key)'
        } else if (isTruncated) {
          errorDetail = `JSON truncated (${openBraces} open braces, ${closeBraces} close braces) - response may have been cut off`
        } else {
          errorDetail = `Invalid JSON structure: ${parseError.message}`
        }

        const contentPreview = fullContent?.slice(0, 300) || '(empty)'
        const contentEnd = fullContent?.length > 300 ? fullContent?.slice(-100) : ''

        console.error('Content preview:', contentPreview)
        if (contentEnd) console.error('Content end:', contentEnd)

        throw new Error(`Controller failed: ${errorDetail}`)
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
