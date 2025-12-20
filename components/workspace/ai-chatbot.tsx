'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Sparkles,
  User,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  FileCode,
  ArrowUp,
  Paperclip,
  Wand2,
  FolderOpen,
} from 'lucide-react'
import type { Message, File, PlatformType } from '@/types'
import { cn } from '@/lib/utils'
import { getSuggestionsForPlatform } from '@/lib/ai-suggestions'
import { motion, AnimatePresence } from 'framer-motion'

interface AIChatbotProps {
  projectId: string
  files: File[]
  onFilesChange: (files: File[]) => void
  platform?: PlatformType
}

// Simple markdown-like renderer for code blocks
function MessageContent({ content }: { content: string }) {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null)

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedBlock(index)
    setTimeout(() => setCopiedBlock(null), 2000)
  }

  // Parse content for code blocks
  const parts = useMemo(() => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const result: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: content.slice(lastIndex, match.index) })
      }
      result.push({ type: 'code', content: match[2].trim(), language: match[1] || 'plaintext' })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      result.push({ type: 'text', content: content.slice(lastIndex) })
    }

    return result.length > 0 ? result : [{ type: 'text' as const, content }]
  }, [content])

  return (
    <div className="space-y-3">
      {parts.map((part, index) => (
        part.type === 'code' ? (
          <div key={index} className="relative group rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/[0.06]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
              <span className="text-[11px] font-medium text-white/40 uppercase tracking-wide">
                {part.language}
              </span>
              <button
                onClick={() => copyCode(part.content, index)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
              >
                {copiedBlock === index ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
              <code className="text-white/80 font-mono">{part.content}</code>
            </pre>
          </div>
        ) : (
          <p key={index} className="text-[14px] text-white/80 leading-[1.75] whitespace-pre-wrap">
            {part.content.split('\n').map((line, i) => (
              <span key={i}>
                {line.split(/(`[^`]+`)/).map((segment, j) => (
                  segment.startsWith('`') && segment.endsWith('`') ? (
                    <code key={j} className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-300 text-[13px] font-mono border border-violet-500/20">
                      {segment.slice(1, -1)}
                    </code>
                  ) : (
                    <span key={j}>{segment}</span>
                  )
                ))}
                {i < part.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      ))}
    </div>
  )
}

// Typing indicator for loading state
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <motion.span
        className="w-2 h-2 rounded-full bg-violet-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-violet-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-violet-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
}

// Files Created Summary Component
function FilesCreatedSummary({ files }: { files: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (files.length === 0) return null

  const displayFiles = isExpanded ? files : files.slice(0, 4)
  const hasMore = files.length > 4

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <FolderOpen className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">
          {files.length} file{files.length > 1 ? 's' : ''} created
        </span>
      </div>
      <div className="px-3 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {displayFiles.map((file, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-black/20 text-white/60 font-mono"
            >
              <FileCode className="h-3 w-3 text-emerald-400/60" />
              {file.split('/').pop()}
            </span>
          ))}
          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="px-2 py-1 text-xs rounded-md bg-black/20 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              +{files.length - 4} more
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generatedFilesRef = useRef<string[]>([])
  const filesRef = useRef<File[]>(files)
  const { toast } = useToast()

  useEffect(() => {
    filesRef.current = files
  }, [files])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  // Handle initial prompt
  useEffect(() => {
    const initialPrompt = sessionStorage.getItem('initialPrompt')
    if (initialPrompt) {
      sessionStorage.removeItem('initialPrompt')
      setInput(initialPrompt)
      setTimeout(() => {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          project_id: projectId,
          role: 'user',
          content: initialPrompt,
          created_at: new Date().toISOString(),
        }
        setMessages([userMessage])
        setInput('')
        sendMessage(userMessage, [])
      }, 100)
    }
  }, [projectId])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendMessage = async (userMessage: Message, existingMessages: Message[]) => {
    setIsLoading(true)
    setGeneratedFiles([])
    generatedFilesRef.current = []
    setLastFailedMessage(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          messages: [...existingMessages, userMessage],
          files,
          platform,
          useDualMode: true,
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
                  const updatedFiles = [...filesRef.current]
                  const newFileNames: string[] = []
                  const normalizePath = (p: string) => p.replace(/^\.?\//, '').trim()

                  for (const action of data.actions) {
                    if (action.type === 'create_or_update_file') {
                      const normalizedPath = normalizePath(action.path)
                      newFileNames.push(normalizedPath)

                      const existingIndex = updatedFiles.findIndex(f => normalizePath(f.path) === normalizedPath)
                      if (existingIndex >= 0) {
                        updatedFiles[existingIndex] = {
                          ...updatedFiles[existingIndex],
                          path: normalizedPath,
                          content: action.content,
                          updated_at: new Date().toISOString(),
                        }
                      } else {
                        const ext = normalizedPath.split('.').pop()?.toLowerCase() || ''
                        const langMap: Record<string, string> = {
                          html: 'html', htm: 'html',
                          css: 'css', scss: 'scss', less: 'less',
                          js: 'javascript', jsx: 'javascript',
                          ts: 'typescript', tsx: 'typescript',
                          json: 'json', md: 'markdown'
                        }
                        updatedFiles.push({
                          id: crypto.randomUUID(),
                          project_id: projectId,
                          path: normalizedPath,
                          content: action.content,
                          language: langMap[ext] || 'plaintext',
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        })
                      }
                    } else if (action.type === 'delete_file') {
                      const normalizedPath = normalizePath(action.path)
                      const index = updatedFiles.findIndex(f => normalizePath(f.path) === normalizedPath)
                      if (index >= 0) {
                        updatedFiles.splice(index, 1)
                      }
                    }
                  }

                  generatedFilesRef.current = [...generatedFilesRef.current, ...newFileNames]
                  setGeneratedFiles(generatedFilesRef.current)
                  filesRef.current = updatedFiles
                  onFilesChange(updatedFiles)
                } else if (data.type === 'error') {
                  const error = new Error(data.error || data.message || 'Generation failed') as any
                  error.retryable = data.retryable || false
                  throw error
                }
              } catch (error) {
                if (!(error instanceof SyntaxError)) {
                  throw error
                }
              }
            }
          }
        }
      }

      if (generatedFilesRef.current.length > 0) {
        toast({
          title: 'Files Generated',
          description: `${generatedFilesRef.current.length} file(s) created successfully!`,
        })
      }
    } catch (error: any) {
      console.error('Chat error:', error)

      const isRetryable = error.retryable || error.message?.includes('502') || error.message?.includes('temporarily unavailable')

      toast({
        title: isRetryable ? 'Connection Error' : 'Generation Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      })

      if (isRetryable) {
        setLastFailedMessage(userMessage.content)
      }

      setMessages(prev => [
        ...prev.filter(m => m.role !== 'assistant' || m.content),
        {
          id: crypto.randomUUID(),
          project_id: projectId,
          role: 'assistant',
          content: isRetryable
            ? `I encountered a temporary connection issue. The AI provider may be overloaded. Please click "Retry" or try again in a moment.`
            : `I encountered an error: ${error.message}. Please try again.`,
          created_at: new Date().toISOString(),
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(userMessage, messages)
  }

  const handleRetry = () => {
    setLastFailedMessage(null)

    if (lastFailedMessage) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        project_id: projectId,
        role: 'user',
        content: lastFailedMessage,
        created_at: new Date().toISOString(),
      }
      const cleanedMessages = messages.filter(m =>
        !(m.role === 'assistant' && m.content?.includes('connection issue'))
      )
      setMessages(cleanedMessages)
      sendMessage(userMessage, cleanedMessages)
      return
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      const messagesBeforeLast = messages.slice(0, messages.indexOf(lastUserMessage))
      setMessages(messagesBeforeLast)
      sendMessage(lastUserMessage, messagesBeforeLast)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = getSuggestionsForPlatform(platform, 4)

  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 ? (
          // Empty State
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/30">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3 tracking-tight">
              What would you like to build?
            </h1>
            <p className="text-sm text-white/40 mb-10 text-center max-w-[320px] leading-relaxed">
              Describe your idea and I'll generate production-ready code for you
            </p>

            {/* Suggestion Cards */}
            <div className="w-full max-w-md grid grid-cols-2 gap-2.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => setInput(suggestion.text)}
                  className="p-4 text-left rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 group hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300 origin-left">
                    {suggestion.emoji}
                  </span>
                  <span className="text-xs text-white/60 group-hover:text-white/80 line-clamp-2 leading-relaxed transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === 'user' ? (
                    // User Message
                    <div className="flex justify-end">
                      <div className="max-w-[85%] flex items-end gap-3">
                        <div className="rounded-2xl rounded-br-md px-4 py-3 bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20">
                          <p className="text-[14px] text-white leading-[1.6] whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant Message
                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Message Content */}
                        {msg.content && (
                          <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white/[0.03] border border-white/[0.06]">
                            <MessageContent content={msg.content} />
                          </div>
                        )}

                        {/* Files Created Summary */}
                        {idx === messages.length - 1 && generatedFiles.length > 0 && !isLoading && (
                          <FilesCreatedSummary files={generatedFiles} />
                        )}

                        {/* Actions */}
                        {msg.content && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                              title="Copy message"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            {idx === messages.length - 1 && (
                              <button
                                onClick={handleRetry}
                                className={cn(
                                  "p-2 rounded-xl transition-all",
                                  lastFailedMessage
                                    ? "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 animate-pulse"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                                )}
                                title={lastFailedMessage ? "Retry failed request" : "Regenerate response"}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading State - Simple typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-md px-4 py-4 bg-white/[0.03] border border-white/[0.06]">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className={cn(
            "relative rounded-2xl border transition-all duration-300",
            input.trim()
              ? "border-violet-500/40 bg-violet-500/[0.03] shadow-lg shadow-violet-500/10"
              : "border-white/[0.08] bg-white/[0.02]"
          )}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to build..."
              rows={1}
              className="w-full px-4 py-4 pr-24 resize-none bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none leading-relaxed"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                className="p-2.5 rounded-xl text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-all"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-300",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105"
                    : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-white/25 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/40 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/40 font-mono text-[10px]">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}
