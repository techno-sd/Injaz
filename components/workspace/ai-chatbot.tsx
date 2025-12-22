'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ArrowUp,
  Paperclip,
  Wand2,
  Square,
  CheckSquare,
  Circle,
  Plus,
  Slash,
  Sparkles,
  Bot,
  User,
  ArrowDownCircle,
  Zap,
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
  initialPrompt?: string
}

// Tool operation types
type ToolType = 'Read' | 'Edit' | 'Write' | 'Glob' | 'Grep' | 'Bash' | 'Task'

interface ToolOperation {
  id: string
  type: ToolType
  target: string
  status: 'running' | 'complete' | 'error'
  result?: string
}

interface TodoItem {
  id: string
  content: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface ThinkingBlock {
  id: string
  content: string
  isExpanded: boolean
}

// AI Avatar Component
function AIAvatar({ isAnimating = false }: { isAnimating?: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className={cn(
        "w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg",
        isAnimating && "shadow-emerald-500/40"
      )}>
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      {isAnimating && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400"
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  )
}

// User Avatar Component
function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0">
      <User className="h-4 w-4 text-white/80" />
    </div>
  )
}

// Shimmer effect for loading states
function ShimmerText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  )
}

// Typing indicator with bouncing dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <motion.span
        className="w-2 h-2 rounded-full bg-emerald-400"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-teal-400"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-emerald-400"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  )
}

// Format timestamp
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Tool Badge Component (Claude-style)
function ToolBadge({ type, target, status }: { type: ToolType; target: string; status: string }) {
  const fileName = target.split('/').pop() || target

  const typeColors: Record<ToolType, string> = {
    Read: 'text-teal-400',
    Edit: 'text-amber-400',
    Write: 'text-emerald-400',
    Glob: 'text-cyan-400',
    Grep: 'text-cyan-400',
    Bash: 'text-rose-400',
    Task: 'text-violet-400',
  }

  return (
    <div className="flex items-center gap-2 py-1.5 text-sm group">
      <span className={cn("font-medium", typeColors[type] || 'text-emerald-400')}>{type}</span>
      <span className="text-white/50 font-mono text-xs group-hover:text-white/70 transition-colors">{fileName}</span>
      {status === 'running' && (
        <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
      )}
      {status === 'complete' && (
        <Check className="h-3 w-3 text-emerald-400" />
      )}
    </div>
  )
}

