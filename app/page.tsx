'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Sparkles,
  Code2,
  Paperclip,
  Palette,
  Zap,
  Layers,
  Globe,
  Shield,
  Star,
  ChevronRight,
  Play,
  Rocket,
  Terminal,
  Wand2,
  Menu,
  X
} from 'lucide-react'

const TYPING_TEXTS = [
  'achieve',
  'build',
  'create',
  'ship'
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate complete apps in seconds, not hours',
    color: 'amber'
  },
  {
    icon: Layers,
    title: 'Production Ready',
    description: 'Clean, maintainable code following best practices',
    color: 'blue'
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    description: 'Export and deploy to Vercel, Netlify, or any host',
    color: 'emerald'
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Built-in security patterns and best practices',
    color: 'purple'
  }
]

const STATS = [
  { value: '50K+', label: 'Apps Generated' },
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<2s', label: 'Avg Generation' }
]

const TESTIMONIALS = [
  {
    quote: "Injaz transformed our workflow. We ship features 10x faster now.",
    author: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "SC"
  },
  {
    quote: "The best AI code generator I've used. It actually understands what I want.",
    author: "Marcus Johnson",
    role: "Indie Developer",
    avatar: "MJ"
  },
  {
    quote: "From idea to production in minutes. This is the future of development.",
    author: "Emily Rodriguez",
    role: "Founder at StartupXYZ",
    avatar: "ER"
  }
]

export default function HomePage() {
  const router = useRouter()
  const [chatInput, setChatInput] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Typing animation effect
  useEffect(() => {
    const currentWord = TYPING_TEXTS[typingIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1))
        } else {
          setIsDeleting(false)
          setTypingIndex((prev) => (prev + 1) % TYPING_TEXTS.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, typingIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      const projectId = `new-${Date.now()}`
      router.push(`/workspace/${projectId}?prompt=${encodeURIComponent(chatInput)}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl border-b border-white/5 bg-[#0A0A0F]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Code2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">Injaz</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: 'Templates', href: '/templates' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Docs', href: '/docs' },
              { name: 'Blog', href: '/blog' }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:flex text-white/60 hover:text-white hover:bg-white/5">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-white text-black hover:bg-white/90 font-medium shadow-lg shadow-white/5">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0A0A0F]/95 backdrop-blur-xl">
            <nav className="px-6 py-4 space-y-1">
              {['Templates', 'Pricing', 'Docs', 'Blog'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/login"
                className="block px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-20 pb-32 px-6">
          <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 hover:bg-white/[0.05] transition-colors cursor-pointer group">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm text-emerald-400 font-medium">New</span>
              </div>
              <span className="text-sm text-white/60">Introducing AI-powered code review</span>
              <ChevronRight className="h-4 w-4 text-white/30 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              What will you{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {displayText}
                </span>
                <span className="absolute -right-1 top-0 h-full w-[3px] bg-emerald-400 animate-pulse" />
              </span>
              <br />
              <span className="text-white/70">today?</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform your ideas into production-ready applications with AI.
              No boilerplate. No configuration. Just describe what you want.
            </p>

            {/* Main Input */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-8">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 group-focus-within:opacity-75 transition-opacity duration-500" />

                <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 group-focus-within:border-emerald-500/30 transition-colors">
                  <div className="p-6">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Describe the app you want to build..."
                      className="w-full bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none resize-none h-28"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e)
                        }
                      }}
                    />
                  </div>

                  {/* Toolbar */}
                  <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <button type="button" className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <span className="text-sm">Theme</span>
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium px-6 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Quick prompts */}
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto">
              {[
                { icon: 'R', text: 'SaaS Landing Page', prompt: 'Build a modern SaaS landing page with hero, features, pricing, and testimonials' },
                { icon: 'D', text: 'Dashboard', prompt: 'Create an analytics dashboard with charts, stats cards, and data tables' },
                { icon: 'E', text: 'E-commerce', prompt: 'Build an e-commerce store with product grid, cart, and checkout' },
                { icon: 'C', text: 'Chat App', prompt: 'Create a real-time chat application with message history' }
              ].map((item) => (
                <button
                  key={item.text}
                  onClick={() => setChatInput(item.prompt)}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center gap-2"
                >
                  <span className="h-5 w-5 rounded bg-white/10 text-[10px] font-bold flex items-center justify-center">{item.icon}</span>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">ship fast</span>
              </h2>
              <p className="text-lg text-white/40 max-w-2xl mx-auto">
                Powerful features that help you go from idea to production in minutes, not months.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">How it works</h2>
              <p className="text-lg text-white/40">Three simple steps to your next project</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Describe your idea',
                  description: 'Tell us what you want to build in plain English. Be as detailed or simple as you like.',
                  icon: Terminal
                },
                {
                  step: '02',
                  title: 'AI generates code',
                  description: 'Our AI creates production-ready React components with TypeScript and Tailwind CSS.',
                  icon: Sparkles
                },
                {
                  step: '03',
                  title: 'Deploy & iterate',
                  description: 'Preview instantly, make changes through chat, and deploy when ready.',
                  icon: Rocket
                }
              ].map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                  <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="text-5xl font-bold text-white/5 mb-4">{item.step}</div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white">Start with a template</h2>
                <p className="text-lg text-white/40">Production-ready templates to jumpstart your project</p>
              </div>
              <Link href="/templates" className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                <span className="text-sm font-medium">View all templates</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'SaaS Landing', desc: 'Modern startup landing page', color: 'violet' },
                { name: 'Dashboard', desc: 'Analytics & admin panel', color: 'blue' },
                { name: 'E-commerce', desc: 'Online store template', color: 'orange' },
                { name: 'Portfolio', desc: 'Personal website', color: 'emerald' }
              ].map((template, i) => (
                <Link
                  key={i}
                  href={`/templates/${template.name.toLowerCase().replace(' ', '-')}`}
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br from-${template.color}-500/20 to-${template.color}-600/10 p-6 flex items-center justify-center border-b border-white/5`}>
                    <div className={`h-16 w-16 rounded-2xl bg-${template.color}-500/20 border border-${template.color}-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Code2 className={`h-8 w-8 text-${template.color}-400`} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 text-white group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                    <p className="text-sm text-white/40">{template.desc}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-sm font-medium flex items-center gap-1 text-white">
                      Use template <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Loved by developers</h2>
              <p className="text-lg text-white/40">See what others are building with Injaz</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/60 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-medium text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">{testimonial.author}</div>
                      <div className="text-xs text-white/40">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
              <div className="relative p-12 sm:p-16 rounded-3xl bg-white/[0.02] border border-white/5">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                  Ready to build something amazing?
                </h2>
                <p className="text-lg text-white/40 mb-8 max-w-xl mx-auto">
                  Join thousands of developers who are shipping faster with Injaz.
                  Start for free, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 font-medium shadow-lg shadow-white/5 px-8">
                    <Link href="/dashboard">
                      Start Building Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white px-8">
                    <Link href="/docs">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Injaz</span>
              </Link>
              <p className="text-sm text-white/40 mb-4 max-w-xs">
                Transform ideas into production-ready applications with the power of AI.
              </p>
              <div className="flex items-center gap-3">
                {['twitter', 'github', 'discord'].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    {social === 'twitter' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                    {social === 'github' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {social === 'discord' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: ['Templates', 'Pricing', 'Features', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Community'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] }
            ].map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold mb-4 text-white">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-white/40 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">
              2025 Injaz. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
