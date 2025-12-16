// Viewport Dimensions - Display current viewport size
'use client'

import { cn } from '@/lib/utils'
import { usePreviewDevice, useViewportDimensions, useCurrentBreakpoint } from './use-preview-device'
import { getBreakpointForWidth } from '@/types/preview-types'

// =============================================================================
// VIEWPORT DIMENSIONS DISPLAY
// =============================================================================

interface ViewportDimensionsProps {
  className?: string
  showBreakpoint?: boolean
  showScale?: boolean
  showPixelRatio?: boolean
}

export function ViewportDimensions({
  className,
  showBreakpoint = true,
  showScale = false,
  showPixelRatio = false,
}: ViewportDimensionsProps) {
  const { device, scale } = usePreviewDevice()
  const { width, height } = useViewportDimensions()
  const breakpoint = getBreakpointForWidth(width)

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      {/* Dimensions */}
      <span className="font-mono text-muted-foreground">
        {width} <span className="opacity-50">x</span> {height}
      </span>

      {/* Breakpoint Badge */}
      {showBreakpoint && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{
            backgroundColor: `${breakpoint.color}20`,
            color: breakpoint.color,
          }}
        >
          {breakpoint.label}
        </span>
      )}

      {/* Scale */}
      {showScale && scale !== 1 && (
        <span className="text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
      )}

      {/* Pixel Ratio */}
      {showPixelRatio && device?.pixelRatio && (
        <span className="text-muted-foreground">
          @{device.pixelRatio}x
        </span>
      )}
    </div>
  )
}

// =============================================================================
// COMPACT VIEWPORT BADGE
// =============================================================================

interface ViewportBadgeProps {
  className?: string
}

export function ViewportBadge({ className }: ViewportBadgeProps) {
  const { width, height } = useViewportDimensions()
  const breakpoint = getBreakpointForWidth(width)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
        className
      )}
      style={{
        backgroundColor: `${breakpoint.color}15`,
        color: breakpoint.color,
      }}
    >
      <span className="font-mono">{width}x{height}</span>
    </div>
  )
}

// =============================================================================
// FULL VIEWPORT INFO
// =============================================================================

interface ViewportInfoProps {
  className?: string
}

export function ViewportInfo({ className }: ViewportInfoProps) {
  const { device, mode, orientation, scale } = usePreviewDevice()
  const { width, height } = useViewportDimensions()
  const breakpoint = getBreakpointForWidth(width)

  return (
    <div className={cn('space-y-2 text-xs', className)}>
      {/* Mode & Device */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Mode</span>
        <span className="font-medium capitalize">{mode}</span>
      </div>

      {device && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Device</span>
          <span className="font-medium">{device.name}</span>
        </div>
      )}

      {/* Dimensions */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Size</span>
        <span className="font-mono">{width} x {height}</span>
      </div>

      {/* Orientation */}
      {(mode === 'mobile' || mode === 'tablet') && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Orientation</span>
          <span className="font-medium capitalize">{orientation}</span>
        </div>
      )}

      {/* Breakpoint */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Breakpoint</span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{
            backgroundColor: `${breakpoint.color}20`,
            color: breakpoint.color,
          }}
        >
          {breakpoint.label}
        </span>
      </div>

      {/* Scale */}
      {scale !== 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Scale</span>
          <span className="font-medium">{Math.round(scale * 100)}%</span>
        </div>
      )}

      {/* Pixel Ratio */}
      {device?.pixelRatio && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pixel Ratio</span>
          <span className="font-medium">@{device.pixelRatio}x</span>
        </div>
      )}
    </div>
  )
}

export default ViewportDimensions
