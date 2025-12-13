'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  Zap,
  Palette,
  Layout
} from 'lucide-react'
import type { Message } from '@/types'

interface SimplifiedAIChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

const STARTER_PROMPTS = [
  {
    icon: <Layout className="h-5 w-5" />,
    title: 'Add a new section',
    prompt: 'Add a new section to my landing page with a title and description',
    color: 'bg-blue-500'
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: 'Change colors',
    prompt: 'Change the color scheme to a modern purple and blue gradient',
    color: 'bg-purple-500'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Add animation',
    prompt: 'Add smooth animations when elements appear on scroll',
    color: 'bg-yellow-500'
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: 'Improve design',
    prompt: 'Make the design more modern and professional',
    color: 'bg-green-500'
  }
]

export function SimplifiedAIChat({
  messages,
  onSendMessage,
  isLoading = false
}: SimplifiedAIChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
      textareaRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="p-6 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Tell me what you want to build
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            // Empty state with starter prompts
            <div className="space-y-6 py-8">
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 rounded-full gradient-primary items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">What would you like to create?</h3>
                <p className="text-muted-foreground text-lg">
                  I can help you build and customize your app
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterPrompt(prompt.prompt)}
                    className="group p-4 rounded-xl border-2 border-muted hover:border-primary bg-card hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${prompt.color} h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                        {prompt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {prompt.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {prompt.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-xl p-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Pro Tips:
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Be specific about what you want</li>
                      <li>• You can ask me to change colors, add sections, or fix bugs</li>
                      <li>• I'll update your code automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Message list
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                    You
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="min-h-[80px] pr-14 text-base resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-full gradient-primary"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
