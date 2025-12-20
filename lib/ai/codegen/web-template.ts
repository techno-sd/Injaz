// Web Application Template Generator
// Generates Vite + React + React Router + Tailwind + shadcn/ui files

import type { UnifiedAppSchema, PageSchema, AuthSchema } from '@/types/app-schema'

export interface WebAppFile {
  path: string
  content: string
  language: string
}

export function generateWebAppTemplate(schema: UnifiedAppSchema): WebAppFile[] {
  const files: WebAppFile[] = []
  const { meta, design, structure, features } = schema

  // Main entry - src/pages/Index.tsx (this is the main page that preview looks for)
  files.push({
    path: 'src/pages/Index.tsx',
    content: generateHomePage(schema),
    language: 'typescript',
  })

  // App.tsx with routes
  files.push({
    path: 'src/App.tsx',
    content: generateAppWithRoutes(structure),
    language: 'typescript',
  })

  // Global CSS
  files.push({
    path: 'src/index.css',
    content: generateGlobalCss(design),
    language: 'css',
  })

  // Generate additional pages
  structure.pages
    .filter((page) => page.path !== '/' && page.path !== '/index')
    .forEach((page) => {
      const pageName = page.name.replace(/\s+/g, '')
      files.push({
        path: `src/pages/${pageName}.tsx`,
        content: generatePage(schema, page),
        language: 'typescript',
      })
    })

  // Lib files
  files.push({
    path: 'src/lib/utils.ts',
    content: generateUtils(),
    language: 'typescript',
  })

  // Components - use relative imports for Vite compatibility
  files.push({
    path: 'src/components/ui/button.tsx',
    content: generateButtonComponent(),
    language: 'typescript',
  })

  files.push({
    path: 'src/components/ui/card.tsx',
    content: generateCardComponent(),
    language: 'typescript',
  })

  files.push({
    path: 'src/components/Header.tsx',
    content: generateHeaderComponent(structure.navigation),
    language: 'typescript',
  })

  files.push({
    path: 'src/components/Footer.tsx',
    content: generateFooterComponent(),
    language: 'typescript',
  })

  // Auth pages if enabled
  if (features.auth?.enabled) {
    files.push({
      path: 'src/pages/Login.tsx',
      content: generateLoginPage(features.auth),
      language: 'typescript',
    })

    files.push({
      path: 'src/pages/Signup.tsx',
      content: generateSignupPage(features.auth),
      language: 'typescript',
    })
  }

  // NotFound page
  files.push({
    path: 'src/pages/NotFound.tsx',
    content: generateNotFoundPage(),
    language: 'typescript',
  })

  return files
}

function generateAppWithRoutes(structure: any): string {
  const pages = structure.pages || []
  const additionalPages = pages.filter((p: any) => p.path !== '/' && p.path !== '/index')

  const imports = [
    `import { Routes, Route } from 'react-router-dom'`,
    `import Index from './pages/Index'`,
    `import NotFound from './pages/NotFound'`,
    ...additionalPages.map((p: any) => `import ${p.name.replace(/\s+/g, '')} from './pages/${p.name.replace(/\s+/g, '')}'`),
  ]

  const routes = [
    `<Route path="/" element={<Index />} />`,
    ...additionalPages.map((p: any) => {
      const path = p.path.startsWith('/') ? p.path : `/${p.path}`
      return `<Route path="${path}" element={<${p.name.replace(/\s+/g, '')} />} />`
    }),
    `<Route path="*" element={<NotFound />} />`,
  ]

  return `${imports.join('\n')}

function App() {
  return (
    <Routes>
      ${routes.join('\n      ')}
    </Routes>
  )
}

export default App`
}

