// Pre-built app templates for instant generation
// Following Bolt.new / V0 patterns - complete, working apps

export interface TemplateFile {
  path: string
  content: string
}

export interface Template {
  id: string
  name: string
  description: string
  keywords: string[]
  files: TemplateFile[]
}

// Base files shared across all templates
const baseFiles: TemplateFile[] = [
  {
    path: 'package.json',
    content: `{
  "name": "vite-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}`
  },
  {
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
  },
  {
    path: 'tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
  },
  {
    path: 'postcss.config.js',
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
  },
  {
    path: 'tsconfig.json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
  },
  {
    path: 'tsconfig.node.json',
    content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`
  },
  {
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  },
  {
    path: 'src/main.tsx',
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)`
  },
  {
    path: 'src/index.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-white antialiased;
}

* {
  @apply border-gray-800;
}`
  },
  {
    path: 'src/vite-env.d.ts',
    content: `/// <reference types="vite/client" />`
  }
]

// Landing Page Template
const landingTemplate: Template = {
  id: 'landing',
  name: 'Landing Page',
  description: 'Beautiful marketing landing page with hero, features, testimonials, and CTA',
  keywords: ['landing', 'landing page', 'website', 'marketing', 'homepage', 'company'],
  files: [
    ...baseFiles,
    {
      path: 'src/App.tsx',
      content: `import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}`
    },
    {
      path: 'src/components/Navbar.tsx',
      content: `import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AppName
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={\`text-sm font-medium transition-colors \${
                  location.pathname === link.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }\`}
              >
                {link.name}
              </Link>
            ))}
            <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}`
    },
    {
      path: 'src/pages/Home.tsx',
      content: `import { ArrowRight, Zap, Shield, Rocket, Star } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed with optimized performance and instant loading times.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Enterprise-grade security with encryption and data protection.',
  },
  {
    icon: Rocket,
    title: 'Scale Effortlessly',
    description: 'Grow from startup to enterprise without changing your stack.',
  },
]

const testimonials = [
  {
    content: 'This product has completely transformed how we work. Highly recommended!',
    author: 'Sarah Johnson',
    role: 'CEO at TechCorp',
  },
  {
    content: 'The best tool we have ever used. Our productivity increased by 300%.',
    author: 'Mike Chen',
    role: 'CTO at StartupXYZ',
  },
  {
    content: 'Incredible experience. The team behind this product is amazing.',
    author: 'Emily Davis',
    role: 'Product Manager at BigCo',
  },
]

export function Home() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Build Something{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Amazing
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              The modern platform for building, deploying, and scaling your applications.
              Start building today and launch tomorrow.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 text-lg font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 text-lg font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose Us</h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Everything you need to build modern applications, all in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Loved by Developers</h2>
            <p className="mt-4 text-gray-400">See what our customers have to say.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of developers building amazing products.
          </p>
          <button className="mt-8 px-8 py-3 text-lg font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Start Building Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© 2024 AppName. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}`
    },
    {
      path: 'src/pages/About.tsx',
      content: `import { Users, Target, Heart } from 'lucide-react'

const values = [
  {
    icon: Users,
    title: 'Customer First',
    description: 'Everything we do starts with our customers in mind.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in everything we create.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'We are passionate about building great products.',
  },
]

export function About() {
  return (
    <div className="pt-16">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold">About Us</h1>
            <p className="mt-6 text-lg text-gray-400">
              We are a team of passionate developers and designers building the future of web development.
              Our mission is to make building applications easier and more enjoyable for everyone.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}`
    },
    {
      path: 'src/pages/Contact.tsx',
      content: `import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Message sent! We will get back to you soon.')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="pt-16">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold">Get in Touch</h1>
            <p className="mt-4 text-lg text-gray-400">
              Have a question? We would love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-400">hello@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-400">+1 (555) 000-0000</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-400">123 Main St, City, Country</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}`
    },
    {
      path: 'src/pages/NotFound.tsx',
      content: `import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-500">404</h1>
        <p className="mt-4 text-xl text-gray-400">Page not found</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  )
}`
    }
  ]
}

