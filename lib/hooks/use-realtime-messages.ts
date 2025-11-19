'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeMessages(projectId: string, onMessagesChange: (messages: Message[]) => void) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel(`messages:${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`,
          },
          async (payload) => {
            // Fetch updated messages
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('project_id', projectId)
              .order('created_at', { ascending: true })

            if (messages) {
              onMessagesChange(messages)
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
  }, [projectId, onMessagesChange])
}
