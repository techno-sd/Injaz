'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { WebContainer } from '@webcontainer/api'

interface WebContainerContextType {
  webcontainer: WebContainer | null
  isBooting: boolean
  error: string | null
  bootStage: string
  restart: () => Promise<void>
  // Persistent preview state
  previewUrl: string
  setPreviewUrl: (url: string) => void
  isServerRunning: boolean
  setIsServerRunning: (running: boolean) => void
}

const WebContainerContext = createContext<WebContainerContextType>({
  webcontainer: null,
  isBooting: true,
  error: null,
  bootStage: 'Initializing...',
  restart: async () => {},
  previewUrl: '',
  setPreviewUrl: () => {},
  isServerRunning: false,
  setIsServerRunning: () => {},
})

export function useWebContainer() {
  return useContext(WebContainerContext)
}

interface WebContainerProviderProps {
  children: ReactNode
}

// Singleton instance - WebContainer only allows one instance per origin
// Only initialized on client side
let globalWebContainer: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

// Track if we've already initialized in this module instance
// This prevents double-initialization in React Strict Mode
let hasModuleInitialized = false

// Use a unique key per page load to detect refreshes
// On refresh, this will be a new value, forcing a fresh boot
const PAGE_LOAD_KEY = 'webcontainer_page_load'
const currentPageLoad = typeof window !== 'undefined' ? Date.now().toString() : ''

// Boot timeout in milliseconds
const BOOT_TIMEOUT = 60000 // Increased to 60 seconds for first boot

// Status messages for user feedback
const BOOT_STAGES = {
  checking: 'Checking browser compatibility...',
  headers: 'Verifying cross-origin isolation...',
  existing: 'Connecting to existing session...',
  booting: 'Downloading WebContainer runtime...',
  ready: 'WebContainer ready!',
}

