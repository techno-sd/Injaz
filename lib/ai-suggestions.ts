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
  website: [
    { id: 'w1', text: 'Build a modern portfolio with project showcase', emoji: '💼', tags: ['portfolio'], complexity: 'medium' },
    { id: 'w2', text: 'Create a startup landing page with animations', emoji: '✨', tags: ['landing'], complexity: 'medium' },
    { id: 'w3', text: 'Design a blog with dark mode & newsletter signup', emoji: '📝', tags: ['blog'], complexity: 'medium' },
    { id: 'w4', text: 'Build a professional business website', emoji: '🏢', tags: ['business'], complexity: 'simple' },
    { id: 'w5', text: 'Create a restaurant website with menu & reservations', emoji: '🍽️', tags: ['business'], complexity: 'medium' },
    { id: 'w6', text: 'Design a photography portfolio with gallery', emoji: '📸', tags: ['portfolio'], complexity: 'simple' },
  ],
  webapp: [
    { id: 'a1', text: 'Build a SaaS landing page with pricing & features', emoji: '🚀', tags: ['saas', 'landing'], complexity: 'medium' },
    { id: 'a2', text: 'Create an admin dashboard with charts & tables', emoji: '📊', tags: ['dashboard'], complexity: 'complex' },
    { id: 'a3', text: 'Design an e-commerce store with product catalog', emoji: '🛒', tags: ['ecommerce'], complexity: 'complex' },
    { id: 'a4', text: 'Build a social platform with user profiles', emoji: '👥', tags: ['social'], complexity: 'complex' },
    { id: 'a5', text: 'Create a project management tool with kanban board', emoji: '📋', tags: ['dashboard', 'saas'], complexity: 'complex' },
    { id: 'a6', text: 'Build a real-time chat application', emoji: '💬', tags: ['social'], complexity: 'complex' },
  ],
  mobile: [
    { id: 'm1', text: 'Build a fitness tracking app with workout plans', emoji: '💪', tags: ['fitness'], complexity: 'medium' },
    { id: 'm2', text: 'Create a food delivery app with cart & checkout', emoji: '🍕', tags: ['ecommerce'], complexity: 'complex' },
    { id: 'm3', text: 'Design a social media app with stories & chat', emoji: '💬', tags: ['social'], complexity: 'complex' },
    { id: 'm4', text: 'Build a productivity app with notes & tasks', emoji: '📋', tags: ['utility'], complexity: 'medium' },
    { id: 'm5', text: 'Create a meditation app with timer & sounds', emoji: '🧘', tags: ['fitness', 'utility'], complexity: 'simple' },
    { id: 'm6', text: 'Design a habit tracker with streaks & reminders', emoji: '✅', tags: ['utility', 'fitness'], complexity: 'medium' },
  ],
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

  // Mobile Sub-platforms
  fitness: [
    { id: 'mf1', text: 'Create a running tracker with maps', emoji: '🏃', tags: [], complexity: 'medium' },
    { id: 'mf2', text: 'Build a yoga app with video tutorials', emoji: '🧘', tags: [], complexity: 'medium' },
    { id: 'mf3', text: 'Design a nutrition tracking app', emoji: '🥗', tags: [], complexity: 'medium' },
  ],
  utility: [
    { id: 'mu1', text: 'Create a password manager app', emoji: '🔐', tags: [], complexity: 'medium' },
    { id: 'mu2', text: 'Build a weather app with forecasts', emoji: '🌤️', tags: [], complexity: 'simple' },
    { id: 'mu3', text: 'Design a file manager app', emoji: '📁', tags: [], complexity: 'medium' },
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
  mobile: 'What kind of mobile app would you like to create?',
}

export const WELCOME_SUBTITLES: Record<PlatformType, string> = {
  website: 'Describe your idea and I\'ll generate a complete responsive website for you',
  webapp: 'Describe your idea and I\'ll design, plan, and generate the complete web app for you',
  mobile: 'Describe your idea and I\'ll create a cross-platform mobile app for you',
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
  mobile: [
    { id: 'qa7', label: 'Add Tab Navigation', prompt: 'Add bottom tab navigation with home, search, and profile tabs', icon: 'Navigation' },
    { id: 'qa8', label: 'Add User Profile', prompt: 'Add a user profile screen with avatar, name, and settings', icon: 'User' },
    { id: 'qa9', label: 'Add List View', prompt: 'Add a scrollable list view with cards and pull-to-refresh', icon: 'List' },
  ],
}
