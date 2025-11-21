'use client'

import { useState, useEffect } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { FileTree } from './file-tree'
import { CodeEditor } from './code-editor'
import { ChatPanel } from './chat-panel'
import { GitPanel } from './git-panel'
import { WebContainerPreview } from './webcontainer-preview'
import { Terminal } from './terminal'
import { WorkspaceHeader } from './workspace-header'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { CommandPalette } from '@/components/command-palette'
import { Button } from '@/components/ui/button'
import { Globe, Terminal as TerminalIcon, MessageSquare, GitBranch } from 'lucide-react'
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
  const [rightView, setRightView] = useState<'chat' | 'git'>('chat')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [fileSearchOpen, setFileSearchOpen] = useState(false)

  const activeFile = files.find(f => f.id === activeFileId)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette - Ctrl/Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      // File search - Ctrl/Cmd+P
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setFileSearchOpen(true)
      }
      // New file - Ctrl/Cmd+N
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        document.querySelector('[data-action="new-file"]')?.dispatchEvent(new Event('click'))
      }
      // Toggle preview - Ctrl/Cmd+R
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault()
        setBottomView('preview')
      }
      // Toggle terminal - Ctrl/Cmd+`
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault()
        setBottomView(bottomView === 'terminal' ? 'preview' : 'terminal')
      }
      // Toggle Git panel - Ctrl/Cmd+Shift+G
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setRightView('git')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bottomView])

  const handleCommandAction = (action: string) => {
    switch (action) {
      case 'new-file':
        // Trigger file tree new file creation
        document.querySelector('[data-action="new-file"]')?.dispatchEvent(new Event('click'))
        break
      case 'search':
        setFileSearchOpen(true)
        break
      case 'git-commit':
        setRightView('git')
        break
      case 'run-preview':
        setBottomView('preview')
        break
      case 'terminal':
        setBottomView(bottomView === 'terminal' ? 'preview' : 'terminal')
        break
      case 'settings':
        window.location.href = '/settings'
        break
      default:
        console.log('Command action:', action)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <WorkspaceHeader project={project} />
      <KeyboardShortcuts />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onAction={handleCommandAction}
      />

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
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 border-b">
                  <Button
                    variant={bottomView === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBottomView('preview')}
                    className={bottomView === 'preview'
                      ? 'h-9 gradient-primary text-white border-0 shadow-sm'
                      : 'h-9 hover:bg-primary/10 hover:text-primary'
                    }
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant={bottomView === 'terminal' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBottomView('terminal')}
                    className={bottomView === 'terminal'
                      ? 'h-9 gradient-primary text-white border-0 shadow-sm'
                      : 'h-9 hover:bg-primary/10 hover:text-primary'
                    }
                  >
                    <TerminalIcon className="h-4 w-4 mr-2" />
                    Terminal
                  </Button>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Live</span>
                  </div>
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

        {/* Right Sidebar - AI Chat / Git Panel */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 border-b">
              <Button
                variant={rightView === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRightView('chat')}
                className={rightView === 'chat'
                  ? 'h-9 gradient-primary text-white border-0 shadow-sm'
                  : 'h-9 hover:bg-primary/10 hover:text-primary'
                }
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Button
                variant={rightView === 'git' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRightView('git')}
                className={rightView === 'git'
                  ? 'h-9 gradient-primary text-white border-0 shadow-sm'
                  : 'h-9 hover:bg-primary/10 hover:text-primary'
                }
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Git
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {rightView === 'chat' ? (
                <ChatPanel
                  projectId={project.id}
                  files={files}
                  messages={messages}
                  onMessagesChange={setMessages}
                  onFilesChange={setFiles}
                />
              ) : (
                <GitPanel
                  project={project}
                  files={files}
                  onRefresh={() => {
                    // Refresh files from server
                    window.location.reload()
                  }}
                />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
