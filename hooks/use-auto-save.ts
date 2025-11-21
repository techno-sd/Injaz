import { useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UseAutoSaveOptions {
  onSave: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave<T>({
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions) {
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isSavingRef = useRef(false)

  const save = useCallback(
    async (data: T) => {
      if (!enabled || isSavingRef.current) return

      isSavingRef.current = true
      try {
        await onSave(data)
      } catch (error) {
        toast({
          title: 'Save failed',
          description: 'Failed to save changes',
          variant: 'destructive',
        })
      } finally {
        isSavingRef.current = false
      }
    },
    [onSave, enabled, toast]
  )

  const debouncedSave = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        save(data)
      }, delay)
    },
    [save, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { debouncedSave, save, isSaving: isSavingRef.current }
}
