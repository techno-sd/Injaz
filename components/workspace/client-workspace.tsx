'use client'

import { useState, useEffect } from 'react'
import { WebContainerProvider } from '@/lib/webcontainer-context'
import { LovableWorkspaceLayout } from './lovable-workspace-layout'
import type { Project, File, Message } from '@/types'

interface ClientWorkspaceProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
  isGuestMode: boolean
  initialPrompt?: string
}

export function ClientWorkspace({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected,
  isGuestMode,
  initialPrompt,
}: ClientWorkspaceProps) {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage for pre-generated files from home page
    const storedFilesKey = `project-${project.id}-files`
    const storedPromptKey = `project-${project.id}-prompt`

    try {
      const storedFilesJson = sessionStorage.getItem(storedFilesKey)
      const storedPrompt = sessionStorage.getItem(storedPromptKey)

      if (storedFilesJson) {
        const storedFiles = JSON.parse(storedFilesJson)

        // Convert stored files to full File format
        const formattedFiles: File[] = storedFiles.map((file: { path: string; content: string }, index: number) => {
          const ext = file.path.split('.').pop() || ''
          const langMap: Record<string, string> = {
            ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
            json: 'json', css: 'css', html: 'html', md: 'markdown'
          }
          return {
            id: `generated-${index}`,
            project_id: project.id,
            path: file.path,
            content: file.content,
            language: langMap[ext] || 'plaintext',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })

        setFiles(formattedFiles)

        // Add initial message about generation
        if (storedPrompt) {
          const userMessage: Message = {
            id: 'initial-user',
            project_id: project.id,
            role: 'user',
            content: storedPrompt,
            created_at: new Date().toISOString(),
          }
          const assistantMessage: Message = {
            id: 'initial-assistant',
            project_id: project.id,
            role: 'assistant',
            content: `✓ Generated ${formattedFiles.length} files for your application.`,
            created_at: new Date().toISOString(),
            metadata: { filesChanged: formattedFiles.map(f => f.path) },
          }
          setMessages([userMessage, assistantMessage])
        }

        // Clear sessionStorage after loading
        sessionStorage.removeItem(storedFilesKey)
        sessionStorage.removeItem(storedPromptKey)
      }
    } catch (error) {
      console.error('Error loading pre-generated files:', error)
    }

    setIsLoading(false)
  }, [project.id])

  // Show loading state briefly while checking sessionStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">Loading workspace...</div>
      </div>
    )
  }

  return (
    <WebContainerProvider>
      <LovableWorkspaceLayout
        project={project}
        initialFiles={files}
        initialMessages={messages}
        isVercelConnected={isVercelConnected}
        isGuestMode={isGuestMode}
        initialPrompt={initialPrompt}
      />
    </WebContainerProvider>
  )
}
