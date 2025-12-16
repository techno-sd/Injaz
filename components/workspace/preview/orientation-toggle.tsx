// Orientation Toggle - Portrait/Landscape toggle for device preview
'use client'

import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePreviewDevice } from './use-preview-device'

// =============================================================================
// ORIENTATION TOGGLE
// =============================================================================

interface OrientationToggleProps {
  className?: string
  showLabel?: boolean
}

export function OrientationToggle({ className, showLabel = false }: OrientationToggleProps) {
  const { orientation, toggleOrientation, mode } = usePreviewDevice()

  // Only show for mobile and tablet modes
  if (mode === 'desktop' || mode === 'custom') {
    return null
  }

  const isPortrait = orientation === 'portrait'

  return (
    <button
      onClick={toggleOrientation}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm',
        'bg-muted/50 hover:bg-muted border border-border/50',
        'transition-all duration-200',
        className
      )}
      title={`Switch to ${isPortrait ? 'landscape' : 'portrait'}`}
    >
      <div className="relative w-5 h-5">
        {/* Device outline */}
        <div
          className={cn(
            'absolute inset-0 border-2 border-current rounded transition-all duration-300',
            isPortrait
              ? 'w-3.5 h-5 top-0 left-1/2 -translate-x-1/2'
              : 'w-5 h-3.5 top-1/2 left-0 -translate-y-1/2'
          )}
        />
        {/* Rotation indicator */}
        <RotateCcw
          className={cn(
            'w-3 h-3 absolute transition-transform duration-300',
            isPortrait
              ? 'bottom-0 right-0 rotate-0'
              : 'bottom-0 right-0 -rotate-90'
          )}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium capitalize">{orientation}</span>
      )}
    </button>
  )
}

// =============================================================================
// ORIENTATION SWITCH (Alternative UI)
// =============================================================================

interface OrientationSwitchProps {
  className?: string
}

export function OrientationSwitch({ className }: OrientationSwitchProps) {
  const { orientation, setOrientation, mode } = usePreviewDevice()

  // Only show for mobile and tablet modes
  if (mode === 'desktop' || mode === 'custom') {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center p-0.5 rounded-lg bg-muted/50 border border-border/50',
        className
      )}
    >
      {/* Portrait */}
      <button
        onClick={() => setOrientation('portrait')}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md transition-all',
          orientation === 'portrait'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Portrait"
      >
        <div className="w-3 h-4 border-2 border-current rounded" />
      </button>

      {/* Landscape */}
      <button
        onClick={() => setOrientation('landscape')}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md transition-all',
          orientation === 'landscape'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Landscape"
      >
        <div className="w-4 h-3 border-2 border-current rounded" />
      </button>
    </div>
  )
}

// =============================================================================
// ORIENTATION ICON (Read-only display)
// =============================================================================

interface OrientationIconProps {
  orientation: 'portrait' | 'landscape'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function OrientationIcon({
  orientation,
  className,
  size = 'md',
}: OrientationIconProps) {
  const sizes = {
    sm: { container: 'w-3 h-3', device: orientation === 'portrait' ? 'w-2 h-3' : 'w-3 h-2' },
    md: { container: 'w-4 h-4', device: orientation === 'portrait' ? 'w-2.5 h-4' : 'w-4 h-2.5' },
    lg: { container: 'w-5 h-5', device: orientation === 'portrait' ? 'w-3 h-5' : 'w-5 h-3' },
  }

  return (
    <div className={cn('relative', sizes[size].container, className)}>
      <div
        className={cn(
          'absolute border-2 border-current rounded transition-all',
          sizes[size].device,
          orientation === 'portrait'
            ? 'top-0 left-1/2 -translate-x-1/2'
            : 'top-1/2 left-0 -translate-y-1/2'
        )}
      />
    </div>
  )
}

export default OrientationToggle
