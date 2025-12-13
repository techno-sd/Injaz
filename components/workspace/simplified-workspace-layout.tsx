'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { SimplifiedFileTree } from './simplified-file-tree'
import { CodeEditor } from './code-editor'
import { SimplifiedWorkspaceHeader } from './simplified-workspace-header'
import { SimplifiedAIChat } from './simplified-ai-chat'
import { Button } from '@/components/ui/button'
import {
  Globe,
  Terminal as TerminalIcon,
  Sparkles,
  Code2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { Project, File, Message } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Lazy load heavy components
const WebContainerPreview = lazy(() =>
  import('./webcontainer-preview').then((mod) => ({ default: mod.WebContainerPreview }))
)
const Terminal = lazy(() =>
  import('./terminal').then((mod) => ({ default: mod.Terminal }))
)

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

interface SimplifiedWorkspaceLayoutProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
}

type ViewMode = 'split' | 'code' | 'preview'
type BottomView = 'preview' | 'terminal'

export function SimplifiedWorkspaceLayout({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected
}: SimplifiedWorkspaceLayoutProps) {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [bottomView, setBottomView] = useState<BottomView>('preview')
  const [showAIChat, setShowAIChat] = useState(true)
  const [showFiles, setShowFiles] = useState(true)

  const activeFile = files.find((f) => f.id === activeFileId)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle AI chat - Ctrl/Cmd+I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        setShowAIChat(!showAIChat)
      }
      // Toggle preview - Ctrl/Cmd+P
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setViewMode(viewMode === 'preview' ? 'split' : 'preview')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAIChat, viewMode])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      project_id: project.id,
      created_at: new Date().toISOString()
    }
    setMessages([...messages, newMessage])

    // TODO: Call AI API and update files
    // For now, just add a placeholder response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand! I\'ll help you with that. Let me update your code...',
        project_id: project.id,
        created_at: new Date().toISOString()
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        <SimplifiedWorkspaceHeader
          project={project}
          onAskAI={() => setShowAIChat(true)}
          onPreview={() => setViewMode('preview')}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Files (Collapsible) */}
          <div className={`relative transition-all duration-300 ${showFiles ? 'w-64' : 'w-0'}`}>
            {showFiles && (
              <SimplifiedFileTree
                files={files}
                activeFileId={activeFileId}
                onFileSelect={setActiveFileId}
                onAskAI={() => setShowAIChat(true)}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFiles(!showFiles)}
              className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background shadow-md z-10"
            >
              {showFiles ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* View Mode Toggle */}
            <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'code' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('code')}
                      className={viewMode === 'code' ? 'gradient-primary text-white' : ''}
                    >
                      <Code2 className="h-4 w-4 mr-2" />
                      Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View code editor only</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'split' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('split')}
                      className={viewMode === 'split' ? 'gradient-primary text-white' : ''}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Split View
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View code and preview side-by-side</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'preview' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('preview')}
                      className={viewMode === 'preview' ? 'gradient-primary text-white' : ''}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View live preview only</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={bottomView === 'preview' ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => setBottomView(bottomView === 'terminal' ? 'preview' : 'terminal')}
                >
                  <TerminalIcon className="h-4 w-4 mr-2" />
                  {bottomView === 'terminal' ? 'Hide' : 'Show'} Terminal
                </Button>
              </div>
            </div>

            {/* Editor and Preview */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'code' ? (
                // Code only
                <CodeEditor
                  file={activeFile}
                  projectId={project.id}
                  onFileUpdate={(updatedFile) => {
                    setFiles(files.map((f) => (f.id === updatedFile.id ? updatedFile : f)))
                  }}
                />
              ) : viewMode === 'preview' ? (
                // Preview only
                <div className="h-full">
                  <Suspense fallback={<LoadingFallback />}>
                    {bottomView === 'terminal' ? (
                      <Terminal projectId={project.id} />
                    ) : (
                      <WebContainerPreview projectId={project.id} files={files} />
                    )}
                  </Suspense>
                </div>
              ) : (
                // Split view
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <CodeEditor
                      file={activeFile}
                      projectId={project.id}
                      onFileUpdate={(updatedFile) => {
                        setFiles(files.map((f) => (f.id === updatedFile.id ? updatedFile : f)))
                      }}
                    />
                  </ResizablePanel>
                  <ResizableHandle className="w-1 bg-border hover:bg-primary transition-colors" />
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <Suspense fallback={<LoadingFallback />}>
                      {bottomView === 'terminal' ? (
                        <Terminal projectId={project.id} />
                      ) : (
                        <WebContainerPreview projectId={project.id} files={files} />
                      )}
                    </Suspense>
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </div>
          </div>

          {/* Right Sidebar - AI Chat (Collapsible) */}
          <div className={`relative transition-all duration-300 border-l ${showAIChat ? 'w-96' : 'w-0'}`}>
            {showAIChat && (
              <SimplifiedAIChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={false}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAIChat(!showAIChat)}
              className="absolute -left-3 top-4 h-6 w-6 rounded-full border bg-background shadow-md z-10"
            >
              {showAIChat ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Floating AI Button (when chat is hidden) */}
        {!showAIChat && (
          <Button
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full gradient-primary text-white shadow-2xl hover:shadow-3xl transition-all z-50"
            size="icon"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}
