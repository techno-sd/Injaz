'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { File } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeFiles(projectId: string, onFilesChange: (files: File[]) => void) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel(`project:${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'files',
            filter: `project_id=eq.${projectId}`,
          },
          async (payload) => {
            // Fetch updated files
            const { data: files } = await supabase
              .from('files')
              .select('*')
              .eq('project_id', projectId)
              .order('path', { ascending: true })

            if (files) {
              onFilesChange(files)
            }
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [projectId, onFilesChange])
}
