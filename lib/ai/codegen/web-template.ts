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
  const components = schema.components || []
  const pageComponentIds = page.components || []

  // Try to find components for this page
  const pageComponents = pageComponentIds
    .map((id: string) => components.find((c: any) => c.id === id))
    .filter(Boolean)

  // Generate sections based on page type or default content
  const contentSections = generatePageContent(page, pageComponents, schema)

  return `import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ${page.name.replace(/\s+/g, '')}Page() {
  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold tracking-tight mb-4">
              ${page.title}
            </h1>
            ${page.description ? `<p className="text-xl text-muted">${page.description}</p>` : ''}
          </div>
        </div>
      </section>

${contentSections}
    </div>
  )
}`
}

function generatePageContent(page: PageSchema, components: any[], schema: any): string {
  const pageType = page.type || 'static'
  const pageName = page.name.toLowerCase()

  // Check for specific page types
  if (pageName.includes('about')) {
    return generateAboutPageContent(schema)
  }
  if (pageName.includes('contact')) {
    return generateContactPageContent()
  }
  if (pageName.includes('service')) {
    return generateServicesPageContent(schema)
  }
  if (pageName.includes('pricing') || pageName.includes('plan')) {
    return generatePricingPageContent()
  }
  if (pageName.includes('feature')) {
    return generateFeaturesPageContent(schema)
  }
  if (pageName.includes('blog') || pageName.includes('post') || pageName.includes('article')) {
    return generateBlogPageContent()
  }
  if (pageName.includes('faq') || pageName.includes('help')) {
    return generateFaqPageContent()
  }
  if (pageName.includes('team') || pageName.includes('member')) {
    return generateTeamPageContent()
  }
  if (pageName.includes('portfolio') || pageName.includes('work') || pageName.includes('project')) {
    return generatePortfolioPageContent()
  }
  if (pageName.includes('testimonial') || pageName.includes('review')) {
    return generateTestimonialsPageContent()
  }

  // Default content based on components or generic sections
  if (components.length > 0) {
    return generateComponentBasedContent(components)
  }

  return generateDefaultPageContent(page)
}

function generateAboutPageContent(schema: any): string {
  return `      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-4">Our Mission</h2>
              <p className="text-muted text-lg mb-6">
                We are dedicated to delivering exceptional solutions that empower businesses
                and individuals to achieve their goals. Our commitment to excellence drives
                everything we do.
              </p>
              <p className="text-muted">
                Founded with a vision to make a difference, we continue to innovate and
                push boundaries in our industry.
              </p>
            </div>
            <div className="bg-muted/20 rounded-2xl aspect-video flex items-center justify-center">
              <span className="text-muted">Company Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/10">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Innovation', description: 'We constantly push boundaries and embrace new ideas.' },
              { title: 'Integrity', description: 'We conduct business with honesty and transparency.' },
              { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' }
            ].map((value, i) => (
              <Card key={i} className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Want to learn more?</h2>
          <p className="text-muted mb-8">Get in touch with us today.</p>
          <Button size="lg">Contact Us</Button>
        </div>
      </section>`
}

function generateContactPageContent(): string {
  return `      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Get in Touch</h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">Send Message</Button>
              </form>
            </div>
            <div className="lg:pl-12">
              <h2 className="text-2xl font-heading font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted">123 Business Street, Suite 100<br/>City, State 12345</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted">contact@example.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-muted">Monday - Friday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>`
}

function generateServicesPageContent(schema: any): string {
  return `      {/* Services Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Consulting', description: 'Expert guidance to help you make informed decisions and achieve your objectives.' },
              { title: 'Development', description: 'Custom solutions built with cutting-edge technology to meet your unique needs.' },
              { title: 'Support', description: '24/7 dedicated support to ensure your success and peace of mind.' },
              { title: 'Training', description: 'Comprehensive training programs to empower your team with new skills.' },
              { title: 'Analytics', description: 'Data-driven insights to optimize your operations and drive growth.' },
              { title: 'Integration', description: 'Seamless integration with your existing systems and workflows.' }
            ].map((service, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted mb-4">{service.description}</p>
                <Button variant="outline" size="sm">Learn More</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Need a custom solution?</h2>
          <p className="text-lg opacity-90 mb-8">Contact us to discuss your specific requirements.</p>
          <Button size="lg" variant="secondary">Get a Quote</Button>
        </div>
      </section>`
}

