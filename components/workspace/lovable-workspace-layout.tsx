'use client'

import { useState, useEffect, useCallback, useMemo, type ComponentType } from 'react'
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
  ChevronRight,
  Github,
  RefreshCw,
  Loader2,
  Zap,
  Save,
  AlertTriangle,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { saveGuestProject, checkAuth } from '@/app/actions/projects'
import { EditorSkeleton } from './loading-skeleton'
import { KeyboardShortcutsModal } from './keyboard-shortcuts-modal'
import { CommandPalette } from './command-palette'
import { useWorkspacePanelConfig } from '@/lib/hooks/use-persisted-state'
import { useWorkspaceShortcuts } from '@/lib/hooks/use-workspace-shortcuts'
import type { Project, File, Message } from '@/types'

// Lazy load heavy components
const CodeEditor = dynamic(() => import('./code-editor').then(mod => ({ default: mod.CodeEditor })), {
  loading: () => <EditorSkeleton />,
  ssr: false,
})

const LivePreview = dynamic(() => import('./live-preview').then(mod => ({ default: mod.LivePreview })), {
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0d0d12]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  ),
  ssr: false,
})

const WebContainerPreview = dynamic(() => import('./webcontainer-preview').then(mod => ({ default: mod.WebContainerPreview })), {
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0d0d12]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm text-white/60">Starting WebContainer...</span>
      </div>
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
  initialPrompt?: string
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
    case 'png': case 'jpg': case 'svg': return <Image className="h-4 w-4 text-emerald-400" />
    default: return <FileText className="h-4 w-4 text-white/40" />
  }
}

// Check if project should use WebContainer preview (React/Vite based)
// Returns true for most cases to use WebContainer as the default preview
function needsWebContainer(files: File[]): boolean {
  // Default to true for empty/new projects
  if (files.length === 0) return true

  // Check for any React/JSX/TSX/JS files
  const hasWebFiles = files.some(f =>
    f.path.endsWith('.tsx') ||
    f.path.endsWith('.jsx') ||
    f.path.endsWith('.ts') ||
    f.path.endsWith('.js') ||
    f.path.includes('pages/') ||
    f.path.includes('components/') ||
    f.path.includes('src/')
  )

  if (hasWebFiles) return true

  // Also check for package.json
  const hasPackageJson = files.some(f => f.path === 'package.json')
  if (hasPackageJson) return true

  // Check for any HTML/CSS files (static site)
  const hasStaticFiles = files.some(f =>
    f.path.endsWith('.html') ||
    f.path.endsWith('.css')
  )

  // Default to WebContainer for most projects
  return hasStaticFiles || files.length < 10
}

// View modes for the main content area
type ViewMode = 'preview' | 'code' | 'split'

// Mobile view tabs
type MobileView = 'chat' | 'code' | 'preview'

