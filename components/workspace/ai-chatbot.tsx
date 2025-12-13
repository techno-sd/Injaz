'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Send, Loader2, Code2, Zap, Layout, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message, File } from '@/types'

interface AIChatbotProps {
  projectId: string
  files: File[]
  onFilesChange: (files: File[]) => void
}

const QUICK_PROMPTS = [
  { icon: Layout, text: 'Add a hero section', color: 'from-blue-500 to-cyan-500' },
  { icon: Palette, text: 'Change color scheme to purple', color: 'from-purple-500 to-pink-500' },
  { icon: Zap, text: 'Add smooth animations', color: 'from-orange-500 to-yellow-500' },
  { icon: Code2, text: 'Improve the code structure', color: 'from-green-500 to-emerald-500' },
]

export function AIChatbot({ projectId, files, onFilesChange }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      project_id: projectId,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          messages: [...messages, userMessage],
          files,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        project_id: projectId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'content') {
                  assistantContent += data.content
                  setMessages(prev =>
                    prev.map(m => m.id === assistantMessage.id
                      ? { ...m, content: assistantContent }
                      : m
                    )
                  )
                } else if (data.type === 'actions' && data.actions) {
                  // Apply file changes
                  const updatedFiles = [...files]

                  for (const action of data.actions) {
                    if (action.type === 'create_or_update_file') {
                      const existingIndex = updatedFiles.findIndex(f => f.path === action.path)

                      if (existingIndex >= 0) {
                        updatedFiles[existingIndex] = {
                          ...updatedFiles[existingIndex],
                          content: action.content,
                          updated_at: new Date().toISOString(),
                        }
                      } else {
                        updatedFiles.push({
                          id: crypto.randomUUID(),
                          project_id: projectId,
                          path: action.path,
                          content: action.content,
                          language: 'typescript',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        })
                      }
                    } else if (action.type === 'delete_file') {
                      const index = updatedFiles.findIndex(f => f.path === action.path)
                      if (index >= 0) {
                        updatedFiles.splice(index, 1)
                      }
                    }
                  }

                  onFilesChange(updatedFiles)

                  toast({
                    title: 'Files Updated',
                    description: `${data.actions.length} file(s) modified`,
                  })
                }
              } catch (error) {
                console.error('Error parsing SSE:', error)
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      toast({
        title: 'AI Error',
        description: error.message || 'Failed to get response. Check console.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Assistant</h3>
            <p className="text-xs text-white/80">Powered by GPT-4o Mini</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 flex items-center justify-center mb-6 animate-scale-in">
              <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-lg mb-2">Ready to Build?</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Tell me what you want to create and I'll write the code for you.
            </p>
            <div className="w-full space-y-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt.text)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 bg-background hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-500 transition-all text-left group animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <prompt.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                        : 'bg-muted border-2 border-border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-muted border-2 border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe what you want to build..."
            className="min-h-[80px] pr-12 resize-none rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-110"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