function generatePricingPageContent(): string {
  return `      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: '9', features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'] },
              { name: 'Professional', price: '29', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'], popular: true },
              { name: 'Enterprise', price: '99', features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'] }
            ].map((plan, i) => (
              <Card key={i} className={\`p-6 \${plan.popular ? 'ring-2 ring-primary scale-105' : ''}\`}>
                {plan.popular && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Most Popular</span>
                )}
                <h3 className="text-2xl font-bold mt-2">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold">\${plan.price}</span>
                  <span className="text-muted">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/10">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time.' },
              { q: 'Is there a free trial?', a: 'Yes, all plans come with a 14-day free trial.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and PayPal.' }
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>`
}

function generateFeaturesPageContent(schema: any): string {
  return `      {/* Features Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: 'Easy to Use', description: 'Intuitive interface designed for users of all skill levels.' },
              { title: 'Fast & Reliable', description: 'Built for performance with 99.9% uptime guarantee.' },
              { title: 'Secure', description: 'Enterprise-grade security to protect your data.' },
              { title: 'Scalable', description: 'Grows with your business, from startup to enterprise.' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight Section */}
      <section className="py-16 bg-muted/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-muted/20 rounded-2xl aspect-video flex items-center justify-center">
              <span className="text-muted">Feature Preview</span>
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold mb-4">Powerful Features</h2>
              <p className="text-muted text-lg mb-6">
                Our platform provides everything you need to succeed, with powerful tools
                and features designed to streamline your workflow.
              </p>
              <Button size="lg">Start Free Trial</Button>
            </div>
          </div>
        </div>
      </section>`
}

function generateBlogPageContent(): string {
  return `      {/* Blog Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-muted/20 aspect-video flex items-center justify-center">
                  <span className="text-muted">Blog Image</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <span>Jan {i}, 2024</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                    <a href="#">Blog Post Title {i}</a>
                  </h3>
                  <p className="text-muted mb-4">
                    A brief description of the blog post content that gives readers a preview...
                  </p>
                  <Button variant="outline" size="sm">Read More</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Subscribe to our Newsletter</h2>
          <p className="opacity-90 mb-6">Get the latest updates delivered to your inbox.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-foreground"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </section>`
}

function generateFaqPageContent(): string {
  return `      {/* FAQ Section */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {[
              { q: 'What is your refund policy?', a: 'We offer a 30-day money-back guarantee on all plans. If you are not satisfied, simply contact support for a full refund.' },
              { q: 'How do I get started?', a: 'Simply sign up for a free account, choose your plan, and follow our quick setup guide. You will be up and running in minutes.' },
              { q: 'Do you offer customer support?', a: 'Yes, we offer 24/7 customer support via email and live chat. Premium plans also include phone support.' },
              { q: 'Can I upgrade or downgrade my plan?', a: 'Absolutely! You can change your plan at any time from your account settings. Changes take effect immediately.' },
              { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption and security measures to protect your data. We are also SOC 2 compliant.' },
              { q: 'Do you offer a free trial?', a: 'Yes, all plans come with a 14-day free trial. No credit card required to start.' }
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/10">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Still have questions?</h2>
          <p className="text-muted mb-8">Our support team is here to help.</p>
          <Button size="lg">Contact Support</Button>
        </div>
      </section>`
}

