'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Code2, Paperclip, Palette, Send } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [chatInput, setChatInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      // Navigate to workspace with prompt - chatbot will auto-start generation
      const projectId = `new-${Date.now()}`
      router.push(`/workspace/${projectId}?prompt=${encodeURIComponent(chatInput)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Achievement-themed gradient mesh overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-emerald-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-teal-600/10 to-emerald-600/10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Animated gradient orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md border-b border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">Injaz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/templates" className="text-sm text-white/80 hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-white/80 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="/community" className="text-sm text-white/80 hover:text-white transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:flex text-white hover:bg-white/10 transition-all">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-medium">
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - centered */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6">
        <div className="max-w-4xl mx-auto w-full text-center space-y-8">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-xl border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 cursor-pointer group">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-white/80">Introducing Injaz Pro</span>
            <ArrowRight className="h-4 w-4 text-white/60 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            What will you{' '}
            <span className="italic bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
              achieve
            </span>{' '}
            today?
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Create stunning apps & websites by chatting with AI. From idea to deployment in minutes.
          </p>

          {/* Input box - large dark container */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pt-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/20">
              <div className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Make a software application that..."
                  className="w-full bg-transparent text-lg text-white/90 placeholder:text-white/40 focus:outline-none resize-none h-32 focus:text-white transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
              </div>
              
              {/* Toolbar */}
              <div className="px-8 py-4 border-t border-emerald-500/10 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" className="h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button type="button" className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-white/60 hover:bg-white/10 transition-colors">
                    <Paperclip className="h-4 w-4" />
                    <span>Attach</span>
                  </button>
                  <button type="button" className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-white/60 hover:bg-white/10 transition-colors border border-white/10">
                    <Palette className="h-4 w-4" />
                    <span>Theme</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" className="h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <Button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 px-6 disabled:opacity-40 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              </div>
              </div>
            </div>
          </form>

          {/* Quick Actions - inspired by v0 and Replit */}
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setChatInput('Build a modern landing page with hero section and contact form')}
                className="px-4 py-2 rounded-lg bg-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-800/80 text-sm text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                📄 Landing Page
              </button>
              <button
                onClick={() => setChatInput('Create an AI-powered chatbot with conversation history')}
                className="px-4 py-2 rounded-lg bg-slate-800/50 border border-teal-500/20 hover:border-teal-500/40 hover:bg-slate-800/80 text-sm text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                🤖 AI App
              </button>
              <button
                onClick={() => setChatInput('Build a task management dashboard with drag and drop')}
                className="px-4 py-2 rounded-lg bg-slate-800/50 border border-amber-500/20 hover:border-amber-500/40 hover:bg-slate-800/80 text-sm text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setChatInput('Create an e-commerce store with product catalog and cart')}
                className="px-4 py-2 rounded-lg bg-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-800/80 text-sm text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                🛍️ E-Commerce
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 hover:border-white/20 hover:bg-slate-800/80 text-white/50 hover:text-white/70 transition-all duration-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="max-w-7xl mx-auto px-6 mt-20 pb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 border border-emerald-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Start with a template</h2>
                <p className="text-base sm:text-lg text-white/60">Jump-start your project with pre-built solutions</p>
              </div>
              <Link href="/templates" className="group flex items-center gap-2 text-white/80 hover:text-white transition-all">
                <span className="text-sm font-medium">View all</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Template Card 1 */}
              <Link href="/templates/ecommerce" className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-emerald-500/30">
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                    <div className="text-6xl">🛍️</div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">Ecommerce store</h3>
                    <p className="text-sm text-gray-600">Premium design for webstore</p>
                  </div>
                </div>
              </Link>

              {/* Template Card 2 */}
              <Link href="/templates/architecture" className="group">
                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl shadow-black/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-teal-500/30 border border-white/5">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-white text-xl font-bold">MINIMAL<br/>ARCHITECTURE</div>
                  </div>
                  <div className="p-4 bg-black border-t border-white/10">
                    <h3 className="font-bold text-white mb-1">Architect portfolio</h3>
                    <p className="text-sm text-gray-400">Firm website & showcase</p>
                  </div>
                </div>
              </Link>

              {/* Template Card 3 */}
              <Link href="/templates/blog" className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-amber-500/30">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-5xl">📰</div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">Personal blog</h3>
                    <p className="text-sm text-gray-600">Muted, intimate design</p>
                  </div>
                </div>
              </Link>

              {/* Template Card 4 */}
              <Link href="/templates/fashion" className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-emerald-500/30">
                  <div className="aspect-[4/3] bg-gradient-to-br from-emerald-200 to-teal-100 flex items-center justify-center">
                    <div className="text-5xl font-bold text-emerald-700">VESPER</div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">Fashion blog</h3>
                    <p className="text-sm text-gray-600">Minimal, playful design</p>
                  </div>
                </div>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/templates" className="text-white/60 hover:text-white transition-colors text-sm">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white/60 hover:text-white transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/60 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/60 hover:text-white transition-colors text-sm">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/docs" className="text-white/60 hover:text-white transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-white/60 hover:text-white transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-white/60 hover:text-white transition-colors text-sm">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-white/60 hover:text-white transition-colors text-sm">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/60 text-sm">© 2025 Injaz. Ship faster, achieve more.</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
