// Web Application Template Generator
// Generates Next.js 14 + App Router + Supabase files

import type { UnifiedAppSchema, PageSchema, LayoutSchema, AuthSchema } from '@/types/app-schema'

export interface WebAppFile {
  path: string
  content: string
  language: string
}

export function generateWebAppTemplate(schema: UnifiedAppSchema): WebAppFile[] {
  const files: WebAppFile[] = []
  const { meta, design, structure, features, components } = schema

  // Package.json
  files.push({
    path: 'package.json',
    content: generatePackageJson(meta, features),
    language: 'json',
  })

  // next.config.js
  files.push({
    path: 'next.config.js',
    content: generateNextConfig(),
    language: 'javascript',
  })

  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: generateTsConfig(),
    language: 'json',
  })

  // tailwind.config.ts
  files.push({
    path: 'tailwind.config.ts',
    content: generateTailwindConfig(design),
    language: 'typescript',
  })

  // postcss.config.js
  files.push({
    path: 'postcss.config.js',
    content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    language: 'javascript',
  })

  // .env.example
  files.push({
    path: '.env.example',
    content: generateEnvExample(features),
    language: 'plaintext',
  })

  // App directory files
  files.push({
    path: 'app/layout.tsx',
    content: generateRootLayout(meta, design, structure),
    language: 'typescript',
  })

  files.push({
    path: 'app/globals.css',
    content: generateGlobalCss(design),
    language: 'css',
  })

  files.push({
    path: 'app/page.tsx',
    content: generateHomePage(schema),
    language: 'typescript',
  })

  files.push({
    path: 'app/loading.tsx',
    content: generateLoadingPage(),
    language: 'typescript',
  })

  // Generate additional pages
  structure.pages
    .filter((page) => page.path !== '/' && page.path !== '/index')
    .forEach((page) => {
      const pagePath = page.path.startsWith('/') ? page.path.slice(1) : page.path
      files.push({
        path: `app/${pagePath}/page.tsx`,
        content: generatePage(schema, page),
        language: 'typescript',
      })
    })

  // Lib files
  files.push({
    path: 'lib/utils.ts',
    content: generateUtils(),
    language: 'typescript',
  })

  if (features.database || features.auth) {
    files.push({
      path: 'lib/supabase.ts',
      content: generateSupabaseClient(),
      language: 'typescript',
    })
  }

  // Components
  files.push({
    path: 'components/ui/button.tsx',
    content: generateButtonComponent(),
    language: 'typescript',
  })

  files.push({
    path: 'components/ui/card.tsx',
    content: generateCardComponent(),
    language: 'typescript',
  })

  files.push({
    path: 'components/header.tsx',
    content: generateHeaderComponent(structure.navigation),
    language: 'typescript',
  })

  files.push({
    path: 'components/footer.tsx',
    content: generateFooterComponent(),
    language: 'typescript',
  })

  // Auth pages if enabled
  if (features.auth?.enabled) {
    files.push({
      path: 'app/login/page.tsx',
      content: generateLoginPage(features.auth),
      language: 'typescript',
    })

    files.push({
      path: 'app/signup/page.tsx',
      content: generateSignupPage(features.auth),
      language: 'typescript',
    })
  }

  return files
}

function generatePackageJson(meta: any, features: any): string {
  const deps: Record<string, string> = {
    next: '^14.0.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'class-variance-authority': '^0.7.0',
    clsx: '^2.0.0',
    'tailwind-merge': '^2.0.0',
    'lucide-react': '^0.294.0',
  }

  if (features.database || features.auth) {
    deps['@supabase/supabase-js'] = '^2.38.0'
    deps['@supabase/ssr'] = '^0.1.0'
  }

  return JSON.stringify(
    {
      name: meta.name.toLowerCase().replace(/\s+/g, '-'),
      version: meta.version || '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: deps,
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        autoprefixer: '^10.0.1',
        postcss: '^8',
        tailwindcss: '^3.4.0',
        typescript: '^5',
      },
    },
    null,
    2
  )
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
}

module.exports = nextConfig`
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    null,
    2
  )
}

function generateTailwindConfig(design: any): string {
  const { colors } = design
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${colors.primary}',
        secondary: '${colors.secondary}',
        accent: '${colors.accent}',
        background: '${colors.background}',
        foreground: '${colors.foreground}',
        muted: '${colors.muted}',
        border: '${colors.border}',
      },
      fontFamily: {
        heading: ['${design.typography.headingFont}', 'system-ui', 'sans-serif'],
        body: ['${design.typography.bodyFont}', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config`
}

