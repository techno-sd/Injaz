'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, CheckCircle2, Sparkles, FileCode, Lightbulb, Zap, Code2, Paintbrush, Database, Shield, Bug, Rocket } from 'lucide-react'
import type { File, Message } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface ChatPanelProps {
  projectId: string
  files: File[]
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  onFilesChange: (files: File[]) => void
  /** Called when AI generation starts/stops */
  onGeneratingChange?: (isGenerating: boolean) => void
}

export function ChatPanel({ projectId, files, messages, onMessagesChange, onFilesChange, onGeneratingChange }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [contextFiles, setContextFiles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const suggestedPrompts = [
    { icon: Paintbrush, text: "Add a dark mode toggle", category: "UI" },
    { icon: FileCode, text: "Create a contact form with validation", category: "Feature" },
    { icon: Shield, text: "Add authentication with JWT", category: "Security" },
    { icon: Zap, text: "Optimize performance and loading", category: "Performance" },
    { icon: Bug, text: "Review code for potential bugs", category: "Quality" },
    { icon: Database, text: "Add database integration", category: "Backend" },
    { icon: Rocket, text: "Improve SEO and meta tags", category: "SEO" },
    { icon: Code2, text: "Refactor code for best practices", category: "Quality" }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Notify parent when generating state changes
  useEffect(() => {
    onGeneratingChange?.(isLoading)
  }, [isLoading, onGeneratingChange])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      project_id: projectId,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    onMessagesChange([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      onMessagesChange([...messages, userMessage, assistantMessage])

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
                  assistantMessage.content = assistantContent
                  onMessagesChange([...messages, userMessage, { ...assistantMessage }])
                } else if (data.type === 'actions') {
                  // Apply file changes
                  const updatedFiles = [...files]

                  for (const action of data.actions) {
                    if (action.type === 'create_or_update_file') {
                      const existingFileIndex = updatedFiles.findIndex(
                        f => f.path === action.path
                      )

                      if (existingFileIndex >= 0) {
                        updatedFiles[existingFileIndex] = {
                          ...updatedFiles[existingFileIndex],
                          content: action.content,
                        }
                      } else {
                        // Create new file
                        const newFile: File = {
                          id: crypto.randomUUID(),
                          project_id: projectId,
                          path: action.path,
                          content: action.content,
                          language: 'typescript',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        }
                        updatedFiles.push(newFile)
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
                console.error('Error parsing SSE data:', error)
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      toast({
        title: 'AI Chat Error',
        description: error.message || 'Failed to communicate with AI. Check console for details.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 space-y-6"
          >
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Start building with AI</p>
              <p className="text-xs text-muted-foreground/70">
                Describe features, fix bugs, or improve your app
              </p>
            </div>

            {/* Suggested prompts */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Smart Suggestions</p>
                <div className="grid gap-2">
                  {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => {
                        setInput(prompt.text)
                        setShowSuggestions(false)
                        inputRef.current?.focus()
                      }}
                      className="text-left p-3 rounded-xl border-2 glass-card hover:border-primary transition-all group hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all">
                          <prompt.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {prompt.text}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {prompt.category}
                          </Badge>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-2",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-background border rounded-tl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-start"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-background border shadow-sm">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground/40"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-background/80 backdrop-blur-sm space-y-3">
        {/* Context indicators */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCode className="h-3 w-3" />
            <span>Context: {files.length} file{files.length !== 1 ? 's' : ''}</span>
            <Badge variant="secondary" className="text-xs">
              AI-aware
            </Badge>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (e.target.value) setShowSuggestions(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Describe what you want to build... (Shift+Enter for new line)"
              disabled={isLoading}
              className="min-h-[44px] max-h-32 resize-none pr-10 rounded-xl border-2 focus:border-primary transition-colors"
              rows={1}
            />
            {input && !isLoading && (
              <div className="absolute right-3 bottom-3 text-xs text-muted-foreground flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 flex-shrink-0 gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>AI can make mistakes. Review code changes carefully.</p>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span className="font-medium">Powered by AI</span>
          </div>
        </div>
      </form>
    </div>
  )
}
