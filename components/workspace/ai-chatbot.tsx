'use client'

import { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react'
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
  AlertCircle,
  X,
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
  onCaptureErrorReady?: (captureError: (error: { message: string; stack?: string }) => void) => void
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

// Error info for Fix Issue feature
interface CapturedError {
  message: string
  stack?: string
  timestamp: number
}

// Debug step for progress UI
interface DebugStep {
  id: string
  content: string
  status: 'pending' | 'in_progress' | 'completed'
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

// Get file icon based on extension
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, { icon: string; color: string }> = {
    tsx: { icon: '⚛️', color: 'text-cyan-400' },
    ts: { icon: '📘', color: 'text-blue-400' },
    jsx: { icon: '⚛️', color: 'text-cyan-400' },
    js: { icon: '📒', color: 'text-yellow-400' },
    css: { icon: '🎨', color: 'text-pink-400' },
    json: { icon: '📋', color: 'text-amber-400' },
    html: { icon: '🌐', color: 'text-orange-400' },
    md: { icon: '📝', color: 'text-gray-400' },
  }
  return iconMap[ext || ''] || { icon: '📄', color: 'text-white/60' }
}

// Tool Badge Component (Claude-style) - Enhanced with better animations
// Using forwardRef to support AnimatePresence mode="popLayout"
const ToolBadge = forwardRef<HTMLDivElement, { type: ToolType; target: string; status: string; index?: number }>(
  function ToolBadge({ type, target, status, index = 0 }, ref) {
    const fileName = target.split('/').pop() || target
    const fullPath = target
    const fileInfo = getFileIcon(fileName)

    const typeConfig: Record<ToolType, { color: string; bgColor: string; label: string }> = {
      Read: { color: 'text-teal-400', bgColor: 'bg-teal-500/10', label: 'Read' },
      Edit: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Edit' },
      Write: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Create' },
      Glob: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', label: 'Search' },
      Grep: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', label: 'Find' },
      Bash: { color: 'text-rose-400', bgColor: 'bg-rose-500/10', label: 'Run' },
      Task: { color: 'text-violet-400', bgColor: 'bg-violet-500/10', label: 'Task' },
    }

    const config = typeConfig[type] || typeConfig.Write

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: index * 0.03, duration: 0.2, ease: 'easeOut' }}
        className={cn(
          "flex items-center gap-2.5 py-1.5 px-2 rounded-lg group transition-all duration-200",
          status === 'running' && "bg-emerald-500/5",
          status === 'complete' && "hover:bg-white/[0.02]"
        )}
      >
      {/* Status indicator */}
      <div className="relative flex items-center justify-center w-5 h-5">
        {status === 'running' ? (
          <motion.div
            className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : status === 'complete' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className="h-4 w-4 text-emerald-400" />
          </motion.div>
        ) : (
          <span className="h-4 w-4 text-red-400 text-center">✕</span>
        )}
      </div>

      {/* File icon */}
      <span className="text-sm">{fileInfo.icon}</span>

      {/* File path */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-mono text-xs truncate block transition-colors",
            status === 'running' ? "text-white/70" : "text-white/50 group-hover:text-white/70"
          )}
          title={fullPath}
        >
          {fullPath}
        </span>
      </div>

      {/* Action badge */}
      <span className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider",
        config.bgColor,
        config.color
      )}>
        {config.label}
      </span>
    </motion.div>
    )
  }
)

