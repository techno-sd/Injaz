// App Template Registry
// Pre-built templates that AI selects and customizes for faster, more consistent generation

export interface PageTemplate {
  id: string
  name: string
  description: string
  category: 'landing' | 'auth' | 'dashboard' | 'content' | 'form' | 'ecommerce' | 'utility'
  route: string
  template: (config: PageConfig) => string
  requiredComponents?: string[]
}

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: 'navigation' | 'layout' | 'card' | 'form' | 'modal' | 'feedback' | 'data'
  template: (config: ComponentConfig) => string
}

export interface PageConfig {
  title?: string
  subtitle?: string
  primaryColor?: string
  features?: string[]
  sections?: string[]
  branding?: {
    name: string
    tagline?: string
  }
}

export interface ComponentConfig {
  variant?: string
  items?: Array<{ label: string; href?: string; icon?: string }>
  title?: string
  description?: string
}

// ============================================
// PAGE TEMPLATES
// ============================================

export const pageTemplates: Record<string, PageTemplate> = {
  // Landing Pages
  'hero-landing': {
    id: 'hero-landing',
    name: 'Hero Landing Page',
    description: 'Modern landing page with hero section, features, and CTA',
    category: 'landing',
    route: '/',
    template: (config) => `import { ArrowRight, Sparkles, Zap, Shield, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Index() {
  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Built for speed and performance' },
    { icon: Shield, title: 'Secure by Default', description: 'Enterprise-grade security' },
    { icon: Star, title: 'Premium Quality', description: 'Crafted with attention to detail' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">${config.branding?.tagline || 'Welcome to the future'}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              ${config.title || 'Build Something'}
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ${config.subtitle || 'Amazing'}
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Create beautiful, modern applications with ease. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to succeed</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto relative">Join thousands of users already building amazing things.</p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors relative">
            Start Building Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
`,
  },

  'minimal-landing': {
    id: 'minimal-landing',
    name: 'Minimal Landing Page',
    description: 'Clean, minimal landing page with focus on content',
    category: 'landing',
    route: '/',
    template: (config) => `import { ArrowRight } from 'lucide-react'

export default function Index() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
          ${config.title || 'Simple.'}
          <br />
          <span className="text-gray-400">${config.subtitle || 'Powerful.'}</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12">
          ${config.branding?.tagline || 'Build something amazing with modern tools and simple workflows.'}
        </p>
        <button className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-80 transition-opacity">
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
`,
  },

  // Auth Pages
  'login-page': {
    id: 'login-page',
    name: 'Login Page',
    description: 'Modern login page with form validation',
    category: 'auth',
    route: '/login',
    template: (config) => `import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-purple-500" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
`,
  },

  'register-page': {
    id: 'register-page',
    name: 'Register Page',
    description: 'User registration page with form',
    category: 'auth',
    route: '/register',
    template: (config) => `import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Start your journey with us</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
`,
  },

  // Dashboard Pages
  'dashboard-home': {
    id: 'dashboard-home',
    name: 'Dashboard Home',
    description: 'Dashboard with stats, charts, and recent activity',
    category: 'dashboard',
    route: '/dashboard',
    template: (config) => `import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up', icon: DollarSign },
    { label: 'Active Users', value: '2,350', change: '+15.3%', trend: 'up', icon: Users },
    { label: 'Total Orders', value: '12,234', change: '+8.2%', trend: 'up', icon: ShoppingCart },
    { label: 'Conversion Rate', value: '3.2%', change: '-2.1%', trend: 'down', icon: Activity },
  ]

  const recentActivity = [
    { id: 1, action: 'New user registered', time: '2 minutes ago', type: 'user' },
    { id: 2, action: 'Order #12345 completed', time: '15 minutes ago', type: 'order' },
    { id: 3, action: 'Payment received', time: '1 hour ago', type: 'payment' },
    { id: 4, action: 'New review submitted', time: '2 hours ago', type: 'review' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                <span className={\`flex items-center gap-1 text-sm font-medium \${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}\`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revenue Overview</h2>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
              <p className="text-gray-500">Chart placeholder</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                  <div>
                    <p className="text-gray-200 text-sm">{item.action}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`,
  },

  // Content Pages
  'about-page': {
    id: 'about-page',
    name: 'About Page',
    description: 'About page with team and mission sections',
    category: 'content',
    route: '/about',
    template: (config) => `import { Users, Target, Heart, Award } from 'lucide-react'

export default function About() {
  const values = [
    { icon: Target, title: 'Our Mission', description: 'To empower everyone to build amazing digital experiences.' },
    { icon: Heart, title: 'Our Values', description: 'Innovation, integrity, and customer success drive everything we do.' },
    { icon: Award, title: 'Our Vision', description: 'A world where technology is accessible and empowering for all.' },
  ]

  const team = [
    { name: 'Alex Johnson', role: 'CEO & Founder', avatar: 'A' },
    { name: 'Sarah Chen', role: 'CTO', avatar: 'S' },
    { name: 'Mike Williams', role: 'Head of Design', avatar: 'M' },
    { name: 'Emma Davis', role: 'Head of Product', avatar: 'E' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">${config.title || 'About Us'}</h1>
          <p className="text-xl text-gray-400">
            ${config.branding?.tagline || 'We are building the future of digital experiences, one innovation at a time.'}
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{value.title}</h3>
              <p className="text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                {member.avatar}
              </div>
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
`,
  },

  'contact-page': {
    id: 'contact-page',
    name: 'Contact Page',
    description: 'Contact page with form and info',
    category: 'form',
    route: '/contact',
    template: (config) => `import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form:', formData)
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@example.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: MapPin, label: 'Address', value: '123 Main St, City, Country' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Your message..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.label}</h3>
                  <p className="text-gray-400 mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
`,
  },

  // E-commerce Pages
  'product-grid': {
    id: 'product-grid',
    name: 'Product Grid',
    description: 'E-commerce product listing with grid layout',
    category: 'ecommerce',
    route: '/products',
    template: (config) => `import { useState } from 'react'
import { ShoppingCart, Heart, Star, Filter } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  rating: number
  image: string
  category: string
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const products: Product[] = [
    { id: 1, name: 'Premium Headphones', price: 299, rating: 4.8, image: '', category: 'electronics' },
    { id: 2, name: 'Wireless Mouse', price: 79, rating: 4.5, image: '', category: 'electronics' },
    { id: 3, name: 'Mechanical Keyboard', price: 159, rating: 4.9, image: '', category: 'electronics' },
    { id: 4, name: 'USB-C Hub', price: 49, rating: 4.3, image: '', category: 'accessories' },
    { id: 5, name: 'Monitor Stand', price: 89, rating: 4.6, image: '', category: 'accessories' },
    { id: 6, name: 'Webcam HD', price: 129, rating: 4.4, image: '', category: 'electronics' },
  ]

  const categories = ['all', 'electronics', 'accessories']

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="text-gray-400 mt-1">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                  selectedCategory === cat
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }\`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors">
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-400">{product.rating}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">\${product.price}</span>
                  <button className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white hover:bg-purple-600 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
`,
  },

  // Settings Page
  'settings-page': {
    id: 'settings-page',
    name: 'Settings Page',
    description: 'User settings page with multiple sections',
    category: 'utility',
    route: '/settings',
    template: (config) => `import { useState } from 'react'
import { User, Bell, Shield, Palette, Save } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors \${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }\`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="Software developer passionate about creating amazing experiences."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                {['Email notifications', 'Push notifications', 'SMS alerts', 'Weekly digest'].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
                    <span className="text-gray-300">{item}</span>
                    <button className="w-12 h-6 rounded-full bg-purple-500 relative">
                      <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors">
                    <span>Change Password</span>
                    <span className="text-gray-500">Last changed 30 days ago</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors">
                    <span>Two-Factor Authentication</span>
                    <span className="text-emerald-400">Enabled</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors">
                    <span>Active Sessions</span>
                    <span className="text-gray-500">3 devices</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Appearance Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'System'].map(theme => (
                      <button
                        key={theme}
                        className={\`p-4 rounded-xl border text-center transition-colors \${
                          theme === 'Dark'
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-white/10 text-gray-400 hover:border-white/20'
                        }\`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
`,
  },
}

