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
  Terminal,
  Wand2,
  Layers,
  FileText,
  Check,
  Play,
  Pause,
} from 'lucide-react'
import type { Message, File, PlatformType } from '@/types'
import { cn } from '@/lib/utils'
import { getSuggestionsForPlatform, WELCOME_MESSAGES, WELCOME_SUBTITLES } from '@/lib/ai-suggestions'

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
  borderColor: string
}

const STAGES: StageInfo[] = [
  { id: 'analyzing', label: 'Analyzing', description: 'Understanding your requirements', icon: Sparkles, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { id: 'planning', label: 'Planning', description: 'Designing architecture', icon: Braces, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { id: 'schema', label: 'Structuring', description: 'Building app structure', icon: FolderTree, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { id: 'generating', label: 'Generating', description: 'Writing code', icon: Code2, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { id: 'complete', label: 'Complete', description: 'Your app is ready!', icon: Rocket, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
]

interface ActivityLogItem {
  id: string
  type: 'stage' | 'file' | 'info' | 'success' | 'error'
  message: string
  timestamp: number
  icon?: typeof Cpu
  color?: string
}

interface GenerationState {
  stage: AIStage
  message: string
  currentFile?: string
  progress?: number
  total?: number
  startTime?: number
  completedStages: AIStage[]
  error?: string
  activityLog: ActivityLogItem[]
}

const PLATFORM_INFO: Record<PlatformType, { icon: typeof Globe; label: string; color: string }> = {
  website: { icon: Globe, label: 'Website', color: 'text-emerald-400' },
  webapp: { icon: AppWindow, label: 'Web App', color: 'text-violet-400' },
  mobile: { icon: Smartphone, label: 'Mobile', color: 'text-cyan-400' },
}

// Progress Circle Component
function ProgressCircle({ progress, size = 40, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-white/70">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

// Animated Thinking Indicator
function ThinkingIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center ring-1 ring-white/[0.08]">
          <Wand2 className="h-4 w-4 text-violet-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 animate-ping" />
        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-violet-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white/70">{message}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Inline Progress Card Component (Lovable-style)
function InlineProgressCard({
  generationState,
  elapsedTime,
  generatedFiles,
  formatTime,
}: {
  generationState: GenerationState
  elapsedTime: number
  generatedFiles: string[]
  formatTime: (seconds: number) => string
}) {
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const currentStageInfo = STAGES.find(s => s.id === generationState.stage) || STAGES[0]
  const isComplete = generationState.stage === 'complete'
  const isError = generationState.stage === 'error'

  // Calculate overall progress
  const stageOrder: AIStage[] = ['analyzing', 'planning', 'schema', 'generating', 'complete']
  const currentIndex = stageOrder.indexOf(generationState.stage)
  const overallProgress = isComplete ? 100 : isError ? 0 : Math.min(95, ((currentIndex + 1) / stageOrder.length) * 100)

  return (
    <div className="w-full animate-fade-in-up">
      <div className={cn(
        'rounded-2xl border overflow-hidden transition-all duration-300',
        isComplete ? 'border-emerald-500/30 bg-emerald-500/[0.03]' :
        isError ? 'border-red-500/30 bg-red-500/[0.03]' :
        'border-white/[0.08] bg-white/[0.02]'
      )}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center transition-all',
              isComplete ? 'bg-emerald-500/20' : isError ? 'bg-red-500/20' : currentStageInfo.bgColor
            )}>
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <currentStageInfo.icon className={cn('h-5 w-5 animate-pulse', currentStageInfo.color)} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  isComplete ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-white/90'
                )}>
                  {isComplete ? 'Generation Complete' : isError ? 'Generation Failed' : currentStageInfo.label}
                </span>
                {!isComplete && !isError && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/20 text-violet-400">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">{generationState.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" />
              <span className="tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
            {!isComplete && !isError && (
              <ProgressCircle progress={overallProgress} size={36} strokeWidth={3} />
            )}
          </div>
        </div>

        {/* Stage Pipeline */}
        {!isComplete && !isError && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1">
              {STAGES.slice(0, -1).map((stage, index) => {
                const isCompleted = generationState.completedStages.includes(stage.id)
                const isCurrent = generationState.stage === stage.id

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-500',
                      isCompleted ? 'bg-emerald-500' :
                      isCurrent ? 'bg-gradient-to-r from-violet-500 to-violet-500/50 animate-pulse' :
                      'bg-white/[0.08]'
                    )} />
                    {index < STAGES.length - 2 && (
                      <div className={cn(
                        'h-2 w-2 rounded-full mx-0.5 flex-shrink-0 transition-all',
                        isCompleted ? 'bg-emerald-500' :
                        isCurrent ? 'bg-violet-500 animate-pulse' :
                        'bg-white/[0.08]'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              {STAGES.slice(0, -1).map((stage) => {
                const isCompleted = generationState.completedStages.includes(stage.id)
                const isCurrent = generationState.stage === stage.id

                return (
                  <span
                    key={stage.id}
                    className={cn(
                      'text-[10px] transition-colors',
                      isCompleted ? 'text-emerald-400' :
                      isCurrent ? 'text-white/70' :
                      'text-white/30'
                    )}
                  >
                    {stage.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Current File Being Generated */}
        {generationState.currentFile && !isComplete && !isError && (
          <div className="px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <code className="text-xs text-cyan-400/80 font-mono truncate flex-1">
                {generationState.currentFile}
              </code>
              {generationState.progress !== undefined && generationState.total !== undefined && (
                <span className="text-[10px] text-white/40 tabular-nums">
                  {generationState.progress}/{generationState.total}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <div className="border-b border-white/[0.06]">
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-white/50" />
                <span className="text-xs text-white/70">Generated Files</span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-white/50 tabular-nums">
                  {generatedFiles.length}
                </span>
              </div>
              {showFiles ? (
                <ChevronDown className="h-3.5 w-3.5 text-white/40" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              )}
            </button>
            {showFiles && (
              <div className="px-4 pb-3">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {generatedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs group animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                      <FileText className="h-3 w-3 text-white/30 flex-shrink-0" />
                      <span className="text-white/60 group-hover:text-white/80 truncate transition-colors font-mono">
                        {file}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Log */}
        {generationState.activityLog.length > 0 && (
          <div>
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-white/50" />
                <span className="text-xs text-white/70">Activity Log</span>
              </div>
              {showActivityLog ? (
                <ChevronDown className="h-3.5 w-3.5 text-white/40" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              )}
            </button>
            {showActivityLog && (
              <div className="px-4 pb-3">
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {generationState.activityLog.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-white/30 tabular-nums flex-shrink-0 w-12">
                        {new Date(item.timestamp).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      <span className={cn(
                        'flex-1',
                        item.type === 'success' ? 'text-emerald-400' :
                        item.type === 'error' ? 'text-red-400' :
                        item.type === 'file' ? 'text-cyan-400/80' :
                        'text-white/50'
                      )}>
                        {item.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generationState, setGenerationState] = useState<GenerationState>({
    stage: 'idle',
    message: '',
    completedStages: [],
    activityLog: [],
  })
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const generatedFilesRef = useRef<string[]>([])
  const filesRef = useRef<File[]>(files)
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages, generationState, generatedFiles])

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

  const addActivityLog = useCallback((type: ActivityLogItem['type'], message: string) => {
    setGenerationState(prev => ({
      ...prev,
      activityLog: [
        ...prev.activityLog,
        {
          id: crypto.randomUUID(),
          type,
          message,
          timestamp: Date.now(),
        }
      ]
    }))
  }, [])

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
    generatedFilesRef.current = []
    let completionTriggered = false
    setElapsedTime(0)

    setGenerationState({
      stage: 'analyzing',
      message: 'Understanding your requirements...',
      completedStages: [],
      startTime: Date.now(),
      activityLog: [{
        id: crypto.randomUUID(),
        type: 'stage',
        message: 'Started analyzing request',
        timestamp: Date.now(),
      }],
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
                  addActivityLog('info', `Mode: ${data.mode} | Platform: ${data.platform}`)
                } else if (data.type === 'planning') {
                  const phase = data.phase || data.message || ''
                  if (phase.includes('analyz')) {
                    updateStage('analyzing', data.message || 'Analyzing your request...')
                    addActivityLog('stage', data.message || 'Analyzing request')
                  } else if (phase.includes('design') || phase.includes('structure')) {
                    updateStage('planning', data.message || 'Designing application architecture...')
                    addActivityLog('stage', data.message || 'Designing architecture')
                  } else if (phase.includes('controller')) {
                    updateStage('planning', 'AI Controller planning app structure...')
                    addActivityLog('stage', 'AI Controller planning structure')
                  } else if (phase.includes('transition')) {
                    updateStage('schema', 'Schema ready. Preparing code generation...')
                    addActivityLog('stage', 'Schema ready, preparing generation')
                  } else {
                    updateStage('planning', data.message || 'Planning...')
                    addActivityLog('stage', data.message || 'Planning')
                  }
                } else if (data.type === 'schema') {
                  updateStage('schema', 'Application schema created successfully')
                  addActivityLog('success', 'Schema created successfully')
                } else if (data.type === 'generating') {
                  updateStage('generating', data.file || 'Generating code files...', {
                    currentFile: data.file,
                    progress: data.progress,
                    total: data.total,
                  })
                  if (data.file) {
                    addActivityLog('info', `Generating: ${data.file}`)
                  }
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
                      updateStage('generating', `Creating ${normalizedPath}...`, { currentFile: normalizedPath })
                      addActivityLog('file', `Created: ${normalizedPath}`)

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
                        addActivityLog('info', `Deleted: ${normalizedPath}`)
                      }
                    }
                  }

                  generatedFilesRef.current = [...generatedFilesRef.current, ...newFileNames]
                  setGeneratedFiles(generatedFilesRef.current)
                  filesRef.current = updatedFiles
                  onFilesChange(updatedFiles)
                } else if (data.type === 'complete') {
                  if (!completionTriggered) {
                    completionTriggered = true
                    const fileCount = data.totalFiles || data.files?.length || generatedFilesRef.current.length
                    updateStage('complete', `Successfully generated ${fileCount} files!`, { progress: 100 })
                    addActivityLog('success', `Generation complete: ${fileCount} files created`)
                  }
                } else if (data.type === 'done') {
                  if (!completionTriggered && generatedFilesRef.current.length > 0) {
                    completionTriggered = true
                    updateStage('complete', `Successfully generated ${generatedFilesRef.current.length} files!`, { progress: 100 })
                    addActivityLog('success', `Generation complete: ${generatedFilesRef.current.length} files created`)
                  }
                } else if (data.type === 'error') {
                  const errorMsg = data.error || data.message || 'Generation failed'
                  addActivityLog('error', errorMsg)
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
        addActivityLog('success', `Generation complete: ${generatedFilesRef.current.length} files created`)
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
      addActivityLog('error', error.message || 'An error occurred')
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
  const showInlineProgress = generationState.stage !== 'idle'

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
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

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4 ring-1 ring-white/[0.08]">
              <Sparkles className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-base text-white/70 mb-2 font-medium">{WELCOME_MESSAGES[platform]}</p>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              {WELCOME_SUBTITLES[platform]}
            </p>
            <div className="w-full max-w-sm space-y-2">
              {getSuggestionsForPlatform(platform, 3).map((suggestion) => (
                <button
                  key={suggestion.id}
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
          <div className="px-4 py-4 space-y-4">
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
                      <div className="flex-1 text-sm text-white/80 leading-relaxed pt-1 min-w-0">
                        {msg.content ? (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        ) : (
                          isLoading && index === messages.length - 1 && (
                            <ThinkingIndicator message={generationState.message || 'Thinking...'} />
                          )
                        )}
                      </div>
                    </div>

                    {/* Inline Progress Card - Show during and after generation */}
                    {index === messages.length - 1 && showInlineProgress && (
                      <div className="ml-11 mt-4">
                        <InlineProgressCard
                          generationState={generationState}
                          elapsedTime={elapsedTime}
                          generatedFiles={generatedFiles}
                          formatTime={formatTime}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading state when waiting for first response */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-white/[0.08]">
                    <Bot className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <ThinkingIndicator message={generationState.message || 'Starting...'} />
                  </div>
                </div>
                {showInlineProgress && (
                  <div className="ml-11 mt-4">
                    <InlineProgressCard
                      generationState={generationState}
                      elapsedTime={elapsedTime}
                      generatedFiles={generatedFiles}
                      formatTime={formatTime}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Retry Button */}
            {generationState.stage === 'error' && (
              <div className="ml-11 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="h-8 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry Generation
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.06] bg-[#08080c] flex-shrink-0">
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
