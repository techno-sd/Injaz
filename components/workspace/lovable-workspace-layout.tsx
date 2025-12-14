'use client'

import { useState, useEffect, useCallback, type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  FolderOpen,
  X,
  Sparkles,
  Code2,
  FileCode,
  Share2,
  Plus,
  FileText,
  Image,
  Eye,
  MessageSquare,
  ChevronLeft,
  Terminal,
  Github,
  RefreshCw,
  Loader2,
  Zap,
  Save,
  AlertTriangle,
  LogIn,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { saveGuestProject, checkAuth } from '@/app/actions/projects'
import { EditorSkeleton } from './loading-skeleton'
import type { Project, File, Message } from '@/types'

// Lazy load heavy components
const CodeEditor = dynamic(() => import('./code-editor').then(mod => ({ default: mod.CodeEditor })), {
  loading: () => <EditorSkeleton />,
  ssr: false,
})

const LivePreview = dynamic(() => import('./live-preview').then(mod => ({ default: mod.LivePreview })), {
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0d0d12]">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  ),
  ssr: false,
})

import { AIChatbot } from './ai-chatbot'

interface LovableWorkspaceLayoutProps {
  project: Project
  initialFiles: File[]
  initialMessages: Message[]
  isVercelConnected: boolean
  isGuestMode?: boolean
}

// File icon helper
function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'html': return <FileCode className="h-4 w-4 text-orange-400" />
    case 'css': return <FileCode className="h-4 w-4 text-blue-400" />
    case 'js': case 'jsx': return <FileCode className="h-4 w-4 text-yellow-400" />
    case 'ts': case 'tsx': return <FileCode className="h-4 w-4 text-blue-500" />
    case 'json': return <FileCode className="h-4 w-4 text-green-400" />
    case 'md': return <FileText className="h-4 w-4 text-white/50" />
    case 'png': case 'jpg': case 'svg': return <Image className="h-4 w-4 text-purple-400" />
    default: return <FileText className="h-4 w-4 text-white/40" />
  }
}

// View modes for the main content area
type ViewMode = 'preview' | 'code' | 'split' | 'terminal'

// Mobile view tabs
type MobileView = 'chat' | 'code' | 'preview'

