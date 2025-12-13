'use client'

import { WebContainerProvider } from '@/lib/webcontainer-context'
import { LovableWorkspaceLayout } from './lovable-workspace-layout'
import type { Project, File, Message } from '@/types'

interface ClientWorkspaceProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
  isGuestMode: boolean
}

export function ClientWorkspace({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected,
  isGuestMode,
}: ClientWorkspaceProps) {
  return (
    <WebContainerProvider>
      <LovableWorkspaceLayout
        project={project}
        initialFiles={initialFiles}
        initialMessages={initialMessages}
        isVercelConnected={isVercelConnected}
        isGuestMode={isGuestMode}
      />
    </WebContainerProvider>
  )
}
