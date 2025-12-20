// Vite + React templates for guest/demo users (no authentication required)
// Updated to use Vite + React Router + Tailwind CSS (same stack as Lovable)

export interface GuestTemplate {
  id: string
  name: string
  icon: string
  description: string
  files: { path: string; content: string }[]
}

// =============================================================================
// BASE VITE + REACT FILES (shared across all templates)
// =============================================================================

const BASE_PACKAGE_JSON = JSON.stringify({
  name: 'my-app',
  version: '0.1.0',
  private: true,
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview'
  },
  dependencies: {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^6.26.0',
    '@tanstack/react-query': '^5.51.1',
    'class-variance-authority': '^0.7.0',
    'clsx': '^2.1.1',
    'tailwind-merge': '^2.3.0',
    'lucide-react': '^0.396.0',
    'sonner': '^1.5.0',
    'framer-motion': '^11.0.0'
  },
  devDependencies: {
    'typescript': '^5.4.5',
    '@types/react': '^18.3.3',
    '@types/react-dom': '^18.3.0',
    'vite': '^5.3.4',
    '@vitejs/plugin-react': '^4.3.1',
    'tailwindcss': '^3.4.4',
    'postcss': '^8.4.38',
    'autoprefixer': '^10.4.19'
  }
}, null, 2)

const BASE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`

const BASE_MAIN_TSX = `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)`

const BASE_APP_TSX = `import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App`

const BASE_NOT_FOUND = `import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found</p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        Go Home
      </Link>
    </div>
  )
}`

const BASE_INDEX_CSS = `@tailwind base;
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
    --primary-foreground: 210 20% 98%;
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
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r;
  }
}`

const BASE_UTILS_TS = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

const BASE_VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`

const BASE_TAILWIND_CONFIG = `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

export default config`

const BASE_TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    baseUrl: '.',
    paths: {
      '@/*': ['./src/*']
    }
  },
  include: ['src'],
  references: [{ path: './tsconfig.node.json' }]
}, null, 2)

const BASE_TSCONFIG_NODE = JSON.stringify({
  compilerOptions: {
    composite: true,
    skipLibCheck: true,
    module: 'ESNext',
    moduleResolution: 'bundler',
    allowSyntheticDefaultImports: true
  },
  include: ['vite.config.ts']
}, null, 2)

const BASE_POSTCSS_CONFIG = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`

// Helper function to create base files for a template
function createGuestBaseFiles(pageContent: string, additionalFiles: { path: string; content: string }[] = []): { path: string; content: string }[] {
  return [
    { path: 'package.json', content: BASE_PACKAGE_JSON },
    { path: 'index.html', content: BASE_INDEX_HTML },
    { path: 'src/main.tsx', content: BASE_MAIN_TSX },
    { path: 'src/App.tsx', content: BASE_APP_TSX },
    { path: 'src/pages/Index.tsx', content: pageContent },
    { path: 'src/pages/NotFound.tsx', content: BASE_NOT_FOUND },
    { path: 'src/index.css', content: BASE_INDEX_CSS },
    { path: 'src/lib/utils.ts', content: BASE_UTILS_TS },
    { path: 'vite.config.ts', content: BASE_VITE_CONFIG },
    { path: 'tailwind.config.ts', content: BASE_TAILWIND_CONFIG },
    { path: 'tsconfig.json', content: BASE_TSCONFIG },
    { path: 'tsconfig.node.json', content: BASE_TSCONFIG_NODE },
    { path: 'postcss.config.js', content: BASE_POSTCSS_CONFIG },
    ...additionalFiles,
  ]
}

export const GUEST_TEMPLATES: Record<string, GuestTemplate> = {
  blank: {
    id: 'blank',
    name: 'Blank Project',
    icon: '📄',
    description: 'Start from scratch with Vite + React',
    files: createGuestBaseFiles(`export default function Index() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-white/40">Your preview will appear here</p>
      </div>
    </div>
  )
}`),
  },

  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    icon: '🚀',
    description: 'Modern landing page with hero and features',
    files: createGuestBaseFiles(`import { motion } from 'framer-motion'

