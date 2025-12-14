'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Cpu,
  Code2,
  FileCode,
  Globe,
  AppWindow,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Braces,
  FolderTree,
  Rocket,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { Message, File, PlatformType } from '@/types'
import { cn } from '@/lib/utils'

interface AIChatbotProps {
  projectId: string
  files: File[]
  onFilesChange: (files: File[]) => void
  platform?: PlatformType
}

type AIStage = 'idle' | 'analyzing' | 'planning' | 'schema' | 'generating' | 'writing' | 'complete' | 'error'

interface StageInfo {
  id: AIStage
  label: string
  description: string
  icon: typeof Cpu
  color: string
  bgColor: string
}

const STAGES: StageInfo[] = [
  { id: 'analyzing', label: 'Understanding', description: 'Analyzing your requirements', icon: Sparkles, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { id: 'planning', label: 'Designing', description: 'Creating architecture', icon: Braces, color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  { id: 'schema', label: 'Structuring', description: 'Building app structure', icon: FolderTree, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'generating', label: 'Coding', description: 'Writing production code', icon: Code2, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'complete', label: 'Ready', description: 'Your app is ready!', icon: Rocket, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
]

interface GenerationState {
  stage: AIStage
  message: string
  currentFile?: string
  progress?: number
  total?: number
  startTime?: number
  completedStages: AIStage[]
  error?: string
}

const PLATFORM_INFO: Record<PlatformType, { icon: typeof Globe; label: string; color: string }> = {
  website: { icon: Globe, label: 'Website', color: 'text-emerald-400' },
  webapp: { icon: AppWindow, label: 'Web App', color: 'text-violet-400' },
  mobile: { icon: Smartphone, label: 'Mobile', color: 'text-cyan-400' },
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generationState, setGenerationState] = useState<GenerationState>({
    stage: 'idle',
    message: '',
    completedStages: [],
  })
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [showFilesList, setShowFilesList] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const generatedFilesRef = useRef<string[]>([])  // Sync ref for file count
  const filesRef = useRef<File[]>(files)  // Sync ref for current files
  const { toast } = useToast()

  // Keep filesRef in sync with files prop
  useEffect(() => {
    filesRef.current = files
  }, [files])

  // Elapsed time tracker
  useEffect(() => {
    if (generationState.startTime && generationState.stage !== 'idle' && generationState.stage !== 'complete' && generationState.stage !== 'error') {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - generationState.startTime!) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [generationState.startTime, generationState.stage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, generationState])

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

  const updateStage = useCallback((stage: AIStage, message: string, extras: Partial<GenerationState> = {}) => {
    setGenerationState(prev => {
      const completedStages = [...prev.completedStages]

      // Mark previous stages as completed
      const stageOrder: AIStage[] = ['analyzing', 'planning', 'schema', 'generating', 'complete']
      const currentIndex = stageOrder.indexOf(stage)
      stageOrder.slice(0, currentIndex).forEach(s => {
        if (!completedStages.includes(s)) completedStages.push(s)
      })

      return {
        ...prev,
        stage,
        message,
        completedStages,
        ...extras,
      }
    })
  }, [])

  const sendMessage = async (userMessage: Message, existingMessages: Message[]) => {
    setIsLoading(true)
    setGeneratedFiles([])
    generatedFilesRef.current = []  // Reset ref
    let completionTriggered = false  // Flag to prevent duplicate completion
    setElapsedTime(0)

    setGenerationState({
      stage: 'analyzing',
      message: 'Understanding your requirements...',
      completedStages: [],
      startTime: Date.now(),
    })

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

                // Handle different event types with detailed stage tracking
                if (data.type === 'mode') {
                  console.log('AI Mode:', data.mode, 'Platform:', data.platform)
                } else if (data.type === 'planning') {
                  const phase = data.phase || data.message || ''
                  if (phase.includes('analyz')) {
                    updateStage('analyzing', data.message || 'Analyzing your request...')
                  } else if (phase.includes('design') || phase.includes('structure')) {
                    updateStage('planning', data.message || 'Designing application architecture...')
                  } else if (phase.includes('controller')) {
                    updateStage('planning', 'AI Controller planning app structure...')
                  } else if (phase.includes('transition')) {
                    updateStage('schema', 'Schema ready. Preparing code generation...')
                  } else {
                    updateStage('planning', data.message || 'Planning...')
                  }
                } else if (data.type === 'schema') {
                  updateStage('schema', 'Application schema created successfully')
                } else if (data.type === 'generating') {
                  updateStage('generating', data.file || 'Generating code files...', {
                    currentFile: data.file,
                    progress: data.progress,
                    total: data.total,
                  })
                } else if (data.type === 'content') {
                  assistantContent += data.content
                  setMessages(prev =>
                    prev.map(m => m.id === assistantMessage.id
                      ? { ...m, content: assistantContent }
                      : m
                    )
                  )
                } else if (data.type === 'actions' && data.actions) {
                  // Use filesRef to get current files (avoids stale closure)
                  const updatedFiles = [...filesRef.current]
                  const newFileNames: string[] = []

                  // Helper to normalize paths (remove leading ./ or /)
                  const normalizePath = (p: string) => p.replace(/^\.?\//, '').trim()

                  for (const action of data.actions) {
                    if (action.type === 'create_or_update_file') {
                      const normalizedPath = normalizePath(action.path)
                      newFileNames.push(normalizedPath)
                      updateStage('generating', `Creating ${normalizedPath}...`, { currentFile: normalizedPath })

                      // Find existing file by normalized path
                      const existingIndex = updatedFiles.findIndex(f => normalizePath(f.path) === normalizedPath)
                      if (existingIndex >= 0) {
                        updatedFiles[existingIndex] = {
                          ...updatedFiles[existingIndex],
                          path: normalizedPath,
                          content: action.content,
                          updated_at: new Date().toISOString(),
                        }
                      } else {
                        // Determine language from file extension
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

                  // Update both state and ref for synchronous access
                  generatedFilesRef.current = [...generatedFilesRef.current, ...newFileNames]
                  setGeneratedFiles(generatedFilesRef.current)
                  filesRef.current = updatedFiles  // Update ref for subsequent actions
                  onFilesChange(updatedFiles)
                } else if (data.type === 'complete') {
                  if (!completionTriggered) {
                    completionTriggered = true
                    // Handle different complete event formats
                    const fileCount = data.totalFiles || data.files?.length || generatedFilesRef.current.length
                    updateStage('complete', `Successfully generated ${fileCount} files!`, { progress: 100 })
                  }
                } else if (data.type === 'done') {
                  // Stream completed - trigger completion if not already done
                  if (!completionTriggered && generatedFilesRef.current.length > 0) {
                    completionTriggered = true
                    updateStage('complete', `Successfully generated ${generatedFilesRef.current.length} files!`, { progress: 100 })
                  }
                } else if (data.type === 'error') {
                  const errorMsg = data.error || data.message || 'Generation failed'
                  console.error('Server error:', data)
                  throw new Error(errorMsg)
                }
              } catch (error) {
                if (error instanceof SyntaxError) {
                  console.error('Error parsing SSE:', error)
                } else {
                  throw error
                }
              }
            }
          }
        }
      }

      // Trigger completion if files were generated but no explicit complete event
      if (generatedFilesRef.current.length > 0 && !completionTriggered) {
        completionTriggered = true
        updateStage('complete', `Successfully generated ${generatedFilesRef.current.length} files!`, { progress: 100 })
      }

      // Show toast on completion
      if (generatedFilesRef.current.length > 0) {
        toast({
          title: 'Generation Complete',
          description: `${generatedFilesRef.current.length} file(s) created successfully`,
        })
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      setGenerationState(prev => ({
        ...prev,
        stage: 'error',
        message: error.message || 'An error occurred',
        error: error.message,
      }))
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      })
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
    await sendMessage(userMessage, messages)
  }

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        const messagesBeforeLast = messages.slice(0, messages.indexOf(lastUserMessage))
        setMessages(messagesBeforeLast)
        sendMessage(lastUserMessage, messagesBeforeLast)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const PlatformIcon = PLATFORM_INFO[platform].icon
  const isGenerating = generationState.stage !== 'idle' && generationState.stage !== 'error'

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-white/80">iEditor AI</span>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium',
            'bg-white/[0.04] border border-white/[0.08]'
          )}>
            <PlatformIcon className={cn('h-3 w-3', PLATFORM_INFO[platform].color)} />
            <span className="text-white/60">{PLATFORM_INFO[platform].label}</span>
          </div>
        </div>
        <button className="p-1 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Pipeline - Modern Stepper */}
      {isGenerating && (
        <div className="px-4 py-4 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
          {/* Timer */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs font-medium text-white/70">Generation in progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="h-3 w-3" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Stage Steps */}
          <div className="flex items-center justify-between">
            {STAGES.map((stage, index) => {
              const isCompleted = generationState.completedStages.includes(stage.id)
              const isCurrent = generationState.stage === stage.id
              const isPending = !isCompleted && !isCurrent

              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    {/* Icon */}
                    <div className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted ? 'bg-emerald-500/20' : isCurrent ? stage.bgColor : 'bg-white/[0.04]',
                      isCurrent && 'ring-2 ring-offset-2 ring-offset-[#0a0a0f] ring-violet-500/50'
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <stage.icon className={cn('h-4 w-4 animate-pulse', stage.color)} />
                      ) : (
                        <stage.icon className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                    {/* Label */}
                    <span className={cn(
                      'text-[10px] font-medium mt-1.5 transition-colors',
                      isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white/80' : 'text-white/30'
                    )}>
                      {stage.label}
                    </span>
                  </div>
                  {/* Connector Line */}
                  {index < STAGES.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mt-[-12px]">
                      <div className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isCompleted ? 'bg-emerald-500/50' : 'bg-white/[0.08]'
                      )} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Current Status Message */}
          <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
              <span className="text-xs text-white/70 flex-1 truncate">{generationState.message}</span>
              {generationState.progress !== undefined && (
                <span className="text-[10px] text-white/50 tabular-nums">{generationState.progress}%</span>
              )}
            </div>
            {generationState.progress !== undefined && (
              <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${generationState.progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {generationState.stage === 'error' && (
        <div className="px-4 py-3 border-b border-red-500/20 bg-red-500/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-400">{generationState.message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Completion State */}
      {generationState.stage === 'complete' && (
        <div className="px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{generationState.message}</span>
            </div>
            <span className="text-[10px] text-emerald-400/60">Completed in {formatTime(elapsedTime)}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4 ring-1 ring-white/[0.08]">
              <Sparkles className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-base text-white/70 mb-2 font-medium">What would you like to build?</p>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              Describe your idea and I'll design, plan, and generate the complete {PLATFORM_INFO[platform].label.toLowerCase()} for you
            </p>
            <div className="w-full max-w-sm space-y-2">
              {platform === 'mobile' ? [
                { text: 'Build a fitness tracking app with workout plans', emoji: '💪' },
                { text: 'Create a food delivery app with cart & checkout', emoji: '🍕' },
                { text: 'Design a social media app with stories & chat', emoji: '💬' },
              ] : platform === 'webapp' ? [
                { text: 'Build a SaaS landing page with pricing & features', emoji: '🚀' },
                { text: 'Create an admin dashboard with charts & tables', emoji: '📊' },
                { text: 'Design an e-commerce store with product catalog', emoji: '🛒' },
              ] : [
                { text: 'Build a modern portfolio with project showcase', emoji: '💼' },
                { text: 'Create a startup landing page with animations', emoji: '✨' },
                { text: 'Design a blog with dark mode & newsletter signup', emoji: '📝' },
              ]}
              .map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => setInput(suggestion.text)}
                  className="w-full px-4 py-3.5 text-sm text-left rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-violet-500/30 text-white/70 hover:text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform">{suggestion.emoji}</span>
                    <span>{suggestion.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-6">
            {messages.map((msg, index) => (
              <div key={msg.id} className="animate-fade-in-up">
                {msg.role === 'user' ? (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-violet-500/20 border border-violet-500/30 text-sm text-white/90">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-white/[0.08]">
                        <Bot className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="flex-1 text-sm text-white/80 leading-relaxed pt-1">
                        <p className="whitespace-pre-wrap">{msg.content || (isLoading && index === messages.length - 1 ? '' : 'Processing...')}</p>
                      </div>
                    </div>

                    {/* Generated Files List */}
                    {index === messages.length - 1 && generatedFiles.length > 0 && (
                      <div className="ml-11 mt-3">
                        <button
                          onClick={() => setShowFilesList(!showFilesList)}
                          className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors mb-2"
                        >
                          {showFilesList ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          <FileCode className="h-3.5 w-3.5" />
                          <span>Generated Files ({generatedFiles.length})</span>
                        </button>
                        {showFilesList && (
                          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] animate-fade-in">
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {generatedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs group">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                                  <span className="text-white/60 group-hover:text-white/80 truncate transition-colors">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3 animate-fade-in-up">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center ring-1 ring-white/[0.08]">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50 pt-1">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.06] bg-[#08080c]">
        <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] focus-within:border-violet-500/50 transition-colors">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] max-h-[200px] px-4 py-3 resize-none text-sm bg-transparent text-white border-0 focus:ring-0 focus:outline-none placeholder:text-white/30"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white/50">
                <Cpu className="h-3.5 w-3.5 text-violet-400" />
                <span>Planner</span>
              </div>
              <div className="h-3 w-px bg-white/[0.1]" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white/50">
                <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>CodeGen</span>
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-8 w-8 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:bg-white/[0.1] transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