function generateEnvExample(features: any): string {
  let content = `# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

  if (features.database || features.auth) {
    content += `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
`
  }

  return content
}

function generateRootLayout(meta: any, design: any, structure: any): string {
  return `import type { Metadata } from 'next'
import { ${design.typography.headingFont.replace(' ', '_')}, ${design.typography.bodyFont.replace(' ', '_')} } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const headingFont = ${design.typography.headingFont.replace(' ', '_')}({
  subsets: ['latin'],
  variable: '--font-heading',
})

const bodyFont = ${design.typography.bodyFont.replace(' ', '_')}({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: '${meta.name}',
  description: '${meta.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={design.theme === 'dark' ? 'dark' : ''}>
      <body className={\`\${headingFont.variable} \${bodyFont.variable} font-body antialiased\`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}`
}

function generateGlobalCss(design: any): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: ${design.colors.primary};
  --color-secondary: ${design.colors.secondary};
  --color-accent: ${design.colors.accent};
  --color-background: ${design.colors.background};
  --color-foreground: ${design.colors.foreground};
}

body {
  color: var(--color-foreground);
  background: var(--color-background);
}

@layer base {
  * {
    @apply border-border;
  }
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}`
}

function generateHomePage(schema: any): string {
  return `import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-heading font-bold tracking-tight mb-6">
              ${schema.meta.name}
            </h1>
            <p className="text-xl text-muted mb-8">
              ${schema.meta.description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/10">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Feature 1', 'Feature 2', 'Feature 3'].map((feature, i) => (
              <Card key={i} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                <p className="text-muted">Description of the feature and its benefits.</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of satisfied users today.</p>
          <Button size="lg" variant="secondary">Sign Up Free</Button>
        </div>
      </section>
    </div>
  )
}`
}

function generateLoadingPage(): string {
  return `export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  )
}`
}

function generatePage(schema: any, page: PageSchema): string {
  return `export default function ${page.name.replace(/\s+/g, '')}Page() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">${page.title}</h1>
      ${page.description ? `<p className="text-muted text-lg mb-8">${page.description}</p>` : ''}
      <div>
        {/* Page content */}
      </div>
    </div>
  )
}`
}

function generateUtils(): string {
  return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
}

function generateSupabaseClient(): string {
  return `import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side client
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies in edge runtime
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies in edge runtime
          }
        },
      },
    }
  )
}`
}

function generateButtonComponent(): string {
  return `import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        outline: 'border border-border bg-transparent hover:bg-muted/10',
        ghost: 'hover:bg-muted/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }`
}

function generateCardComponent(): string {
  return `import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-background shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }`
}

function generateHeaderComponent(navigation: any): string {
  return `'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = ${JSON.stringify(navigation?.items || [])}

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-heading font-bold">
          Logo
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item: any) => (
            <Link
              key={item.id}
              href={item.path || '#'}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Button size="sm">Get Started</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item: any) => (
              <Link
                key={item.id}
                href={item.path || '#'}
                className="py-2 text-sm font-medium text-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button className="mt-2">Get Started</Button>
          </nav>
        </div>
      )}
    </header>
  )
}`
}

function generateFooterComponent(): string {
  return `import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Brand</h3>
            <p className="text-sm opacity-70">Your tagline or description here.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link href="#" className="hover:opacity-100">Features</Link></li>
              <li><Link href="#" className="hover:opacity-100">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link href="#" className="hover:opacity-100">About</Link></li>
              <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link href="#" className="hover:opacity-100">Privacy</Link></li>
              <li><Link href="#" className="hover:opacity-100">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}`
}

function generateLoginPage(auth: AuthSchema): string {
  return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '${auth.redirectAfterLogin || '/dashboard'}'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold text-center mb-8">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}`
}

function generateSignupPage(auth: AuthSchema): string {
  return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < ${auth.passwordMinLength || 8}) {
      setError('Password must be at least ${auth.passwordMinLength || 8} characters')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      ${auth.requireEmailVerification ? "setSuccess(true)" : `window.location.href = '${auth.redirectAfterLogin || '/dashboard'}'`}
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Check your email</h1>
          <p className="text-muted">We've sent you a confirmation link to verify your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold text-center mb-8">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              minLength={${auth.passwordMinLength || 8}}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}`
}