// Thinking Section (Claude-style collapsible)
function ThinkingSection({ content, defaultExpanded = false }: { content: string; defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="py-2 px-3 rounded-lg bg-teal-500/5 border border-teal-500/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-teal-300/70 hover:text-teal-300 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="font-medium">Thinking</span>
        {!isExpanded && (
          <motion.div
            className="flex gap-1 ml-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span className="w-1 h-1 rounded-full bg-teal-400" />
          </motion.div>
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pt-2 text-sm text-white/60 leading-relaxed whitespace-pre-wrap border-l-2 border-teal-500/20 ml-2 mt-2">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Todo List Component (Claude-style)
function TodoList({ items, title = "Update Todos" }: { items: TodoItem[]; title?: string }) {
  return (
    <div className="py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        <span className="text-sm font-medium text-white/80">{title}</span>
      </div>
      <div className="space-y-1 pl-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 py-0.5">
            {item.status === 'completed' ? (
              <CheckSquare className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            ) : item.status === 'in_progress' ? (
              <div className="relative mt-0.5">
                <Square className="h-4 w-4 text-teal-400 shrink-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400/50" />
                </div>
              </div>
            ) : (
              <Square className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
            )}
            <span className={cn(
              "text-sm leading-relaxed",
              item.status === 'completed' ? "text-white/50 line-through" : "text-white/70"
            )}>
              {item.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple markdown renderer for code blocks
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
          <div key={index} className="relative group rounded-xl overflow-hidden bg-slate-900/80 border border-emerald-500/10 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs text-emerald-400/70 font-mono ml-2">
                  {part.language}
                </span>
              </div>
              <button
                onClick={() => copyCode(part.content, index)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
              >
                {copiedBlock === index ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
              <code className="text-white/85 font-mono">{part.content}</code>
            </pre>
          </div>
        ) : (
          <div key={index} className="text-sm text-white/80 leading-[1.7] whitespace-pre-wrap">
            {part.content.split('\n').map((line, i) => (
              <span key={i}>
                {line.split(/(`[^`]+`)/).map((segment, j) => (
                  segment.startsWith('`') && segment.endsWith('`') ? (
                    <code key={j} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300/90 text-[13px] font-mono border border-emerald-500/20">
                      {segment.slice(1, -1)}
                    </code>
                  ) : (
                    <span key={j}>{segment}</span>
                  )
                ))}
                {i < part.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        )
      ))}
    </div>
  )
}

// Format elapsed time as mm:ss
function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Processing indicator (Claude-style dots) with timer
function ProcessingIndicator({ phase, elapsedTime }: { phase?: string; elapsedTime?: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        {phase && (
          <span className="text-sm text-emerald-300/70 font-medium">{phase}</span>
        )}
      </div>
      {elapsedTime !== undefined && elapsedTime > 0 && (
        <span className="text-xs font-mono text-white/40 tabular-nums">
          {formatElapsedTime(elapsedTime)}
        </span>
      )}
    </div>
  )
}

// Files created inline list
function FilesCreatedList({ files }: { files: string[] }) {
  if (files.length === 0) return null

  return (
    <div className="py-2 space-y-1.5 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Check className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-300/80">Files Created</span>
      </div>
      {files.slice(0, 8).map((file, i) => (
        <div key={i} className="flex items-center gap-2 text-sm pl-4 group">
          <span className="text-emerald-400 font-medium">Write</span>
          <span className="text-white/50 font-mono text-xs group-hover:text-white/70 transition-colors">{file}</span>
        </div>
      ))}
      {files.length > 8 && (
        <div className="text-xs text-emerald-400/50 pl-6 mt-1">
          +{files.length - 8} more files
        </div>
      )}
    </div>
  )
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp', initialPrompt }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [thinkingContent, setThinkingContent] = useState<string>('')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [toolOperations, setToolOperations] = useState<ToolOperation[]>([])
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generatedFilesRef = useRef<string[]>([])
  const filesRef = useRef<File[]>(files)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Timer effect for loading state
  useEffect(() => {
    if (isLoading) {
      setElapsedTime(0)
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isLoading])

  useEffect(() => {
    filesRef.current = files
  }, [files])

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom && messages.length > 0)
    }
  }, [messages.length])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, toolOperations])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  // Handle initial prompt from prop or sessionStorage
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false)

  useEffect(() => {
    if (hasProcessedInitialPrompt) return

    // Check for prompt from prop first, then sessionStorage
    const promptToUse = initialPrompt || sessionStorage.getItem('initialPrompt')

    if (promptToUse) {
      // Clear sessionStorage if that's where it came from
      if (!initialPrompt) {
        sessionStorage.removeItem('initialPrompt')
      }

      setHasProcessedInitialPrompt(true)
      setInput(promptToUse)

      // Auto-submit the prompt after a short delay
      setTimeout(() => {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          project_id: projectId,
          role: 'user',
          content: promptToUse,
          created_at: new Date().toISOString(),
        }
        setMessages([userMessage])
        setInput('')
        sendMessage(userMessage, [])
      }, 100)
    }
  }, [projectId, initialPrompt, hasProcessedInitialPrompt])

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
    setThinkingContent('')
    setTodos([])
    setToolOperations([])
    setCurrentPhase('Thinking')

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

                // Handle planning/thinking events
                if (data.type === 'planning') {
                  const phase = data.phase || 'planning'
                  if (phase === 'controller' || phase === 'start') {
                    setCurrentPhase('Planning application structure')
                    setThinkingContent(prev => prev + (data.message || '') + '\n')
                  } else if (phase === 'transition') {
                    setCurrentPhase('Generating code')
                  } else if (phase === 'templates') {
                    setCurrentPhase('Selecting templates')
                    // Add todo for templates
                    setTodos(prev => [...prev, {
                      id: crypto.randomUUID(),
                      content: data.message || 'Using templates',
                      status: 'in_progress'
                    }])
                  }
                }

                // Handle generating events
                if (data.type === 'generating') {
                  setCurrentPhase('')

                  if (data.subtask === 'templates') {
                    // Update template todo
                    setTodos(prev => prev.map(t =>
                      t.content.includes('template') ? { ...t, status: 'completed' as const } : t
                    ))
                  }

                  if (data.subtask === 'validation') {
                    if (data.status === 'running') {
                      setTodos(prev => [...prev, {
                        id: crypto.randomUUID(),
                        content: 'Validating files',
                        status: 'in_progress'
                      }])
                    } else {
                      setTodos(prev => prev.map(t =>
                        t.content === 'Validating files' ? { ...t, status: 'completed' as const } : t
                      ))
                    }
                  }

                  const fileName = data.file || data.path
                  if (fileName) {
                    setToolOperations(prev => [...prev, {
                      id: crypto.randomUUID(),
                      type: 'Write',
                      target: fileName,
                      status: 'complete'
                    }])
                  }
                }

                // Handle schema events
                if (data.type === 'schema') {
                  setTodos(prev => [...prev, {
                    id: crypto.randomUUID(),
                    content: 'Application schema created',
                    status: 'completed'
                  }])
                }

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

                      // Add tool operation
                      setToolOperations(prev => [...prev, {
                        id: crypto.randomUUID(),
                        type: existingIndex >= 0 ? 'Edit' : 'Write',
                        target: normalizedPath,
                        status: 'complete'
                      }])

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
                      setToolOperations(prev => [...prev, {
                        id: crypto.randomUUID(),
                        type: 'Bash',
                        target: `rm ${normalizedPath}`,
                        status: 'complete'
                      }])

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
                } else if (data.type === 'complete' || data.type === 'done') {
                  setCurrentPhase('')
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
      setCurrentPhase('')
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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative">
      {/* Chat Header */}
      <div className="border-b border-emerald-500/10 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <AIAvatar isAnimating={isLoading} />
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Injaz AI
              <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Zap className="h-3 w-3" />
                Ready
              </span>
            </h3>
            <p className="text-xs text-white/50">Your AI coding assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          // Empty State - Modern gradient style
          <div className="h-full flex flex-col items-center justify-center px-6 relative">
            {/* Subtle background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Icon with glow effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-40" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
              What would you like to build?
            </h1>
            <p className="text-sm text-white/50 mb-8 text-center max-w-sm leading-relaxed">
              Describe your idea and I'll generate production-ready code
            </p>

            {/* Suggestion Cards - Enhanced */}
            <div className="w-full max-w-lg grid grid-cols-2 gap-3 relative z-10">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => setInput(suggestion.text)}
                  className="group p-4 text-left rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="text-xl mb-2.5 block transform group-hover:scale-110 transition-transform duration-300">{suggestion.emoji}</span>
                  <span className="text-xs text-white/50 group-hover:text-white/70 line-clamp-2 leading-relaxed transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages - Claude style
          <div className="max-w-3xl mx-auto px-6 py-6">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  {msg.role === 'user' ? (
                    // User Message - Enhanced with avatar
                    <div className="flex justify-end gap-3 mb-6">
                      <div className="flex flex-col items-end">
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-white/30 mt-1.5 mr-1">{formatTime(msg.created_at)}</span>
                      </div>
                      <UserAvatar />
                    </div>
                  ) : (
                    // Assistant Message - Enhanced with avatar
                    <div className="flex gap-3 mb-6">
                      <AIAvatar isAnimating={idx === messages.length - 1 && isLoading} />
                      <div className="flex-1 space-y-2">
                      {/* Thinking section if we have thinking content */}
                      {idx === messages.length - 1 && thinkingContent && (
                        <ThinkingSection content={thinkingContent} defaultExpanded={false} />
                      )}

                      {/* Todos if present */}
                      {idx === messages.length - 1 && todos.length > 0 && (
                        <TodoList items={todos} />
                      )}

                      {/* Tool operations */}
                      {idx === messages.length - 1 && toolOperations.length > 0 && (
                        <div className="space-y-0.5 py-2 px-3 rounded-lg bg-slate-800/50 border border-white/[0.05]">
                          {toolOperations.slice(-10).map((op) => (
                            <ToolBadge
                              key={op.id}
                              type={op.type}
                              target={op.target}
                              status={op.status}
                            />
                          ))}
                        </div>
                      )}

                      {/* Message Content */}
                      {msg.content && (
                        <div className="group">
                          <MessageContent content={msg.content} />

                          {/* Copy button */}
                          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            {idx === messages.length - 1 && (
                              <button
                                onClick={handleRetry}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all duration-200",
                                  lastFailedMessage
                                    ? "text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                                    : "text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10"
                                )}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                        {/* Timestamp */}
                        <span className="text-[10px] text-white/30 mt-1">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading State - Enhanced with avatar */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mb-6"
              >
                <AIAvatar isAnimating={true} />
                <div className="flex-1 space-y-2">
                {/* Thinking indicator */}
                {currentPhase && (
                  <ThinkingSection content={thinkingContent || currentPhase} defaultExpanded={true} />
                )}

                {/* Todos during loading */}
                {todos.length > 0 && (
                  <TodoList items={todos} />
                )}

                {/* Tool operations during loading */}
                {toolOperations.length > 0 && (
                  <div className="space-y-0.5 py-2 px-3 rounded-lg bg-slate-800/50 border border-white/[0.05]">
                    {toolOperations.slice(-10).map((op) => (
                      <ToolBadge
                        key={op.id}
                        type={op.type}
                        target={op.target}
                        status={op.status}
                      />
                    ))}
                  </div>
                )}

                {/* Processing dots */}
                <ProcessingIndicator phase={currentPhase} elapsedTime={elapsedTime} />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 z-10"
          >
            <ArrowDownCircle className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area - Enhanced glass-morphism style */}
      <div className="border-t border-emerald-500/10 bg-gradient-to-t from-slate-900/80 to-transparent backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className={cn(
            "relative rounded-2xl border transition-all duration-300 shadow-lg",
            input.trim()
              ? "border-emerald-500/30 bg-slate-800/50 shadow-emerald-500/10"
              : "border-white/[0.08] bg-slate-800/30"
          )}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to build..."
              rows={1}
              className="w-full px-4 py-4 pr-28 resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none leading-relaxed"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
              <button
                className="p-2 rounded-xl text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-xl text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                title="Commands"
              >
                <Slash className="h-4 w-4" />
              </button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl transition-all duration-300",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/30"
                    : "bg-white/[0.06] text-white/20 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/50 font-mono border border-white/[0.08]">Enter</kbd>
              <span>to send</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/50 font-mono border border-white/[0.08]">Shift+Enter</kbd>
              <span>for new line</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
