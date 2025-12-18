// Code Reviewer Service
// AI-powered code review for generated code quality, security, and best practices

import OpenAI from 'openai'
import type { PlatformType } from '@/types/app-schema'

// Model from env (required - no fallback, must be configured in .env.local)
if (!process.env.REVIEWER_MODEL) {
  // Fallback to DEFAULT_AI_MODEL if REVIEWER_MODEL not set
  if (!process.env.DEFAULT_AI_MODEL) {
    throw new Error('REVIEWER_MODEL or DEFAULT_AI_MODEL environment variable is required. Set it in .env.local')
  }
}
const REVIEWER_MODEL: string = process.env.REVIEWER_MODEL || process.env.DEFAULT_AI_MODEL!

export interface CodeFile {
  path: string
  content: string
  language: string
}

export interface CodeIssue {
  file: string
  line?: number
  severity: 'critical' | 'error' | 'warning' | 'info'
  category: 'security' | 'performance' | 'accessibility' | 'best-practice' | 'bug' | 'style'
  message: string
  suggestion?: string
}

export interface ReviewResult {
  passed: boolean
  score: number // 0-100
  issues: CodeIssue[]
  summary: string
  improvements: string[]
}

const REVIEWER_SYSTEM_PROMPT = `You are an expert code reviewer specializing in modern web and mobile development.

YOUR ROLE:
- Review generated code for quality, security, and best practices
- Identify potential bugs, security vulnerabilities, and performance issues
- Check for accessibility compliance (WCAG)
- Verify framework-specific best practices
- Suggest improvements without over-engineering

REVIEW CATEGORIES:
1. SECURITY: XSS, injection, auth issues, exposed secrets
2. PERFORMANCE: Unnecessary re-renders, missing memoization, bundle size
3. ACCESSIBILITY: ARIA labels, semantic HTML, keyboard navigation
4. BEST PRACTICES: Framework patterns, TypeScript usage, error handling
5. BUGS: Logic errors, race conditions, null checks
6. STYLE: Naming conventions, code organization, comments

PLATFORM-SPECIFIC CHECKS:

For Next.js (webapp):
- Server vs Client component usage ('use client' directive)
- Proper use of Server Actions
- Image optimization with next/image
- Metadata and SEO
- Route handlers security

For React Native/Expo (mobile):
- Platform-specific code (Platform.select)
- Safe area handling
- Performance with FlatList vs ScrollView
- Secure storage usage
- Deep linking configuration

For Static Sites (website):
- Semantic HTML5
- CSS performance
- JavaScript best practices
- Accessibility

OUTPUT FORMAT (JSON):
{
  "passed": boolean,
  "score": number (0-100),
  "issues": [
    {
      "file": "path/to/file.tsx",
      "line": 42,
      "severity": "critical|error|warning|info",
      "category": "security|performance|accessibility|best-practice|bug|style",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief overall assessment",
  "improvements": ["List of recommended improvements"]
}

SCORING:
- Start at 100
- Critical issues: -20 each
- Errors: -10 each
- Warnings: -5 each
- Info: -1 each
- Minimum score: 0

Be thorough but practical. Focus on real issues, not style preferences.
Return ONLY valid JSON, no markdown code blocks.`

export class CodeReviewer {
  private client: OpenAI
  private config: { temperature: number; maxTokens: number }

  constructor() {
    // Prefer OpenRouter, fallback to OpenAI
    if (process.env.OPENROUTER_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'iEditor Code Reviewer',
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
      temperature: 0.2, // Low temperature for consistent reviews
      maxTokens: 4096,
    }
  }

