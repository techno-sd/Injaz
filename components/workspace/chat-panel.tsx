'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import type { File, Message } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

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
    <div className="h-full flex flex-col bg-muted/50">
      <div className="border-b p-3">
        <h3 className="font-semibold text-sm">AI Assistant</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Chat with AI to build your app
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Start a conversation with AI</p>
            <p className="text-xs mt-2">
              Try: "Create a landing page with a hero section"
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 max-w-[85%]",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="rounded-lg px-3 py-2 bg-background border">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