export function LovableWorkspaceLayout({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected,
  isGuestMode = false,
  initialPrompt,
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
  const [mobileView, setMobileView] = useState<MobileView>('chat')
  const [isMobile, setIsMobile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Error capture callback for AI Fix feature
  const [captureErrorFn, setCaptureErrorFn] = useState<((error: { message: string; stack?: string }) => void) | null>(null)

  // Persistent workspace panel configuration
  const {
    config,
    setViewMode,
    setShowChat: setShowChatPanel,
    setShowFileExplorer,
  } = useWorkspacePanelConfig()

  // Extract values from config for easier use
  const viewMode = config.viewMode
  const showChatPanel = config.showChat
  const showFileExplorer = config.showFileExplorer


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
            description: project.description || undefined,
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
        description: project.description || undefined,
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

          // Auto-switch to preview/split mode when files are generated
          // This helps users see the result immediately
          if (newlyAddedFiles.length >= 3 && viewMode === 'code') {
            setViewMode('split')
          }
        }

        // Preview refresh is handled automatically by LivePreview component
      }, 0)

      return newFiles
    })
  }, [])

  // Command palette handler
  const handleCommand = useCallback((command: string) => {
    switch (command) {
      case 'file.save':
        handleSaveProject()
        break
      case 'view.terminal':
        // TODO: Implement terminal toggle
        break
      case 'view.preview':
        setViewMode(viewMode === 'preview' ? 'code' : 'preview')
        break
      case 'preview.refresh':
        // Trigger preview refresh by incrementing a key
        break
      case 'settings.open':
        // TODO: Open settings modal
        break
      default:
        console.log('Command not implemented:', command)
    }
  }, [viewMode, setViewMode])

  // Keyboard shortcuts - defined after handlers are available
  useWorkspaceShortcuts({
    toggleFileExplorer: () => setShowFileExplorer(!showFileExplorer),
    toggleChat: () => setShowChatPanel(!showChatPanel),
    togglePreview: () => setViewMode(viewMode === 'preview' ? 'code' : 'preview'),
    save: handleSaveProject,
    openCommandPalette: () => {/* Command palette opens itself via its own listener */},
    setCodeView: () => setViewMode('code'),
    setPreviewView: () => setViewMode('preview'),
    setSplitView: () => setViewMode('split'),
    focusChat: () => setShowChatPanel(true),
    focusEditor: () => setViewMode('code'),
    openKeyboardShortcuts: () => setShowShortcutsModal(true),
  })

  // Mobile bottom navigation
  const MobileNav = () => (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-2 px-4" role="group">
        <button
          onClick={() => setMobileView('chat')}
          aria-pressed={mobileView === 'chat'}
          aria-label="AI Chat"
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'chat'
              ? 'text-emerald-400 bg-emerald-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">AI Chat</span>
        </button>
        <button
          onClick={() => setMobileView('code')}
          aria-pressed={mobileView === 'code'}
          aria-label="Code editor"
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'code'
              ? 'text-cyan-400 bg-cyan-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Code2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">Code</span>
        </button>
        <button
          onClick={() => setMobileView('preview')}
          aria-pressed={mobileView === 'preview'}
          aria-label="Preview"
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
            mobileView === 'preview'
              ? 'text-emerald-400 bg-emerald-500/15'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">Preview</span>
        </button>
      </div>
    </nav>
  )

  // Get platform from project
  const projectPlatform = (project as any).platform || 'webapp'

  // Check if this project needs WebContainer (Vite, Next.js, etc.)
  const useWebContainer = useMemo(() => needsWebContainer(files), [files])

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
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
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
          <div
            className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border border-border/50"
            role="group"
            aria-label="View mode"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('preview')}
                  aria-label="Preview only"
                  aria-pressed={viewMode === 'preview'}
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
              <TooltipContent>Preview Only (Ctrl+1)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('code')}
                  aria-label="Code only"
                  aria-pressed={viewMode === 'code'}
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
              <TooltipContent>Code Only (Ctrl+2)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('split')}
                  aria-label="Split view"
                  aria-pressed={viewMode === 'split'}
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

          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Keyboard Shortcuts Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                  onClick={() => setShowShortcutsModal(true)}
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts (Ctrl+Shift+/)</TooltipContent>
            </Tooltip>

            {!isTemporaryProject && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                      aria-label="Refresh preview"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                      aria-label="GitHub repository"
                    >
                      <Github className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>GitHub</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"
                      aria-label="Share project"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                <Button className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg border-0">
                  Publish
                </Button>
              </>
            )}
            {isTemporaryProject && (
              <Button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg border-0 gap-2"
                aria-label={isSaving ? 'Saving project' : isAuthenticated ? 'Save project' : 'Sign in to save'}
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
            {/* AI Chat Panel - Collapsible */}
            {showChatPanel ? (
              <aside
                className="w-[420px] border-r border-white/[0.06] flex flex-col bg-[#0a0a0f] relative"
                aria-label="AI Chat panel"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 z-10 text-white/50 hover:text-white hover:bg-white/[0.06]"
                      onClick={() => setShowChatPanel(false)}
                      aria-label="Hide chat panel"
                      aria-expanded="true"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Hide Chat (Ctrl+J)</TooltipContent>
                </Tooltip>
                <AIChatbot
                  projectId={project.id}
                  files={files}
                  onFilesChange={handleFilesChange}
                  platform={(project as any).platform || 'webapp'}
                  initialPrompt={initialPrompt}
                  onCaptureErrorReady={(fn) => setCaptureErrorFn(() => fn)}
                />
              </aside>
            ) : (
              <aside
                className="w-12 border-r border-white/[0.06] flex flex-col items-center py-3 gap-2 bg-[#0a0a0f]"
                aria-label="Collapsed chat panel"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setShowChatPanel(true)}
                      aria-label="Show chat panel"
                      aria-expanded="false"
                    >
                      <PanelLeftOpen className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Show Chat (Ctrl+J)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setShowChatPanel(true)}
                      aria-label="AI Chat"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">AI Chat</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setShowChatPanel(true)}
                      aria-label="Ask AI"
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Ask AI</TooltipContent>
                </Tooltip>
              </aside>
            )}

            {/* Main Content Area - Code + Preview */}
            <div className="flex-1 flex flex-col">
              {viewMode === 'preview' && (
                useWebContainer ? (
                  <WebContainerPreview
                    projectId={project.id}
                    files={files}
                    platform={projectPlatform}
                    onError={captureErrorFn || undefined}
                  />
                ) : (
                  <LivePreview
                    files={files}
                    platform={projectPlatform}
                    onFilesChange={handleFilesChange}
                  />
                )
              )}

              {viewMode === 'code' && (
                <div className="h-full flex bg-[#0d0d12]">
                  {/* File Tree Sidebar */}
                  <div className="w-56 border-r border-white/[0.06] flex flex-col bg-[#0a0a0f]">
                    <div className="h-10 border-b border-white/[0.06] flex items-center px-3 bg-white/[0.02]">
                      <FolderOpen className="h-4 w-4 text-emerald-400 mr-2" />
                      <span className="text-sm font-medium text-white/80">Files</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                      {files.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => handleFileSelect(file.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                            activeFileId === file.id
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                          )}
                        >
                          {getFileIcon(file.path)}
                          <span className="truncate">{file.path}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Editor Area */}
                  <div className="flex-1 flex flex-col">
                    {/* File Tabs */}
                    <div className="h-10 border-b border-white/[0.06] flex items-center gap-1 px-2 bg-white/[0.02]">
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
                </div>
              )}

              {viewMode === 'split' && (
                <div className="h-full flex bg-[#0d0d12]">
                  {/* File Tree Sidebar */}
                  <div className="w-48 border-r border-white/[0.06] flex flex-col bg-[#0a0a0f]">
                    <div className="h-10 border-b border-white/[0.06] flex items-center px-3 bg-white/[0.02]">
                      <FolderOpen className="h-4 w-4 text-emerald-400 mr-2" />
                      <span className="text-sm font-medium text-white/80">Files</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                      {files.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => handleFileSelect(file.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                            activeFileId === file.id
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                          )}
                        >
                          {getFileIcon(file.path)}
                          <span className="truncate">{file.path}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code + Preview Resizable */}
                  <ResizablePanelGroup direction="horizontal" className="flex-1">
                    {/* Code Panel */}
                    <ResizablePanel defaultSize={50} minSize={25}>
                      <div className="h-full flex flex-col">
                        {/* File Tabs */}
                        <div className="h-10 border-b border-white/[0.06] flex items-center gap-1 px-2 bg-white/[0.02]">
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

                    <ResizableHandle className="w-px bg-white/[0.06] hover:bg-emerald-500/50 transition-colors" />

                    {/* Preview Panel */}
                    <ResizablePanel defaultSize={50} minSize={25}>
                      {useWebContainer ? (
                        <WebContainerPreview
                          projectId={project.id}
                          files={files}
                          platform={projectPlatform}
                          onError={captureErrorFn || undefined}
                        />
                      ) : (
                        <LivePreview
                          files={files}
                          platform={projectPlatform}
                          onFilesChange={handleFilesChange}
                        />
                      )}
                    </ResizablePanel>
                  </ResizablePanelGroup>
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
                  initialPrompt={initialPrompt}
                  onCaptureErrorReady={(fn) => setCaptureErrorFn(() => fn)}
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
              useWebContainer ? (
                <WebContainerPreview
                  projectId={project.id}
                  files={files}
                  platform={projectPlatform}
                  onError={captureErrorFn || undefined}
                />
              ) : (
                <LivePreview
                  files={files}
                  platform={projectPlatform}
                  onFilesChange={handleFilesChange}
                />
              )
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
                    <FolderOpen className="h-4 w-4 text-emerald-400" />
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
                          ? 'bg-emerald-500/15 text-emerald-300'
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

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          open={showShortcutsModal}
          onOpenChange={setShowShortcutsModal}
        />

        {/* Command Palette */}
        <CommandPalette onCommand={handleCommand} />
      </div>
    </TooltipProvider>
  )
}
