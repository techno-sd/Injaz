// Platform Configuration for Multi-Platform Project Support
// Defines platform types, sub-categories, and their configurations

import type { PlatformType, SubPlatformType, WebsiteSubType, WebappSubType } from '@/types/app-schema'

// =============================================================================
// PLATFORM CATEGORY CONFIGURATION
// =============================================================================

export interface PlatformCategory {
  id: SubPlatformType
  name: string
  description: string
  icon: string
  gradient: string
  features: string[]
}

export interface PlatformConfig {
  id: PlatformType
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  tech: string
  techStack: string[]
  categories: PlatformCategory[]
}

// =============================================================================
// WEBSITE SUB-PLATFORMS
// =============================================================================

const WEBSITE_CATEGORIES: PlatformCategory[] = [
  {
    id: 'portfolio' as WebsiteSubType,
    name: 'Portfolio',
    description: 'Showcase your work and skills',
    icon: 'Briefcase',
    gradient: 'from-violet-500 to-purple-600',
    features: ['Project Gallery', 'Skills Section', 'About Me', 'Contact Form'],
  },
  {
    id: 'blog' as WebsiteSubType,
    name: 'Blog',
    description: 'Share your thoughts and articles',
    icon: 'FileText',
    gradient: 'from-blue-500 to-indigo-600',
    features: ['Article Listing', 'Categories', 'Search', 'Newsletter'],
  },
  {
    id: 'landing' as WebsiteSubType,
    name: 'Landing Page',
    description: 'Convert visitors into customers',
    icon: 'Rocket',
    gradient: 'from-amber-500 to-orange-600',
    features: ['Hero Section', 'Features', 'Pricing', 'CTA Buttons'],
  },
  {
    id: 'business' as WebsiteSubType,
    name: 'Business Site',
    description: 'Professional company presence',
    icon: 'Building',
    gradient: 'from-emerald-500 to-teal-600',
    features: ['About Page', 'Services', 'Team', 'Contact'],
  },
]

// =============================================================================
// WEBAPP SUB-PLATFORMS
// =============================================================================

const WEBAPP_CATEGORIES: PlatformCategory[] = [
  {
    id: 'dashboard' as WebappSubType,
    name: 'Dashboard',
    description: 'Analytics and admin panels',
    icon: 'LayoutDashboard',
    gradient: 'from-violet-500 to-purple-600',
    features: ['Charts & Graphs', 'Data Tables', 'User Management', 'Settings'],
  },
  {
    id: 'ecommerce' as WebappSubType,
    name: 'E-commerce',
    description: 'Online store and marketplace',
    icon: 'ShoppingCart',
    gradient: 'from-emerald-500 to-teal-600',
    features: ['Product Catalog', 'Shopping Cart', 'Checkout', 'Orders'],
  },
  {
    id: 'saas' as WebappSubType,
    name: 'SaaS',
    description: 'Software as a service platform',
    icon: 'Cloud',
    gradient: 'from-cyan-500 to-blue-600',
    features: ['User Auth', 'Billing', 'API Access', 'Team Management'],
  },
  {
    id: 'social' as WebappSubType,
    name: 'Social App',
    description: 'Connect and share with others',
    icon: 'Users',
    gradient: 'from-pink-500 to-rose-600',
    features: ['User Profiles', 'Feed', 'Messaging', 'Notifications'],
  },
]

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  website: {
    id: 'website',
    name: 'Website',
    description: 'Marketing websites & landing pages',
    icon: 'Globe',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    tech: 'Vite + React',
    techStack: ['Vite', 'React', 'TypeScript', 'Tailwind'],
    categories: WEBSITE_CATEGORIES,
  },
  webapp: {
    id: 'webapp',
    name: 'Web App',
    description: 'Full-stack web applications',
    icon: 'AppWindow',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    tech: 'Vite + React + Supabase',
    techStack: ['Vite', 'React', 'TypeScript', 'Supabase', 'Tailwind'],
    categories: WEBAPP_CATEGORIES,
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getPlatformConfig(platform: PlatformType): PlatformConfig {
  return PLATFORM_CONFIGS[platform]
}

export function getCategoriesForPlatform(platform: PlatformType): PlatformCategory[] {
  return PLATFORM_CONFIGS[platform]?.categories || []
}

export function getCategoryInfo(platform: PlatformType, subPlatform: SubPlatformType): PlatformCategory | undefined {
  const platformConfig = PLATFORM_CONFIGS[platform]
  return platformConfig?.categories.find(cat => cat.id === subPlatform)
}

export function getPlatformIcon(platform: PlatformType): string {
  return PLATFORM_CONFIGS[platform]?.icon || 'Globe'
}

export function getPlatformColor(platform: PlatformType): string {
  return PLATFORM_CONFIGS[platform]?.color || 'text-gray-400'
}

export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(PLATFORM_CONFIGS)
}

// =============================================================================
// PLATFORM FEATURE SETS
// =============================================================================

export const PLATFORM_FEATURES: Record<PlatformType, string[]> = {
  website: [
    'Responsive Design',
    'SEO Optimized',
    'Fast Loading',
    'No Backend Required',
    'Easy Deployment',
  ],
  webapp: [
    'User Authentication',
    'Database Integration',
    'API Routes',
    'Real-time Updates',
    'PWA Support',
  ],
}

// =============================================================================
// DEFAULT TEMPLATES BY PLATFORM
// =============================================================================

export const DEFAULT_TEMPLATE_IDS: Record<PlatformType, string> = {
  website: 'blank-website',
  webapp: 'blank-webapp',
}

// =============================================================================
// PLATFORM COLORS FOR UI
// =============================================================================

export const PLATFORM_COLORS = {
  website: {
    primary: '#10b981', // emerald-500
    light: '#d1fae5',   // emerald-100
    dark: '#064e3b',    // emerald-900
  },
  webapp: {
    primary: '#8b5cf6', // violet-500
    light: '#ede9fe',   // violet-100
    dark: '#4c1d95',    // violet-900
  },
}

// =============================================================================
// TECH STACK ICONS MAPPING
// =============================================================================

export const TECH_STACK_ICONS: Record<string, string> = {
  'HTML': 'html5',
  'CSS': 'css3',
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'React': 'react',
  'Vite': 'vite',
  'Vite + React': 'vite',
  'React Native': 'react',
  'Expo': 'expo',
  'Supabase': 'supabase',
  'Tailwind': 'tailwindcss',
  'Node.js': 'nodejs',
}
