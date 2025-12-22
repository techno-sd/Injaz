'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, Send, Menu, X, Sparkles, Zap, Layers, ArrowRight, Rocket, ShieldCheck, LineChart, Globe2, PlayCircle, HeartHandshake, MousePointer2 } from 'lucide-react'

export default function HomePage() {
  const [chatInput, setChatInput] = useState('Build a SaaS landing page with pricing, hero, and features')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const examplePrompts = [
    {
      text: 'SaaS landing page',
      icon: '🚀',
      prompt: 'Build a SaaS landing page with a hero, social proof, feature grid, pricing with monthly/annual toggle, FAQs, and a final CTA. Use a dark, modern style.'
    },
    {
      text: 'Admin dashboard',
      icon: '📊',
      prompt: 'Create an admin dashboard with a sidebar, topbar search, KPI cards, a table with filters, and a charts section. Use realistic mock data and responsive layout.'
    },
    {
      text: 'E-commerce store',
      icon: '🛒',
      prompt: 'Build an e-commerce storefront with product grid, category filters, product detail page, cart drawer, and checkout page. Use clean UI and mock products.'
    },
    {
      text: 'Portfolio',
      icon: '💼',
      prompt: 'Create a portfolio site with a case studies section, project cards, about page, contact form, and a simple blog layout. Make it elegant and minimal.'
    },
  ]

  const steps = [
    { label: 'Describe', detail: 'Say what to build' },
    { label: 'Iterate', detail: 'Refine with edits' },
    { label: 'Ship', detail: 'Deploy when ready' }
  ]

  const useCases = [
    { title: 'SaaS Landing', blurb: 'Hero, pricing, FAQs, and CTAs that convert', prompt: examplePrompts[0].prompt },
    { title: 'Dashboard', blurb: 'Charts, tables, filters, auth-ready shell', prompt: examplePrompts[1].prompt },
    { title: 'Ecommerce', blurb: 'Product grid, filters, cart, and checkout flow', prompt: examplePrompts[2].prompt },
    { title: 'Portfolio', blurb: 'Case studies, about, contact, and blog layout', prompt: examplePrompts[3].prompt },
    { title: 'Team Workspace', blurb: 'Projects, roles, settings, and activity feed', prompt: 'Build a team workspace with project list, member management, roles, and an activity feed. Include settings screens and responsive layout.' },
    { title: 'Analytics', blurb: 'Events, funnels, retention, and dashboards', prompt: 'Create an analytics app with an overview dashboard, charts, a table of events, filters, and a simple funnel view. Use mock data and clean UI.' },
  ]

  const workflow = [
    { title: 'Prompt', body: 'Describe the product, audience, and must-have features.' },
    { title: 'Generate', body: 'We scaffold UI, routes, data mocks, and hook up state.' },
    { title: 'Ship', body: 'Preview live, tweak copy, and deploy to the cloud in one click.' },
  ]

  const highlights = [
    { title: 'Enterprise-ready', body: 'Secure defaults, env separation, and sane auth patterns.', icon: ShieldCheck },
    { title: 'Data-first', body: 'Tables, charts, and CRUD flows that are wired for scale.', icon: LineChart },
    { title: 'Global by default', body: 'Fast edge delivery, SEO-friendly metadata, and i18n-ready copy.', icon: Globe2 },
  ]

  const capabilities = [
    { title: 'Components + styling', body: 'Modern UI patterns, responsive layouts, and consistent polish.', icon: Layers },
    { title: 'Live preview', body: 'See changes instantly while you iterate with AI.', icon: Zap },
    { title: 'Deploy-ready', body: 'Ship to the cloud when you’re happy with the result.', icon: Rocket },
    { title: 'Guided edits', body: 'Ask for precise changes—copy, layout, or behavior.', icon: MousePointer2 },
  ]

  const demoCards = [
    { title: 'Launch-worthy hero', body: 'Gradient hero with dual CTAs, social proof, and live preview.', accent: 'from-purple-500/30 via-pink-500/20 to-cyan-500/20' },
    { title: 'Pricing that converts', body: 'Three tiers, toggle for monthly/annual, and checkout-ready buttons.', accent: 'from-blue-500/25 via-teal-400/20 to-emerald-400/15' },
    { title: 'Dashboard shell', body: 'Sidebar, topbar, filters, and charts wired to data mocks.', accent: 'from-amber-500/25 via-orange-500/18 to-rose-500/18' },
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
      <main className="flex-1 flex flex-col items-center px-4 pt-28 pb-20 relative">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          {/* Badge */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 badge-primary animate-fade-in-down">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI-Powered Development</span>
            </div>

            <div>
              <h1 className="heading-xl text-white mb-4 leading-tight animate-fade-in-up">
                Build lovable products
                <br />
                <span className="gradient-text-glow">with AI-grade speed.</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl animate-fade-in-up delay-100">
                A guided studio that feels like a design system, a codebase, and a launch pad in one. Describe, preview, and ship—fast.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 animate-fade-in-up delay-150">
              <Button asChild size="sm" className="btn-primary px-5">
                <Link href="/dashboard">
                  Start building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg px-4 font-medium">
                <Link href="/templates">View templates</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg px-4 font-medium">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in-up delay-200">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm font-semibold text-white/70">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{step.label}</div>
                    <div className="text-xs text-white/60">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero right: prompt + preview */}
          <div className="w-full">
            <form onSubmit={handleSubmit} className="relative mb-6 animate-fade-in-up delay-150">
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
            <div className="mt-4 flex flex-col gap-2 text-xs text-white/45">
              <p>
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] font-mono text-white/60 border border-white/[0.1]">Enter</kbd> to submit. Shift+Enter for newline.
              </p>
              <p className="text-white/50">Your prompt stays local; secrets are never sent to the server.</p>
            </div>
          </form>
            <div className="animate-fade-in-up delay-250 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/60 font-medium">Popular builds</p>
                  <Link href="/templates" className="text-xs text-white/50 hover:text-white transition-colors">
                    Browse templates
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {examplePrompts.map((item) => (
                    <button
                      key={item.text}
                      onClick={() => handlePromptClick(item.prompt)}
                      className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-purple-500/10 hover:border-purple-500/30 text-white/70 hover:text-white transition-all duration-200 hover:-translate-y-0.5 font-medium"
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 text-white/60 text-xs">
                  <span className="flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Live preview</span>
                  <span className="rounded-full px-2 py-1 bg-green-500/15 text-green-300">Running</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {demoCards.map((card) => (
                    <div key={card.title} className={`rounded-xl border border-white/[0.08] bg-gradient-to-br ${card.accent} p-3 text-left`}> 
                      <div className="font-semibold text-white mb-1 text-sm">{card.title}</div>
                      <p className="text-xs text-white/70 leading-relaxed">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="w-full max-w-6xl mx-auto mt-16 text-center animate-fade-in-up delay-200">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Trusted by builders</div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/55 text-sm font-medium">
            {['Product teams','Agencies','Indie hackers','Founders','Studios'].map((label) => (
              <span key={label} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">{label}</span>
            ))}
          </div>
          <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left flex flex-col sm:flex-row gap-4">
            <div className="h-11 w-11 rounded-full bg-white/[0.07] flex items-center justify-center text-white/70">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">“We shipped a polished MVP in a weekend. The live preview plus ready-to-deploy flows felt like having design and engineering in the same room.”</p>
              <p className="text-xs text-white/50">Amira K., Founder at Brightwave</p>
            </div>
          </div>
        </div>

        {/* Use-cases */}
        <div className="w-full max-w-6xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up delay-250">
          {useCases.map((item) => (
            <div key={item.title} className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <span className="text-xs text-white/40">Quick start</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">{item.blurb}</p>
              <Button
                size="sm"
                variant="ghost"
                className="px-0 text-purple-300 hover:text-white"
                onClick={() => handlePromptClick(item.prompt)}
              >
                Use this prompt
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <div className="w-full max-w-6xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-300">
          {capabilities.map(({ title, body, icon: Icon }) => (
            <div key={title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
              <div className="h-11 w-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-white/80" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <div className="w-full max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-4 animate-fade-in-up delay-300">
          {workflow.map((item, idx) => (
            <div key={item.title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-9 w-9 rounded-full bg-purple-500/15 text-purple-200 flex items-center justify-center font-semibold">{idx + 1}</span>
                <h3 className="font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="w-full max-w-5xl mx-auto mt-14 grid md:grid-cols-3 gap-4 animate-fade-in-up delay-350">
          {highlights.map(({ title, body, icon: Icon }) => (
            <div key={title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
              <div className="h-11 w-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-white/80" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Feature trio */}
        <div className="w-full max-w-5xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in-up delay-400">
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

        {/* CTA */}
        <div className="w-full max-w-5xl mx-auto mt-16 text-center animate-fade-in-up delay-450">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-8">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to launch?</h3>
            <p className="text-white/60 mb-4">Jump into the workspace, pick a template, or start from a blank prompt.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="btn-primary px-5">
                <Link href="/dashboard">Open workspace</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg px-4 font-medium">
                <Link href="/templates">Browse templates</Link>
              </Button>
            </div>
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
          <div className="flex items-center gap-6 text-sm text-white/50 font-medium">
            <Link href="/templates" className="hover:text-purple-400 transition-colors">Templates</Link>
            <Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
            <Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
            <Link href="/analytics" className="hover:text-purple-400 transition-colors">Analytics</Link>
            <Link href="/login" className="hover:text-purple-400 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
