'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Camera,
  Sun,
  Moon,
  Ruler,
  RotateCcw,
  Download,
  Check,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// =============================================================================
// ZOOM CONTROLS
// =============================================================================

const ZOOM_PRESETS = [
  { label: 'Fit', value: 'fit' },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
] as const

interface ZoomControlsProps {
  scale: number
  onScaleChange: (scale: number) => void
  onFitToScreen?: () => void
  className?: string
}

export function ZoomControls({ scale, onScaleChange, onFitToScreen, className }: ZoomControlsProps) {
  const handleZoomIn = () => {
    const newScale = Math.min(2, scale + 0.1)
    onScaleChange(Math.round(newScale * 100) / 100)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(0.25, scale - 0.1)
    onScaleChange(Math.round(newScale * 100) / 100)
  }

  const handlePresetSelect = (value: number | 'fit') => {
    if (value === 'fit' && onFitToScreen) {
      onFitToScreen()
    } else if (typeof value === 'number') {
      onScaleChange(value)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/[0.06]"
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Zoom Out
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.06] font-mono min-w-[56px]"
          >
            {Math.round(scale * 100)}%
            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[100px]">
          {ZOOM_PRESETS.map((preset, index) => (
            <div key={preset.label}>
              {preset.value === 'fit' && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => handlePresetSelect(preset.value)}
                className="flex items-center justify-between"
              >
                <span>{preset.label}</span>
                {typeof preset.value === 'number' && scale === preset.value && (
                  <Check className="h-3.5 w-3.5 text-violet-400" />
                )}
              </DropdownMenuItem>
              {index === 0 && <DropdownMenuSeparator />}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/[0.06]"
            onClick={handleZoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Zoom In
        </TooltipContent>
      </Tooltip>

      {onFitToScreen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/[0.06]"
              onClick={onFitToScreen}
            >
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Fit to Screen
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// =============================================================================
// SCREENSHOT BUTTON
// =============================================================================

interface ScreenshotButtonProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  deviceName?: string
  className?: string
}

export function ScreenshotButton({ iframeRef, deviceName, className }: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const captureScreenshot = useCallback(async () => {
    if (!iframeRef.current) return

    setIsCapturing(true)
    try {
      // Use html2canvas if available, otherwise download iframe content
      const iframe = iframeRef.current
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document

      if (iframeDocument) {
        // Create a canvas from the iframe content
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(iframeDocument.body, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scale: 2, // High resolution
        })

        // Convert to blob and download
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `screenshot-${deviceName || 'preview'}-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
          }
        }, 'image/png')
      }
    } catch (error) {
      console.error('Screenshot failed:', error)
    } finally {
      setIsCapturing(false)
    }
  }, [iframeRef, deviceName])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 hover:bg-white/[0.06] transition-colors',
            showSuccess ? 'text-emerald-400' : 'text-white/60 hover:text-white',
            className
          )}
          onClick={captureScreenshot}
          disabled={isCapturing}
        >
          {showSuccess ? (
            <Check className="h-3.5 w-3.5" />
          ) : isCapturing ? (
            <Camera className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {showSuccess ? 'Screenshot saved!' : 'Take Screenshot'}
      </TooltipContent>
    </Tooltip>
  )
}

// =============================================================================
// GRID OVERLAY
// =============================================================================

interface GridOverlayProps {
  show: boolean
  gridSize?: number
  showRulers?: boolean
}

export function GridOverlay({ show, gridSize = 8, showRulers = false }: GridOverlayProps) {
  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      {/* Major grid lines every 8 cells */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize * 8}px ${gridSize * 8}px`,
        }}
      />

      {/* Rulers */}
      {showRulers && (
        <>
          {/* Top ruler */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[#1a1a24]/90 border-b border-violet-500/20 flex">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 border-r border-violet-500/30 relative"
                style={{ width: gridSize * 8 }}
              >
                <span className="absolute left-1 top-0.5 text-[8px] text-violet-400/60 font-mono">
                  {i * gridSize * 8}
                </span>
              </div>
            ))}
          </div>
          {/* Left ruler */}
          <div className="absolute top-4 left-0 bottom-0 w-4 bg-[#1a1a24]/90 border-r border-violet-500/20 flex flex-col">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 border-b border-violet-500/30 relative"
                style={{ height: gridSize * 8 }}
              >
                <span className="absolute left-0.5 top-1 text-[8px] text-violet-400/60 font-mono writing-mode-vertical">
                  {i * gridSize * 8}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// GRID/RULER TOGGLE
// =============================================================================

interface GridToggleProps {
  showGrid: boolean
  showRulers: boolean
  onGridChange: (show: boolean) => void
  onRulersChange: (show: boolean) => void
  className?: string
}

export function GridToggle({ showGrid, showRulers, onGridChange, onRulersChange, className }: GridToggleProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 hover:bg-white/[0.06]',
              showGrid ? 'text-violet-400' : 'text-white/60 hover:text-white'
            )}
            onClick={() => onGridChange(!showGrid)}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 hover:bg-white/[0.06]',
              showRulers ? 'text-violet-400' : 'text-white/60 hover:text-white'
            )}
            onClick={() => onRulersChange(!showRulers)}
          >
            <Ruler className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {showRulers ? 'Hide Rulers' : 'Show Rulers'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// =============================================================================
// THEME TOGGLE (Dark/Light Mode)
// =============================================================================

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system'
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
  className?: string
}

export function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    onThemeChange(next)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 hover:bg-white/[0.06]',
            theme === 'dark' ? 'text-violet-400' : 'text-white/60 hover:text-white',
            className
          )}
          onClick={cycleTheme}
        >
          {theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5" />
          ) : theme === 'light' ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Theme: {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
      </TooltipContent>
    </Tooltip>
  )
}

// =============================================================================
// URL BAR SIMULATION
// =============================================================================

interface UrlBarProps {
  url?: string
  isSecure?: boolean
  className?: string
}

export function UrlBar({ url = 'localhost:3000', isSecure = true, className }: UrlBarProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] max-w-md',
      className
    )}>
      {/* SSL indicator */}
      <div className={cn(
        'flex items-center gap-1 text-[10px]',
        isSecure ? 'text-emerald-400' : 'text-amber-400'
      )}>
        <div className={cn(
          'h-3 w-3 rounded-full flex items-center justify-center',
          isSecure ? 'bg-emerald-500/20' : 'bg-amber-500/20'
        )}>
          {isSecure ? (
            <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 2L12 8M12 8L7 8M12 8L17 8M7 8L7 21L17 21L17 8" />
            </svg>
          ) : (
            <span>!</span>
          )}
        </div>
      </div>

      {/* URL */}
      <span className="text-xs text-white/60 font-mono truncate">
        {isSecure ? 'https://' : 'http://'}{url}
      </span>

      {/* Refresh hint */}
      <div className="ml-auto">
        <RotateCcw className="h-3 w-3 text-white/30" />
      </div>
    </div>
  )
}

