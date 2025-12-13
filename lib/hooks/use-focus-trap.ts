"use client"

import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ')

interface UseFocusTrapOptions {
  enabled?: boolean
  autoFocus?: boolean
  restoreFocus?: boolean
  initialFocus?: string | HTMLElement | null
}

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    initialFocus,
  } = options

  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(el => {
      // Filter out hidden elements
      return el.offsetParent !== null && !el.hasAttribute('inert')
    })
  }, [])

  // Focus the first focusable element or specified initial focus
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return

    let elementToFocus: HTMLElement | null = null

    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        elementToFocus = containerRef.current.querySelector(initialFocus)
      } else {
        elementToFocus = initialFocus
      }
    }

    if (!elementToFocus) {
      const focusable = getFocusableElements()
      elementToFocus = focusable[0] || containerRef.current
    }

    elementToFocus?.focus()
  }, [initialFocus, getFocusableElements])

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      // Shift + Tab on first element -> focus last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      // Tab on last element -> focus first
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
        return
      }

      // If focus is outside container, bring it back
      if (!containerRef.current?.contains(activeElement as Node)) {
        event.preventDefault()
        focusFirst()
      }
    },
    [enabled, getFocusableElements, focusFirst]
  )

  // Handle focus leaving the container
  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      if (!enabled || !containerRef.current) return

      const relatedTarget = event.relatedTarget as HTMLElement

      // If focus is moving outside the container, bring it back
      if (relatedTarget && !containerRef.current.contains(relatedTarget)) {
        focusFirst()
      }
    },
    [enabled, focusFirst]
  )

  // Setup and cleanup
  useEffect(() => {
    if (!enabled) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement

    // Auto-focus the first element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        focusFirst()
      })
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    containerRef.current?.addEventListener('focusout', handleFocusOut as EventListener)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      containerRef.current?.removeEventListener('focusout', handleFocusOut as EventListener)

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [enabled, autoFocus, restoreFocus, handleKeyDown, handleFocusOut, focusFirst])

  return {
    ref: containerRef,
    focusFirst,
    getFocusableElements,
  }
}

/**
 * Hook for roving focus within a list of items
 * Useful for toolbars, menus, and other list-based components
 */
export function useRovingFocus<T extends HTMLElement = HTMLDivElement>(
  options: {
    enabled?: boolean
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
  } = {}
) {
  const { enabled = true, orientation = 'vertical', loop = true } = options

  const containerRef = useRef<T>(null)
  const currentIndex = useRef(0)

  const getItems = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[data-roving-item]')
    ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
  }, [])

  const focusItem = useCallback((index: number) => {
    const items = getItems()
    if (items.length === 0) return

    let targetIndex = index
    if (loop) {
      targetIndex = ((index % items.length) + items.length) % items.length
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1))
    }

    items[targetIndex]?.focus()
    currentIndex.current = targetIndex
  }, [getItems, loop])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const isVertical = orientation === 'vertical' || orientation === 'both'
      const isHorizontal = orientation === 'horizontal' || orientation === 'both'

      let handled = false

      switch (event.key) {
        case 'ArrowDown':
          if (isVertical) {
            focusItem(currentIndex.current + 1)
            handled = true
          }
          break
        case 'ArrowUp':
          if (isVertical) {
            focusItem(currentIndex.current - 1)
            handled = true
          }
          break
        case 'ArrowRight':
          if (isHorizontal) {
            focusItem(currentIndex.current + 1)
            handled = true
          }
          break
        case 'ArrowLeft':
          if (isHorizontal) {
            focusItem(currentIndex.current - 1)
            handled = true
          }
          break
        case 'Home':
          focusItem(0)
          handled = true
          break
        case 'End':
          focusItem(getItems().length - 1)
          handled = true
          break
      }

      if (handled) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    [enabled, orientation, focusItem, getItems]
  )

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    container?.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      container?.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [enabled, handleKeyDown])

  return {
    ref: containerRef,
    focusItem,
    getItems,
    currentIndex: currentIndex.current,
  }
}

/**
 * Hook to announce messages to screen readers
 */
export function useScreenReaderAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.createElement('div')
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', priority)
    el.setAttribute('aria-atomic', 'true')
    el.className = 'sr-only'
    el.textContent = message

    document.body.appendChild(el)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(el)
    }, 1000)
  }, [])

  return announce
}
