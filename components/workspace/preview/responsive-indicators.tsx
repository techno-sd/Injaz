// Responsive Indicators - Visual bar showing Tailwind breakpoints
'use client'

import { cn } from '@/lib/utils'
import {
  TAILWIND_BREAKPOINTS,
  getBreakpointForWidth,
  type ResponsiveBreakpoint,
} from '@/types/preview-types'
import { useViewportDimensions } from './use-preview-device'

// =============================================================================
// RESPONSIVE INDICATOR BAR
// =============================================================================

interface ResponsiveIndicatorsProps {
  className?: string
  showLabel?: boolean
  compact?: boolean
}

export function ResponsiveIndicators({
  className,
  showLabel = true,
  compact = false,
}: ResponsiveIndicatorsProps) {
  const { width } = useViewportDimensions()
  const currentBreakpoint = getBreakpointForWidth(width)

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact && 'gap-1',
        className
      )}
    >
      {/* Breakpoint Pills */}
      <div className={cn('flex items-center', compact ? 'gap-0.5' : 'gap-1')}>
        {TAILWIND_BREAKPOINTS.map((breakpoint) => (
          <BreakpointPill
            key={breakpoint.name}
            breakpoint={breakpoint}
            isActive={currentBreakpoint.name === breakpoint.name}
            compact={compact}
          />
        ))}
      </div>

      {/* Current Width Label */}
      {showLabel && (
        <div className="flex items-center gap-1.5 ml-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${currentBreakpoint.color}20`,
              color: currentBreakpoint.color,
            }}
          >
            {currentBreakpoint.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {width}px
          </span>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// BREAKPOINT PILL
// =============================================================================

interface BreakpointPillProps {
  breakpoint: ResponsiveBreakpoint
  isActive: boolean
  compact?: boolean
}

function BreakpointPill({ breakpoint, isActive, compact }: BreakpointPillProps) {
  return (
    <div
      className={cn(
        'relative rounded-full transition-all duration-200',
        compact ? 'w-2 h-2' : 'w-6 h-1.5',
        isActive ? 'scale-110' : 'opacity-50'
      )}
      style={{
        backgroundColor: isActive ? breakpoint.color : `${breakpoint.color}40`,
      }}
      title={`${breakpoint.label}: ${breakpoint.minWidth}px${
        breakpoint.maxWidth ? ` - ${breakpoint.maxWidth}px` : '+'
      }`}
    >
      {isActive && !compact && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase"
          style={{ color: breakpoint.color }}
        >
          {breakpoint.label}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// RESPONSIVE INDICATOR LINE
// =============================================================================

interface ResponsiveIndicatorLineProps {
  className?: string
  maxWidth?: number
}

export function ResponsiveIndicatorLine({
  className,
  maxWidth = 1536,
}: ResponsiveIndicatorLineProps) {
  const { width } = useViewportDimensions()
  const currentBreakpoint = getBreakpointForWidth(width)

  // Calculate position on the line
  const position = Math.min((width / maxWidth) * 100, 100)

  return (
    <div className={cn('relative h-6 w-full', className)}>
      {/* Background segments */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full overflow-hidden flex">
        {TAILWIND_BREAKPOINTS.map((bp, i) => {
          const nextBp = TAILWIND_BREAKPOINTS[i + 1]
          const start = (bp.minWidth / maxWidth) * 100
          const end = nextBp
            ? (nextBp.minWidth / maxWidth) * 100
            : 100

          return (
            <div
              key={bp.name}
              className="h-full"
              style={{
                backgroundColor: `${bp.color}30`,
                width: `${end - start}%`,
              }}
            />
          )
        })}
      </div>

      {/* Breakpoint markers */}
      {TAILWIND_BREAKPOINTS.slice(1).map((bp) => {
        const markerPosition = (bp.minWidth / maxWidth) * 100
        return (
          <div
            key={bp.name}
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-border/50"
            style={{ left: `${markerPosition}%` }}
          />
        )
      })}

      {/* Current position indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-200"
        style={{
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: currentBreakpoint.color,
        }}
      />

      {/* Labels */}
      <div className="absolute inset-x-0 -bottom-3 flex justify-between text-[8px] text-muted-foreground">
        <span>0</span>
        <span>{maxWidth}px</span>
      </div>
    </div>
  )
}

// =============================================================================
// BREAKPOINT BADGE
// =============================================================================

interface BreakpointBadgeProps {
  className?: string
}

export function BreakpointBadge({ className }: BreakpointBadgeProps) {
  const { width } = useViewportDimensions()
  const breakpoint = getBreakpointForWidth(width)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${breakpoint.color}15`,
        color: breakpoint.color,
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: breakpoint.color }}
      />
      <span className="uppercase tracking-wider">{breakpoint.label}</span>
      <span className="font-mono opacity-70">{width}px</span>
    </div>
  )
}

export default ResponsiveIndicators
