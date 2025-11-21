'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, CheckCircle2, Sparkles, FileCode, Lightbulb } from 'lucide-react'
import type { File, Message } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatPanelProps {
  projectId: string
  files: File[]
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  onFilesChange: (files: File[]) => void
}

export function ChatPanel({ projectId, files, messages, onMessagesChange, onFilesChange }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const suggestedPrompts = [
    "Add a dark mode toggle",
    "Create a contact form",
    "Add authentication",
    "Improve the styling",
    "Add error handling",
    "Create an API endpoint"
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        throw new Error('Failed to get AI response')
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to communicate with AI',
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
                className="space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground">Quick actions:</p>
                <div className="grid gap-2">
                  {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => {
                        setInput(prompt)
                        setShowSuggestions(false)
                      }}
                      className="text-left p-3 rounded-lg border bg-background hover:bg-accent hover:border-primary transition-all text-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        <span className="text-muted-foreground group-hover:text-foreground">
                          {prompt}
                        </span>
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
      <form onSubmit={handleSubmit} className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (e.target.value) setShowSuggestions(false)
              }}
              placeholder="Describe what you want to build..."
              disabled={isLoading}
              className="pr-10"
            />
            {input && !isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ↵
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI can make mistakes. Review important code changes.
        </p>
      </form>
    </div>
  )
}