// Dashboard Template
const dashboardTemplate: Template = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Admin dashboard with sidebar navigation, stats cards, and data tables',
  keywords: ['dashboard', 'admin', 'panel', 'analytics', 'management', 'metrics'],
  files: [
    ...baseFiles,
    {
      path: 'src/App.tsx',
      content: `import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Users } from './pages/Users'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}`
    },
    {
      path: 'src/components/Sidebar.tsx',
      content: `import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LogOut, Sparkles } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <span className="text-xl font-bold">Dashboard</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={\`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }\`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}`
    },
    {
      path: 'src/pages/Dashboard.tsx',
      content: `import { Users, DollarSign, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const stats = [
  { name: 'Total Users', value: '12,345', change: '+12%', trend: 'up', icon: Users },
  { name: 'Revenue', value: '$45,678', change: '+8%', trend: 'up', icon: DollarSign },
  { name: 'Orders', value: '1,234', change: '-3%', trend: 'down', icon: ShoppingCart },
  { name: 'Growth', value: '23%', change: '+5%', trend: 'up', icon: TrendingUp },
]

const recentActivity = [
  { user: 'John Doe', action: 'Created a new project', time: '2 minutes ago' },
  { user: 'Jane Smith', action: 'Updated settings', time: '5 minutes ago' },
  { user: 'Bob Johnson', action: 'Uploaded a file', time: '10 minutes ago' },
  { user: 'Alice Brown', action: 'Completed a task', time: '15 minutes ago' },
  { user: 'Charlie Wilson', action: 'Added a comment', time: '20 minutes ago' },
]

export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 bg-gray-900 rounded-xl border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-purple-400" />
              </div>
              <span
                className={\`flex items-center text-sm font-medium \${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }\`}
              >
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 ml-1" />
                )}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 font-medium">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-400">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}`
    },
    {
      path: 'src/pages/Users.tsx',
      content: `import { useState } from 'react'
import { Search, MoreVertical, UserPlus } from 'lucide-react'

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
]

export function Users() {
  const [search, setSearch] = useState('')
  const users = initialUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 last:border-0">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{user.email}</td>
                  <td className="py-4 px-6">{user.role}</td>
                  <td className="py-4 px-6">
                    <span
                      className={\`px-2 py-1 text-xs font-medium rounded-full \${
                        user.status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }\`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}`
    },
    {
      path: 'src/pages/Settings.tsx',
      content: `import { useState } from 'react'
import { Save } from 'lucide-react'

export function Settings() {
  const [settings, setSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notifications: true,
    darkMode: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Settings saved:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-800">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive email updates</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={\`w-12 h-6 rounded-full transition-colors \${
                settings.notifications ? 'bg-purple-600' : 'bg-gray-700'
              }\`}
            >
              <div
                className={\`w-5 h-5 bg-white rounded-full transition-transform \${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }\`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-800">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={\`w-12 h-6 rounded-full transition-colors \${
                settings.darkMode ? 'bg-purple-600' : 'bg-gray-700'
              }\`}
            >
              <div
                className={\`w-5 h-5 bg-white rounded-full transition-transform \${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }\`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}`
    }
  ]
}

// Todo App Template
const todoTemplate: Template = {
  id: 'todo',
  name: 'Todo App',
  description: 'Feature-rich todo application with filters, categories, and local storage',
  keywords: ['todo', 'task', 'tasks', 'todo app', 'task manager', 'checklist'],
  files: [
    ...baseFiles,
    {
      path: 'src/App.tsx',
      content: `import { TodoApp } from './components/TodoApp'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <TodoApp />
    </div>
  )
}`
    },
    {
      path: 'src/components/TodoApp.tsx',
      content: `import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, Filter, ListTodo } from 'lucide-react'

interface Todo {
  id: string
  text: string
  completed: boolean
  category: string
  createdAt: Date
}

type FilterType = 'all' | 'active' | 'completed'

const categories = ['Personal', 'Work', 'Shopping', 'Health']

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('Personal')
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      category,
      createdAt: new Date(),
    }

    setTodos([newTodo, ...todos])
    setInput('')
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeTodos = todos.filter((todo) => !todo.completed).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ListTodo className="w-10 h-10 text-purple-500" />
          <h1 className="text-4xl font-bold">Todo App</h1>
        </div>
        <p className="text-gray-400">Keep track of your tasks</p>
      </div>

      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={\`px-3 py-1 text-sm rounded-lg transition-colors \${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }\`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-400">{activeTodos} items left</span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {filteredTodos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {filter === 'all' ? 'No todos yet. Add one above!' : \`No \${filter} todos\`}
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${
                    todo.completed
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-600 hover:border-purple-500'
                  }\`}
                >
                  {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <p
                    className={\`\${
                      todo.completed ? 'line-through text-gray-500' : 'text-white'
                    }\`}
                  >
                    {todo.text}
                  </p>
                  <span className="text-xs text-gray-500">{todo.category}</span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {todos.some((t) => t.completed) && (
        <div className="mt-4 text-center">
          <button
            onClick={clearCompleted}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  )
}`
    }
  ]
}

