'use client'

import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Code2,
  Eye,
  Terminal as TerminalIcon,
  Sparkles,
  FileCode,
  Loader2,
  Play,
  Save,
  Settings,
  Command
} from 'lucide-react'
import type { Project, File, Message } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'
import { EnhancedFileTree } from './enhanced-file-tree'

// Lazy load heavy components
const WebContainerPreview = lazy(() =>
  import('./webcontainer-preview').then((mod) => ({ default: mod.WebContainerPreview }))
)

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-muted/30">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
)

interface EnhancedWorkspaceLayoutProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
}

export function EnhancedWorkspaceLayout({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected
}: EnhancedWorkspaceLayoutProps) {
  // State
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true)
  const [activeBottomTab, setActiveBottomTab] = useState<'preview' | 'terminal' | 'ai'>('preview')
  const [isSaving, setIsSaving] = useState(false)

  const activeFile = files.find((f) => f.id === activeFileId)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle left sidebar - Ctrl/Cmd+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setLeftSidebarOpen(!leftSidebarOpen)
      }
      // Toggle right sidebar - Ctrl/Cmd+Shift+B
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault()
        setRightSidebarOpen(!rightSidebarOpen)
      }
      // Toggle AI chat - Ctrl/Cmd+I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        setActiveBottomTab('ai')
        setBottomPanelOpen(true)
      }
      // Focus preview - Ctrl/Cmd+Shift+P
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setActiveBottomTab('preview')
        setBottomPanelOpen(true)
      }
      // Save - Ctrl/Cmd+S (handled by editor, but we can show feedback)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [leftSidebarOpen, rightSidebarOpen])

  const handleSave = useCallback(async () => {
    if (!activeFile) return
    setIsSaving(true)
    // Save logic here
    setTimeout(() => setIsSaving(false), 500)
  }, [activeFile])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Top Toolbar */}
        <div className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className="h-8 w-8 p-0"
                >
                  {leftSidebarOpen ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftOpen className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle Files {!leftSidebarOpen && '(⌘B)'}</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {project.name}
              </span>
            </div>
          </div>

          {/* Center section - Active file */}
          {activeFile && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-mono">{activeFile.path}</span>
              {isSaving && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={!activeFile}
                  className="h-8"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save changes (⌘S)</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className="h-8 w-8 p-0"
                >
                  {rightSidebarOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle Preview {!rightSidebarOpen && '(⌘⇧B)'}</p>
              </TooltipContent>
            </Tooltip>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left Sidebar - File Tree */}
            {leftSidebarOpen && (
              <>
                <ResizablePanel
                  defaultSize={20}
                  minSize={15}
                  maxSize={35}
                  className="bg-muted/30"
                >
                  <div className="h-full flex flex-col">
                    {/* File Tree Header */}
                    <div className="h-10 border-b bg-background/50 flex items-center justify-between px-3">
                      <span className="text-sm font-medium">Files</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Command className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* File Tree Content */}
                    <div className="flex-1 overflow-auto p-2">
                      {/* File tree component will go here */}
                      <div className="space-y-1">
                        {files.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => setActiveFileId(file.id)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded text-sm font-mono transition-colors",
                              activeFileId === file.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            {file.path}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Center - Code Editor & Bottom Panel */}
            <ResizablePanel defaultSize={leftSidebarOpen ? 50 : 70} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor */}
                <ResizablePanel defaultSize={bottomPanelOpen ? 60 : 100} minSize={30}>
                  <div className="h-full bg-background">
                    {activeFile ? (
                      <div className="h-full flex flex-col">
                        {/* Editor Toolbar */}
                        <div className="h-10 border-b bg-muted/30 flex items-center justify-between px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {activeFile.path}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              Format
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              Prettier
                            </Button>
                          </div>
                        </div>

                        {/* Monaco Editor will go here */}
                        <div className="flex-1">
                          <p className="p-4 text-sm text-muted-foreground">
                            Monaco Editor Component
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <FileCode className="h-12 w-12 mx-auto text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            Select a file to start editing
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                {/* Bottom Panel - Preview/Terminal/AI */}
                {bottomPanelOpen && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} minSize={20}>
                      <div className="h-full flex flex-col bg-background border-t">
                        {/* Bottom Panel Tabs */}
                        <Tabs
                          value={activeBottomTab}
                          onValueChange={(v) => setActiveBottomTab(v as any)}
                          className="flex-1 flex flex-col"
                        >
                          <div className="border-b bg-muted/30">
                            <TabsList className="h-10 bg-transparent border-0 rounded-none w-full justify-start px-3">
                              <TabsTrigger
                                value="preview"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </TabsTrigger>
                              <TabsTrigger
                                value="terminal"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                <TerminalIcon className="h-4 w-4 mr-2" />
                                Terminal
                              </TabsTrigger>
                              <TabsTrigger
                                value="ai"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI Assistant
                              </TabsTrigger>

                              <div className="ml-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setBottomPanelOpen(false)}
                                  className="h-7 w-7 p-0"
                                >
                                  <PanelLeftClose className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TabsList>
                          </div>

                          <TabsContent value="preview" className="flex-1 m-0 p-0">
                            <Suspense fallback={<LoadingFallback />}>
                              <WebContainerPreview
                                projectId={project.id}
                                files={files}
                              />
                            </Suspense>
                          </TabsContent>

                          <TabsContent value="terminal" className="flex-1 m-0 p-4">
                            <div className="text-sm text-muted-foreground">
                              Terminal Component
                            </div>
                          </TabsContent>

                          <TabsContent value="ai" className="flex-1 m-0 p-0">
                            <div className="h-full flex flex-col p-4">
                              <div className="text-sm text-muted-foreground">
                                AI Chat Component
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* Right Sidebar - Preview (when separate) */}
            {rightSidebarOpen && !bottomPanelOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <div className="h-full bg-background border-l">
                    <Suspense fallback={<LoadingFallback />}>
                      <WebContainerPreview
                        projectId={project.id}
                        files={files}
                      />
                    </Suspense>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-6 border-t bg-muted/50 flex items-center justify-between px-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {files.length} files
            </span>
            {activeFile && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono">{activeFile.path}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              WebContainer Ready
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
