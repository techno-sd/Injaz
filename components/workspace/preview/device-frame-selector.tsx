// Device Frame Selector - Dropdown to select device presets
'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  Check,
  Ruler,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PHONE_PRESETS,
  TABLET_PRESETS,
  DEVICE_PRESETS_BY_BRAND,
  type DevicePreset,
  type DeviceMode,
} from '@/types/preview-types'
import type { PlatformType } from '@/types'
import { usePreviewDevice } from './use-preview-device'

// =============================================================================
// MODE ICONS
// =============================================================================

const MODE_ICONS: Record<DeviceMode, typeof Smartphone> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
  custom: Ruler,
}

const MODE_LABELS: Record<DeviceMode, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
  custom: 'Custom',
}

// Platform-specific mode configurations
// Mobile apps: Only phone and tablet previews (no desktop)
// Websites/Webapps: All device types including desktop
const PLATFORM_MODES: Record<PlatformType, DeviceMode[]> = {
  mobile: ['mobile', 'tablet'], // Mobile apps only show phone and tablet
  website: ['desktop', 'tablet', 'mobile', 'custom'], // Websites show all
  webapp: ['desktop', 'tablet', 'mobile', 'custom'], // Web apps show all
}

// =============================================================================
// DEVICE FRAME SELECTOR
// =============================================================================

interface DeviceFrameSelectorProps {
  className?: string
  compact?: boolean
  platform?: PlatformType
}

export function DeviceFrameSelector({
  className,
  compact = false,
  platform = 'webapp',
}: DeviceFrameSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { device, mode, setDevice, setMode } = usePreviewDevice()

  // Get available modes for the current platform
  const availableModes = useMemo(() => PLATFORM_MODES[platform], [platform])
  const isMobileApp = platform === 'mobile'

  // Ensure current mode is valid for the platform, otherwise switch to first available
  useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0])
    }
  }, [availableModes, mode, setMode])

  const ModeIcon = MODE_ICONS[mode]
  const currentLabel = device?.name || MODE_LABELS[mode]

  // Calculate grid columns based on available modes
  const gridCols = availableModes.length === 2 ? 'grid-cols-2' : 'grid-cols-4'

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
          'bg-muted/50 hover:bg-muted border border-border/50',
          'transition-colors',
          compact && 'px-2 py-1',
          isMobileApp && 'border-cyan-500/30 bg-cyan-500/5'
        )}
      >
        <ModeIcon className={cn('w-4 h-4 text-muted-foreground', isMobileApp && 'text-cyan-400')} />
        {!compact && (
          <>
            <span className={cn('font-medium truncate max-w-[120px]', isMobileApp && 'text-cyan-100')}>{currentLabel}</span>
            <ChevronDown
              className={cn(
                'w-3 h-3 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className={cn(
            'absolute top-full left-0 mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200',
            isMobileApp ? 'w-64' : 'w-72'
          )}>
            {/* Platform indicator for mobile */}
            {isMobileApp && (
              <div className="px-3 py-2 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-300 font-medium">Mobile App Preview</span>
              </div>
            )}

            {/* Quick Modes */}
            <div className="p-2 border-b border-border">
              <div className={cn('grid gap-1', gridCols)}>
                {availableModes.map((m) => {
                  const Icon = MODE_ICONS[m]
                  const isActive = mode === m
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m)
                        if (m === 'desktop' || m === 'custom') {
                          setIsOpen(false)
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                        isActive
                          ? isMobileApp ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{MODE_LABELS[m]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Device List */}
            {(mode === 'mobile' || mode === 'tablet') && (
              <div className="max-h-80 overflow-y-auto">
                {Object.entries(DEVICE_PRESETS_BY_BRAND).map(([brand, devices]) => {
                  const filteredDevices = devices.filter((d) =>
                    mode === 'mobile' ? d.category === 'phone' : d.category === 'tablet'
                  )
                  if (filteredDevices.length === 0) return null

                  return (
                    <div key={brand}>
                      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                        {brand}
                      </div>
                      {filteredDevices.map((preset) => (
                        <DeviceOption
                          key={preset.id}
                          device={preset}
                          isSelected={device?.id === preset.id}
                          onSelect={() => {
                            setDevice(preset)
                            setIsOpen(false)
                          }}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Custom Size Info */}
            {mode === 'custom' && (
              <div className="p-3 text-sm text-muted-foreground">
                Use the viewport input to set custom dimensions
              </div>
            )}

            {/* Desktop Info */}
            {mode === 'desktop' && (
              <div className="p-3 text-sm text-muted-foreground">
                Full-width desktop preview (1920 x 1080)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// DEVICE OPTION
// =============================================================================

interface DeviceOptionProps {
  device: DevicePreset
  isSelected: boolean
  onSelect: () => void
}

function DeviceOption({ device, isSelected, onSelect }: DeviceOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 text-left',
        'hover:bg-muted/50 transition-colors',
        isSelected && 'bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        {device.category === 'phone' ? (
          <Smartphone className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Tablet className="w-4 h-4 text-muted-foreground" />
        )}
        <div>
          <div className="text-sm font-medium">{device.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {device.width} x {device.height}
          </div>
        </div>
      </div>
      {isSelected && <Check className="w-4 h-4 text-primary" />}
    </button>
  )
}

export default DeviceFrameSelector
