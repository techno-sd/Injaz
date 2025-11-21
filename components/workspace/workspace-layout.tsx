'use client'

import { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { FileTree } from './file-tree'
import { CodeEditor } from './code-editor'
import { ChatPanel } from './chat-panel'
import { WebContainerPreview } from './webcontainer-preview'
import { Terminal } from './terminal'
import { WorkspaceHeader } from './workspace-header'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { Button } from '@/components/ui/button'
import { Globe, Terminal as TerminalIcon } from 'lucide-react'
import type { Project, File, Message } from '@/types'

interface WorkspaceLayoutProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
}

export function WorkspaceLayout({ project, initialFiles, initialMessages }: WorkspaceLayoutProps) {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [bottomView, setBottomView] = useState<'preview' | 'terminal'>('preview')

  const activeFile = files.find(f => f.id === activeFileId)

  return (
    <div className="h-screen flex flex-col">
      <WorkspaceHeader project={project} />
      <KeyboardShortcuts />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar - File Tree */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileTree
            files={files}
            projectId={project.id}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onFilesChange={setFiles}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Editor Area */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <CodeEditor
                file={activeFile}
                projectId={project.id}
                onFileUpdate={(updatedFile) => {
                  setFiles(files.map(f => f.id === updatedFile.id ? updatedFile : f))
                }}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Preview / Terminal */}
            <ResizablePanel defaultSize={40} minSize={20}>
              <div className="h-full flex flex-col">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-muted px-2 py-1 border-b">
                  <Button
                    variant={bottomView === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBottomView('preview')}
                    className="h-8"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant={bottomView === 'terminal' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBottomView('terminal')}
                    className="h-8"
                  >
                    <TerminalIcon className="h-4 w-4 mr-2" />
                    Terminal
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {bottomView === 'preview' ? (
                    <WebContainerPreview projectId={project.id} files={files} />
                  ) : (
                    <Terminal projectId={project.id} />
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Sidebar - AI Chat */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ChatPanel
            projectId={project.id}
            files={files}
            messages={messages}
            onMessagesChange={setMessages}
            onFilesChange={setFiles}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
