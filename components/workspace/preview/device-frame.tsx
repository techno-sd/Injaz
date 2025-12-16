// Device Frame - Realistic device bezels with notch/dynamic island
'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { DevicePreset, DeviceOrientation } from '@/types/preview-types'
import { usePreviewDevice, useViewportDimensions } from './use-preview-device'

// =============================================================================
// DEVICE FRAME COMPONENT
// =============================================================================

interface DeviceFrameProps {
  children: ReactNode
  className?: string
  showFrame?: boolean
}

export function DeviceFrame({ children, className, showFrame }: DeviceFrameProps) {
  const { device, orientation, showFrame: storeShowFrame, scale } = usePreviewDevice()
  const { width, height } = useViewportDimensions()

  const shouldShowFrame = showFrame ?? storeShowFrame

  // Don't show frame for desktop or custom modes
  if (!device || !shouldShowFrame) {
    return (
      <div
        className={cn('relative overflow-hidden bg-white', className)}
        style={{
          width: width * scale,
          height: height * scale,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    )
  }

  // Calculate dimensions based on orientation
  const frameWidth = orientation === 'portrait' ? device.width : device.height
  const frameHeight = orientation === 'portrait' ? device.height : device.width

  return (
    <div
      className={cn('relative transition-transform duration-300', className)}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      {/* Device Frame */}
      <div
        className="relative"
        style={{
          width: frameWidth + device.framePadding * 2,
          height: frameHeight + device.framePadding * 2,
          backgroundColor: device.frameColor,
          borderRadius: device.frameRadius,
          padding: device.framePadding,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.1) inset,
            0 25px 50px -12px rgba(0,0,0,0.5),
            0 0 0 1px rgba(0,0,0,0.1)
          `,
        }}
      >
        {/* Side Buttons (for phones) */}
        {device.category === 'phone' && orientation === 'portrait' && (
          <>
            {/* Volume buttons - left side */}
            <div
              className="absolute bg-[#2a2a2f] rounded-l-sm"
              style={{
                left: -3,
                top: device.framePadding + 100,
                width: 3,
                height: 30,
              }}
            />
            <div
              className="absolute bg-[#2a2a2f] rounded-l-sm"
              style={{
                left: -3,
                top: device.framePadding + 140,
                width: 3,
                height: 30,
              }}
            />
            {/* Power button - right side */}
            <div
              className="absolute bg-[#2a2a2f] rounded-r-sm"
              style={{
                right: -3,
                top: device.framePadding + 120,
                width: 3,
                height: 45,
              }}
            />
          </>
        )}

        {/* Screen Container */}
        <div
          className="relative overflow-hidden bg-black"
          style={{
            width: frameWidth,
            height: frameHeight,
            borderRadius: device.screenRadius || device.frameRadius - 6,
          }}
        >
          {/* Status Bar Area */}
          {device.statusBarHeight && device.statusBarHeight > 0 && (
            <StatusBar device={device} orientation={orientation} />
          )}

          {/* Notch / Dynamic Island */}
          {device.notch && device.notch.type !== 'none' && (
            <Notch device={device} orientation={orientation} />
          )}

          {/* Screen Content */}
          <div
            className="absolute inset-0 overflow-auto bg-white"
            style={{
              paddingTop: device.statusBarHeight || 0,
            }}
          >
            {children}
          </div>

          {/* Home Indicator */}
          {device.homeIndicator && (
            <HomeIndicator device={device} orientation={orientation} />
          )}
        </div>
      </div>

      {/* Device Name Label */}
      <div className="mt-3 text-center text-xs text-muted-foreground font-medium">
        {device.name}
      </div>
    </div>
  )
}

// =============================================================================
// STATUS BAR
// =============================================================================

interface StatusBarProps {
  device: DevicePreset
  orientation: DeviceOrientation
}

function StatusBar({ device, orientation }: StatusBarProps) {
  const isPortrait = orientation === 'portrait'
  const height = device.statusBarHeight || 44

  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 text-white text-xs font-semibold"
      style={{
        height,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
      }}
    >
      {/* Time */}
      <span className="w-12">9:41</span>

      {/* Spacer for notch */}
      <span className="flex-1" />

      {/* Status Icons */}
      <div className="flex items-center gap-1.5 w-16 justify-end">
        {/* Signal */}
        <svg className="w-4 h-3" viewBox="0 0 17 10" fill="currentColor">
          <rect x="0" y="5" width="3" height="5" rx="0.5" />
          <rect x="4" y="3" width="3" height="7" rx="0.5" />
          <rect x="8" y="1" width="3" height="9" rx="0.5" />
          <rect x="12" y="0" width="3" height="10" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg className="w-4 h-3" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 3.5C9.5 3.5 11.3 4.2 12.7 5.3L14 4C12.2 2.5 10 1.5 7.5 1.5C5 1.5 2.8 2.5 1 4L2.3 5.3C3.7 4.2 5.5 3.5 7.5 3.5Z" />
          <path d="M7.5 6C8.8 6 10 6.5 11 7.3L12.3 6C11 4.9 9.3 4.3 7.5 4.3C5.7 4.3 4 4.9 2.7 6L4 7.3C5 6.5 6.2 6 7.5 6Z" />
          <circle cx="7.5" cy="9.5" r="1.5" />
        </svg>
        {/* Battery */}
        <svg className="w-6 h-3" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0" y="1" width="22" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="2" y="3" width="17" height="6" rx="1" fill="currentColor" />
          <rect x="23" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

// =============================================================================
// NOTCH / DYNAMIC ISLAND
// =============================================================================

interface NotchProps {
  device: DevicePreset
  orientation: DeviceOrientation
}

function Notch({ device, orientation }: NotchProps) {
  if (!device.notch || device.notch.type === 'none') return null

  const { type, width, height, borderRadius } = device.notch
  const isPortrait = orientation === 'portrait'

  if (type === 'dynamic-island') {
    return (
      <div
        className="absolute z-20 bg-black"
        style={{
          top: isPortrait ? 12 : '50%',
          left: isPortrait ? '50%' : 12,
          transform: isPortrait
            ? 'translateX(-50%)'
            : 'translateY(-50%) rotate(90deg)',
          width,
          height,
          borderRadius: borderRadius || height / 2,
        }}
      >
        {/* Camera dot */}
        <div
          className="absolute bg-[#1a1a1f] rounded-full"
          style={{
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
          }}
        >
          <div className="absolute inset-1 rounded-full bg-[#0d4d8a]/30" />
        </div>
      </div>
    )
  }

  if (type === 'notch') {
    return (
      <div
        className="absolute z-20 bg-black"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width,
          height,
          borderRadius: `0 0 ${borderRadius || 20}px ${borderRadius || 20}px`,
        }}
      >
        {/* Speaker */}
        <div
          className="absolute bg-[#1a1a1f] rounded-full"
          style={{
            top: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 6,
          }}
        />
        {/* Camera */}
        <div
          className="absolute bg-[#1a1a1f] rounded-full"
          style={{
            top: 12,
            right: 30,
            width: 12,
            height: 12,
          }}
        />
      </div>
    )
  }

  if (type === 'punch-hole') {
    return (
      <div
        className="absolute z-20 bg-black rounded-full"
        style={{
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width,
          height,
        }}
      >
        <div className="absolute inset-1 rounded-full bg-[#0d4d8a]/30" />
      </div>
    )
  }

  if (type === 'pill') {
    return (
      <div
        className="absolute z-20 bg-black rounded-full"
        style={{
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width,
          height,
        }}
      >
        <div
          className="absolute bg-[#1a1a1f] rounded-full"
          style={{
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            width: 8,
            height: 8,
          }}
        />
      </div>
    )
  }

  return null
}

// =============================================================================
// HOME INDICATOR
// =============================================================================

interface HomeIndicatorProps {
  device: DevicePreset
  orientation: DeviceOrientation
}

function HomeIndicator({ device, orientation }: HomeIndicatorProps) {
  if (!device.homeIndicator) return null

  const { width, height, bottomOffset, borderRadius } = device.homeIndicator
  const isPortrait = orientation === 'portrait'

  return (
    <div
      className="absolute z-20 bg-white/30 rounded-full"
      style={{
        bottom: isPortrait ? bottomOffset : '50%',
        left: isPortrait ? '50%' : bottomOffset,
        transform: isPortrait
          ? 'translateX(-50%)'
          : 'translateY(50%) rotate(90deg)',
        width,
        height,
        borderRadius: borderRadius || height / 2,
      }}
    />
  )
}

export default DeviceFrame