const features = [
  { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed with edge computing and smart caching.' },
  { icon: '🔒', title: 'Enterprise Security', description: 'Bank-level encryption and SOC2 compliance built-in.' },
  { icon: '🎨', title: 'Beautiful Design', description: 'Stunning templates designed by world-class designers.' },
  { icon: '🔧', title: 'Developer Tools', description: 'Powerful CLI, APIs, and SDKs for every major language.' },
  { icon: '📊', title: 'Analytics', description: 'Real-time insights and comprehensive dashboards.' },
  { icon: '🌍', title: 'Global Scale', description: 'Deploy to 30+ regions worldwide with auto-scaling.' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO at TechCorp', quote: 'Absolutely incredible platform. Shipped our product 3x faster.', avatar: 'S' },
  { name: 'Mike Johnson', role: 'Lead Dev at StartupXYZ', quote: 'Best developer experience I\\'ve ever had.', avatar: 'M' },
  { name: 'Alex Rivera', role: 'Founder at CloudApp', quote: 'Migrated our entire infrastructure in a weekend.', avatar: 'A' },
]

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-xl">YourApp</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            <button className="text-gray-300 hover:text-white transition-colors">Sign In</button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300 mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now in Public Beta
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Build Something
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The modern platform for building fast, secure, and beautiful applications. Ship faster with our powerful tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2">
              Start Building Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium text-lg transition-colors">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
              { value: '50ms', label: 'Response Time' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-medium">Features</span>
            <h2 className="text-4xl font-bold mt-2">Everything You Need</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-medium">Testimonials</span>
            <h2 className="text-4xl font-bold mt-2">Loved by Developers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-yellow-400 mb-4">★★★★★</div>
                <p className="text-gray-300 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-white/10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of developers building the future. Free to start, no credit card required.
              </p>
              <button className="px-8 py-4 bg-white text-slate-900 hover:bg-gray-100 rounded-xl font-medium text-lg transition-colors">
                Start Building Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-xl">YourApp</span>
              </div>
              <p className="text-gray-500">Build the future with the most powerful platform for modern applications.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center text-gray-600">
            © 2024 YourApp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}`),
  },

  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    description: 'Analytics dashboard with stats and charts',
    files: createGuestBaseFiles(`import { useState } from 'react'

const stats = [
  { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up' },
  { label: 'Subscriptions', value: '+2,350', change: '+180.1%', trend: 'up' },
  { label: 'Sales', value: '+12,234', change: '+19%', trend: 'up' },
  { label: 'Active Now', value: '+573', change: '+201', trend: 'up' },
]

const recentSales = [
  { name: 'Olivia Martin', email: 'olivia@email.com', amount: '+$1,999.00' },
  { name: 'Jackson Lee', email: 'jackson@email.com', amount: '+$39.00' },
  { name: 'Isabella Nguyen', email: 'isabella@email.com', amount: '+$299.00' },
  { name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
  { name: 'Sofia Davis', email: 'sofia@email.com', amount: '+$39.00' },
]

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={\`\${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-white/10 transition-all duration-300 flex flex-col\`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-lg">Dashboard</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="flex-1 p-4">
          {[
            { icon: '📊', label: 'Overview', active: true },
            { icon: '👥', label: 'Customers' },
            { icon: '📦', label: 'Products' },
            { icon: '📈', label: 'Analytics' },
            { icon: '⚙️', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors \${
                item.active ? 'bg-purple-600' : 'hover:bg-white/10'
              }\`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Overview</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">🔔</button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className={\`text-sm \${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}\`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid lg:grid-cols-7 gap-6">
            {/* Chart */}
            <div className="lg:col-span-4 p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-4">Overview</h3>
              <div className="h-[300px] flex items-end gap-2">
                {[40, 25, 55, 30, 45, 65, 50, 70, 45, 60, 75, 55].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: \`\${height}%\` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="lg:col-span-3 p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-4">Recent Sales</h3>
              <p className="text-sm text-gray-400 mb-4">You made 265 sales this month.</p>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                        {sale.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{sale.name}</div>
                        <div className="text-xs text-gray-500">{sale.email}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}`),
  },

  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    icon: '💼',
    description: 'Personal portfolio with projects',
    files: createGuestBaseFiles(`import { useState } from 'react'
import { motion } from 'framer-motion'

const projects = [
  {
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce platform built with React and Node.js',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    tags: ['React', 'Node.js', 'MongoDB'],
    link: '#',
  },
  {
    title: 'Task Management App',
    description: 'Collaborative task management with real-time updates',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=600&fit=crop',
    tags: ['TypeScript', 'Next.js', 'Prisma'],
    link: '#',
  },
  {
    title: 'AI Chat Interface',
    description: 'Conversational AI interface with natural language processing',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    tags: ['Python', 'FastAPI', 'OpenAI'],
    link: '#',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard with interactive visualizations',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    tags: ['React', 'D3.js', 'PostgreSQL'],
    link: '#',
  },
]

const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL']

export default function Index() {
  const [filter, setFilter] = useState('All')
  const allTags = ['All', ...new Set(projects.flatMap(p => p.tags))]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">JD</span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="#projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold"
          >
            JD
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            John Doe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8"
          >
            Full-Stack Developer & UI Designer
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {skills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">About Me</h2>
          <p className="text-gray-400 text-lg text-center leading-relaxed">
            I'm a passionate full-stack developer with 5+ years of experience building web applications.
            I love creating beautiful, performant, and accessible user experiences. When I'm not coding,
            you can find me exploring new technologies, contributing to open source, or enjoying a good cup of coffee.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Projects</h2>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={\`px-4 py-2 rounded-full text-sm transition-colors \${
                  filter === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }\`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {projects
              .filter(p => filter === 'All' || p.tags.includes(filter))
              .map((project, i) => (
                <motion.a
                  key={project.title}
                  href={project.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="aspect-video bg-slate-800 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.a>
              ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Get In Touch</h2>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500">© 2024 John Doe. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}`),
  },

  blog: {
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    description: 'Simple blog layout',
    files: createGuestBaseFiles(`import { useState } from 'react'

const posts = [
  {
    id: 1,
    title: 'Getting Started with React 18',
    excerpt: 'Learn about the new features in React 18 including automatic batching, transitions, and Suspense.',
    author: 'Sarah Johnson',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    category: 'React',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Building Modern APIs with Node.js',
    excerpt: 'A comprehensive guide to building RESTful APIs with Express and best practices for production.',
    author: 'Mike Chen',
    date: 'Dec 12, 2024',
    readTime: '8 min read',
    category: 'Backend',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Mastering TypeScript Generics',
    excerpt: 'Deep dive into TypeScript generics and how to use them to write more reusable code.',
    author: 'Emily Davis',
    date: 'Dec 10, 2024',
    readTime: '6 min read',
    category: 'TypeScript',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
  },
  {
    id: 4,
    title: 'CSS Grid Layout Complete Guide',
    excerpt: 'Everything you need to know about CSS Grid to create complex layouts with ease.',
    author: 'Alex Rivera',
    date: 'Dec 8, 2024',
    readTime: '7 min read',
    category: 'CSS',
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
  },
]

const categories = ['All', 'React', 'Backend', 'TypeScript', 'CSS']

export default function Index() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">TechBlog</span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Articles</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">TechBlog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the latest insights in web development, programming, and technology.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 mb-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={\`px-4 py-2 rounded-full text-sm transition-colors \${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }\`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                <div className="aspect-[2/1] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                      {post.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{post.author}</div>
                      <div className="text-xs text-gray-500">{post.date}</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 pb-20">
        <div className="container mx-auto max-w-2xl">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h2>
            <p className="text-gray-400 mb-6">Get the latest articles delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="container mx-auto text-center text-gray-500">
          © 2024 TechBlog. All rights reserved.
        </div>
      </footer>
    </div>
  )
}`),
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: '🛒',
    description: 'Product catalog with shopping cart',
    files: createGuestBaseFiles(`import { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Electronics',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Minimalist Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'Accessories',
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Leather Backpack',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Bags',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Smart Fitness Tracker',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop',
    category: 'Electronics',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Designer Sunglasses',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    category: 'Accessories',
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Portable Speaker',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    category: 'Electronics',
    rating: 4.4,
  },
]

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

export default function Index() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">ShopModern</span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors hidden md:block">Products</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors hidden md:block">Categories</a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Shop the <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Latest</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover premium products curated just for you.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                <div className="aspect-square overflow-hidden bg-slate-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{product.category}</span>
                    <span className="text-xs text-yellow-400">★ {product.rating}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">\${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        <p className="font-bold">\${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Total</span>
                    <span className="text-xl font-bold">\${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="container mx-auto text-center text-gray-500">
          © 2024 ShopModern. All rights reserved.
        </div>
      </footer>
    </div>
  )
}`),
  },

  'task-manager': {
    id: 'task-manager',
    name: 'Task Manager',
    icon: '✅',
    description: 'Kanban-style task management',
    files: createGuestBaseFiles(`import { useState } from 'react'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

const initialTasks: Task[] = [
  { id: '1', title: 'Design new landing page', status: 'todo', priority: 'high' },
  { id: '2', title: 'Setup CI/CD pipeline', status: 'todo', priority: 'medium' },
  { id: '3', title: 'Write API documentation', status: 'in-progress', priority: 'medium' },
  { id: '4', title: 'Code review PR #42', status: 'in-progress', priority: 'high' },
  { id: '5', title: 'Fix login bug', status: 'done', priority: 'high' },
  { id: '6', title: 'Update dependencies', status: 'done', priority: 'low' },
]

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      status: 'todo',
      priority: 'medium',
    }
    setTasks([...tasks, task])
    setNewTask('')
  }

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">✅ TaskFlow</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
          </div>
        </div>
      </header>

      {/* Add Task */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="container mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white/5 rounded-xl p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => draggedTask && moveTask(draggedTask, column.id as Task['status'])}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={\`w-3 h-3 rounded-full \${column.color}\`} />
                <h2 className="font-semibold">{column.title}</h2>
                <span className="ml-auto text-sm text-gray-500">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter(t => t.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTask(task.id)}
                      onDragEnd={() => setDraggedTask(null)}
                      className={\`p-4 bg-slate-800 rounded-lg border border-white/10 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-colors \${
                        draggedTask === task.id ? 'opacity-50' : ''
                      }\`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">{task.title}</span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={\`px-2 py-0.5 rounded text-xs \${priorityColors[task.priority]}\`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/10 mt-auto">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          Drag and drop tasks to move them between columns
        </div>
      </footer>
    </div>
  )
}`),
  },
}

// Helper function to get template files by ID
export function getGuestTemplateFiles(templateId: string): { path: string; content: string }[] {
  const template = GUEST_TEMPLATES[templateId]
  return template ? template.files : GUEST_TEMPLATES.blank.files
}

export default GUEST_TEMPLATES
