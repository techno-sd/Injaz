'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface WorkspaceShortcutHandlers {
  // Panel toggles
  toggleFileExplorer?: () => void
  toggleChat?: () => void
  togglePreview?: () => void
  toggleTerminal?: () => void

  // View modes
  setCodeView?: () => void
  setPreviewView?: () => void
  setSplitView?: () => void

  // Actions
  save?: () => void
  openCommandPalette?: () => void
  focusEditor?: () => void
  focusChat?: () => void
  refresh?: () => void
  openKeyboardShortcuts?: () => void

  // Navigation
  goBack?: () => void
  goToDashboard?: () => void
}

interface ShortcutDefinition {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: keyof WorkspaceShortcutHandlers
  description: string
}

// Define all shortcuts in one place
export const WORKSPACE_SHORTCUTS: ShortcutDefinition[] = [
  // Panel toggles
  { key: 'b', ctrl: true, handler: 'toggleFileExplorer', description: 'Toggle file explorer' },
  { key: 'j', ctrl: true, handler: 'toggleChat', description: 'Toggle AI chat panel' },
  { key: '\\', ctrl: true, handler: 'togglePreview', description: 'Toggle preview panel' },
  { key: '`', ctrl: true, handler: 'toggleTerminal', description: 'Toggle terminal' },

  // View modes
  { key: '1', ctrl: true, handler: 'setCodeView', description: 'Code only view' },
  { key: '2', ctrl: true, handler: 'setPreviewView', description: 'Preview only view' },
  { key: '3', ctrl: true, handler: 'setSplitView', description: 'Split view' },

  // Actions
  { key: 's', ctrl: true, handler: 'save', description: 'Save current file' },
  { key: 'p', ctrl: true, shift: true, handler: 'openCommandPalette', description: 'Open command palette' },
  { key: 'k', ctrl: true, shift: true, handler: 'openCommandPalette', description: 'Open command palette (alt)' },
  { key: 'e', ctrl: true, handler: 'focusEditor', description: 'Focus editor' },
  { key: 'i', ctrl: true, handler: 'focusChat', description: 'Focus AI chat input' },
  { key: 'r', ctrl: true, shift: true, handler: 'refresh', description: 'Refresh preview' },
  { key: '/', ctrl: true, shift: true, handler: 'openKeyboardShortcuts', description: 'Show keyboard shortcuts' },

  // Navigation
  { key: 'Escape', handler: 'goBack', description: 'Go back / close panel' },
]

/**
 * Unified keyboard shortcuts hook for workspace
 * Provides consistent shortcuts across all layout variants
 */
export function useWorkspaceShortcuts(handlers: WorkspaceShortcutHandlers) {
  // Store handlers in ref to avoid effect dependencies
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input/textarea
    const target = e.target as HTMLElement
    const isInputField =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('.monaco-editor') // Monaco editor

    // Allow some shortcuts even in input fields
    const allowInInput = ['s', 'Escape', 'p']

    if (isInputField && !allowInInput.includes(e.key)) {
      return
    }

    // Find matching shortcut
    const matchingShortcut = WORKSPACE_SHORTCUTS.find(shortcut => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !shortcut.ctrl || (e.ctrlKey || e.metaKey)
      const shiftMatch = !shortcut.shift || e.shiftKey
      const altMatch = !shortcut.alt || e.altKey

      return keyMatch && ctrlMatch && shiftMatch && altMatch
    })

    if (matchingShortcut) {
      const handler = handlersRef.current[matchingShortcut.handler]
      if (handler) {
        e.preventDefault()
        e.stopPropagation()
        handler()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: ShortcutDefinition): string {
  const parts: string[] = []

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')

  // Format key
  let key = shortcut.key
  if (key === ' ') key = 'Space'
  else if (key === '\\') key = '\\'
  else if (key === '`') key = '`'
  else key = key.toUpperCase()

  parts.push(key)

  return parts.join(' + ')
}

/**
 * Get shortcuts grouped by category for display
 */
export function getGroupedShortcuts() {
  return {
    'Panel Toggles': WORKSPACE_SHORTCUTS.filter(s =>
      ['toggleFileExplorer', 'toggleChat', 'togglePreview', 'toggleTerminal'].includes(s.handler)
    ),
    'View Modes': WORKSPACE_SHORTCUTS.filter(s =>
      ['setCodeView', 'setPreviewView', 'setSplitView'].includes(s.handler)
    ),
    'Actions': WORKSPACE_SHORTCUTS.filter(s =>
      ['save', 'openCommandPalette', 'focusEditor', 'focusChat', 'refresh', 'openKeyboardShortcuts'].includes(s.handler)
    ),
    'Navigation': WORKSPACE_SHORTCUTS.filter(s =>
      ['goBack', 'goToDashboard'].includes(s.handler)
    ),
  }
}
