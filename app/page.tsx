'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Code2, Sparkles, Send, ArrowRight, Zap, Layout, Rocket } from 'lucide-react'
import { DemoLoginButton } from '@/components/demo-login-button'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [chatInput, setChatInput] = useState('')
  const [showPrompts, setShowPrompts] = useState(true)

  const examplePrompts = [
    "Build a modern landing page with a hero section and pricing",
    "Create a dashboard with analytics charts and tables",
    "Design a blog with markdown support and dark mode",
    "Make a todo app with drag and drop functionality"
  ]

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt)
    setShowPrompts(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to signup with the prompt as a query parameter
    const encodedPrompt = encodeURIComponent(chatInput)
    window.location.href = `/signup?prompt=${encodedPrompt}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">iEditor</span>
          </Link>
          <div className="flex items-center gap-3">
            <DemoLoginButton variant="ghost" />
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Chat Interface */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered App Builder
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight"
          >
            Build apps by chatting <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Describe your app idea and watch as AI transforms your words into working code.
            No coding required.
          </motion.p>
        </div>

        {/* Interactive Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">AI Assistant</span>
                <span className="text-xs text-white/80">● Online</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-end">
              {/* AI Welcome Message */}
              <div className="mb-6">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-gray-800">
                      Hi! 👋 I'm your AI development assistant. Tell me what you'd like to build,
                      and I'll help you create it step by step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Prompts */}
              {showPrompts && (
                <div className="mb-6 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-sm group"
                      >
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 group-hover:text-gray-900">
                            {prompt}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center gap-2 p-2 border-2 border-gray-200 rounded-2xl focus-within:border-primary transition-colors bg-white">
                  <Input
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value)
                      if (e.target.value) setShowPrompts(false)
                    }}
                    placeholder="Describe the app you want to build..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl h-10 w-10 flex-shrink-0"
                    disabled={!chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to start building · Free to try
                </p>
              </form>
            </div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Instant deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-500" />
              <span>Production-ready code</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>AI-powered</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-24 mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            Build faster with AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600 mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered Development</h3>
              <p className="text-muted-foreground text-sm">
                Chat with AI to build your app. Describe features in plain English
                and watch them come to life.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-100 text-purple-600 mb-2">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Real-Time Editor</h3>
              <p className="text-muted-foreground text-sm">
                Edit code directly with Monaco editor. See changes instantly
                in the live preview.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-600 mb-2">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">One-Click Deploy</h3>
              <p className="text-muted-foreground text-sm">
                Deploy your application to production with a single click.
                Share your creation instantly.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to build something amazing?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of developers building apps with AI
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 iEditor. Built with AI, for developers.</p>
        </div>
      </footer>
    </div>
  )
}
