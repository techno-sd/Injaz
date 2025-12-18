// Enhanced Prompts System - Industry-Specific Guidance for Modern Apps
// Provides additional context to Controller and Codegen for better quality output

import type { PlatformType, SubPlatformType } from '@/types/app-schema'
import { modernDesignTokens, industryTemplates, modernComponents } from './modern-templates'

// ============================================================================
// ENHANCED CONTROLLER PROMPTS
// ============================================================================

export const controllerEnhancements = {
  // Platform-specific guidance
  platforms: {
    website: `
WEBSITE BEST PRACTICES (2024-2025):
- Use semantic HTML5 elements (header, nav, main, section, article, footer)
- Implement smooth scroll animations with Intersection Observer
- Include skip-to-content link for accessibility
- Use picture element with WebP + fallback for images
- Implement lazy loading for below-fold content
- Add Open Graph meta tags for social sharing
- Include structured data (JSON-LD) for SEO
- Use CSS custom properties for theming
- Implement dark mode with prefers-color-scheme
- Add print styles for content pages

MODERN DESIGN PATTERNS:
- Hero sections with gradient backgrounds or split layouts
- Bento grid layouts for features
- Glassmorphism cards with backdrop-blur
- Floating navigation bars
- Scroll-triggered animations
- Magnetic buttons and hover effects
- 3D transforms for depth
`,
    webapp: `
NEXT.JS 14+ BEST PRACTICES:
- Use App Router with Server Components by default
- Mark interactive components with 'use client'
- Implement Server Actions for form handling
- Use next/image for automatic optimization
- Implement streaming with loading.tsx and Suspense
- Use generateMetadata for dynamic SEO
- Implement middleware for auth redirects
- Use Route Handlers for API endpoints
- Implement parallel and intercepting routes where appropriate
- Use next/font for optimal font loading

MODERN WEB APP PATTERNS:
- Command menu (Cmd+K) for power users
- Toast notifications with Sonner
- Optimistic UI updates
- Skeleton loading states
- Infinite scroll with virtualization
- Real-time updates with Supabase subscriptions
- Multi-step forms with validation
- Data tables with sorting, filtering, pagination
- Dashboard layouts with collapsible sidebar
- Settings pages with tabs

SHADCN/UI COMPONENTS TO USE:
- Button, Card, Dialog, Sheet, Dropdown
- Form, Input, Select, Checkbox, Switch
- Table, Tabs, Accordion, Command
- Avatar, Badge, Toast, Skeleton
- NavigationMenu, Breadcrumb, Pagination
`,
    mobile: `
EXPO/REACT NATIVE BEST PRACTICES:
- Use Expo Router for file-based navigation
- Implement proper TypeScript types
- Use expo-image for optimized image loading
- Implement haptic feedback with expo-haptics
- Use SafeAreaView for notch handling
- Implement KeyboardAvoidingView for forms
- Use FlatList instead of ScrollView for lists
- Implement pull-to-refresh
- Use React.memo for performance
- Store sensitive data with expo-secure-store

MODERN MOBILE PATTERNS:
- Bottom sheet for actions (using @gorhom/bottom-sheet)
- Swipeable list items
- Tab bar with floating action button
- Skeleton loading screens
- Pull-to-refresh with custom animations
- Gesture-based navigation
- Biometric authentication
- Deep linking configuration
- Push notifications setup
- App icon and splash screen

PLATFORM-SPECIFIC:
- iOS: Use SF Symbols, respect safe areas, implement haptics
- Android: Material You design, edge-to-edge layout, proper elevation
`,
  },

  // Industry-specific templates
  industries: {
    // Website Industries
    portfolio: `
PORTFOLIO DESIGN GUIDANCE:
- Hero: Large name/tagline with subtle animation
- Work section: Grid of projects with hover effects and filters
- About: Photo + bio with skill tags
- Contact: Simple form or email link
- Consider dark theme for creative portfolios

MUST-HAVE COMPONENTS:
- Project cards with image, title, tags, links
- Skill/technology badges
- Timeline for experience
- Social links in header/footer
- Resume/CV download button

SAMPLE CONTENT STYLE:
- "Hi, I'm [Name] — a [Role] crafting digital experiences"
- Project names like "Redesigning the Future of Banking"
- Skills: React, TypeScript, Figma, etc.
`,
    blog: `
BLOG DESIGN GUIDANCE:
- Clean, readable typography (18px+ body)
- Table of contents for long posts
- Estimated reading time
- Code blocks with syntax highlighting
- Newsletter subscription form
- Related posts section
- Author bio with avatar

MUST-HAVE COMPONENTS:
- Post card (image, title, excerpt, date, author)
- Category/tag pills
- Search functionality
- Pagination or infinite scroll
- Share buttons
- Comments section (optional)

SEO ESSENTIALS:
- Proper heading hierarchy (h1 for title)
- Meta description from excerpt
- Open Graph images
- Canonical URLs
- RSS feed
`,
    landing: `
LANDING PAGE DESIGN GUIDANCE:
- Above-fold: Clear value proposition + CTA
- Social proof: Logos, testimonials, stats
- Features: Benefits-focused, not feature lists
- Pricing: Clear, simple tiers
- FAQ: Address objections
- Final CTA: Urgency or special offer

CONVERSION OPTIMIZATION:
- Single primary CTA color throughout
- Reduce navigation options
- Add trust badges and security icons
- Use specific numbers ("10,000+ users" not "many users")
- Include video testimonials if possible

HIGH-CONVERTING SECTIONS ORDER:
1. Hero with CTA
2. Logo cloud (social proof)
3. Problem/Solution
4. Features/Benefits
5. How it works
6. Testimonials
7. Pricing
8. FAQ
9. Final CTA
`,
    business: `
BUSINESS WEBSITE GUIDANCE:
- Professional, trustworthy design
- Clear services/products overview
- Team section with photos
- Contact information prominent
- Location map if applicable
- Client logos/testimonials

MUST-HAVE PAGES:
- Home: Overview + key CTAs
- About: Company story, values, team
- Services/Products: Detailed offerings
- Contact: Form, phone, email, address, map
- Consider: Blog, Careers, Case Studies

TRUST ELEMENTS:
- Years in business
- Number of clients/projects
- Certifications/awards
- Client testimonials
- Case studies with results
`,

    // Web App Industries
    dashboard: `
DASHBOARD DESIGN GUIDANCE:
- Sidebar navigation (collapsible)
- Top bar with search, notifications, user menu
- Card-based widgets for metrics
- Data tables with actions
- Charts for visualization
- Dark mode support (preferred)

KEY COMPONENTS:
- Stats cards with trend indicators
- Line/bar/pie charts
- Data tables with sorting, filtering
- Search with command menu (Cmd+K)
- Notification dropdown
- User settings panel
- Activity feed

LAYOUT STRUCTURE:
- Fixed sidebar (240px, collapsible to 64px)
- Sticky header (64px)
- Main content with padding
- Optional right sidebar for details
`,
    ecommerce: `
E-COMMERCE DESIGN GUIDANCE:
- Fast product discovery (search, filters, categories)
- High-quality product images with zoom
- Clear pricing and availability
- Easy add-to-cart flow
- Persistent cart with quick view
- Trust badges on checkout

KEY PAGES & COMPONENTS:
- Product listing with filters
- Product detail with gallery, variants, reviews
- Shopping cart (drawer or page)
- Checkout (multi-step or single page)
- Order confirmation
- User account with orders

CONVERSION ESSENTIALS:
- Guest checkout option
- Multiple payment methods
- Clear shipping information
- Easy returns policy
- Stock indicators
- Recently viewed products
`,
    saas: `
SAAS DESIGN GUIDANCE:
- Marketing site + App (separate or combined)
- Clear pricing tiers
- Free trial or demo CTA
- Feature comparison table
- Customer testimonials
- Integration logos

MARKETING PAGES:
- Home: Hero, features, social proof, pricing, CTA
- Features: Detailed feature pages
- Pricing: Comparison table, FAQ
- About: Team, story, values
- Blog: Content marketing

APP STRUCTURE:
- Onboarding flow
- Dashboard home
- Core feature pages
- Settings (profile, team, billing)
- Help/documentation
`,
    social: `
SOCIAL APP DESIGN GUIDANCE:
- Feed-centric layout
- Real-time updates
- Rich media support
- Engagement actions (like, comment, share)
- User profiles
- Notifications

KEY COMPONENTS:
- Post composer
- Feed cards (text, image, video)
- Comment threads
- User profile header
- Follow/unfollow buttons
- Notification badges
- Direct messages

REAL-TIME FEATURES:
- Live feed updates
- Typing indicators
- Online status
- Push notifications
`,

    // Mobile Industries
    fitness: `
FITNESS APP DESIGN GUIDANCE:
- Quick access to start workout
- Progress visualization (charts, rings)
- Calendar for tracking
- Achievement/streak system
- Timer/stopwatch integration
- Health data sync

KEY SCREENS:
- Home: Today's goal, quick start, stats
- Workouts: Library, custom, history
- Progress: Charts, calendar, achievements
- Profile: Settings, goals, connected apps

ENGAGEMENT FEATURES:
- Daily reminders
- Streak tracking
- Social challenges
- Achievement badges
- Progress photos
`,
    utility: `
UTILITY APP DESIGN GUIDANCE:
- Fast, focused functionality
- Minimal UI, maximum usability
- Offline support
- Widget support
- Quick actions
- Settings for customization

KEY PATTERNS:
- Home: Primary function front and center
- Lists: Swipeable actions, drag to reorder
- Settings: Grouped preferences
- Search: Quick access to content

PERFORMANCE PRIORITIES:
- Instant launch
- Offline-first
- Efficient battery usage
- Small app size
`,
  },
}

