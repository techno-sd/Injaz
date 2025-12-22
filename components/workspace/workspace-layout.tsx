'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { FileTree } from './file-tree'
import { WorkspaceHeader } from './workspace-header'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { CommandPalette } from '@/components/command-palette'
import { Button } from '@/components/ui/button'
import {
  Globe,
  Terminal as TerminalIcon,
  MessageSquare,
  GitBranch,
  Rocket,
  Code2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  EditorSkeleton,
  PreviewSkeleton,
  TerminalSkeleton,
  ChatSkeleton,
  GitPanelSkeleton,
  DeploymentSkeleton,
} from './loading-skeleton'
import type { Project, File, Message } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Lazy load heavy components
const CodeEditor = dynamic(() => import('./code-editor').then(mod => ({ default: mod.CodeEditor })), {
  loading: () => <EditorSkeleton />,
  ssr: false,
})

const ChatPanel = dynamic(() => import('./chat-panel').then(mod => ({ default: mod.ChatPanel })), {
  loading: () => <ChatSkeleton />,
  ssr: false,
})

const GitPanel = dynamic(() => import('./git-panel').then(mod => ({ default: mod.GitPanel })), {
  loading: () => <GitPanelSkeleton />,
  ssr: false,
})

const WebContainerPreview = dynamic(() => import('./webcontainer-preview').then(mod => ({ default: mod.WebContainerPreview })), {
  loading: () => <PreviewSkeleton />,
  ssr: false,
})

const Terminal = dynamic(() => import('./terminal').then(mod => ({ default: mod.Terminal })), {
  loading: () => <TerminalSkeleton />,
  ssr: false,
})

const DeploymentPanel = dynamic(() => import('@/components/vercel/deployment-panel').then(mod => ({ default: mod.DeploymentPanel })), {
  loading: () => <DeploymentSkeleton />,
  ssr: false,
})

interface WorkspaceLayoutProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
  isGuestMode?: boolean
}

