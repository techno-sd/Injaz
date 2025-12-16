// Viewport Input - Custom width/height input for preview
'use client'

import { useState, useEffect } from 'react'
import { Link2, Link2Off, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePreviewDevice, useViewportDimensions } from './use-preview-device'
import { COMMON_VIEWPORT_SIZES } from '@/types/preview-types'

// =============================================================================
// VIEWPORT INPUT
// =============================================================================

interface ViewportInputProps {
  className?: string
}

export function ViewportInput({ className }: ViewportInputProps) {
  const { mode, setCustomDimensions, customWidth, customHeight } = usePreviewDevice()
  const { width, height } = useViewportDimensions()

  const [localWidth, setLocalWidth] = useState(width.toString())
  const [localHeight, setLocalHeight] = useState(height.toString())
  const [aspectLocked, setAspectLocked] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(width / height)
  const [showPresets, setShowPresets] = useState(false)

  // Sync local state with store
  useEffect(() => {
    setLocalWidth(width.toString())
    setLocalHeight(height.toString())
    setAspectRatio(width / height)
  }, [width, height])

  const handleWidthChange = (value: string) => {
    setLocalWidth(value)
    const numWidth = parseInt(value)
    if (!isNaN(numWidth) && numWidth > 0) {
      if (aspectLocked) {
        const newHeight = Math.round(numWidth / aspectRatio)
        setLocalHeight(newHeight.toString())
        setCustomDimensions(numWidth, newHeight)
      } else {
        setCustomDimensions(numWidth, parseInt(localHeight) || height)
      }
    }
  }

  const handleHeightChange = (value: string) => {
    setLocalHeight(value)
    const numHeight = parseInt(value)
    if (!isNaN(numHeight) && numHeight > 0) {
      if (aspectLocked) {
        const newWidth = Math.round(numHeight * aspectRatio)
        setLocalWidth(newWidth.toString())
        setCustomDimensions(newWidth, numHeight)
      } else {
        setCustomDimensions(parseInt(localWidth) || width, numHeight)
      }
    }
  }

  const handleBlur = () => {
    const numWidth = parseInt(localWidth) || width
    const numHeight = parseInt(localHeight) || height
    setLocalWidth(numWidth.toString())
    setLocalHeight(numHeight.toString())
    setCustomDimensions(numWidth, numHeight)
  }

  const handlePresetSelect = (preset: (typeof COMMON_VIEWPORT_SIZES)[0]) => {
    setLocalWidth(preset.width.toString())
    setLocalHeight(preset.height.toString())
    setCustomDimensions(preset.width, preset.height)
    setShowPresets(false)
  }

  const toggleAspectLock = () => {
    if (!aspectLocked) {
      setAspectRatio(width / height)
    }
    setAspectLocked(!aspectLocked)
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-1.5">
        {/* Width Input */}
        <div className="relative">
          <input
            type="text"
            value={localWidth}
            onChange={(e) => handleWidthChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              'w-16 h-7 px-2 text-xs text-center',
              'bg-muted/50 border border-border/50 rounded-md',
              'focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50',
              'transition-colors'
            )}
            title="Width"
          />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground">
            W
          </span>
        </div>

        {/* Aspect Lock Button */}
        <button
          onClick={toggleAspectLock}
          className={cn(
            'p-1 rounded transition-colors',
            aspectLocked
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
        >
          {aspectLocked ? (
            <Link2 className="w-3 h-3" />
          ) : (
            <Link2Off className="w-3 h-3" />
          )}
        </button>

        {/* Height Input */}
        <div className="relative">
          <input
            type="text"
            value={localHeight}
            onChange={(e) => handleHeightChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              'w-16 h-7 px-2 text-xs text-center',
              'bg-muted/50 border border-border/50 rounded-md',
              'focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50',
              'transition-colors'
            )}
            title="Height"
          />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground">
            H
          </span>
        </div>

        {/* Presets Button */}
        <button
          onClick={() => setShowPresets(!showPresets)}
          className={cn(
            'ml-1 px-2 h-7 text-[10px] font-medium rounded-md',
            'bg-muted/50 border border-border/50',
            'hover:bg-muted transition-colors'
          )}
        >
          Presets
        </button>
      </div>

      {/* Presets Dropdown */}
      {showPresets && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPresets(false)}
          />
          <div className="absolute top-full right-0 mt-2 z-50 w-48 bg-popover border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium">Common Sizes</span>
              <button
                onClick={() => setShowPresets(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {COMMON_VIEWPORT_SIZES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left',
                    'hover:bg-muted/50 transition-colors',
                    width === preset.width &&
                      height === preset.height &&
                      'bg-primary/5'
                  )}
                >
                  <span className="text-sm">{preset.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {preset.width} x {preset.height}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ViewportInput
