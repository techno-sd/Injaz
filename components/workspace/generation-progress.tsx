'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Cpu,
  Code2,
  FileCode,
  ChevronDown,
  ChevronRight,
  Clock,
  Braces,
  FolderTree,
  Rocket,
  AlertCircle,
  Terminal,
  Wand2,
  Layers,
  FileText,
  Check,
  Loader2,
  Eye,
  Copy,
  Zap,
  Database,
  Layout,
  Palette,
  Server,
  Shield,
} from 'lucide-react'

// Types
export type AIStage = 'idle' | 'analyzing' | 'planning' | 'schema' | 'generating' | 'writing' | 'compiling' | 'complete' | 'error'

export interface SubStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed'
  detail?: string
}

export interface StageInfo {
  id: AIStage
  label: string
  description: string
  icon: typeof Cpu
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
  subSteps?: SubStep[]
}

export interface ActivityLogItem {
  id: string
  type: 'stage' | 'file' | 'info' | 'success' | 'error' | 'substep'
  message: string
  timestamp: number
  icon?: typeof Cpu
  color?: string
}

export interface GenerationState {
  stage: AIStage
  message: string
  currentFile?: string
  progress?: number
  total?: number
  startTime?: number
  completedStages: AIStage[]
  error?: string
  activityLog: ActivityLogItem[]
  subSteps?: SubStep[]
  codePreview?: { filename: string; content: string; language: string }
}

// Stage configurations with enhanced visuals
export const STAGES: StageInfo[] = [
  {
    id: 'analyzing',
    label: 'Analyzing',
    description: 'Understanding your requirements',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20'
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Designing architecture',
    icon: Braces,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/20'
  },
  {
    id: 'schema',
    label: 'Structuring',
    description: 'Building app structure',
    icon: FolderTree,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20'
  },
  {
    id: 'generating',
    label: 'Generating',
    description: 'Writing code',
    icon: Code2,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/20'
  },
  {
    id: 'compiling',
    label: 'Compiling',
    description: 'Building your app',
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20'
  },
  {
    id: 'complete',
    label: 'Complete',
    description: 'Your app is ready!',
    icon: Rocket,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20'
  },
]

// Animated typing text component
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)
    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  )
}

// Shimmer loading effect
function ShimmerLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-full bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] animate-shimmer"
      style={{ width, backgroundSize: '200% 100%' }}
    />
  )
}

// Enhanced Progress Circle with gradient animation
function ProgressCircle({ progress, size = 44, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
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
          className="text-white/[0.06]"
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
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-white/80 tabular-nums">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

// Sub-step item component
function SubStepItem({ step, isLast }: { step: SubStep; isLast: boolean }) {
  const getIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
      case 'active':
        return <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
      default:
        return <Circle className="h-3.5 w-3.5 text-white/20" />
    }
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex flex-col items-center">
        {getIcon()}
        {!isLast && (
          <div className={cn(
            'w-px h-4 mt-1',
            step.status === 'completed' ? 'bg-emerald-500/50' : 'bg-white/[0.08]'
          )} />
        )}
      </div>
      <div className="flex-1 -mt-0.5">
        <span className={cn(
          'text-xs',
          step.status === 'completed' ? 'text-white/60' :
          step.status === 'active' ? 'text-white/90' :
          'text-white/40'
        )}>
          {step.label}
        </span>
        {step.detail && step.status === 'active' && (
          <p className="text-[10px] text-white/40 mt-0.5">{step.detail}</p>
        )}
      </div>
    </div>
  )
}

// Code preview panel
function CodePreview({ filename, content, language }: { filename: string; content: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const lines = content.split('\n').slice(0, 8)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs text-white/60 font-mono">{filename}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/[0.06] transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 text-white/40" />
            )}
          </button>
        </div>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="text-[11px] font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 text-white/20 select-none">{i + 1}</span>
              <span className="text-white/70">{line}</span>
            </div>
          ))}
          {content.split('\n').length > 8 && (
            <div className="flex">
              <span className="w-6 text-white/20 select-none">...</span>
              <span className="text-white/40 italic">+{content.split('\n').length - 8} more lines</span>
            </div>
          )}
        </pre>
      </div>
    </div>
  )
}