// ============================================================================
// ENHANCED CODEGEN PROMPTS
// ============================================================================

export const codegenEnhancements = {
  webapp: `
NEXT.JS CODE STANDARDS:
1. File naming: kebab-case for files, PascalCase for components
2. Always use TypeScript with strict mode
3. Import order: React, Next, third-party, local, styles
4. Use path aliases (@/components, @/lib, etc.)
5. Colocate related files (component + styles + tests)

COMPONENT PATTERNS:
\`\`\`tsx
// Good: Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Good: Client Component
'use client'
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}

// Good: Loading state
export default function Loading() {
  return <Skeleton className="h-[200px] w-full" />
}

// Good: Error boundary
'use client'
export default function Error({ error, reset }) {
  return <div><button onClick={reset}>Try again</button></div>
}
\`\`\`

STYLING WITH TAILWIND:
- Use cn() helper for conditional classes
- Prefer composition over customization
- Use design tokens (primary, muted, etc.)
- Mobile-first responsive (sm:, md:, lg:)
- Use @apply sparingly, prefer utilities

DATA FETCHING:
- Server Components: Direct async/await
- Client: React Query or SWR
- Forms: Server Actions with useFormState
- Real-time: Supabase subscriptions
`,

  mobile: `
EXPO/REACT NATIVE CODE STANDARDS:
1. Use functional components with hooks
2. TypeScript for all files
3. StyleSheet.create() for styles
4. Platform-specific code with Platform.select()
5. Use expo-router for navigation

COMPONENT PATTERNS:
\`\`\`tsx
// Screen component
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  )
}

// List screen
export default function ListScreen() {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <ListItem item={item} />}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Separator}
    />
  )
}

// Form with keyboard handling
export default function FormScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Form fields */}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
\`\`\`

STYLING PATTERNS:
- Use StyleSheet.create() always
- Platform shadows: shadowProps (iOS) + elevation (Android)
- Use theme colors from context
- Consistent spacing (4, 8, 12, 16, 24, 32)
- Safe area padding for notches
`,

  website: `
STATIC WEBSITE CODE STANDARDS:
1. Semantic HTML5 structure
2. BEM naming for CSS classes
3. CSS custom properties for theming
4. Vanilla JS with modern syntax
5. Accessible by default

HTML STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <title></title>
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="header">
    <nav class="nav" aria-label="Main navigation">
      <!-- Navigation -->
    </nav>
  </header>
  <main id="main" class="main">
    <!-- Content -->
  </main>
  <footer class="footer">
    <!-- Footer -->
  </footer>
</body>
</html>
\`\`\`

CSS PATTERNS:
- Mobile-first media queries
- CSS Grid for layouts
- Flexbox for components
- Custom properties for colors
- Smooth transitions (0.3s ease)
- Reduced motion support
`,
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildControllerPrompt(
  platform: PlatformType,
  subPlatform?: SubPlatformType
): string {
  let enhancement = ''

  // Add platform guidance
  enhancement += controllerEnhancements.platforms[platform] || ''

  // Add industry guidance
  if (subPlatform && controllerEnhancements.industries[subPlatform]) {
    enhancement += '\n\n' + controllerEnhancements.industries[subPlatform]
  }

  // Add modern design tokens as reference
  enhancement += `

MODERN COLOR PALETTES (choose one or create similar):
- Modern Dark: Primary #6366f1, Background #0a0a0f, Foreground #fafafa
- Vibrant: Primary #ec4899, Background #030712, Accent #14b8a6
- Minimal Light: Primary #18181b, Background #ffffff, Foreground #09090b
- Nature: Primary #22c55e, Background #052e16, Foreground #f0fdf4

TYPOGRAPHY RECOMMENDATIONS:
- Modern: Inter (heading & body)
- Elegant: Playfair Display (heading) + Source Sans Pro (body)
- Tech: Space Grotesk (heading) + IBM Plex Sans (body)
`

  return enhancement
}

export function buildCodegenPrompt(platform: PlatformType): string {
  return codegenEnhancements[platform] || ''
}

// ============================================================================
// INDUSTRY TEMPLATE GENERATOR
// ============================================================================

export function getIndustryTemplate(
  platform: PlatformType,
  subPlatform: SubPlatformType
) {
  const template = industryTemplates[subPlatform]
  if (!template) return null

  return {
    ...template,
    enhancement: controllerEnhancements.industries[subPlatform] || '',
    codeGuidance: codegenEnhancements[platform] || '',
    designTokens: modernDesignTokens.palettes.modern,
  }
}

// ============================================================================
// COMPONENT PATTERN HELPER
// ============================================================================

export function getComponentPatterns(platform: PlatformType): string[] {
  if (platform === 'website') {
    return [
      'hero-gradient', 'hero-split', 'hero-minimal',
      'bento-grid', 'features-cards', 'features-alternating',
      'pricing-table', 'testimonials-grid', 'cta-gradient',
      'navigation-sticky', 'navigation-floating', 'footer-columns',
    ]
  }

  if (platform === 'webapp') {
    return [
      'dashboard-layout', 'sidebar-navigation', 'data-table',
      'stats-cards', 'chart-card', 'command-menu',
      'settings-form', 'user-dropdown', 'notification-list',
      'modal-form', 'sheet-panel', 'toast-notifications',
    ]
  }

  if (platform === 'mobile') {
    return [
      'tab-navigation', 'stack-navigation', 'bottom-sheet',
      'list-item', 'card-swipeable', 'profile-header',
      'stats-grid', 'progress-ring', 'skeleton-loader',
      'pull-refresh', 'empty-state', 'error-boundary',
    ]
  }

  return []
}

export default {
  buildControllerPrompt,
  buildCodegenPrompt,
  getIndustryTemplate,
  getComponentPatterns,
}
