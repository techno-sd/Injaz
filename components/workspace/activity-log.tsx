'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Code2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Palette,
  Database,
  Layout,
  Zap,
  Package,
  FileCheck,
  FilePlus,
  FileEdit,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ActivityType =
  | 'analyzing'
  | 'planning'
  | 'designing'
  | 'generating'
  | 'validating'
  | 'creating_file'
  | 'updating_file'
  | 'deleting_file'
  | 'complete'
  | 'error'

export interface Activity {
  id: string
  type: ActivityType
  message: string
  detail?: string
  timestamp: number
  status: 'active' | 'complete' | 'error'
  file?: string
}

interface ActivityLogProps {
  activities: Activity[]
  isProcessing: boolean
  currentPhase?: string
}

const activityConfig: Record<ActivityType, {
  icon: typeof Brain
  color: string
  bgColor: string
  label: string
}> = {
  analyzing: {
    icon: Brain,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'Analyzing',
  },
  planning: {
    icon: Layers,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'Planning',
  },
  designing: {
    icon: Palette,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    label: 'Designing',
  },
  generating: {
    icon: Code2,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    label: 'Generating',
  },
  validating: {
    icon: ShieldCheck,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    label: 'Validating',
  },
  creating_file: {
    icon: FilePlus,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'Creating',
  },
  updating_file: {
    icon: FileEdit,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    label: 'Updating',
  },
  deleting_file: {
    icon: Trash2,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'Deleting',
  },
  complete: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'Complete',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'Error',
  },
}

// Current Activity Indicator (shows during processing)
function CurrentActivityIndicator({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        config.bgColor,
        'border-white/[0.08]'
      )}
    >
      <div className={cn('relative flex items-center justify-center', config.color)}>
        {/* Pulsing ring animation */}
        <motion.div
          className={cn(
            'absolute w-8 h-8 rounded-full',
            config.bgColor
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <Icon className="h-5 w-5 relative z-10" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-white/30"
          >
            ...
          </motion.span>
        </div>
        <p className="text-xs text-white/50 truncate">
          {activity.message}
        </p>
      </div>
      <Loader2 className={cn('h-4 w-4 animate-spin', config.color)} />
    </motion.div>
  )
}

// Single Activity Item
function ActivityItem({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 relative"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/[0.06]" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          config.bgColor
        )}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/70">
            {config.label}
          </span>
          {activity.status === 'complete' && (
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          )}
          {activity.status === 'error' && (
            <AlertCircle className="h-3 w-3 text-red-400" />
          )}
        </div>
        <p className="text-xs text-white/40 mt-0.5 truncate">
          {activity.message}
        </p>
        {activity.file && (
          <div className="flex items-center gap-1.5 mt-1">
            <FileCode className="h-3 w-3 text-white/30" />
            <code className="text-[10px] text-white/40 font-mono">
              {activity.file}
            </code>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Main Activity Log Component
export function ActivityLog({ activities, isProcessing, currentPhase }: ActivityLogProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentActivity = activities.find(a => a.status === 'active')
  const completedActivities = activities.filter(a => a.status !== 'active')
  const recentActivities = completedActivities.slice(-5)

  // Auto-expand when processing starts
  useEffect(() => {
    if (isProcessing && activities.length > 0) {
      setIsExpanded(true)
    }
  }, [isProcessing, activities.length])

  if (activities.length === 0 && !isProcessing) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-white/70">Activity Log</span>
          {activities.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-white/50">
              {activities.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </div>
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
            <div className="px-4 pb-4 space-y-3">
              {/* Current Activity */}
              <AnimatePresence mode="wait">
                {currentActivity && (
                  <CurrentActivityIndicator activity={currentActivity} />
                )}
              </AnimatePresence>

              {/* Activity Timeline */}
              {recentActivities.length > 0 && (
                <div className="pt-2">
                  {recentActivities.map((activity, idx) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      isLast={idx === recentActivities.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Show more button */}
              {completedActivities.length > 5 && (
                <button className="w-full text-center text-xs text-white/30 hover:text-white/50 py-2 transition-colors">
                  Show {completedActivities.length - 5} more activities
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Compact Activity Badge (shows in message area)
export function ActivityBadge({ type, message }: { type: ActivityType; message: string }) {
  const config = activityConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
        config.bgColor,
        'border border-white/[0.06]'
      )}
    >
      <Icon className={cn('h-3 w-3', config.color)} />
      <span className={cn('font-medium', config.color)}>{config.label}</span>
      {type !== 'complete' && type !== 'error' && (
        <Loader2 className={cn('h-3 w-3 animate-spin', config.color)} />
      )}
    </motion.div>
  )
}

// File Operation Badge
export function FileOperationBadge({
  operation,
  filePath
}: {
  operation: 'create' | 'update' | 'delete'
  filePath: string
}) {
  const configs = {
    create: { icon: FilePlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Created' },
    update: { icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Updated' },
    delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Deleted' },
  }

  const config = configs[operation]
  const Icon = config.icon
  const fileName = filePath.split('/').pop()

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        config.bg,
        'border border-white/[0.06]'
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
      <code className="text-xs text-white/50 font-mono">{fileName}</code>
    </motion.div>
  )
}
