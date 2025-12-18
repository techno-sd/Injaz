'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Circle,
  ChevronDown,
  ChevronRight,
  Zap,
  Layout,
  Palette,
  Box,
  Settings,
  FileCheck,
  FolderOpen,
} from 'lucide-react'
import type { Message, File, PlatformType } from '@/types'
import { cn } from '@/lib/utils'
import { getSuggestionsForPlatform } from '@/lib/ai-suggestions'

// Activity step type for Bolt-style activity log
type ActivityStep = {
  id: string
  label: string
  status: 'pending' | 'running' | 'complete'
  icon?: React.ReactNode
  children?: { label: string; file?: string }[]
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
          <div key={index} className="relative group rounded-lg overflow-hidden bg-[#0d0d12] border border-white/[0.06]">
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.06]">
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-wide">
                {part.language}
              </span>
              <button
                onClick={() => copyCode(part.content, index)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
              >
                {copiedBlock === index ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-[13px] leading-relaxed">
              <code className="text-white/80 font-mono">{part.content}</code>
            </pre>
          </div>
        ) : (
          <p key={index} className="text-[14px] text-white/80 leading-[1.7] whitespace-pre-wrap">
            {part.content.split('\n').map((line, i) => (
              <span key={i}>
                {line.split(/(`[^`]+`)/).map((segment, j) => (
                  segment.startsWith('`') && segment.endsWith('`') ? (
                    <code key={j} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-violet-300 text-[13px] font-mono">
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

// Progress status type
type ProgressStatus = {
  phase: 'idle' | 'planning' | 'generating' | 'complete'
  message: string
  currentFile?: string
  filesGenerated?: number
  progress?: number // 0-100 percentage
}

// Bolt-style Activity Log Component
function ActivityLog({
  steps,
  isExpanded,
  onToggle,
  progress,
}: {
  steps: ActivityStep[]
  isExpanded: boolean
  onToggle: () => void
  progress?: number
}) {
  const completedCount = steps.filter(s => s.status === 'complete').length
  const totalCount = steps.length
  const isComplete = completedCount === totalCount && totalCount > 0

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            </div>
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-white/90">
              {isComplete ? 'Generation complete' : 'Generating...'}
            </div>
            <div className="text-xs text-white/40">
              {completedCount} of {totalCount} steps complete
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {progress !== undefined && progress > 0 && !isComplete && (
            <span className="text-xs text-white/40">{Math.round(progress)}%</span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      {!isComplete && (
        <div className="h-0.5 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress || 0}%` }}
          />
        </div>
      )}

      {/* Steps list */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-1 border-t border-white/[0.06]">
          {steps.map((step) => (
            <div key={step.id} className="py-1.5">
              <div className="flex items-center gap-2.5">
                {/* Status icon */}
                {step.status === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : step.status === 'running' ? (
                  <Loader2 className="h-4 w-4 text-violet-400 animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-white/20 flex-shrink-0" />
                )}
                {/* Step icon */}
                <span className="text-white/40">{step.icon}</span>
                {/* Label */}
                <span
                  className={cn(
                    'text-sm',
                    step.status === 'complete'
                      ? 'text-white/60'
                      : step.status === 'running'
                      ? 'text-white/90'
                      : 'text-white/40'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Children (files) */}
              {step.children && step.children.length > 0 && step.status !== 'pending' && (
                <div className="ml-6 mt-1.5 space-y-1">
                  {step.children.map((child, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/40">
                      <FileCode className="h-3 w-3" />
                      <span className="font-mono">{child.file || child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [progress, setProgress] = useState<ProgressStatus>({ phase: 'idle', message: '' })
  const [activitySteps, setActivitySteps] = useState<ActivityStep[]>([])
  const [isActivityExpanded, setIsActivityExpanded] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generatedFilesRef = useRef<string[]>([])
  const filesRef = useRef<File[]>(files)
  const activityStepsRef = useRef<ActivityStep[]>([])
  const { toast } = useToast()

  // Helper to update activity steps
  const updateActivityStep = (
    stepId: string,
    label: string,
    status: 'pending' | 'running' | 'complete',
    icon?: React.ReactNode,
    children?: { label: string; file?: string }[]
  ) => {
    setActivitySteps(prev => {
      const existing = prev.find(s => s.id === stepId)
      if (existing) {
        return prev.map(s =>
          s.id === stepId
            ? { ...s, label, status, icon: icon || s.icon, children: children || s.children }
            : s
        )
      } else {
        return [...prev, { id: stepId, label, status, icon, children }]
      }
    })
  }

  // Helper to add file to a step's children
  const addFileToStep = (stepId: string, file: string) => {
    setActivitySteps(prev =>
      prev.map(s =>
        s.id === stepId
          ? { ...s, children: [...(s.children || []), { label: file, file }] }
          : s
      )
    )
  }

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
    setProgress({ phase: 'planning', message: 'Analyzing request...' })
    // Reset activity steps for new request
    setActivitySteps([])
    setIsActivityExpanded(true)

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

                if (data.type === 'mode') {
                  // Initial mode info from API
                  setProgress({
                    phase: 'planning',
                    message: `Starting ${data.mode || 'dual'} mode...`,
                  })
                } else if (data.type === 'context') {
                  // Context info from legacy mode
                  setProgress({
                    phase: 'planning',
                    message: `Processing ${data.filesIncluded || 0} files...`,
                  })
                } else if (data.type === 'planning') {
                  // Update progress with planning status
                  setProgress({
                    phase: 'planning',
                    message: data.message || 'Planning application structure...',
                  })

                  // Handle subtask-based activity updates
                  if (data.subtask && data.status) {
                    const subtaskIcons: Record<string, React.ReactNode> = {
                      requirements: <Zap className="h-3.5 w-3.5" />,
                      platform: <Settings className="h-3.5 w-3.5" />,
                      structure: <Layout className="h-3.5 w-3.5" />,
                      design: <Palette className="h-3.5 w-3.5" />,
                      components: <Box className="h-3.5 w-3.5" />,
                      features: <Settings className="h-3.5 w-3.5" />,
                      validation: <FileCheck className="h-3.5 w-3.5" />,
                    }
                    updateActivityStep(
                      `planning-${data.subtask}`,
                      data.message,
                      data.status,
                      subtaskIcons[data.subtask]
                    )
                  }
                } else if (data.type === 'generating') {
                  // Update progress with generating status
                  const isFileName = data.file && (data.file.includes('.') || data.file.includes('/'))
                  setProgress({
                    phase: 'generating',
                    message: isFileName ? 'Generating files...' : (data.file || data.message || 'Generating code...'),
                    currentFile: isFileName ? data.file : (data.path || undefined),
                    filesGenerated: generatedFilesRef.current.length,
                    progress: data.progress,
                  })

                  // Handle subtask-based activity updates for codegen
                  if (data.subtask && data.status) {
                    const subtaskIcons: Record<string, React.ReactNode> = {
                      init: <Zap className="h-3.5 w-3.5" />,
                      codegen: <FileCode className="h-3.5 w-3.5" />,
                      file: <FileCode className="h-3.5 w-3.5" />,
                      validate: <FileCheck className="h-3.5 w-3.5" />,
                      write: <FolderOpen className="h-3.5 w-3.5" />,
                    }
                    updateActivityStep(
                      `codegen-${data.subtask}`,
                      data.message,
                      data.status,
                      subtaskIcons[data.subtask]
                    )
                    // If this is a file subtask with a file path, add it as a child
                    if (data.subtask === 'file' && data.file) {
                      addFileToStep('codegen-file', data.file)
                    }
                  }
                } else if (data.type === 'schema') {
                  // Schema created
                  setProgress({
                    phase: 'generating',
                    message: 'Schema ready. Generating files...',
                  })
                  updateActivityStep(
                    'schema-ready',
                    'Schema generated',
                    'complete',
                    <FileCheck className="h-3.5 w-3.5" />
                  )
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

                  // Update progress with file count
                  if (newFileNames.length > 0) {
                    setProgress({
                      phase: 'generating',
                      message: `Generated ${generatedFilesRef.current.length} file${generatedFilesRef.current.length > 1 ? 's' : ''}...`,
                      currentFile: newFileNames[newFileNames.length - 1],
                      filesGenerated: generatedFilesRef.current.length,
                    })
                  }
                } else if (data.type === 'complete' || data.type === 'done') {
                  // Mark as complete
                  setProgress({ phase: 'complete', message: 'Complete!' })
                } else if (data.type === 'error') {
                  throw new Error(data.error || data.message || 'Generation failed')
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
          description: `${generatedFilesRef.current.length} file(s) created`,
        })
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      })
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'assistant' || m.content),
        {
          id: crypto.randomUUID(),
          project_id: projectId,
          role: 'assistant',
          content: `I encountered an error: ${error.message}. Please try again.`,
          created_at: new Date().toISOString(),
        }
      ])
    } finally {
      setIsLoading(false)
      setProgress({ phase: 'idle', message: '' })
      // Keep activity steps visible for completed state
      // They will be reset on next sendMessage call
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/25">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              What would you like to build?
            </h1>
            <p className="text-sm text-white/40 mb-10 text-center max-w-[300px]">
              Describe your idea in detail and I'll generate production-ready code
            </p>

            {/* Suggestion Cards */}
            <div className="w-full max-w-md grid grid-cols-2 gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => setInput(suggestion.text)}
                  className="p-4 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <span className="text-xl mb-2 block group-hover:scale-110 transition-transform origin-left">
                    {suggestion.emoji}
                  </span>
                  <span className="text-xs text-white/60 group-hover:text-white/80 line-clamp-2 leading-relaxed">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={cn(
                  "animate-in fade-in-0 slide-in-from-bottom-3 duration-500",
                  msg.role === 'user' ? 'pl-12' : 'pr-4'
                )}
              >
                {msg.role === 'user' ? (
                  // User Message
                  <div className="flex items-start gap-4 justify-end">
                    <div className="flex-1 max-w-[85%]">
                      <p className="text-[14px] text-white/90 leading-[1.7] whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  // Assistant Message
                  <div className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      {msg.content ? (
                        <>
                          <MessageContent content={msg.content} />

                          {/* Generated Files */}
                          {idx === messages.length - 1 && generatedFiles.length > 0 && (
                            <div className="p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                  <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <span className="text-sm font-medium text-emerald-400">
                                  {generatedFiles.length} file{generatedFiles.length > 1 ? 's' : ''} created
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {generatedFiles.slice(0, 10).map((file, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] text-white/60 font-mono"
                                  >
                                    {file.split('/').pop()}
                                  </span>
                                ))}
                                {generatedFiles.length > 10 && (
                                  <span className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] text-white/40">
                                    +{generatedFiles.length - 10} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
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
                                className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                                title="Regenerate response"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        // Bolt-style Activity Log
                        activitySteps.length > 0 ? (
                          <ActivityLog
                            steps={activitySteps}
                            isExpanded={isActivityExpanded}
                            onToggle={() => setIsActivityExpanded(!isActivityExpanded)}
                            progress={progress.progress}
                          />
                        ) : (
                          // Fallback progress indicator
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse [animation-delay:150ms]" />
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse [animation-delay:300ms]" />
                            </div>
                            <span className="text-sm text-white/50">
                              {progress.message || 'Thinking...'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 pr-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {activitySteps.length > 0 ? (
                    <ActivityLog
                      steps={activitySteps}
                      isExpanded={isActivityExpanded}
                      onToggle={() => setIsActivityExpanded(!isActivityExpanded)}
                      progress={progress.progress}
                    />
                  ) : (
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse [animation-delay:300ms]" />
                      </div>
                      <span className="text-sm text-white/50">
                        {progress.message || 'Thinking...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-[#09090b] p-4">
        <div className="max-w-3xl mx-auto">
          <div className={cn(
            "relative rounded-2xl border transition-all duration-200",
            input.trim()
              ? "border-violet-500/50 bg-violet-500/[0.02]"
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
                className="p-2 rounded-xl text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-200",
                  input.trim() && !isLoading
                    ? "bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/25"
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
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}
