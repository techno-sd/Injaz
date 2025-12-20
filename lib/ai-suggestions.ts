// AI Chatbot Suggestions Configuration
// Platform-specific and context-aware suggestions for the AI chatbot

import type { PlatformType, SubPlatformType } from '@/types/app-schema'

// =============================================================================
// SUGGESTION INTERFACE
// =============================================================================

export interface AISuggestion {
  id: string
  text: string
  emoji: string
  tags: string[]
  complexity: 'simple' | 'medium' | 'complex'
}

// =============================================================================
// PLATFORM-SPECIFIC SUGGESTIONS
// =============================================================================

export const PLATFORM_SUGGESTIONS: Record<PlatformType, AISuggestion[]> = {
  website: [],
  webapp: [],
}

// =============================================================================
// SUB-PLATFORM SPECIFIC SUGGESTIONS
// =============================================================================

export const SUB_PLATFORM_SUGGESTIONS: Partial<Record<SubPlatformType, AISuggestion[]>> = {
  // Website Sub-platforms
  portfolio: [
    { id: 'sp1', text: 'Create a designer portfolio with case studies', emoji: '🎨', tags: [], complexity: 'medium' },
    { id: 'sp2', text: 'Build a developer portfolio with GitHub integration', emoji: '💻', tags: [], complexity: 'medium' },
    { id: 'sp3', text: 'Design a creative agency portfolio', emoji: '🖼️', tags: [], complexity: 'medium' },
  ],
  blog: [
    { id: 'sb1', text: 'Create a tech blog with syntax highlighting', emoji: '📱', tags: [], complexity: 'medium' },
    { id: 'sb2', text: 'Build a personal journal with categories', emoji: '📔', tags: [], complexity: 'simple' },
    { id: 'sb3', text: 'Design a news site with article cards', emoji: '📰', tags: [], complexity: 'medium' },
  ],
  landing: [
    { id: 'sl1', text: 'Create a product launch page with countdown', emoji: '⏰', tags: [], complexity: 'simple' },
    { id: 'sl2', text: 'Build an app download landing page', emoji: '📲', tags: [], complexity: 'simple' },
    { id: 'sl3', text: 'Design a SaaS waitlist page', emoji: '📧', tags: [], complexity: 'simple' },
  ],
  business: [
    { id: 'sbu1', text: 'Create a law firm website with services', emoji: '⚖️', tags: [], complexity: 'medium' },
    { id: 'sbu2', text: 'Build a real estate agency website', emoji: '🏠', tags: [], complexity: 'medium' },
    { id: 'sbu3', text: 'Design a consulting firm website', emoji: '💼', tags: [], complexity: 'medium' },
  ],

  // Webapp Sub-platforms
  dashboard: [
    { id: 'sd1', text: 'Create a sales analytics dashboard', emoji: '📈', tags: [], complexity: 'complex' },
    { id: 'sd2', text: 'Build a user management admin panel', emoji: '👤', tags: [], complexity: 'medium' },
    { id: 'sd3', text: 'Design a CRM dashboard with pipelines', emoji: '🎯', tags: [], complexity: 'complex' },
  ],
  ecommerce: [
    { id: 'se1', text: 'Create a fashion store with size filters', emoji: '👗', tags: [], complexity: 'complex' },
    { id: 'se2', text: 'Build a digital products marketplace', emoji: '🎮', tags: [], complexity: 'complex' },
    { id: 'se3', text: 'Design a grocery delivery platform', emoji: '🥬', tags: [], complexity: 'complex' },
  ],
  saas: [
    { id: 'ss1', text: 'Create a subscription management platform', emoji: '💳', tags: [], complexity: 'complex' },
    { id: 'ss2', text: 'Build an email marketing tool', emoji: '📧', tags: [], complexity: 'complex' },
    { id: 'ss3', text: 'Design a team collaboration platform', emoji: '🤝', tags: [], complexity: 'complex' },
  ],
  social: [
    { id: 'so1', text: 'Create a professional networking platform', emoji: '🔗', tags: [], complexity: 'complex' },
    { id: 'so2', text: 'Build a community forum with threads', emoji: '💭', tags: [], complexity: 'complex' },
    { id: 'so3', text: 'Design a photo sharing platform', emoji: '📷', tags: [], complexity: 'complex' },
  ],
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get suggestions for a specific platform
 */
export function getSuggestionsForPlatform(platform: PlatformType, limit?: number): AISuggestion[] {
  const suggestions = PLATFORM_SUGGESTIONS[platform] || []
  return limit ? suggestions.slice(0, limit) : suggestions
}

/**
 * Get suggestions for a specific sub-platform
 */
export function getSuggestionsForSubPlatform(subPlatform: SubPlatformType, limit?: number): AISuggestion[] {
  const suggestions = SUB_PLATFORM_SUGGESTIONS[subPlatform] || []
  return limit ? suggestions.slice(0, limit) : suggestions
}

/**
 * Get combined suggestions for platform and sub-platform
 */
export function getCombinedSuggestions(
  platform: PlatformType,
  subPlatform?: SubPlatformType,
  limit: number = 6
): AISuggestion[] {
  const platformSuggestions = PLATFORM_SUGGESTIONS[platform] || []
  const subPlatformSuggestions = subPlatform ? (SUB_PLATFORM_SUGGESTIONS[subPlatform] || []) : []

  // Prioritize sub-platform suggestions if available
  if (subPlatformSuggestions.length > 0) {
    const combined = [...subPlatformSuggestions, ...platformSuggestions]
    // Remove duplicates by id
    const unique = combined.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
    return unique.slice(0, limit)
  }

  return platformSuggestions.slice(0, limit)
}

/**
 * Get random suggestions for variety
 */
export function getRandomSuggestions(platform: PlatformType, count: number = 3): AISuggestion[] {
  const suggestions = [...(PLATFORM_SUGGESTIONS[platform] || [])]
  const shuffled = suggestions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Search suggestions by text
 */
export function searchSuggestions(query: string, platform?: PlatformType): AISuggestion[] {
  const lowerQuery = query.toLowerCase()
  const allSuggestions = platform
    ? PLATFORM_SUGGESTIONS[platform] || []
    : Object.values(PLATFORM_SUGGESTIONS).flat()

  return allSuggestions.filter(s =>
    s.text.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.toLowerCase().includes(lowerQuery))
  )
}

// =============================================================================
// WELCOME MESSAGES
// =============================================================================

export const WELCOME_MESSAGES: Record<PlatformType, string> = {
  website: 'What kind of website would you like to build?',
  webapp: 'What would you like to build?',
}

export const WELCOME_SUBTITLES: Record<PlatformType, string> = {
  website: 'Describe your idea and I\'ll generate a complete responsive website for you',
  webapp: 'Describe your idea and I\'ll design, plan, and generate the complete web app for you',
}

// =============================================================================
// QUICK ACTION PROMPTS
// =============================================================================

export interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: string
}

export const QUICK_ACTIONS: Record<PlatformType, QuickAction[]> = {
  website: [
    { id: 'qa1', label: 'Add Contact Form', prompt: 'Add a contact form with name, email, and message fields', icon: 'Mail' },
    { id: 'qa2', label: 'Add Hero Section', prompt: 'Add a hero section with headline, description, and CTA buttons', icon: 'Layout' },
    { id: 'qa3', label: 'Add Footer', prompt: 'Add a footer with links, social icons, and copyright', icon: 'AlignBottom' },
  ],
  webapp: [
    { id: 'qa4', label: 'Add Authentication', prompt: 'Add user authentication with login, signup, and password reset', icon: 'Lock' },
    { id: 'qa5', label: 'Add Dashboard', prompt: 'Add a dashboard page with stats cards and charts', icon: 'LayoutDashboard' },
    { id: 'qa6', label: 'Add Data Table', prompt: 'Add a data table with sorting, filtering, and pagination', icon: 'Table' },
  ],
}