function generateGlobalCss(design: any): string {
  const colors = design?.colors || {
    primary: '#8b5cf6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#0f172a',
    foreground: '#f8fafc',
    muted: '#64748b',
    border: '#334155',
  }

  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: Inter, system-ui, sans-serif;
    margin: 0;
    min-height: 100vh;
  }
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}`
}

function generateHomePage(schema: any): string {
  const name = schema.meta?.name || 'My App'
  const description = schema.meta?.description || 'Welcome to your new application'

  return `import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Sparkles, ArrowRight } from "lucide-react"

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-16 w-16 text-purple-400 animate-pulse" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              ${name}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              ${description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Fast & Modern', description: 'Built with the latest technologies for optimal performance.' },
              { title: 'Easy to Use', description: 'Intuitive interface designed for users of all skill levels.' },
              { title: 'Fully Responsive', description: 'Looks great on any device, from mobile to desktop.' }
            ].map((feature, i) => (
              <Card key={i} className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600/20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to get started?</h2>
          <p className="text-lg text-gray-300 mb-8">Join thousands of satisfied users today.</p>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            Sign Up Free
          </Button>
        </div>
      </section>
    </main>
  )
}

export default Index`
}

function generatePage(schema: any, page: PageSchema): string {
  const pageName = page.name.toLowerCase()

  // Check for specific page types
  if (pageName.includes('about')) {
    return generateAboutPage(schema, page)
  }
  if (pageName.includes('contact')) {
    return generateContactPage(page)
  }
  if (pageName.includes('service')) {
    return generateServicesPage(page)
  }
  if (pageName.includes('pricing') || pageName.includes('plan')) {
    return generatePricingPage(page)
  }

  // Default page
  return generateDefaultPage(page)
}

function generateAboutPage(schema: any, page: PageSchema): string {
  return `import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

const ${page.name.replace(/\s+/g, '')} = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
              ${page.title}
            </h1>
            ${page.description ? `<p className="text-xl text-gray-300">${page.description}</p>` : ''}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-black/20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
              <p className="text-gray-300 text-lg mb-6">
                We are dedicated to delivering exceptional solutions that empower businesses
                and individuals to achieve their goals.
              </p>
              <p className="text-gray-400">
                Founded with a vision to make a difference, we continue to innovate and
                push boundaries in our industry.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl aspect-video flex items-center justify-center border border-white/10">
              <span className="text-gray-500">Company Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Innovation', description: 'We constantly push boundaries and embrace new ideas.' },
              { title: 'Integrity', description: 'We conduct business with honesty and transparency.' },
              { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' }
            ].map((value, i) => (
              <Card key={i} className="p-6 text-center bg-white/5 border-white/10">
                <h3 className="text-xl font-semibold mb-2 text-white">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-600/20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Want to learn more?</h2>
          <p className="text-gray-300 mb-8">Get in touch with us today.</p>
          <Button size="lg">Contact Us</Button>
        </div>
      </section>
    </main>
  )
}

export default ${page.name.replace(/\s+/g, '')}`
}

function generateContactPage(page: PageSchema): string {
  return `import { Button } from "../components/ui/button"

const ${page.name.replace(/\s+/g, '')} = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">${page.title}</h1>
          ${page.description ? `<p className="text-xl text-gray-300">${page.description}</p>` : ''}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-white">Get in Touch</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">Send Message</Button>
            </form>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-1 text-white">Address</h3>
                <p className="text-gray-400">123 Business Street, Suite 100<br/>City, State 12345</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Email</h3>
                <p className="text-gray-400">contact@example.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Phone</h3>
                <p className="text-gray-400">+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Business Hours</h3>
                <p className="text-gray-400">Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ${page.name.replace(/\s+/g, '')}`
}

function generateServicesPage(page: PageSchema): string {
  return `import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