// ============================================
// COMPONENT TEMPLATES
// ============================================

export const componentTemplates: Record<string, ComponentTemplate> = {
  'navbar': {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Responsive navigation with mobile menu',
    category: 'navigation',
    template: (config) => `import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = ${JSON.stringify(config.items || [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
], null, 2)}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-white">
            ${config.title || 'Logo'}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={\`text-sm font-medium transition-colors \${
                  location.pathname === item.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }\`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={\`block py-3 text-sm font-medium transition-colors \${
                  location.pathname === item.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }\`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
`,
  },

  'footer': {
    id: 'footer',
    name: 'Footer',
    description: 'Site footer with links and social',
    category: 'layout',
    template: (config) => `import { Link } from 'react-router-dom'

export function Footer() {
  const links = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ]

  return (
    <footer className="bg-gray-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-400">
            &copy; {new Date().getFullYear()} ${config.title || 'Company'}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
`,
  },

  'card': {
    id: 'card',
    name: 'Card Component',
    description: 'Reusable card with variants',
    category: 'card',
    template: (config) => `import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'outline'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white/5 border border-white/10',
    gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20',
    outline: 'bg-transparent border-2 border-white/20',
  }

  return (
    <div className={\`rounded-2xl p-6 \${variants[variant]} \${className}\`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={\`mb-4 \${className}\`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={\`text-xl font-semibold text-white \${className}\`}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={\`text-gray-400 mt-1 \${className}\`}>{children}</p>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={\`mt-6 pt-6 border-t border-white/10 \${className}\`}>{children}</div>
}
`,
  },

  'modal': {
    id: 'modal',
    name: 'Modal Dialog',
    description: 'Accessible modal component',
    category: 'modal',
    template: (config) => `import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
`,
  },

  'toast': {
    id: 'toast',
    name: 'Toast Notification',
    description: 'Toast notification system',
    category: 'feedback',
    template: (config) => `import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          return (
            <div
              key={toast.id}
              className={\`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl \${colors[toast.type]}\`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
`,
  },

  'data-table': {
    id: 'data-table',
    name: 'Data Table',
    description: 'Sortable data table component',
    category: 'data',
    template: (config) => `import { useState, ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
}

export function DataTable<T extends Record<string, any>>({ data, columns }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={\`px-6 py-4 text-left text-sm font-medium text-gray-400 \${
                  col.sortable ? 'cursor-pointer hover:text-white' : ''
                }\`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-300">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
`,
  },
}

