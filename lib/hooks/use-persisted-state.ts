'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for persisting state to localStorage
 * Automatically syncs state with localStorage and handles SSR
 * Uses defaultValue for initial render to avoid hydration mismatch
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Always use defaultValue for initial render to avoid hydration mismatch
  const [state, setState] = useState<T>(defaultValue)
  const isInitialized = useRef(false)

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    try {
      const stored = localStorage.getItem(`ieditor:${key}`)
      if (stored) {
        const parsed = JSON.parse(stored) as T
        setState(parsed)
      }
    } catch (error) {
      console.warn(`Failed to parse persisted state for key "${key}":`, error)
    }
  }, [key])

  // Persist to localStorage whenever state changes (skip initial mount)
  useEffect(() => {
    // Don't persist until we've loaded from localStorage
    if (!isInitialized.current) return

    try {
      localStorage.setItem(`ieditor:${key}`, JSON.stringify(state))
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error)
    }
  }, [key, state])

  // Wrapper to handle function updates
  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value)
  }, [])

  return [state, setPersistedState]
}

/**
 * Hook for persisting workspace panel configuration
 */
export interface WorkspacePanelConfig {
  viewMode: 'code' | 'preview' | 'split'
  showFileExplorer: boolean
  showChat: boolean
  panelSizes: {
    left: number
    center: number
    right: number
  }
  editorFontSize: number
  showMinimap: boolean
}

const defaultPanelConfig: WorkspacePanelConfig = {
  viewMode: 'preview',
  showFileExplorer: true,
  showChat: true,
  panelSizes: {
    left: 25,
    center: 50,
    right: 25,
  },
  editorFontSize: 14,
  showMinimap: true,
}

export function useWorkspacePanelConfig() {
  const [config, setConfig] = usePersistedState<WorkspacePanelConfig>(
    'workspace-panel-config',
    defaultPanelConfig
  )

  const updateConfig = useCallback((updates: Partial<WorkspacePanelConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [setConfig])

  const resetConfig = useCallback(() => {
    setConfig(defaultPanelConfig)
  }, [setConfig])

  return {
    config,
    updateConfig,
    resetConfig,
    // Convenience setters
    setViewMode: (mode: WorkspacePanelConfig['viewMode']) => updateConfig({ viewMode: mode }),
    setShowFileExplorer: (show: boolean) => updateConfig({ showFileExplorer: show }),
    setShowChat: (show: boolean) => updateConfig({ showChat: show }),
    setPanelSizes: (sizes: WorkspacePanelConfig['panelSizes']) => updateConfig({ panelSizes: sizes }),
    setEditorFontSize: (size: number) => updateConfig({ editorFontSize: size }),
    setShowMinimap: (show: boolean) => updateConfig({ showMinimap: show }),
  }
}