export function WebContainerProvider({ children }: WebContainerProviderProps) {
  // Always start with null on initial render to avoid SSR hydration mismatch
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bootStage, setBootStage] = useState<string>(BOOT_STAGES.checking)
  const mountedRef = useRef(true)
  const hasInitialized = useRef(false)

  // Persistent preview state - survives component unmount/remount
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isServerRunning, setIsServerRunning] = useState(false)

  const bootWebContainer = async () => {
    try {
      // Check if WebContainers are supported
      if (typeof window === 'undefined') {
        return
      }

      setBootStage(BOOT_STAGES.checking)
      console.log('[WebContainer] Starting boot process...')

      // Check for cross-origin isolation (required for SharedArrayBuffer)
      setBootStage(BOOT_STAGES.headers)
      const isCrossOriginIsolated = window.crossOriginIsolated
      console.log('[WebContainer] Cross-origin isolated:', isCrossOriginIsolated)

      if (!isCrossOriginIsolated) {
        throw new Error('Cross-origin isolation is not enabled. Please close all other tabs of this app and refresh, or restart the dev server.')
      }

      // Check for SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined') {
        throw new Error('SharedArrayBuffer is not available. Please use Chrome, Edge, or Firefox.')
      }

      console.log('[WebContainer] SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined')

      // Check for pre-booted instance from preloader
      const prebootedInstance = (window as any).__webcontainer_instance
      if (prebootedInstance) {
        console.log('[WebContainer] Using pre-booted instance!')
        globalWebContainer = prebootedInstance
        if (mountedRef.current) {
          setWebcontainer(prebootedInstance)
          setBootStage(BOOT_STAGES.ready)
          setIsBooting(false)
        }
        return
      }

      // Return existing instance if available
      if (globalWebContainer) {
        setBootStage(BOOT_STAGES.existing)
        console.log('[WebContainer] Using existing instance')
        if (mountedRef.current) {
          setWebcontainer(globalWebContainer)
          setBootStage(BOOT_STAGES.ready)
          setIsBooting(false)
        }
        return
      }

      // Wait for existing boot if in progress
      if (bootPromise) {
        setBootStage(BOOT_STAGES.existing)
        console.log('[WebContainer] Waiting for existing boot...')
        const instance = await bootPromise
        if (mountedRef.current) {
          setWebcontainer(instance)
          setBootStage(BOOT_STAGES.ready)
          setIsBooting(false)
        }
        return
      }

      // Boot new instance with timeout
      setIsBooting(true)
      setError(null)
      setBootStage(BOOT_STAGES.booting)

      console.log('[WebContainer] Booting new instance...')

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`WebContainer boot timed out after ${BOOT_TIMEOUT / 1000} seconds`))
        }, BOOT_TIMEOUT)
      })

      // Race between boot and timeout
      bootPromise = WebContainer.boot()
      const instance = await Promise.race([bootPromise, timeoutPromise])

      globalWebContainer = instance
      console.log('[WebContainer] Boot successful!')

      if (mountedRef.current) {
        setWebcontainer(instance)
        setBootStage(BOOT_STAGES.ready)
        setIsBooting(false)
      }
    } catch (err) {
      console.error('[WebContainer] Failed to boot:', err)
      bootPromise = null

      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to boot WebContainer'

        // Provide helpful error messages
        if (errorMessage.includes('Unable to create more instances')) {
          setError('WebContainer limit reached. Please close other tabs using Injaz.ai and refresh this page.')
        } else if (errorMessage.includes('SharedArrayBuffer') || errorMessage.includes('cross-origin')) {
          setError('Cross-origin isolation required. Please restart the dev server and ensure COOP/COEP headers are set.')
        } else if (errorMessage.includes('timed out')) {
          setError('WebContainer boot timed out. Please refresh the page and try again.')
        } else {
          setError(errorMessage)
        }
        setIsBooting(false)
      }
    }
  }

  const restart = async () => {
    // Teardown existing instance
    if (globalWebContainer) {
      try {
        await globalWebContainer.teardown()
      } catch (e) {
        console.error('Error tearing down WebContainer:', e)
      }
      globalWebContainer = null
      bootPromise = null
    }

    // Boot fresh instance
    await bootWebContainer()
  }

  useEffect(() => {
    // Check if this is a page refresh or HMR
    const lastPageLoad = typeof window !== 'undefined' ? sessionStorage.getItem(PAGE_LOAD_KEY) : null
    const isPageRefresh = lastPageLoad !== null && lastPageLoad !== currentPageLoad
    const isFirstLoad = lastPageLoad === null

    // Store current page load ID
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PAGE_LOAD_KEY, currentPageLoad)
    }

    console.log('[WebContainerProvider] useEffect running:', {
      hasInitialized: hasInitialized.current,
      hasModuleInitialized,
      hasGlobalInstance: !!globalWebContainer,
      isPageRefresh,
      isFirstLoad,
      lastPageLoad,
      currentPageLoad,
    })

    // Prevent double initialization in React Strict Mode
    if (hasInitialized.current) {
      console.log('[WebContainerProvider] Component already initialized, skipping')
      return
    }
    hasInitialized.current = true
    mountedRef.current = true

    // Boot fresh on first load or page refresh
    const initializeWebContainer = async () => {
      // If there's an existing instance, teardown first
      if (globalWebContainer) {
        console.log('[WebContainerProvider] Tearing down existing instance for fresh boot')
        try {
          await globalWebContainer.teardown()
        } catch (e) {
          console.error('[WebContainerProvider] Error tearing down:', e)
        }
        globalWebContainer = null
        bootPromise = null
      }

      // Reset all state for fresh start
      setPreviewUrl('')
      setIsServerRunning(false)

      // Boot fresh WebContainer
      console.log('[WebContainerProvider] Starting fresh boot')
      bootWebContainer()
    }

    // On page refresh or first load: always boot fresh
    if (isFirstLoad || isPageRefresh) {
      console.log('[WebContainerProvider] First load or page refresh - booting fresh')
      hasModuleInitialized = true
      initializeWebContainer()
      return
    }

    // HMR case: reuse existing instance if available
    if (hasModuleInitialized && globalWebContainer) {
      console.log('[WebContainerProvider] HMR detected, reusing instance')
      setWebcontainer(globalWebContainer)
      setBootStage(BOOT_STAGES.ready)
      setIsBooting(false)
      // Reset server state to trigger dev server restart
      setPreviewUrl('')
      setIsServerRunning(false)
      return
    }

    // Fallback: boot fresh
    console.log('[WebContainerProvider] Fallback - booting fresh')
    hasModuleInitialized = true
    initializeWebContainer()

    return () => {
      mountedRef.current = false
    }
  }, [])

  return (
    <WebContainerContext.Provider value={{
      webcontainer,
      isBooting,
      error,
      bootStage,
      restart,
      previewUrl,
      setPreviewUrl,
      isServerRunning,
      setIsServerRunning,
    }}>
      {children}
    </WebContainerContext.Provider>
  )
}