// ============================================
// TEMPLATE SELECTION HELPER
// ============================================

export interface TemplateMatch {
  template: PageTemplate | ComponentTemplate
  confidence: number
  type: 'page' | 'component'
}

const pageKeywords: Record<string, string[]> = {
  'hero-landing': ['landing', 'home', 'homepage', 'hero', 'main page', 'welcome'],
  'minimal-landing': ['minimal', 'simple', 'clean', 'modern landing'],
  'login-page': ['login', 'sign in', 'signin', 'authentication'],
  'register-page': ['register', 'sign up', 'signup', 'create account'],
  'dashboard-home': ['dashboard', 'admin', 'analytics', 'stats', 'metrics'],
  'about-page': ['about', 'about us', 'team', 'company', 'who we are'],
  'contact-page': ['contact', 'get in touch', 'reach out', 'message'],
  'product-grid': ['products', 'shop', 'store', 'catalog', 'ecommerce', 'e-commerce'],
  'settings-page': ['settings', 'preferences', 'profile', 'account settings'],
}

const componentKeywords: Record<string, string[]> = {
  'navbar': ['navigation', 'navbar', 'header', 'menu', 'nav'],
  'footer': ['footer', 'bottom', 'site footer'],
  'card': ['card', 'cards', 'tile', 'panel'],
  'modal': ['modal', 'dialog', 'popup', 'overlay'],
  'toast': ['toast', 'notification', 'alert', 'snackbar'],
  'data-table': ['table', 'data table', 'grid', 'list', 'data grid'],
}

export function matchTemplates(prompt: string): TemplateMatch[] {
  const matches: TemplateMatch[] = []
  const lowerPrompt = prompt.toLowerCase()

  // Match pages
  for (const [templateId, keywords] of Object.entries(pageKeywords)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        const template = pageTemplates[templateId]
        if (template) {
          matches.push({
            template,
            confidence: keyword.length / prompt.length,
            type: 'page',
          })
        }
        break
      }
    }
  }

  // Match components
  for (const [templateId, keywords] of Object.entries(componentKeywords)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        const template = componentTemplates[templateId]
        if (template) {
          matches.push({
            template,
            confidence: keyword.length / prompt.length,
            type: 'component',
          })
        }
        break
      }
    }
  }

  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence)
}

// Get suggested templates based on app type
export function getSuggestedTemplates(appType: string): {
  pages: PageTemplate[]
  components: ComponentTemplate[]
} {
  const suggestions: Record<string, { pages: string[]; components: string[] }> = {
    'landing': {
      pages: ['hero-landing', 'about-page', 'contact-page'],
      components: ['navbar', 'footer'],
    },
    'dashboard': {
      pages: ['dashboard-home', 'settings-page'],
      components: ['navbar', 'card', 'data-table', 'toast'],
    },
    'auth': {
      pages: ['login-page', 'register-page'],
      components: ['toast'],
    },
    'ecommerce': {
      pages: ['hero-landing', 'product-grid', 'contact-page'],
      components: ['navbar', 'footer', 'card', 'modal', 'toast'],
    },
    'saas': {
      pages: ['hero-landing', 'login-page', 'register-page', 'dashboard-home', 'settings-page'],
      components: ['navbar', 'footer', 'card', 'modal', 'toast'],
    },
  }

  const config = suggestions[appType] || suggestions['landing']

  return {
    pages: config.pages.map(id => pageTemplates[id]).filter(Boolean),
    components: config.components.map(id => componentTemplates[id]).filter(Boolean),
  }
}