function generateTeamPageContent(): string {
  return `      {/* Team Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'John Smith', role: 'CEO & Founder' },
              { name: 'Sarah Johnson', role: 'CTO' },
              { name: 'Mike Williams', role: 'Lead Designer' },
              { name: 'Emily Brown', role: 'Marketing Director' },
              { name: 'David Lee', role: 'Senior Developer' },
              { name: 'Lisa Chen', role: 'Product Manager' },
              { name: 'James Wilson', role: 'Sales Lead' },
              { name: 'Anna Garcia', role: 'Customer Success' }
            ].map((member, i) => (
              <Card key={i} className="p-6 text-center">
                <div className="w-24 h-24 bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-muted">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-muted">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Join Our Team</h2>
          <p className="text-lg opacity-90 mb-8">We are always looking for talented individuals.</p>
          <Button size="lg" variant="secondary">View Open Positions</Button>
        </div>
      </section>`
}

function generatePortfolioPageContent(): string {
  return `      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                <div className="bg-muted/20 aspect-square flex items-center justify-center relative">
                  <span className="text-muted">Project {i}</span>
                  <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary">View Project</Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">Project Title {i}</h3>
                  <p className="text-sm text-muted">Category</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/10">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Interested in working together?</h2>
          <p className="text-muted mb-8">Let us discuss your project.</p>
          <Button size="lg">Start a Project</Button>
        </div>
      </section>`
}

function generateTestimonialsPageContent(): string {
  return `      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Alex Thompson', company: 'Tech Corp', quote: 'This product has transformed the way we work. Highly recommended!' },
              { name: 'Maria Rodriguez', company: 'Design Studio', quote: 'Outstanding service and support. The team went above and beyond.' },
              { name: 'Chris Park', company: 'Startup Inc', quote: 'Best investment we have made this year. The ROI has been incredible.' },
              { name: 'Rachel Green', company: 'Marketing Co', quote: 'Easy to use and incredibly powerful. Exactly what we needed.' },
              { name: 'Tom Harris', company: 'Finance Ltd', quote: 'The customer support is exceptional. They truly care about their users.' },
              { name: 'Sophie Miller', company: 'E-commerce Plus', quote: 'We have seen a 40% increase in productivity since switching.' }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to join them?</h2>
          <p className="text-lg opacity-90 mb-8">Start your success story today.</p>
          <Button size="lg" variant="secondary">Get Started Free</Button>
        </div>
      </section>`
}

function generateComponentBasedContent(components: any[]): string {
  return components.map(comp => {
    switch (comp.type) {
      case 'hero':
        return `      <section className="py-20 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">${comp.props?.title || 'Welcome'}</h2>
          <p className="text-xl text-muted mb-8">${comp.props?.subtitle || 'Discover what we offer.'}</p>
          <Button size="lg">${comp.props?.ctaText || 'Learn More'}</Button>
        </div>
      </section>`
      case 'features':
        return `      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">${comp.props?.title || 'Features'}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Feature 1', 'Feature 2', 'Feature 3'].map((f, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold mb-2">{f}</h3>
                <p className="text-muted">Description of the feature.</p>
              </Card>
            ))}
          </div>
        </div>
      </section>`
      default:
        return `      <section className="py-16">
        <div className="container">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">${comp.name || 'Section'}</h2>
            <p className="text-muted">Content goes here.</p>
          </Card>
        </div>
      </section>`
    }
  }).join('\n\n')
}

function generateDefaultPageContent(page: PageSchema): string {
  return `      {/* Content Section */}
      <section className="py-16">
        <div className="container">
          <div className="prose prose-lg max-w-3xl mx-auto">
            <p className="text-muted">
              Welcome to the ${page.title} page. This is where your content will appear.
              You can customize this page by adding components to your schema or editing the template.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/10">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {['Section 1', 'Section 2', 'Section 3'].map((section, i) => (
              <Card key={i} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{section}</h3>
                <p className="text-muted">Content for this section.</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Get Started Today</h2>
          <p className="text-muted mb-8">Ready to take the next step?</p>
          <Button size="lg">Contact Us</Button>
        </div>
      </section>`
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