// Stage progress indicator
function StageProgress({ stage, completedStages }: { stage: AIStage; completedStages: AIStage[] }) {
  const stageOrder: AIStage[] = ['analyzing', 'planning', 'schema', 'generating', 'complete']

  return (
    <div className="flex items-center gap-1">
      {stageOrder.map((s, index) => {
        const stageInfo = STAGES.find(st => st.id === s)
        if (!stageInfo) return null

        const isCompleted = completedStages.includes(s)
        const isCurrent = stage === s
        const isPending = !isCompleted && !isCurrent

        return (
          <div key={s} className="flex items-center">
            <div className={cn(
              'h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-300',
              isCompleted ? 'bg-emerald-500/20' :
              isCurrent ? cn(stageInfo.bgColor, 'ring-1', stageInfo.borderColor) :
              'bg-white/[0.03]'
            )}>
              {isCompleted ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : isCurrent ? (
                <stageInfo.icon className={cn('h-3.5 w-3.5', stageInfo.color, 'animate-pulse')} />
              ) : (
                <stageInfo.icon className="h-3.5 w-3.5 text-white/20" />
              )}
            </div>
            {index < stageOrder.length - 1 && (
              <div className={cn(
                'w-4 h-px mx-0.5',
                isCompleted ? 'bg-emerald-500/50' : 'bg-white/[0.08]'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Main enhanced progress card component
export function GenerationProgress({
  generationState,
  elapsedTime,
  generatedFiles,
  formatTime,
  onCancel,
}: {
  generationState: GenerationState
  elapsedTime: number
  generatedFiles: string[]
  formatTime: (seconds: number) => string
  onCancel?: () => void
}) {
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const [showCodePreview, setShowCodePreview] = useState(true)
  const currentStageInfo = STAGES.find(s => s.id === generationState.stage) || STAGES[0]
  const isComplete = generationState.stage === 'complete'
  const isError = generationState.stage === 'error'
  const isActive = !isComplete && !isError && generationState.stage !== 'idle'

  // Calculate overall progress
  const stageOrder: AIStage[] = ['analyzing', 'planning', 'schema', 'generating', 'complete']
  const currentIndex = stageOrder.indexOf(generationState.stage)
  const baseProgress = (currentIndex / (stageOrder.length - 1)) * 100
  const fileProgress = generationState.total && generationState.progress
    ? (generationState.progress / generationState.total) * (100 / stageOrder.length)
    : 0
  const overallProgress = isComplete ? 100 : isError ? 0 : Math.min(99, baseProgress + fileProgress)

  return (
    <div className="w-full animate-fade-in-up">
      <div className={cn(
        'rounded-2xl border overflow-hidden transition-all duration-500',
        isComplete ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.05] to-transparent shadow-lg shadow-emerald-500/10' :
        isError ? 'border-red-500/30 bg-gradient-to-b from-red-500/[0.05] to-transparent shadow-lg shadow-red-500/10' :
        'border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent'
      )}>
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300',
                isComplete ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20' :
                isError ? 'bg-red-500/20 shadow-lg shadow-red-500/20' :
                cn(currentStageInfo.bgColor, 'shadow-lg', currentStageInfo.glowColor)
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : isError ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <currentStageInfo.icon className={cn('h-5 w-5', currentStageInfo.color, isActive && 'animate-pulse')} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-semibold',
                    isComplete ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-white'
                  )}>
                    {isComplete ? 'Generation Complete!' : isError ? 'Generation Failed' : currentStageInfo.label}
                  </span>
                  {isActive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-0.5 max-w-[250px] truncate">
                  {isActive ? (
                    <TypewriterText text={generationState.message} speed={20} />
                  ) : (
                    generationState.message
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-white/40 bg-white/[0.03] px-2 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5" />
                <span className="tabular-nums font-medium">{formatTime(elapsedTime)}</span>
              </div>
              {isActive && <ProgressCircle progress={overallProgress} />}
            </div>
          </div>

          {/* Stage Progress Indicator */}
          {!isComplete && !isError && (
            <StageProgress stage={generationState.stage} completedStages={generationState.completedStages} />
          )}
        </div>

        {/* Sub-steps (when available) */}
        {generationState.subSteps && generationState.subSteps.length > 0 && isActive && (
          <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="space-y-0">
              {generationState.subSteps.map((step, index) => (
                <SubStepItem
                  key={step.id}
                  step={step}
                  isLast={index === generationState.subSteps!.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current File Being Generated */}
        {generationState.currentFile && isActive && (
          <div className="px-4 py-2.5 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/[0.03] to-transparent">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <code className="text-xs text-cyan-400/90 font-mono truncate flex-1">
                {generationState.currentFile}
              </code>
              {generationState.progress !== undefined && generationState.total !== undefined && (
                <span className="text-[10px] text-white/40 tabular-nums bg-white/[0.04] px-1.5 py-0.5 rounded">
                  {generationState.progress}/{generationState.total}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Code Preview */}
        {generationState.codePreview && showCodePreview && isActive && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <button
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="flex items-center gap-2 mb-2 text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </button>
            <CodePreview {...generationState.codePreview} />
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
                <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-white/70 font-medium">Generated Files</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-400 tabular-nums font-medium">
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
                <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
                  {generatedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs group animate-fade-in px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                      <FileText className="h-3 w-3 text-white/30 flex-shrink-0" />
                      <span className="text-white/60 group-hover:text-white/80 truncate transition-colors font-mono text-[11px]">
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
                <span className="text-[10px] text-white/30">({generationState.activityLog.length})</span>
              </div>
              {showActivityLog ? (
                <ChevronDown className="h-3.5 w-3.5 text-white/40" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              )}
            </button>
            {showActivityLog && (
              <div className="px-4 pb-3">
                <div className="space-y-1 max-h-48 overflow-y-auto font-mono">
                  {generationState.activityLog.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-[11px] py-1 px-2 rounded hover:bg-white/[0.02]"
                    >
                      <span className="text-white/25 tabular-nums flex-shrink-0 w-14">
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
                        item.type === 'substep' ? 'text-violet-400/80' :
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

        {/* Success Footer */}
        {isComplete && (
          <div className="px-4 py-3 bg-emerald-500/[0.03] border-t border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Your app is ready to preview!
                </span>
              </div>
              <span className="text-[10px] text-white/40">
                {generatedFiles.length} files generated in {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        )}

        {/* Error Footer */}
        {isError && (
          <div className="px-4 py-3 bg-red-500/[0.03] border-t border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-400">
                {generationState.error || 'An error occurred during generation'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Thinking Indicator
export function ThinkingIndicator({ message, stage }: { message: string; stage?: AIStage }) {
  const stageInfo = stage ? STAGES.find(s => s.id === stage) : null
  const IconComponent = stageInfo?.icon || Wand2
  const iconColor = stageInfo?.color || 'text-violet-400'

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={cn(
          'h-9 w-9 rounded-xl flex items-center justify-center ring-1 ring-white/[0.08]',
          stageInfo?.bgColor || 'bg-gradient-to-br from-violet-500/20 to-cyan-500/20'
        )}>
          <IconComponent className={cn('h-4 w-4', iconColor)} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              stageInfo?.color?.replace('text-', 'bg-') || 'bg-violet-400'
            )}></span>
            <span className={cn(
              'relative inline-flex rounded-full h-2.5 w-2.5',
              stageInfo?.color?.replace('text-', 'bg-') || 'bg-violet-500'
            )}></span>
          </span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-white/70">
          <TypewriterText text={message} speed={25} />
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Add shimmer animation to globals.css - export for reference
export const shimmerCSS = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
`