// File operations progress component - Enhanced Claude/Cursor style
function FileOperationsProgress({ operations, totalExpected, reviewStatus }: { operations: ToolOperation[]; totalExpected?: number; reviewStatus?: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const completed = operations.filter(op => op.status === 'complete').length
  const hasRunning = operations.some(op => op.status === 'running')
  const total = totalExpected || operations.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  if (operations.length === 0) return null

  // Determine current phase for display
  const isReviewing = reviewStatus?.includes('Reviewing') || reviewStatus?.includes('🔍') || reviewStatus?.includes('review')
  const isFixing = reviewStatus?.includes('Fixing') || reviewStatus?.includes('🔧') || reviewStatus?.includes('Auto-fixing') || reviewStatus?.includes('fixed')
  const isComplete = reviewStatus?.includes('✅') || reviewStatus?.includes('All checks') || reviewStatus?.includes('passed') || reviewStatus?.includes('complete')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-white/[0.08] shadow-xl"
    >
      {/* Header with progress */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Animated status icon */}
          <div className="relative">
            {hasRunning ? (
              <motion.div
                className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"
              >
                <Check className="h-5 w-5 text-emerald-400" />
              </motion.div>
            )}
          </div>

          {/* Title and count */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/90">
                {hasRunning ? 'Creating files' : 'Files created'}
              </span>
              <motion.span
                key={completed}
                initial={{ scale: 1.2, color: '#34d399' }}
                animate={{ scale: 1, color: 'rgba(255,255,255,0.5)' }}
                className="text-xs font-mono bg-white/[0.05] px-2 py-0.5 rounded-full"
              >
                {completed}/{total}
              </motion.span>
            </div>
            {hasRunning && operations.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-white/40 font-mono"
              >
                {operations[operations.length - 1]?.target.split('/').pop()}
              </motion.span>
            )}
          </div>
        </div>

        {/* Expand/collapse button */}
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700/50">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {hasRunning && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>

      {/* Expandable operations list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {operations.slice(-20).map((op, idx) => (
                  <ToolBadge
                    key={op.id}
                    type={op.type}
                    target={op.target}
                    status={op.status}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review status - Enhanced styling */}
      {reviewStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "flex items-center gap-2 text-xs py-2.5 px-4 border-t",
            isReviewing && "bg-blue-500/5 border-blue-500/10 text-blue-400",
            isFixing && "bg-amber-500/5 border-amber-500/10 text-amber-400",
            isComplete && "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
            !isReviewing && !isFixing && !isComplete && "bg-slate-500/5 border-slate-500/10 text-slate-400"
          )}
        >
          {(isReviewing || isFixing) && !isComplete ? (
            <motion.div
              className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : isComplete ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="h-3.5 w-3.5" />
            </motion.div>
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          <span className="font-medium">{reviewStatus}</span>
        </motion.div>
      )}
    </motion.div>
  )
}