export function LovableWorkspaceLayout({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected,
  isGuestMode = false,
}: LovableWorkspaceLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [openTabs, setOpenTabs] = useState<string[]>(
    initialFiles.length > 0 ? [initialFiles[0].id] : []
  )
  const [showFileDrawer, setShowFileDrawer] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [mobileView, setMobileView] = useState<MobileView>('chat')
  const [isMobile, setIsMobile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check if this is a temporary/unsaved project
  const isTemporaryProject = project.id.startsWith('new-') || project.id === 'demo' || project.id === 'new'
  const hasGeneratedFiles = files.length > 3 || files.some(f => f.content && f.content.length > 200)

  // Track if we've auto-saved
  const [hasAutoSaved, setHasAutoSaved] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null)

  // Check auth status on mount
  useEffect(() => {
    checkAuth().then(({ isAuthenticated }) => setIsAuthenticated(isAuthenticated))
  }, [])

  // Auto-save for logged-in users when files are generated
  useEffect(() => {
    // Only auto-save if:
    // 1. User is authenticated
    // 2. This is a temporary project
    // 3. We haven't already auto-saved
    // 4. There are generated files (more than initial 3 starter files)
    if (
      isAuthenticated &&
      isTemporaryProject &&
      !hasAutoSaved &&
      hasGeneratedFiles &&
      files.length > 3
    ) {
      const autoSave = async () => {
        try {
          const result = await saveGuestProject({
            name: project.name || 'My Project',
            description: project.description,
            platform: (project as any).platform || 'website',
            files: files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.language,
            })),
          })

          if (result.success && result.projectId) {
            setHasAutoSaved(true)
            setSavedProjectId(result.projectId)
            toast({
              title: 'Project Auto-Saved',
              description: 'Your project has been saved to your account.',
            })
            // Redirect to saved project after a short delay
            setTimeout(() => {
              router.push(`/workspace/${result.projectId}`)
            }, 1500)
          }
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }

      // Debounce auto-save to avoid saving during rapid file generation
      const timer = setTimeout(autoSave, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isTemporaryProject, hasAutoSaved, hasGeneratedFiles, files, project, router, toast])

  // Save project handler
  const handleSaveProject = async () => {
    if (!isTemporaryProject) return

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    setIsSaving(true)
    try {
      const result = await saveGuestProject({
        name: project.name || 'My Project',
        description: project.description,
        platform: (project as any).platform || 'website',
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.language,
        })),
      })

      if (result.success && result.projectId) {
        toast({
          title: 'Project Saved!',
          description: 'Your project has been saved to your account.',
        })
        // Redirect to the saved project
        router.push(`/workspace/${result.projectId}`)
      } else {
        toast({
          title: 'Save Failed',
          description: result.error || 'Failed to save project',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const activeFile = files.find(f => f.id === activeFileId)

  const handleFileUpdate = useCallback((updatedFile: File) => {
    setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)))
  }, [])

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId)
    if (!openTabs.includes(fileId)) {
      setOpenTabs([...openTabs, fileId])
    }
    setShowFileDrawer(false)
    if (isMobile) {
      setMobileView('code')
    }
  }

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = openTabs.filter(id => id !== fileId)
    setOpenTabs(newTabs)
    if (activeFileId === fileId) {
      setActiveFileId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
    }
  }

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(prevFiles => {
      // Find newly added files (files that weren't in previous state)
      const prevIds = new Set(prevFiles.map(f => f.id))
      const newlyAddedFiles = newFiles.filter(f => !prevIds.has(f.id))

      // Check if any existing files were modified
      const hasModifiedFiles = newFiles.some(newFile => {
        const prevFile = prevFiles.find(f => f.id === newFile.id)
        return prevFile && prevFile.content !== newFile.content
      })

      // Schedule tab and preview updates after state update
      // Always refresh preview if files were modified OR new files added
      setTimeout(() => {
        if (newlyAddedFiles.length > 0) {
          const newTabIds = newlyAddedFiles.map(f => f.id)
          setOpenTabs(prev => [...new Set([...prev, ...newTabIds])])

          // Set active file to index.html if it exists, otherwise first new file
          const indexFile = newlyAddedFiles.find(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
          const fileToActivate = indexFile || newlyAddedFiles[0]
          if (fileToActivate) {
            setActiveFileId(fileToActivate.id)
          }
        }

        // Preview refresh is handled automatically by LivePreview component
      }, 0)

      return newFiles
    })
  }, [])

  
  // Mobile bottom navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-4">
        <button
          onClick={() => setMobileView('chat')}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'chat'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px] font-medium">AI Chat</span>
        </button>
        <button
          onClick={() => setMobileView('code')}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'code'
              ? 'text-cyan-400 bg-cyan-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Code2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Code</span>
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'preview'
              ? 'text-emerald-400 bg-emerald-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Eye className="h-5 w-5" />
          <span className="text-[10px] font-medium">Preview</span>
        </button>
      </div>
    </div>
  )

  // Get platform from project
  const projectPlatform = (project as any).platform || 'webapp'

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-[#08080c]">
        {/* Header - Bolt Style */}
        <header className="h-12 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-3 z-50">
          {/* Left - Logo & Project Name */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.06]"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{project.name}</span>
                {isGuestMode && (
                  <Badge className="bg-white/[0.06] text-white/60 border-0 text-[10px] px-1.5">
                    Demo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Center - View Toggle Toolbar */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border border-border/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('preview')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'preview'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Preview Only</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('code')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'code'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Code2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Code Only</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('split')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'split'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-4 bg-current rounded-[1px]" />
                    <div className="w-1.5 h-4 bg-current rounded-[1px] opacity-50" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>Split View</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('terminal')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'terminal'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Terminal className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Terminal</TooltipContent>
            </Tooltip>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {!isTemporaryProject && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                >
                  <Github className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button className="h-8 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg border-0">
                  Publish
                </Button>
              </>
            )}
            {isTemporaryProject && (
              <Button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg border-0 gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isAuthenticated ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : isAuthenticated ? 'Save Project' : 'Sign in to Save'}
              </Button>
            )}
          </div>
        </header>

        {/* Unsaved Project Banner */}
        {isTemporaryProject && hasGeneratedFiles && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Your project is not saved. {isAuthenticated ? 'Click "Save Project" to keep your work.' : 'Sign in to save your progress.'}
              </span>
            </div>
            <Button
              onClick={handleSaveProject}
              disabled={isSaving}
              size="sm"
              className="h-7 px-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium"
            >
              {isSaving ? 'Saving...' : isAuthenticated ? 'Save Now' : 'Sign In'}
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-1">
            {/* AI Chat Panel - Bolt Style */}
            <div className="w-[420px] border-r border-white/[0.06] flex flex-col bg-[#0a0a0f]">
              <AIChatbot
                projectId={project.id}
                files={files}
                onFilesChange={handleFilesChange}
                platform={(project as any).platform || 'webapp'}
              />
            </div>

            {/* Main Content Area - Code + Preview */}
            <div className="flex-1 flex flex-col">
              {viewMode === 'preview' && (
                <LivePreview files={files} platform={projectPlatform} onFilesChange={handleFilesChange} />
              )}

              {viewMode === 'code' && (
                <div className="h-full flex flex-col bg-[#0d0d12]">
                  {/* File Tabs */}
                  <div className="h-10 border-b border-white/[0.06] flex items-center gap-1 px-2 bg-white/[0.02]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]"
                      onClick={() => setShowFileDrawer(true)}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-white/[0.08] mx-1" />
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                      {openTabs.map((tabId) => {
                        const file = files.find(f => f.id === tabId)
                        if (!file) return null
                        return (
                          <button
                            key={tabId}
                            onClick={() => setActiveFileId(tabId)}
                            className={cn(
                              'flex items-center gap-2 px-3 h-7 rounded-lg text-xs font-medium transition-colors flex-shrink-0',
                              activeFileId === tabId
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                            )}
                          >
                            {getFileIcon(file.path)}
                            <span>{file.path.split('/').pop()}</span>
                            <X
                              className="h-3 w-3 opacity-50 hover:opacity-100"
                              onClick={(e) => handleCloseTab(tabId, e)}
                            />
                          </button>
                        )
                      })}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 overflow-hidden">
                    {activeFile ? (
                      <CodeEditor
                        file={activeFile}
                        projectId={project.id}
                        onFileUpdate={handleFileUpdate}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/40">
                        <div className="text-center">
                          <FileCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Select a file to edit</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'split' && (
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                  {/* Code Panel */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col bg-[#0d0d12]">
                      {/* File Tabs */}
                      <div className="h-10 border-b border-white/[0.06] flex items-center gap-1 px-2 bg-white/[0.02]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]"
                          onClick={() => setShowFileDrawer(true)}
                        >
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        <div className="h-4 w-px bg-white/[0.08] mx-1" />
                        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                          {openTabs.map((tabId) => {
                            const file = files.find(f => f.id === tabId)
                            if (!file) return null
                            return (
                              <button
                                key={tabId}
                                onClick={() => setActiveFileId(tabId)}
                                className={cn(
                                  'flex items-center gap-2 px-3 h-7 rounded-lg text-xs font-medium transition-colors flex-shrink-0',
                                  activeFileId === tabId
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                )}
                              >
                                {getFileIcon(file.path)}
                                <span>{file.path.split('/').pop()}</span>
                                <X
                                  className="h-3 w-3 opacity-50 hover:opacity-100"
                                  onClick={(e) => handleCloseTab(tabId, e)}
                                />
                              </button>
                            )
                          })}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Editor */}
                      <div className="flex-1 overflow-hidden">
                        {activeFile ? (
                          <CodeEditor
                            file={activeFile}
                            projectId={project.id}
                            onFileUpdate={handleFileUpdate}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-white/40">
                            <div className="text-center">
                              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                              <p>Select a file to edit</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle className="w-px bg-white/[0.06] hover:bg-purple-500/50 transition-colors" />

                  {/* Preview Panel */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <LivePreview files={files} platform={projectPlatform} onFilesChange={handleFilesChange} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}

              {viewMode === 'terminal' && (
                <div className="h-full flex flex-col bg-[#0d0d12]">
                  <div className="h-10 border-b border-white/[0.06] flex items-center px-4 bg-white/[0.02]">
                    <Terminal className="h-4 w-4 text-white/50 mr-2" />
                    <span className="text-sm text-white/70">Terminal</span>
                  </div>
                  <div className="flex-1 p-4 font-mono text-sm text-white/70">
                    <p className="text-green-400">$ npm run dev</p>
                    <p className="text-white/50 mt-2">Starting development server...</p>
                    <p className="text-cyan-400 mt-1">Ready on http://localhost:3000</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex-1 flex flex-col">
            {mobileView === 'chat' && (
              <div className="flex-1 overflow-hidden bg-[#0a0a0f]">
                <AIChatbot
                  projectId={project.id}
                  files={files}
                  onFilesChange={handleFilesChange}
                  platform={(project as any).platform || 'webapp'}
                />
              </div>
            )}

            {mobileView === 'code' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d12]">
                <div className="h-10 border-b border-white/[0.06] flex items-center gap-1 px-2 bg-white/[0.02]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]"
                    onClick={() => setShowFileDrawer(true)}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-white/[0.08] mx-1" />
                  <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {openTabs.map((tabId) => {
                      const file = files.find(f => f.id === tabId)
                      if (!file) return null
                      return (
                        <button
                          key={tabId}
                          onClick={() => setActiveFileId(tabId)}
                          className={cn(
                            'flex items-center gap-2 px-2 h-7 rounded-lg text-xs font-medium transition-colors flex-shrink-0',
                            activeFileId === tabId
                              ? 'bg-white/[0.08] text-white'
                              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                          )}
                        >
                          {getFileIcon(file.path)}
                          <span className="max-w-[60px] truncate">{file.path.split('/').pop()}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {activeFile ? (
                    <CodeEditor
                      file={activeFile}
                      projectId={project.id}
                      onFileUpdate={handleFileUpdate}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/40 p-4">
                      <div className="text-center">
                        <FileCode className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Select a file to edit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mobileView === 'preview' && (
              <LivePreview files={files} platform={projectPlatform} onFilesChange={handleFilesChange} />
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* File Drawer Overlay */}
        <AnimatePresence>
          {showFileDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowFileDrawer(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-[280px] sm:w-80 bg-[#0d0d12] border-r border-white/[0.06] z-50 shadow-2xl"
              >
                <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-white">
                    <FolderOpen className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">Files</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/[0.06]"
                    onClick={() => setShowFileDrawer(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                        activeFileId === file.id
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                      )}
                    >
                      {getFileIcon(file.path)}
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06] bg-[#0d0d12]">
                  <Button variant="outline" className="w-full gap-2 border-white/[0.1] text-white/70 hover:bg-white/[0.06] hover:text-white">
                    <Plus className="h-4 w-4" />
                    Add File
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
