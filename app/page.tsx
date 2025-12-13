'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Code2, Sparkles, Send, ArrowRight, Zap, Layout, Rocket, Check, Github, Play, Star, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [chatInput, setChatInput] = useState('')
  const [showPrompts, setShowPrompts] = useState(true)

  const examplePrompts = [
    "Build a modern SaaS dashboard with analytics",
    "Create an e-commerce store with cart and checkout",
    "Design a portfolio website with dark mode",
    "Make a real-time chat application"
  ]

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Development",
      description: "Chat with AI to build your app. Describe features in plain English and watch them come to life.",
      color: "blue"
    },
    {
      icon: Layout,
      title: "Real-Time Editor",
      description: "Professional Monaco editor with syntax highlighting. See your changes instantly in the live preview.",
      color: "purple"
    },
    {
      icon: Rocket,
      title: "One-Click Deploy",
      description: "Deploy to Vercel with a single click. Connect your GitHub and push updates seamlessly.",
      color: "green"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "WebContainer technology runs your app instantly in the browser. No waiting for builds.",
      color: "yellow"
    },
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Import repositories, sync code, and push changes directly from the editor.",
      color: "gray"
    },
    {
      icon: Users,
      title: "Templates Library",
      description: "Start from 10+ professional templates or create your own from scratch.",
      color: "pink"
    }
  ]

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt)
    setShowPrompts(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Go directly to demo workspace - no sign up required
    window.location.href = '/workspace/demo'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/30 group-hover:scale-105 group-hover:rotate-6 transition-all">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              iEditor
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105">
              Templates
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all hover:scale-105">
              <Link href="/workspace/demo">Try Now</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all hover:scale-105">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium animate-fade-in"
            >
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-gradient">AI-Powered App Builder</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight animate-slide-up"
            >
              Build apps with{' '}
              <span className="text-gradient animate-pulse-slow">
                AI
              </span>
              <br />
              in seconds
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up animate-delay-100"
            >
              The fastest way to build full-stack applications. Chat with AI, edit code in real-time,
              and deploy to production—all in one platform.
            </motion.p>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in animate-delay-200"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-white"></div>
                  ))}
                </div>
                <span>5,000+ developers</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1">5.0 rating</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto animate-scale-in animate-delay-300"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden ring-1 ring-gray-200/50 hover-lift">
              {/* Chat Header */}
              <div className="gradient-primary px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">AI Assistant</span>
                    <span className="text-xs text-white/80">● Online</span>
                  </div>
                  <div className="text-xs text-white/80">
                    <Play className="h-4 w-4 inline mr-1" />
                    Try it now
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-6 md:p-8 min-h-[350px] flex flex-col justify-end bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-800">
                {/* AI Welcome Message */}
                <div className="mb-8 animate-slide-in">
                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] shadow-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        Hi! 👋 I'm your AI development assistant. Tell me what you'd like to build,
                        and I'll create it with production-ready code, instant preview, and deployment support.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example Prompts */}
                {showPrompts && (
                  <div className="mb-6 space-y-3 animate-slide-up animate-delay-200">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      Popular requests:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all text-sm group hover-lift animate-slide-up"
                          style={{ animationDelay: `${300 + index * 100}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-medium">
                              {prompt}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input Form */}
                <form onSubmit={handleSubmit} className="relative animate-slide-up animate-delay-400">
                  <div className="flex items-center gap-2 p-2 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:shadow-purple-500/10">
                    <Input
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value)
                        if (e.target.value) setShowPrompts(false)
                      }}
                      placeholder="Describe the app you want to build..."
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-xl h-10 w-10 flex-shrink-0 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-110 transition-all"
                      disabled={!chatInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Press Enter to start building · Free to try · No credit card required
                  </p>
                </form>
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm animate-fade-in animate-delay-500"
            >
              <div className="flex items-center gap-2 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all group cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110 transition-all">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold">Instant deployment</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all group cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110 transition-all">
                  <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold">Production-ready code</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all group cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110 transition-all">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold">AI-powered</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32 mb-20">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full glass-card text-sm font-semibold text-primary mb-4"
            >
              Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Everything you need to build
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Professional developer tools powered by AI. From idea to deployment in minutes.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl glass-card hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/30 transition-all hover-lift border-2"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xl mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-32 mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 p-12 md:p-16 shadow-2xl">
            {/* Animated background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Projects Created', value: '10,000+', icon: Code2 },
                { label: 'Active Users', value: '5,000+', icon: Users },
                { label: 'Lines of Code', value: '1M+', icon: Sparkles },
                { label: 'Deployments', value: '15,000+', icon: Rocket },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center group cursor-pointer p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-white group-hover:scale-110 transition-transform" />
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center space-y-8 gradient-primary rounded-3xl p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            >
              Ready to build something amazing?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10"
            >
              Join thousands of developers building apps with AI. Start for free, no credit card required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" variant="secondary" className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg px-8 py-6">
                <Link href="/signup">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-xl text-lg px-8 py-6">
                <Link href="/templates">
                  <Layout className="mr-2 h-5 w-5" />
                  Browse Templates
                </Link>
              </Button>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80"
            >
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/templates" className="hover:text-foreground transition-colors">Templates</Link></li>
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-8 w-8 gradient-primary rounded-lg flex items-center justify-center">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gradient">iEditor</span>
            </div>
            <p>© 2024 iEditor. Built with AI, for developers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
