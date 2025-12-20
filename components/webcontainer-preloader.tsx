'use client'

import { useEffect } from 'react'

// Pre-boot WebContainer in the background
// This caches the runtime so it's instant when user opens a project
export function WebContainerPreloader() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if browser supports WebContainer
    if (!window.crossOriginIsolated) {
      console.log('[Preloader] Skipping - not cross-origin isolated')
      return
    }

    if (typeof SharedArrayBuffer === 'undefined') {
      console.log('[Preloader] Skipping - SharedArrayBuffer not available')
      return
    }

    // Delay preload to not block initial page load
    const timer = setTimeout(async () => {
      try {
        console.log('[Preloader] Pre-loading WebContainer runtime...')

        // Dynamically import WebContainer to cache it
        const { WebContainer } = await import('@webcontainer/api')

        // Check if already booted elsewhere
        if ((window as any).__webcontainer_instance) {
          console.log('[Preloader] WebContainer already booted')
          return
        }

        // Boot WebContainer and store globally
        const instance = await WebContainer.boot()
        ;(window as any).__webcontainer_instance = instance

        console.log('[Preloader] WebContainer pre-booted successfully!')
      } catch (err) {
        // Silently fail - this is just an optimization
        console.log('[Preloader] Pre-boot skipped:', err)
      }
    }, 2000) // Wait 2 seconds after page load

    return () => clearTimeout(timer)
  }, [])

  return null
}
