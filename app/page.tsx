'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, Send, Menu, X, Sparkles, Zap, Layers, ArrowRight, Rocket } from 'lucide-react'

export default function HomePage() {
  const [chatInput, setChatInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const examplePrompts = [
    { text: "SaaS landing page", icon: "🚀" },
    { text: "E-commerce store", icon: "🛒" },
    { text: "Portfolio site", icon: "💼" },
    { text: "Admin dashboard", icon: "📊" },
  ]

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    sessionStorage.setItem('initialPrompt', chatInput.trim())
    const projectId = `new-${Date.now()}`
    window.location.href = `/workspace/${projectId}`
  }

  return (
    <div className="min-h-screen bg-[#08080c] flex flex-col overflow-hidden noise">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none gradient-mesh-dark" />

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] animate-float delay-300" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[80px] animate-float delay-500" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl icon-box-brand group-hover:glow-purple transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">Injaz.ai</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg px-4 font-medium">
              <Link href="/templates">Templates</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg px-4 font-medium">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="ml-2 btn-primary px-5">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-10 w-10 rounded-lg text-white hover:bg-white/[0.06]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl animate-fade-in-down">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/templates"
                className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/login"
                className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Button asChild className="w-full mt-2 btn-primary">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-16 relative">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-primary mb-8 animate-fade-in-down">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">AI-Powered Development</span>
          </div>

          {/* Heading */}
          <h1 className="heading-xl text-white mb-6 animate-fade-in-up">
            What do you want
            <br />
            <span className="gradient-text-glow">
              to build today?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/50 mb-12 max-w-lg mx-auto animate-fade-in-up delay-100 leading-relaxed">
            Describe your idea in plain English and watch AI transform it into a fully functional application.
          </p>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="relative mb-10 animate-fade-in-up delay-200">
            <div
              className={`relative rounded-2xl transition-all duration-300 ${
                isFocused
                  ? 'bg-white/[0.06] border border-purple-500/50 glow-purple'
                  : 'bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Describe your app idea in detail..."
                rows={3}
                className="w-full px-6 py-5 pr-16 bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none text-base rounded-2xl leading-relaxed"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim()}
                className="absolute right-4 bottom-4 h-11 w-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-4">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] font-mono text-white/60 border border-white/[0.1]">Enter</kbd> to submit
            </p>
          </form>

          {/* Example Prompts */}
          <div className="animate-fade-in-up delay-300">
            <p className="text-sm text-white/50 mb-4 font-medium">Try these examples:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-purple-500/10 hover:border-purple-500/30 text-white/70 hover:text-white transition-all duration-200 hover:-translate-y-0.5 font-medium"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-4xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in-up delay-400">
          <div className="group p-6 rounded-2xl card-interactive">
            <div className="h-12 w-12 rounded-xl icon-box mb-5 group-hover:icon-box-brand transition-all duration-300">
              <Sparkles className="h-6 w-6 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-sm text-white/50 leading-relaxed">Describe your vision and let AI write production-ready code for you.</p>
          </div>

          <div className="group p-6 rounded-2xl card-interactive">
            <div className="h-12 w-12 rounded-xl icon-box mb-5 group-hover:icon-box-cyan transition-all duration-300">
              <Zap className="h-6 w-6 text-cyan-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-white mb-2">Real-time Preview</h3>
            <p className="text-sm text-white/50 leading-relaxed">See your changes instantly with live browser preview.</p>
          </div>

          <div className="group p-6 rounded-2xl card-interactive">
            <div className="h-12 w-12 rounded-xl icon-box mb-5 group-hover:icon-box-brand transition-all duration-300">
              <Rocket className="h-6 w-6 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-white mb-2">One-Click Deploy</h3>
            <p className="text-sm text-white/50 leading-relaxed">Deploy your app to the cloud with a single click.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/[0.06] bg-[#08080c]/80">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40">
            <Code2 className="h-4 w-4" />
            <span className="text-sm font-medium">Injaz.ai</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/50 font-medium">
            <Link href="/templates" className="hover:text-purple-400 transition-colors">
              Templates
            </Link>
            <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-purple-400 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