const ${page.name.replace(/\s+/g, '')} = () => {
  const services = [
    { title: 'Consulting', description: 'Expert guidance to help you make informed decisions.' },
    { title: 'Development', description: 'Custom solutions built with cutting-edge technology.' },
    { title: 'Support', description: '24/7 dedicated support to ensure your success.' },
    { title: 'Training', description: 'Comprehensive training programs for your team.' },
    { title: 'Analytics', description: 'Data-driven insights to optimize your operations.' },
    { title: 'Integration', description: 'Seamless integration with your existing systems.' }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">${page.title}</h1>
          ${page.description ? `<p className="text-xl text-gray-300">${page.description}</p>` : ''}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, i) => (
            <Card key={i} className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-400 font-bold">{i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <Button variant="outline" size="sm" className="text-white border-white/20">Learn More</Button>
            </Card>
          ))}
        </div>

        <section className="py-16 bg-purple-600/20 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need a custom solution?</h2>
          <p className="text-lg text-gray-300 mb-8">Contact us to discuss your specific requirements.</p>
          <Button size="lg">Get a Quote</Button>
        </section>
      </div>
    </main>
  )
}

export default ${page.name.replace(/\s+/g, '')}`
}

function generatePricingPage(page: PageSchema): string {
  return `import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Check } from "lucide-react"

const ${page.name.replace(/\s+/g, '')} = () => {
  const plans = [
    { name: 'Starter', price: '9', features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'] },
    { name: 'Professional', price: '29', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'], popular: true },
    { name: 'Enterprise', price: '99', features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'] }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">${page.title}</h1>
          ${page.description ? `<p className="text-xl text-gray-300">${page.description}</p>` : ''}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={\`p-6 bg-white/5 border-white/10 \${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}\`}>
              {plan.popular && (
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Most Popular</span>
              )}
              <h3 className="text-2xl font-bold mt-2 text-white">{plan.name}</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-white">\${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
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
    </main>
  )
}

export default ${page.name.replace(/\s+/g, '')}`
}

function generateDefaultPage(page: PageSchema): string {
  return `import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

const ${page.name.replace(/\s+/g, '')} = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">${page.title}</h1>
          ${page.description ? `<p className="text-xl text-gray-300">${page.description}</p>` : ''}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 bg-white/5 border-white/10">
            <p className="text-gray-300 mb-6">
              Welcome to the ${page.title} page. This is where your content will appear.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {['Section 1', 'Section 2', 'Section 3'].map((section, i) => (
                <Card key={i} className="p-4 bg-white/5 border-white/10">
                  <h3 className="font-semibold mb-2 text-white">{section}</h3>
                  <p className="text-sm text-gray-400">Content for this section.</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg">Get Started</Button>
        </div>
      </div>
    </main>
  )
}

export default ${page.name.replace(/\s+/g, '')}`
}

function generateNotFoundPage(): string {
  return `import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Home } from "lucide-react"

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-gray-300">Page not found</p>
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default NotFound`
}

function generateUtils(): string {
  return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
}

function generateButtonComponent(): string {
  return `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`
}

function generateCardComponent(): string {
  return `import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }`
}

function generateHeaderComponent(navigation: any): string {
  const navItems = navigation?.items || []

  return `import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = ${JSON.stringify(navItems)}

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-white">
          Logo
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item: any) => (
            <Link
              key={item.id}
              to={item.path || '/'}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Button size="sm">Get Started</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item: any) => (
              <Link
                key={item.id}
                to={item.path || '/'}
                className="py-2 text-sm font-medium text-gray-300 hover:text-white"
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
  return `import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Brand</h3>
            <p className="text-sm text-gray-400">Your tagline or description here.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white">Features</Link></li>
              <li><Link to="#" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white">Privacy</Link></li>
              <li><Link to="#" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}`
}

function generateLoginPage(auth: AuthSchema): string {
  return `import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // TODO: Implement authentication
    console.log('Login:', { email, password })

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-8 rounded-xl border border-white/10">
          {error && (
            <div className="p-3 bg-red-500/20 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login`
}

function generateSignupPage(auth: AuthSchema): string {
  return `import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < ${auth.passwordMinLength || 8}) {
      setError('Password must be at least ${auth.passwordMinLength || 8} characters')
      return
    }

    setLoading(true)
    setError(null)

    // TODO: Implement authentication
    console.log('Signup:', { email, password })

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-8 rounded-xl border border-white/10">
          {error && (
            <div className="p-3 bg-red-500/20 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              minLength={${auth.passwordMinLength || 8}}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Signup`
}
