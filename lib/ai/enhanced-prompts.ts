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
VITE + REACT MARKETING WEBSITE BEST PRACTICES (2024-2025):
- Use Vite + React 18 with TypeScript for all pages
- React Router v6 for client-side navigation
- React Helmet or document.title for SEO meta tags
- Lazy loading with React.lazy() and Suspense
- Tailwind CSS for styling (no custom CSS)
- shadcn/ui components for UI elements

TECHNICAL ARCHITECTURE:
- src/main.tsx: Entry point with BrowserRouter
- src/App.tsx: Routes configuration
- src/pages/Index.tsx: Home page with all sections
- src/index.css: Tailwind directives + custom utilities
- src/components/sections/: Hero, Features, Testimonials, CTA, Footer
- src/components/ui/: Button, Card, Badge (shadcn/ui pattern)
- src/lib/utils.ts: cn() helper for class merging

SEO & PERFORMANCE:
- React Helmet for meta tags
- Semantic HTML: header, main, section, article, footer
- Skip-to-content link for accessibility
- Proper heading hierarchy (single h1 per page)
- Image optimization with lazy loading

MODERN DESIGN PATTERNS:
- Hero sections with gradient backgrounds or split layouts
- Bento grid layouts for features
- Glassmorphism cards with backdrop-blur
- Floating navigation bars with scroll effects
- Scroll-triggered animations (Framer Motion or CSS)
- Magnetic buttons and hover effects
- 3D transforms for depth
- Dark mode support with Tailwind dark: variants
`,
    webapp: `
VITE + REACT 18 BEST PRACTICES (2024-2025):
- Use Vite as build tool for fast HMR and builds
- React 18 with TypeScript strict mode
- React Router v6 for all navigation
- TanStack Query (React Query) for data fetching
- Zustand or React Context for state management
- Tailwind CSS + shadcn/ui for styling

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
  },
}

// ============================================================================
// ENHANCED CODEGEN PROMPTS
// ============================================================================

export const codegenEnhancements = {
  webapp: `
VITE + REACT CODE STANDARDS:
1. File naming: kebab-case for files, PascalCase for components
2. Always use TypeScript with strict mode
3. Import order: React, third-party, local, styles
4. Use path aliases (@/components, @/lib, etc.) via vite.config.ts
5. Colocate related files (component + styles + tests)

COMPONENT PATTERNS:
\`\`\`tsx
// Good: Functional Component
export default function Page() {
  const { data, isLoading } = useQuery({ queryKey: ['data'], queryFn: fetchData })
  if (isLoading) return <Skeleton />
  return <div>{data}</div>
}

// Good: Interactive Component with state
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}

// Good: Loading state component
export function Loading() {
  return <Skeleton className="h-[200px] w-full" />
}

// Good: Error boundary
export function ErrorFallback({ error, resetErrorBoundary }) {
  return <div><button onClick={resetErrorBoundary}>Try again</button></div>
}
\`\`\`

STYLING WITH TAILWIND:
- Use cn() helper for conditional classes
- Prefer composition over customization
- Use design tokens (primary, muted, etc.)
- Mobile-first responsive (sm:, md:, lg:)
- Use @apply sparingly, prefer utilities

DATA FETCHING:
- TanStack Query (React Query) for server state
- Zustand or React Context for client state
- React Hook Form + Zod for forms
- Real-time: Supabase subscriptions
`,

  website: `
VITE + REACT MARKETING WEBSITE CODE STANDARDS:
1. File naming: kebab-case for files, PascalCase for components
2. TypeScript for all files with strict mode
3. All components are client-side (Vite SPA)
4. Import order: React, third-party, local, styles
5. Use path aliases (@/components, @/lib, etc.) via vite.config.ts

PAGE COMPONENT PATTERN:
\`\`\`tsx
// src/pages/Index.tsx
import { Hero } from '../components/sections/hero'
import { Features } from '../components/sections/features'
import { Testimonials } from '../components/sections/testimonials'
import { CTA } from '../components/sections/cta'
import { Footer } from '../components/sections/footer'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
\`\`\`

SECTION COMPONENT PATTERN:
\`\`\`tsx
// src/components/sections/hero.tsx
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Your Headline Here
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your subheadline describing the value proposition
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/demo">Watch Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
\`\`\`

ANIMATED COMPONENT PATTERN:
\`\`\`tsx
import { motion } from 'framer-motion'

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

STYLING WITH TAILWIND:
- Use cn() helper for conditional classes
- Mobile-first responsive (sm:, md:, lg:, xl:)
- Dark mode with dark: prefix
- Gradients: bg-gradient-to-r from-primary to-secondary
- Glass effects: backdrop-blur-md bg-white/10 border border-white/20
- Animations: animate-fade-in, animate-slide-up (custom keyframes)
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

  return []
}

export default {
  buildControllerPrompt,
  buildCodegenPrompt,
  getIndustryTemplate,
  getComponentPatterns,
}