export function WorkspaceLayout({ project, initialFiles, initialMessages, isVercelConnected, isGuestMode = false }: WorkspaceLayoutProps) {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [bottomView, setBottomView] = useState<'preview' | 'terminal'>('preview')
  const [rightView, setRightView] = useState<'chat' | 'git' | 'deploy'>('chat')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [fileSearchOpen, setFileSearchOpen] = useState(false)
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(true)  // Default: show preview only
  const [isFileTreeCollapsed, setIsFileTreeCollapsed] = useState(true)  // Default: hide file tree
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true)  // Default: hide chat panel
  const [isGenerating, setIsGenerating] = useState(false)  // Track AI file generation

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
      // Toggle editor - Ctrl/Cmd+E
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setIsEditorCollapsed(!isEditorCollapsed)
      }
      // Toggle file tree - Ctrl/Cmd+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setIsFileTreeCollapsed(!isFileTreeCollapsed)
      }
      // Toggle right panel (chat) - Ctrl/Cmd+J
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setIsRightPanelCollapsed(!isRightPanelCollapsed)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bottomView, isEditorCollapsed, isFileTreeCollapsed, isRightPanelCollapsed])

  const handleCommandAction = (action: string) => {
    switch (action) {
      case 'new-file':
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
      case 'toggle-editor':
        setIsEditorCollapsed(!isEditorCollapsed)
        break
      case 'toggle-sidebar':
        setIsFileTreeCollapsed(!isFileTreeCollapsed)
        break
      case 'toggle-chat':
        setIsRightPanelCollapsed(!isRightPanelCollapsed)
        break
      case 'settings':
        window.location.href = '/settings'
        break
      default:
        console.log('Command action:', action)
    }
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gray-50">
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
          {!isFileTreeCollapsed && (
            <>
              <ResizablePanel defaultSize={18} minSize={12} maxSize={25}>
                <div className="h-full flex flex-col bg-white border-r border-gray-200">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Explorer</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          onClick={() => setIsFileTreeCollapsed(true)}
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Hide sidebar (Ctrl+B)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FileTree
                    files={files}
                    projectId={project.id}
                    activeFileId={activeFileId}
                    onFileSelect={setActiveFileId}
                    onFilesChange={setFiles}
                    isGenerating={isGenerating}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-gray-100 hover:bg-emerald-300 transition-colors" />
            </>
          )}

          {/* Collapsed File Tree Toggle */}
          {isFileTreeCollapsed && (
            <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setIsFileTreeCollapsed(false)}
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Show sidebar (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={isFileTreeCollapsed ? 50 : 45} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              {!isEditorCollapsed && (
                <>
                  <ResizablePanel defaultSize={55} minSize={20}>
                    <div className="h-full flex flex-col bg-white">
                      {/* Editor Header */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {activeFile?.path || 'No file selected'}
                          </span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-gray-600"
                              onClick={() => setIsEditorCollapsed(true)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Collapse editor (Ctrl+E)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <CodeEditor
                          file={activeFile}
                          projectId={project.id}
                          onFileUpdate={(updatedFile) => {
                            setFiles(files.map(f => f.id === updatedFile.id ? updatedFile : f))
                          }}
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle className="h-1 bg-gray-100 hover:bg-emerald-300 transition-colors" />
                </>
              )}

              {/* Collapsed Editor Toggle */}
              {isEditorCollapsed && (
                <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Editor collapsed</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => setIsEditorCollapsed(false)}
                      >
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show Editor
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expand editor (Ctrl+E)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Preview / Terminal */}
              <ResizablePanel defaultSize={isEditorCollapsed ? 100 : 45} minSize={20}>
                <div className="h-full flex flex-col bg-white">
                  {/* Tabs */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border-b border-gray-100">
                    <Button
                      variant={bottomView === 'preview' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setBottomView('preview')}
                      className={bottomView === 'preview'
                        ? 'h-8 bg-gradient-to-r from-emerald-600 via-emerald-600 to-indigo-600 text-white border-0 shadow-sm rounded-lg'
                        : 'h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
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
                        ? 'h-8 bg-gradient-to-r from-emerald-600 via-emerald-600 to-indigo-600 text-white border-0 shadow-sm rounded-lg'
                        : 'h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
                      }
                    >
                      <TerminalIcon className="h-4 w-4 mr-2" />
                      Terminal
                    </Button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
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

          {/* Right Sidebar - AI Chat / Git Panel / Deploy */}
          {!isRightPanelCollapsed && (
            <>
              <ResizableHandle className="w-1 bg-gray-100 hover:bg-emerald-300 transition-colors" />
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                <div className="h-full flex flex-col bg-white">
                  {/* Tabs */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border-b border-gray-100">
                    <Button
                      variant={rightView === 'chat' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRightView('chat')}
                      className={rightView === 'chat'
                        ? 'h-8 bg-gradient-to-r from-emerald-600 via-emerald-600 to-indigo-600 text-white border-0 shadow-sm rounded-lg'
                        : 'h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
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
                        ? 'h-8 bg-gradient-to-r from-emerald-600 via-emerald-600 to-indigo-600 text-white border-0 shadow-sm rounded-lg'
                        : 'h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
                      }
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      Git
                    </Button>
                    <Button
                      variant={rightView === 'deploy' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRightView('deploy')}
                      className={rightView === 'deploy'
                        ? 'h-8 bg-gradient-to-r from-emerald-600 via-emerald-600 to-indigo-600 text-white border-0 shadow-sm rounded-lg'
                        : 'h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
                      }
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                    <div className="flex-1"></div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          onClick={() => setIsRightPanelCollapsed(true)}
                        >
                          <PanelRightClose className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Hide panel (Ctrl+J)</p>
                      </TooltipContent>
                    </Tooltip>
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
                        onGeneratingChange={setIsGenerating}
                      />
                    ) : rightView === 'git' ? (
                      <GitPanel
                        project={project}
                        files={files}
                        onRefresh={() => {
                          window.location.reload()
                        }}
                      />
                    ) : (
                      <div className="h-full overflow-auto p-4">
                        <DeploymentPanel
                          project={project}
                          isVercelConnected={isVercelConnected}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}

          {/* Collapsed Right Panel Toggle */}
          {isRightPanelCollapsed && (
            <div className="w-12 bg-white border-l border-gray-200 flex flex-col items-center py-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setIsRightPanelCollapsed(false)}
                  >
                    <PanelRightOpen className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Show panel (Ctrl+J)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => { setIsRightPanelCollapsed(false); setRightView('chat'); }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>AI Chat</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => { setIsRightPanelCollapsed(false); setRightView('git'); }}
                  >
                    <GitBranch className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Git</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => { setIsRightPanelCollapsed(false); setRightView('deploy'); }}
                  >
                    <Rocket className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Deploy</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  )
}