// Thinking Section (Claude-style collapsible) - Enhanced
function ThinkingSection({ content, defaultExpanded = false }: { content: string; defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-violet-500/5 border border-violet-500/10"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.02] transition-colors"
      >
        {/* Animated brain icon */}
        <div className="relative">
          <motion.div
            className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center"
            animate={!isExpanded ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="h-4 w-4 text-violet-400" />
          </motion.div>
          {!isExpanded && (
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-400"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="font-medium text-violet-300/90">Thinking</span>
          {!isExpanded && (
            <motion.span
              className="ml-2 text-violet-400/50"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              •••
            </motion.span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-violet-400/50" />
        </motion.div>
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
            <div className="px-4 pb-4">
              <div className="pl-4 text-sm text-white/60 leading-relaxed whitespace-pre-wrap border-l-2 border-violet-500/30">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Todo List Component (Claude-style) - Enhanced with animations
function TodoList({ items, title = "Task Progress" }: { items: TodoItem[]; title?: string }) {
  const completedCount = items.filter(i => i.status === 'completed').length
  const hasRunning = items.some(i => i.status === 'in_progress')

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-white/[0.06]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {hasRunning ? (
              <motion.div
                className="w-6 h-6 rounded-md bg-teal-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="h-3.5 w-3.5 text-teal-400" />
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <span className="text-xs text-white/40 font-mono bg-white/[0.03] px-2 py-0.5 rounded-full">
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Tasks list */}
      <div className="p-2 space-y-0.5">
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center gap-2.5 py-2 px-2.5 rounded-lg transition-all duration-200",
                item.status === 'in_progress' && "bg-teal-500/5",
                item.status === 'completed' && "opacity-60"
              )}
            >
              {/* Status checkbox */}
              <div className="relative flex items-center justify-center w-5 h-5">
                {item.status === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                  </motion.div>
                ) : item.status === 'in_progress' ? (
                  <div className="relative w-5 h-5 rounded-md bg-teal-500/20 flex items-center justify-center">
                    <motion.div
                      className="w-3 h-3 border-2 border-teal-400/30 border-t-teal-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md bg-white/[0.03] border border-white/10" />
                )}
              </div>

              {/* Task content */}
              <span className={cn(
                "flex-1 text-sm",
                item.status === 'completed' && "line-through text-white/40",
                item.status === 'in_progress' && "text-white/80",
                item.status === 'pending' && "text-white/50"
              )}>
                {item.content}
              </span>

              {/* Status badge for in_progress */}
              {item.status === 'in_progress' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-medium text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded"
                >
                  Running
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Error Panel with Fix Issue button - Industry standard like Bolt.new/Cursor
function ErrorPanel({
  error,
  onFixIssue,
  onDismiss,
  isFixing,
  debugSteps,
  debugMessage,
}: {
  error: CapturedError
  onFixIssue: () => void
  onDismiss: () => void
  isFixing: boolean
  debugSteps: DebugStep[]
  debugMessage: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="rounded-xl overflow-hidden bg-gradient-to-b from-red-950/80 to-slate-900/90 border border-red-500/20 shadow-xl shadow-red-500/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-red-500/10 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-red-300">Error Detected</span>
            <p className="text-xs text-red-400/60">Click Fix Issue to let AI resolve this</p>
          </div>
        </div>
        {!isFixing && (
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/60 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      <div className="px-4 py-3">
        <pre className="text-xs text-red-300/80 font-mono whitespace-pre-wrap break-all max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
          {error.message}
        </pre>
        {error.stack && (
          <details className="mt-2">
            <summary className="text-xs text-red-400/50 cursor-pointer hover:text-red-400/70">
              Stack trace
            </summary>
            <pre className="text-[10px] text-red-300/50 font-mono whitespace-pre-wrap break-all mt-1 max-h-20 overflow-y-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      {/* Debug progress (when fixing) */}
      {isFixing && debugSteps.length > 0 && (
        <div className="px-4 py-2 border-t border-red-500/10 bg-slate-900/50">
          <div className="space-y-1.5">
            {debugSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.status === 'completed' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : step.status === 'in_progress' ? (
                  <motion.div
                    className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-white/20" />
                )}
                <span className={cn(
                  "text-xs",
                  step.status === 'completed' && "text-white/50",
                  step.status === 'in_progress' && "text-amber-300",
                  step.status === 'pending' && "text-white/30"
                )}>
                  {step.content}
                </span>
              </div>
            ))}
          </div>
          {debugMessage && (
            <p className="text-xs text-amber-400/70 mt-2">{debugMessage}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-red-500/10">
        {isFixing ? (
          <div className="flex items-center gap-2 text-amber-400">
            <motion.div
              className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-sm font-medium">AI is fixing the issue...</span>
          </div>
        ) : (
          <>
            <Button
              onClick={onFixIssue}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-lg shadow-amber-500/20"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Fix Issue
            </Button>
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="text-white/50 hover:text-white/70"
            >
              Dismiss
            </Button>
          </>
        )}
      </div>
    </motion.div>
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

export function AIChatbot({ projectId, files, onFilesChange, platform = 'webapp', initialPrompt, onCaptureErrorReady }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [finalReviewStatus, setFinalReviewStatus] = useState<string>('')
  const [thinkingContent, setThinkingContent] = useState<string>('')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [toolOperations, setToolOperations] = useState<ToolOperation[]>([])
  const [totalExpectedFiles, setTotalExpectedFiles] = useState<number>(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  // Debug/Fix Issue state
  const [capturedError, setCapturedError] = useState<CapturedError | null>(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([])
  const [debugMessage, setDebugMessage] = useState('')
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
    // Initialize todos with "Create files" task
    setTodos([{
      id: crypto.randomUUID(),
      content: '📁 Create files',
      status: 'in_progress'
    }])
    setToolOperations([])
    setTotalExpectedFiles(0)
    setCurrentPhase('Thinking')
    setFinalReviewStatus('')

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
                  } else if (phase === 'generating') {
                    setCurrentPhase('Generating code')
                  } else if (phase === 'creating') {
                    // File creation progress - just update count, don't add operations
                    // Operations are added when 'actions' event is received
                    setCurrentPhase('')

                    // Capture total expected files if provided
                    if (data.total && data.total > 0) {
                      setTotalExpectedFiles(data.total)
                    }
                  } else if (phase === 'reviewing') {
                    // Review phase - show as a distinct todo item
                    const reviewMsg = data.message || '🔍 Reviewing generated code'
                    setCurrentPhase(reviewMsg)
                    setFinalReviewStatus(reviewMsg)
                    // Mark "Create files" as complete, add review as a todo item
                    setTodos(prev => {
                      // Mark create files as complete
                      let updated = prev.map(t =>
                        (t.content.includes('Create files') || t.content.includes('📁'))
                          ? { ...t, status: 'completed' as const }
                          : t
                      )
                      // Check if review todo already exists
                      const hasReviewTodo = updated.some(t => t.content.includes('Review') || t.content.includes('🔍'))
                      if (!hasReviewTodo) {
                        updated = [...updated, {
                          id: crypto.randomUUID(),
                          content: '🔍 Review generated code',
                          status: 'in_progress'
                        }]
                      }
                      return updated
                    })
                  } else if (phase === 'fixing') {
                    // Fixing phase - mark create files and review complete, add fixing todo
                    const fixMsg = data.message || '🔧 Fixing issues'
                    setCurrentPhase(fixMsg)
                    setFinalReviewStatus(fixMsg)
                    // Mark create files and review as complete, add fixing todo
                    setTodos(prev => {
                      let updated = prev.map(t => {
                        if (t.content.includes('Create files') || t.content.includes('📁')) {
                          return { ...t, status: 'completed' as const }
                        }
                        if (t.content.includes('Review') || t.content.includes('🔍')) {
                          return { ...t, status: 'completed' as const }
                        }
                        return t
                      })
                      // Add fixing todo if not already present
                      const hasFixingTodo = updated.some(t => t.content.includes('Fix') || t.content.includes('🔧'))
                      if (!hasFixingTodo) {
                        updated = [...updated, {
                          id: crypto.randomUUID(),
                          content: '🔧 Fix detected issues',
                          status: 'in_progress'
                        }]
                      }
                      return updated
                    })
                  } else if (phase === 'template') {
                    setCurrentPhase('Using template')
                    setTodos(prev => [...prev, {
                      id: crypto.randomUUID(),
                      content: data.message || 'Applying template',
                      status: 'in_progress'
                    }])
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

                // Handle generating events (for templates and validation status only)
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
                }

                // Handle schema events
                if (data.type === 'schema') {
                  setTodos(prev => [...prev, {
                    id: crypto.randomUUID(),
                    content: 'Application schema created',
                    status: 'completed'
                  }])
                }

                // Handle progress events (validation, review, fixing)
                if (data.type === 'progress') {
                  const message = data.message || data.data?.message || ''
                  if (message) {
                    // Update phase display for review/fix messages
                    if (message.includes('Validating') || message.includes('Reviewing')) {
                      setCurrentPhase(message)
                      setFinalReviewStatus(message)
                      // Mark "Create files" complete, add review todo if not exists
                      setTodos(prev => {
                        // Mark create files as complete
                        let updated = prev.map(t =>
                          (t.content.includes('Create files') || t.content.includes('📁'))
                            ? { ...t, status: 'completed' as const }
                            : t
                        )
                        const hasReviewTodo = updated.some(t => t.content.includes('Review') || t.content.includes('🔍'))
                        if (!hasReviewTodo) {
                          updated = [...updated, {
                            id: crypto.randomUUID(),
                            content: '🔍 Review generated code',
                            status: 'in_progress'
                          }]
                        }
                        return updated
                      })
                    } else if (message.includes('AI reviewing') || message.includes('🤖')) {
                      // AI review phase with DeepSeek V3
                      setCurrentPhase(message)
                      setFinalReviewStatus(message)
                      // Mark review as complete, add AI review todo
                      setTodos(prev => {
                        let updated = prev.map(t => {
                          if (t.content.includes('Create files') || t.content.includes('📁')) {
                            return { ...t, status: 'completed' as const }
                          }
                          if (t.content.includes('Review') || t.content.includes('🔍')) {
                            return { ...t, status: 'completed' as const }
                          }
                          return t
                        })
                        const hasAIReviewTodo = updated.some(t => t.content.includes('AI') || t.content.includes('🤖'))
                        if (!hasAIReviewTodo) {
                          updated = [...updated, {
                            id: crypto.randomUUID(),
                            content: '🤖 AI fixing issues (DeepSeek V3)',
                            status: 'in_progress'
                          }]
                        }
                        return updated
                      })
                    } else if (message.includes('Fixing') || message.includes('Auto-fixing')) {
                      setCurrentPhase(message)
                      setFinalReviewStatus(message)
                      // Mark create files and review complete, add fixing todo
                      setTodos(prev => {
                        let updated = prev.map(t => {
                          if (t.content.includes('Create files') || t.content.includes('📁')) {
                            return { ...t, status: 'completed' as const }
                          }
                          if (t.content.includes('Review') || t.content.includes('🔍')) {
                            return { ...t, status: 'completed' as const }
                          }
                          return t
                        })
                        const hasFixingTodo = updated.some(t => t.content.includes('Fix') || t.content.includes('🔧'))
                        if (!hasFixingTodo) {
                          updated = [...updated, {
                            id: crypto.randomUUID(),
                            content: '🔧 Fix detected issues',
                            status: 'in_progress'
                          }]
                        }
                        return updated
                      })
                    } else if (message.includes('✅') || message.includes('Fixed') || message.includes('All checks') || message.includes('✨')) {
                      // Completion message - mark all todos complete
                      setFinalReviewStatus(message)
                      setTodos(prev => prev.map(t =>
                        (t.content.includes('Create files') || t.content.includes('📁') ||
                         t.content.includes('Review') || t.content.includes('🔍') ||
                         t.content.includes('Fix') || t.content.includes('🔧') ||
                         t.content.includes('AI') || t.content.includes('🤖'))
                          ? { ...t, status: 'completed' as const }
                          : t
                      ))
                    } else if (message.includes('Created stub:') || message.includes('Creating stub:')) {
                      // Stub creation - show as tool operation
                      const stubFile = message.replace('Creating stub: ', '').replace('✨ Created stub: ', '').replace('Created stub: ', '')
                      setToolOperations(prev => [...prev, {
                        id: crypto.randomUUID(),
                        type: 'Write',
                        target: stubFile,
                        status: 'complete'
                      }])
                      setFinalReviewStatus(message)
                    } else if (message.includes('ℹ️')) {
                      // Info message
                      setFinalReviewStatus(message)
                    }
                  }
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
                      const operationType = existingIndex >= 0 ? 'Edit' : 'Write'

                      // Update tool operation status to complete, or add new one
                      setToolOperations(prev => {
                        const existingOpIndex = prev.findIndex(op => op.target === normalizedPath)
                        if (existingOpIndex >= 0) {
                          // Update existing operation to complete
                          const updated = [...prev]
                          updated[existingOpIndex] = {
                            ...updated[existingOpIndex],
                            type: operationType,
                            status: 'complete'
                          }
                          return updated
                        }
                        // Add new completed operation
                        return [...prev, {
                          id: crypto.randomUUID(),
                          type: operationType,
                          target: normalizedPath,
                          status: 'complete'
                        }]
                      })

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
                  // Mark all todos as complete on generation done
                  setTodos(prev => {
                    let updated = [...prev]
                    // Add review todo if not already present
                    const hasReviewTodo = updated.some(t => t.content.includes('Review') || t.content.includes('🔍'))
                    if (!hasReviewTodo) {
                      updated.push({
                        id: crypto.randomUUID(),
                        content: '🔍 Review generated code',
                        status: 'completed' as const
                      })
                    }
                    // Mark all todos as complete
                    return updated.map(t => ({ ...t, status: 'completed' as const }))
                  })
                  // Set final review status with completion message
                  if (data.message) {
                    setFinalReviewStatus(data.message.includes('passed') ? '✅ ' + data.message : data.message)
                  } else {
                    setFinalReviewStatus('✅ Generation complete')
                  }
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

  // Fix Issue handler - calls the debug API to let AI fix errors
  const fixIssue = async () => {
    if (!capturedError || isDebugging) return

    setIsDebugging(true)
    setDebugSteps([
      { id: '1', content: 'Analyzing error', status: 'in_progress' },
      { id: '2', content: 'Identifying affected files', status: 'pending' },
      { id: '3', content: 'Generating fixes', status: 'pending' },
      { id: '4', content: 'Applying fixes', status: 'pending' },
    ])
    setDebugMessage('AI is analyzing the error...')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          files,
          debugMode: true,
          errorMessage: capturedError.message,
          errorStack: capturedError.stack,
        }),
      })

      if (!response.ok) {
        throw new Error(`Debug request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

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

                if (data.type === 'debug') {
                  // Update debug progress
                  const stepMessage = data.message || ''
                  setDebugMessage(stepMessage)

                  // Update step statuses based on message content
                  if (stepMessage.includes('Analyzing') || stepMessage.includes('analyzing')) {
                    setDebugSteps(prev => prev.map(s =>
                      s.id === '1' ? { ...s, status: 'in_progress' } : s
                    ))
                  } else if (stepMessage.includes('Identifying') || stepMessage.includes('file')) {
                    setDebugSteps(prev => prev.map(s =>
                      s.id === '1' ? { ...s, status: 'completed' } :
                      s.id === '2' ? { ...s, status: 'in_progress' } : s
                    ))
                  } else if (stepMessage.includes('Generating') || stepMessage.includes('fix')) {
                    setDebugSteps(prev => prev.map(s =>
                      s.id === '1' || s.id === '2' ? { ...s, status: 'completed' } :
                      s.id === '3' ? { ...s, status: 'in_progress' } : s
                    ))
                  } else if (stepMessage.includes('Applying') || stepMessage.includes('apply')) {
                    setDebugSteps(prev => prev.map(s =>
                      s.id === '1' || s.id === '2' || s.id === '3' ? { ...s, status: 'completed' } :
                      s.id === '4' ? { ...s, status: 'in_progress' } : s
                    ))
                  }
                } else if (data.type === 'actions' && data.actions) {
                  // Handle file updates from debug
                  const updatedFiles = [...filesRef.current]
                  const normalizePath = (p: string) => p.replace(/^\.?\//, '').trim()

                  for (const action of data.actions) {
                    if (action.type === 'create_or_update_file') {
                      const normalizedPath = normalizePath(action.path)
                      const existingIndex = updatedFiles.findIndex(f => normalizePath(f.path) === normalizedPath)

                      if (existingIndex >= 0) {
                        updatedFiles[existingIndex] = {
                          ...updatedFiles[existingIndex],
                          content: action.content,
                          updated_at: new Date().toISOString(),
                        }
                      } else {
                        const ext = normalizedPath.split('.').pop()?.toLowerCase() || ''
                        const langMap: Record<string, string> = {
                          html: 'html', css: 'css', js: 'javascript', jsx: 'javascript',
                          ts: 'typescript', tsx: 'typescript', json: 'json', md: 'markdown'
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
                    }
                  }

                  filesRef.current = updatedFiles
                  onFilesChange(updatedFiles)
                } else if (data.type === 'complete' || data.type === 'done') {
                  // Mark all steps complete
                  setDebugSteps(prev => prev.map(s => ({ ...s, status: 'completed' })))
                  setDebugMessage('Issue fixed successfully!')

                  // Clear error after short delay
                  setTimeout(() => {
                    setCapturedError(null)
                    setIsDebugging(false)
                    setDebugSteps([])
                    setDebugMessage('')
                  }, 1500)

                  toast({
                    title: 'Issue Fixed',
                    description: 'AI has resolved the error. Check the preview.',
                  })
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Debug failed')
                }
              } catch (parseError) {
                if (!(parseError instanceof SyntaxError)) {
                  throw parseError
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Debug error:', error)
      setDebugMessage(`Failed to fix: ${error.message}`)
      setDebugSteps(prev => prev.map(s =>
        s.status === 'in_progress' ? { ...s, status: 'pending' } : s
      ))

      toast({
        title: 'Debug Failed',
        description: error.message || 'Failed to fix the issue',
        variant: 'destructive',
      })

      // Reset debugging state after delay
      setTimeout(() => {
        setIsDebugging(false)
      }, 2000)
    }
  }

  // Expose captureError method to parent via callback
  const captureError = useCallback((error: { message: string; stack?: string }) => {
    setCapturedError({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    })
  }, [])

  // Dismiss error
  const dismissError = useCallback(() => {
    if (!isDebugging) {
      setCapturedError(null)
      setDebugSteps([])
      setDebugMessage('')
    }
  }, [isDebugging])

  // Expose captureError to parent component
  useEffect(() => {
    if (onCaptureErrorReady) {
      onCaptureErrorReady(captureError)
    }
  }, [onCaptureErrorReady, captureError])

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

                      {/* Todos if present - shows task progress (only when not loading, loading has its own) */}
                      {idx === messages.length - 1 && todos.length > 0 && !isLoading && (
                        <TodoList items={todos} title="Task Progress" />
                      )}

                      {/* Tool operations - show completed file operations with review status */}
                      {idx === messages.length - 1 && toolOperations.length > 0 && !isLoading && (
                        <FileOperationsProgress
                          operations={toolOperations}
                          totalExpected={toolOperations.length}
                          reviewStatus={finalReviewStatus}
                        />
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
                <div className="flex-1 space-y-3">
                  {/* Thinking indicator - show only initial phases before file operations */}
                  {currentPhase && toolOperations.length === 0 && (
                    <ThinkingSection content={thinkingContent || currentPhase} defaultExpanded={true} />
                  )}

                  {/* Todos during loading - shows task progress */}
                  {todos.length > 0 && (
                    <TodoList items={todos} title="Task Progress" />
                  )}

                  {/* File operations progress - Claude/Cursor style */}
                  {toolOperations.length > 0 && (
                    <FileOperationsProgress
                      operations={toolOperations}
                      totalExpected={totalExpectedFiles}
                      reviewStatus={currentPhase}
                    />
                  )}

                  {/* Processing dots with timer - only show when no file operations */}
                  {toolOperations.length === 0 && (
                    <ProcessingIndicator
                      phase={currentPhase}
                      elapsedTime={elapsedTime}
                    />
                  )}
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

      {/* Error Panel - Fix Issue feature */}
      <AnimatePresence>
        {capturedError && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto">
              <ErrorPanel
                error={capturedError}
                onFixIssue={fixIssue}
                onDismiss={dismissError}
                isFixing={isDebugging}
                debugSteps={debugSteps}
                debugMessage={debugMessage}
              />
            </div>
          </div>
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