// E-commerce Template
const ecommerceTemplate: Template = {
  id: 'ecommerce',
  name: 'E-commerce',
  description: 'Online store with product grid, cart, and checkout',
  keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'products', 'cart', 'shopping'],
  files: [
    ...baseFiles,
    {
      path: 'src/App.tsx',
      content: `import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Products } from './pages/Products'
import { Cart } from './pages/Cart'
import { ProductDetail } from './pages/ProductDetail'

export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

export interface CartItem extends Product {
  quantity: number
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar cartCount={cartCount} />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Products addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} />} />
        </Routes>
      </main>
    </div>
  )
}`
    },
    {
      path: 'src/components/Navbar.tsx',
      content: `import { Link } from 'react-router-dom'
import { ShoppingCart, Store } from 'lucide-react'

interface NavbarProps {
  cartCount: number
}

export function Navbar({ cartCount }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold">ShopApp</span>
          </Link>

          <Link
            to="/cart"
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}`
    },
    {
      path: 'src/pages/Products.tsx',
      content: `import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '../App'

const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 199,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'Premium wireless headphones with noise cancellation',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 299,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    description: 'Feature-rich smartwatch with health tracking',
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Leather Backpack',
    price: 149,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    description: 'Stylish leather backpack for everyday use',
    category: 'Accessories',
  },
  {
    id: 4,
    name: 'Running Shoes',
    price: 129,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    description: 'Comfortable running shoes for athletes',
    category: 'Footwear',
  },
  {
    id: 5,
    name: 'Sunglasses',
    price: 89,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    description: 'Classic sunglasses with UV protection',
    category: 'Accessories',
  },
  {
    id: 6,
    name: 'Camera Lens',
    price: 599,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400',
    description: 'Professional camera lens for photography',
    category: 'Electronics',
  },
]

interface ProductsProps {
  addToCart: (product: Product) => void
}

export function Products({ addToCart }: ProductsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group"
          >
            <Link to={\`/product/\${product.id}\`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="p-4">
              <p className="text-sm text-purple-400 mb-1">{product.category}</p>
              <Link to={\`/product/\${product.id}\`}>
                <h3 className="font-semibold mb-2 hover:text-purple-400 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">\${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { products }`
    },
    {
      path: 'src/pages/ProductDetail.tsx',
      content: `import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { products } from './Products'
import type { Product } from '../App'

interface ProductDetailProps {
  addToCart: (product: Product) => void
}

export function ProductDetail({ addToCart }: ProductDetailProps) {
  const { id } = useParams()
  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/" className="text-purple-400 hover:underline">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-purple-400 mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-400 mb-6">{product.description}</p>
          <p className="text-4xl font-bold mb-8">\${product.price}</p>

          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}`
    },
    {
      path: 'src/pages/Cart.tsx',
      content: `import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import type { CartItem } from '../App'

interface CartProps {
  cart: CartItem[]
  updateQuantity: (id: number, quantity: number) => void
}

export function Cart({ cart, updateQuantity }: CartProps) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <ul className="divide-y divide-gray-800">
          {cart.map((item) => (
            <li key={item.id} className="p-4 flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-400">\${item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="w-24 text-right font-semibold">
                \${item.price * item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 0)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-gray-800 bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg">Total</span>
            <span className="text-2xl font-bold">\${total}</span>
          </div>
          <button className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}`
    }
  ]
}

// All templates
export const templates: Record<string, Template> = {
  landing: landingTemplate,
  dashboard: dashboardTemplate,
  todo: todoTemplate,
  ecommerce: ecommerceTemplate,
}

// Match template from prompt
export function matchTemplate(prompt: string): Template | null {
  const lowerPrompt = prompt.toLowerCase()

  // Score each template based on keyword matches
  let bestMatch: Template | null = null
  let bestScore = 0

  for (const template of Object.values(templates)) {
    const score = template.keywords.filter(kw => lowerPrompt.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = template
    }
  }

  // Only return if we have at least 1 keyword match
  return bestScore > 0 ? bestMatch : null
}

// Get all available templates
export function getTemplates(): Template[] {
  return Object.values(templates)
}
