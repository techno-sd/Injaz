'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { WebContainer } from '@webcontainer/api'

interface WebContainerContextType {
  webcontainer: WebContainer | null
  isBooting: boolean
  error: string | null
}

const WebContainerContext = createContext<WebContainerContextType>({
  webcontainer: null,
  isBooting: true,
  error: null,
})

export function useWebContainer() {
  return useContext(WebContainerContext)
}

interface WebContainerProviderProps {
  children: ReactNode
}

export function WebContainerProvider({ children }: WebContainerProviderProps) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function bootWebContainer() {
      try {
        // Check if WebContainers are supported
        if (typeof window === 'undefined') {
          return
        }

        // Boot WebContainer
        const instance = await WebContainer.boot()

        if (mounted) {
          setWebcontainer(instance)
          setIsBooting(false)
        }
      } catch (err) {
        console.error('Failed to boot WebContainer:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to boot WebContainer')
          setIsBooting(false)
        }
      }
    }

    bootWebContainer()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <WebContainerContext.Provider value={{ webcontainer, isBooting, error }}>
      {children}
    </WebContainerContext.Provider>
  )
}
