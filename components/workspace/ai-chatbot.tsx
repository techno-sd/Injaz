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
  CheckCircle2,
  Zap,
  Layout,
  Palette,
  Box,
  Settings,
  FileCheck,
  FolderOpen,
  Code2,
  Layers,
  Cpu,
  PenTool,
  GitBranch,
  Package,
  FileText,
} from 'lucide-react'
import type { Message, File, PlatformType } from '@/types'
import { cn } from '@/lib/utils'
import { getSuggestionsForPlatform } from '@/lib/ai-suggestions'

// Activity item type for Lovable-style activity feed
type ActivityItem = {
  id: string
  type: 'planning' | 'generating' | 'file' | 'complete' | 'thinking'
  message: string
  icon?: React.ReactNode
  file?: string
  status: 'running' | 'complete'
  timestamp: number
}

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

// Lovable-style Activity Item Component
function ActivityItemComponent({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const getIcon = () => {
    if (item.icon) return item.icon
    switch (item.type) {
      case 'thinking':
        return <Cpu className="h-3.5 w-3.5" />
      case 'planning':
        return <Layout className="h-3.5 w-3.5" />
      case 'generating':
        return <Code2 className="h-3.5 w-3.5" />
      case 'file':
        return <FileCode className="h-3.5 w-3.5" />
      case 'complete':
        return <CheckCircle2 className="h-3.5 w-3.5" />
      default:
        return <Zap className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="relative flex items-start gap-3 py-1.5 animate-in fade-in-0 slide-in-from-left-2 duration-300">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-7 w-[2px] h-[calc(100%-4px)] bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {/* Icon */}
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
        item.status === 'complete'
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-violet-500/20 text-violet-400"
      )}>
        {item.status === 'running' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : item.status === 'complete' ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          getIcon()
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={cn(
          "text-sm transition-colors duration-300",
          item.status === 'complete' ? "text-white/60" : "text-white/80"
        )}>
          {item.message}
        </p>
        {item.file && (
          <div className="flex items-center gap-1.5 mt-1">
            <FileCode className="h-3 w-3 text-violet-400" />
            <span className="text-xs font-mono text-violet-400/80">{item.file}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Lovable-style Activity Feed Component
function ActivityFeed({ items, isGenerating }: { items: ActivityItem[]; isGenerating: boolean }) {
  if (items.length === 0 && !isGenerating) return null

  const completedCount = items.filter(i => i.status === 'complete').length
  const isComplete = completedCount === items.length && items.length > 0 && !isGenerating

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
        {isComplete ? (
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white/90">
            {isComplete ? 'Generation complete' : 'Working on it...'}
          </p>
          <p className="text-xs text-white/40">
            {completedCount} of {items.length} steps
          </p>
        </div>
      </div>

      {/* Activity Items */}
      <div className="px-4 py-3 space-y-0">
        {items.map((item, index) => (
          <ActivityItemComponent
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

// Files Created Summary Component
function FilesCreatedSummary({ files }: { files: string[] }) {
  if (files.length === 0) return null

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <FolderOpen className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-400">
            {files.length} file{files.length > 1 ? 's' : ''} created
          </p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {files.slice(0, 12).map((file, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-black/20 text-white/70 font-mono border border-white/[0.04]"
            >
              <FileCode className="h-3 w-3 text-emerald-400/60" />
              {file.split('/').pop()}
            </span>
          ))}
          {files.length > 12 && (
            <span className="px-2.5 py-1 text-xs rounded-lg bg-black/20 text-white/40 border border-white/[0.04]">
              +{files.length - 12} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generatedFilesRef = useRef<string[]>([])
  const filesRef = useRef<File[]>(files)
  const { toast } = useToast()

  // Helper to add activity item
  const addActivityItem = (
    type: ActivityItem['type'],
    message: string,
    icon?: React.ReactNode,
    file?: string
  ) => {
    const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setActivityItems(prev => [...prev, {
      id,
      type,
      message,
      icon,
      file,
      status: 'running',
      timestamp: Date.now(),
    }])
    return id
  }

  // Helper to complete an activity item
  const completeActivityItem = (id: string) => {
    setActivityItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'complete' as const } : item
    ))
  }

  // Helper to complete all running items
  const completeAllItems = () => {
    setActivityItems(prev => prev.map(item => ({ ...item, status: 'complete' as const })))
  }

  useEffect(() => {
    filesRef.current = files
  }, [files])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, activityItems])

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
    setActivityItems([])
    setLastFailedMessage(null) // Clear any previous failed message

    // Add initial thinking activity
    const thinkingId = addActivityItem('thinking', 'Understanding your request...', <Cpu className="h-3.5 w-3.5" />)

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

      completeActivityItem(thinkingId)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let currentStepId: string | null = null

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

                if (data.type === 'mode') {
                  // Initial mode info
                  currentStepId = addActivityItem('planning', 'Starting generation...', <Zap className="h-3.5 w-3.5" />)
                } else if (data.type === 'planning') {
                  // Planning step
                  if (currentStepId) completeActivityItem(currentStepId)

                  const icons: Record<string, React.ReactNode> = {
                    requirements: <FileText className="h-3.5 w-3.5" />,
                    platform: <Settings className="h-3.5 w-3.5" />,
                    structure: <Layers className="h-3.5 w-3.5" />,
                    design: <Palette className="h-3.5 w-3.5" />,
                    components: <Box className="h-3.5 w-3.5" />,
                    features: <Settings className="h-3.5 w-3.5" />,
                    validation: <FileCheck className="h-3.5 w-3.5" />,
                  }

                  currentStepId = addActivityItem(
                    'planning',
                    data.message || 'Planning...',
                    icons[data.subtask] || <Layout className="h-3.5 w-3.5" />
                  )
                } else if (data.type === 'generating') {
                  // Generating step
                  if (currentStepId) completeActivityItem(currentStepId)

                  const icons: Record<string, React.ReactNode> = {
                    init: <Zap className="h-3.5 w-3.5" />,
                    codegen: <Code2 className="h-3.5 w-3.5" />,
                    file: <FileCode className="h-3.5 w-3.5" />,
                    validate: <FileCheck className="h-3.5 w-3.5" />,
                    write: <PenTool className="h-3.5 w-3.5" />,
                  }

                  const isFile = data.file && data.file.includes('.')
                  currentStepId = addActivityItem(
                    isFile ? 'file' : 'generating',
                    data.message || (isFile ? `Creating ${data.file}` : 'Generating code...'),
                    icons[data.subtask] || <Code2 className="h-3.5 w-3.5" />,
                    isFile ? data.file : undefined
                  )
                } else if (data.type === 'schema') {
                  // Schema ready
                  if (currentStepId) completeActivityItem(currentStepId)
                  currentStepId = addActivityItem('generating', 'Schema generated, creating files...', <Package className="h-3.5 w-3.5" />)
                } else if (data.type === 'content') {
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

                      // Add file creation activity
                      const fileId = addActivityItem('file', `Creating ${normalizedPath.split('/').pop()}`, <FileCode className="h-3.5 w-3.5" />, normalizedPath)
                      setTimeout(() => completeActivityItem(fileId), 200)

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
                } else if (data.type === 'complete' || data.type === 'done') {
                  if (currentStepId) completeActivityItem(currentStepId)
                  completeAllItems()
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

      // Complete all items when done
      completeAllItems()

      if (generatedFilesRef.current.length > 0) {
        toast({
          title: 'Files Generated',
          description: `${generatedFilesRef.current.length} file(s) created`,
        })
      }
    } catch (error: any) {
      console.error('Chat error:', error)

      const isRetryable = error.retryable || error.message?.includes('502') || error.message?.includes('temporarily unavailable')

      toast({
        title: isRetryable ? 'Connection Error' : 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      })

      // Store for potential retry
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
    // Clear the last failed message state
    setLastFailedMessage(null)

    // If we have a stored failed message, use that
    if (lastFailedMessage) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        project_id: projectId,
        role: 'user',
        content: lastFailedMessage,
        created_at: new Date().toISOString(),
      }
      // Remove the error message from assistant
      const cleanedMessages = messages.filter(m =>
        !(m.role === 'assistant' && m.content?.includes('connection issue'))
      )
      setMessages(cleanedMessages)
      sendMessage(userMessage, cleanedMessages)
      return
    }

    // Otherwise, retry the last user message
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
          // Empty State - Lovable style
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

            {/* Suggestion Cards - Lovable style */}
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
          // Chat Messages - Lovable style
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-400"
              >
                {msg.role === 'user' ? (
                  // User Message - clean bubble style
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
                  // Assistant Message - Lovable style
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Activity Feed - shows during/after generation */}
                      {idx === messages.length - 1 && activityItems.length > 0 && (
                        <ActivityFeed items={activityItems} isGenerating={isLoading} />
                      )}

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
              </div>
            ))}

            {/* Loading State */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-400">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <ActivityFeed items={activityItems} isGenerating={true} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Lovable style */}
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