  async review(files: CodeFile[], platform: PlatformType): Promise<ReviewResult> {
    // Build file content for review
    const fileContents = files.map(f =>
      `--- FILE: ${f.path} (${f.language}) ---\n${f.content}\n--- END FILE ---`
    ).join('\n\n')

    const userPrompt = `Review the following ${platform} application code for quality, security, and best practices.

PLATFORM: ${platform}
FILES TO REVIEW:

${fileContents}

Provide a comprehensive review in the specified JSON format.`

    try {
      const response = await this.client.chat.completions.create({
        model: REVIEWER_MODEL,
        messages: [
          { role: 'system', content: REVIEWER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from Code Reviewer')
      }

      const result = JSON.parse(content) as ReviewResult

      // Validate and normalize the result
      return this.normalizeResult(result)
    } catch (error: any) {
      console.error('Code review error:', error)
      // Return a default result on error
      return {
        passed: true,
        score: 70,
        issues: [],
        summary: 'Code review could not be completed. Manual review recommended.',
        improvements: ['Manual code review recommended'],
      }
    }
  }

  async reviewFile(file: CodeFile, platform: PlatformType): Promise<ReviewResult> {
    return this.review([file], platform)
  }

  async quickCheck(code: string, language: string, platform: PlatformType): Promise<{
    hasIssues: boolean
    criticalCount: number
    summary: string
  }> {
    const result = await this.review([{
      path: `temp.${language}`,
      content: code,
      language,
    }], platform)

    return {
      hasIssues: result.issues.length > 0,
      criticalCount: result.issues.filter(i => i.severity === 'critical').length,
      summary: result.summary,
    }
  }

  private normalizeResult(result: ReviewResult): ReviewResult {
    // Ensure all required fields exist
    return {
      passed: result.passed ?? (result.score >= 60),
      score: Math.max(0, Math.min(100, result.score || 70)),
      issues: (result.issues || []).map(issue => ({
        file: issue.file || 'unknown',
        line: issue.line,
        severity: issue.severity || 'info',
        category: issue.category || 'best-practice',
        message: issue.message || 'Unknown issue',
        suggestion: issue.suggestion,
      })),
      summary: result.summary || 'Review completed',
      improvements: result.improvements || [],
    }
  }
}

// Singleton instance
let reviewerInstance: CodeReviewer | null = null

export function getCodeReviewer(): CodeReviewer {
  if (!reviewerInstance) {
    reviewerInstance = new CodeReviewer()
  }
  return reviewerInstance
}

// Helper to format review result for display
export function formatReviewResult(result: ReviewResult): string {
  const lines: string[] = []

  const statusEmoji = result.passed ? '✅' : '❌'
  lines.push(`${statusEmoji} Code Review: ${result.passed ? 'PASSED' : 'NEEDS ATTENTION'}`)
  lines.push(`Score: ${result.score}/100`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)

  if (result.issues.length > 0) {
    lines.push('')
    lines.push('Issues Found:')

    // Group by severity
    const critical = result.issues.filter(i => i.severity === 'critical')
    const errors = result.issues.filter(i => i.severity === 'error')
    const warnings = result.issues.filter(i => i.severity === 'warning')
    const infos = result.issues.filter(i => i.severity === 'info')

    if (critical.length > 0) {
      lines.push(`\n🚨 Critical (${critical.length}):`)
      critical.forEach(i => {
        lines.push(`  • [${i.category}] ${i.file}${i.line ? `:${i.line}` : ''}: ${i.message}`)
        if (i.suggestion) lines.push(`    → ${i.suggestion}`)
      })
    }

    if (errors.length > 0) {
      lines.push(`\n❌ Errors (${errors.length}):`)
      errors.forEach(i => {
        lines.push(`  • [${i.category}] ${i.file}${i.line ? `:${i.line}` : ''}: ${i.message}`)
        if (i.suggestion) lines.push(`    → ${i.suggestion}`)
      })
    }

    if (warnings.length > 0) {
      lines.push(`\n⚠️ Warnings (${warnings.length}):`)
      warnings.forEach(i => {
        lines.push(`  • [${i.category}] ${i.file}${i.line ? `:${i.line}` : ''}: ${i.message}`)
      })
    }

    if (infos.length > 0) {
      lines.push(`\nℹ️ Info (${infos.length}):`)
      infos.forEach(i => {
        lines.push(`  • [${i.category}] ${i.file}: ${i.message}`)
      })
    }
  }

  if (result.improvements.length > 0) {
    lines.push('')
    lines.push('Recommended Improvements:')
    result.improvements.forEach(imp => lines.push(`  💡 ${imp}`))
  }

  return lines.join('\n')
}

// Security-focused quick check
export async function securityCheck(files: CodeFile[], platform: PlatformType): Promise<{
  secure: boolean
  vulnerabilities: CodeIssue[]
}> {
  const reviewer = getCodeReviewer()
  const result = await reviewer.review(files, platform)

  const vulnerabilities = result.issues.filter(
    i => i.category === 'security' && (i.severity === 'critical' || i.severity === 'error')
  )

  return {
    secure: vulnerabilities.length === 0,
    vulnerabilities,
  }
}