// =============================================================================
// MOBILE STATUS BAR (Enhanced)
// =============================================================================

interface MobileStatusBarProps {
  variant?: 'ios' | 'android'
  isDark?: boolean
  time?: string
  batteryLevel?: number
  isCharging?: boolean
  signalStrength?: number
  wifiStrength?: number
  carrier?: string
  className?: string
}

export function MobileStatusBar({
  variant = 'ios',
  isDark = false,
  time,
  batteryLevel = 85,
  isCharging = false,
  signalStrength = 4,
  wifiStrength = 3,
  carrier = '',
  className,
}: MobileStatusBarProps) {
  const currentTime = time || new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const textColor = isDark ? 'text-white' : 'text-black'
  const iconColor = isDark ? 'fill-white' : 'fill-black'

  return (
    <div className={cn(
      'flex items-center justify-between px-6 py-1',
      isDark ? 'bg-black' : 'bg-white',
      className
    )}>
      {/* Left side - Time or Carrier */}
      <div className="flex items-center gap-1 min-w-[60px]">
        {variant === 'ios' ? (
          <span className={cn('text-[14px] font-semibold', textColor)}>
            {currentTime}
          </span>
        ) : (
          <>
            <span className={cn('text-[12px]', textColor)}>{currentTime}</span>
            {carrier && (
              <span className={cn('text-[10px] ml-1', textColor, 'opacity-70')}>{carrier}</span>
            )}
          </>
        )}
      </div>

      {/* Center - Dynamic Island area (iOS only) */}
      {variant === 'ios' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          {/* Dynamic Island placeholder */}
        </div>
      )}

      {/* Right side - Icons */}
      <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" className={iconColor}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4}
              y={9 - i * 3}
              width="3"
              height={3 + i * 3}
              rx="0.5"
              opacity={i < signalStrength ? 1 : 0.3}
            />
          ))}
        </svg>

        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" className={iconColor}>
          <path
            d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
            opacity={wifiStrength >= 1 ? 1 : 0.3}
          />
          <path
            d="M4.5 7.5C5.5 6.5 6.7 6 8 6s2.5.5 3.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={isDark ? 'stroke-white' : 'stroke-black'}
            opacity={wifiStrength >= 2 ? 1 : 0.3}
          />
          <path
            d="M2 5C3.5 3.5 5.6 2.5 8 2.5s4.5 1 6 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={isDark ? 'stroke-white' : 'stroke-black'}
            opacity={wifiStrength >= 3 ? 1 : 0.3}
          />
        </svg>

        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className={cn(
            'relative w-[25px] h-[12px] rounded-[3px] border-[1.5px]',
            isDark ? 'border-white' : 'border-black'
          )}>
            <div
              className={cn(
                'absolute left-0.5 top-0.5 bottom-0.5 rounded-[1px] transition-all',
                batteryLevel > 20 ? (isDark ? 'bg-white' : 'bg-black') : 'bg-red-500',
                isCharging && 'bg-emerald-500'
              )}
              style={{ width: `${Math.max(2, (batteryLevel / 100) * 20)}px` }}
            />
            {isCharging && (
              <svg
                className="absolute inset-0 m-auto h-2 w-2"
                viewBox="0 0 24 24"
                fill={isDark ? 'black' : 'white'}
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            )}
          </div>
          <div className={cn(
            'w-[3px] h-[5px] rounded-r-sm',
            isDark ? 'bg-white' : 'bg-black'
          )} />
        </div>

        {/* Battery percentage (optional for Android) */}
        {variant === 'android' && (
          <span className={cn('text-[11px]', textColor)}>{batteryLevel}%</span>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export {
  ZOOM_PRESETS,
}
