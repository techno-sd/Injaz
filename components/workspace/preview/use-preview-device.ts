// Preview Device Hook - Shared state for device selection in preview
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DevicePreset,
  DeviceMode,
  DeviceOrientation,
  ViewportState,
} from '@/types/preview-types'
import {
  IPHONE_15_PRO,
  IPAD_PRO_11,
  ALL_DEVICE_PRESETS,
} from '@/types/preview-types'

// =============================================================================
// PREVIEW STORE
// =============================================================================

interface PreviewState extends ViewportState {
  // Actions
  setDevice: (device: DevicePreset | null) => void
  setMode: (mode: DeviceMode) => void
  setOrientation: (orientation: DeviceOrientation) => void
  toggleOrientation: () => void
  setCustomDimensions: (width: number, height: number) => void
  setScale: (scale: number) => void
  setShowFrame: (show: boolean) => void
  reset: () => void
}

const DEFAULT_STATE: ViewportState = {
  device: IPHONE_15_PRO,
  mode: 'mobile',
  orientation: 'portrait',
  customWidth: 375,
  customHeight: 812,
  scale: 1,
  showFrame: true,
}

export const usePreviewDevice = create<PreviewState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setDevice: (device) =>
        set((state) => ({
          device,
          mode: device
            ? device.category === 'phone'
              ? 'mobile'
              : device.category === 'tablet'
              ? 'tablet'
              : 'desktop'
            : state.mode,
        })),

      setMode: (mode) =>
        set((state) => {
          // Auto-select appropriate device for mode
          let device = state.device
          if (mode === 'mobile' && (!device || device.category !== 'phone')) {
            device = IPHONE_15_PRO
          } else if (mode === 'tablet' && (!device || device.category !== 'tablet')) {
            device = IPAD_PRO_11
          } else if (mode === 'desktop' || mode === 'custom') {
            device = null
          }
          return { mode, device }
        }),

      setOrientation: (orientation) => set({ orientation }),

      toggleOrientation: () =>
        set((state) => ({
          orientation: state.orientation === 'portrait' ? 'landscape' : 'portrait',
        })),

      setCustomDimensions: (width, height) =>
        set({
          customWidth: Math.max(320, Math.min(2560, width)),
          customHeight: Math.max(320, Math.min(2560, height)),
          mode: 'custom',
          device: null,
        }),

      setScale: (scale) =>
        set({
          scale: Math.max(0.25, Math.min(2, scale)),
        }),

      setShowFrame: (showFrame) => set({ showFrame }),

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: 'preview-device-storage',
      partialize: (state) => ({
        mode: state.mode,
        orientation: state.orientation,
        customWidth: state.customWidth,
        customHeight: state.customHeight,
        showFrame: state.showFrame,
        // Store device ID to restore on load
        deviceId: state.device?.id,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore device from ID
        if (state && (state as any).deviceId) {
          const device = ALL_DEVICE_PRESETS.find((d) => d.id === (state as any).deviceId)
          if (device) {
            state.device = device
          }
        }
      },
    }
  )
)

// =============================================================================
// HELPER HOOKS
// =============================================================================

/**
 * Get current viewport dimensions based on state
 */
export function useViewportDimensions() {
  const { device, mode, orientation, customWidth, customHeight } = usePreviewDevice()

  if (mode === 'desktop') {
    return { width: 1920, height: 1080 }
  }

  if (mode === 'custom') {
    return { width: customWidth, height: customHeight }
  }

  if (device) {
    const w = orientation === 'portrait' ? device.width : device.height
    const h = orientation === 'portrait' ? device.height : device.width
    return { width: w, height: h }
  }

  // Fallback defaults
  const defaults = {
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 },
  }
  const dim = defaults[mode as 'tablet' | 'mobile'] || defaults.mobile
  return {
    width: orientation === 'portrait' ? dim.width : dim.height,
    height: orientation === 'portrait' ? dim.height : dim.width,
  }
}

/**
 * Get current Tailwind breakpoint name
 */
export function useCurrentBreakpoint() {
  const { width } = useViewportDimensions()

  if (width >= 1536) return '2xl'
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 768) return 'md'
  if (width >= 640) return 'sm'
  return 'xs'
}

/**
 * Check if current viewport is considered mobile
 */
export function useIsMobileViewport() {
  const { width } = useViewportDimensions()
  return width < 768
}
