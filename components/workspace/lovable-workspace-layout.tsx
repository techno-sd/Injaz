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
import { formatDistanceToNow } from 'date-fns'
import {
  FolderOpen,
  X,
  Sparkles,
  Code2,
  FileCode,
  Share2,
  Rocket,
  Plus,
  Lightbulb,
  FileText,
  Image,
  Home,
} from 'lucide-react'
import { EditorSkeleton } from './loading-skeleton'
import type { Project, File, Message } from '@/types'

// Lazy load heavy components
const CodeEditor = dynamic(() => import('./code-editor').then(mod => ({ default: mod.CodeEditor })), {
  loading: () => <EditorSkeleton />,
  ssr: false,
})

// Use simple iframe-based preview for fast loading
import { SimplePreview } from './simple-preview'
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
    case 'html': return <FileCode className="h-4 w-4 text-orange-500" />
    case 'css': return <FileCode className="h-4 w-4 text-blue-500" />
    case 'js': case 'jsx': return <FileCode className="h-4 w-4 text-yellow-500" />
    case 'ts': case 'tsx': return <FileCode className="h-4 w-4 text-blue-600" />
    case 'json': return <FileCode className="h-4 w-4 text-green-500" />
    case 'md': return <FileText className="h-4 w-4 text-gray-500" />
    case 'png': case 'jpg': case 'svg': return <Image className="h-4 w-4 text-purple-500" />
    default: return <FileText className="h-4 w-4 text-gray-400" />
  }
}

type StatusTone = 'neutral' | 'success' | 'warning'

interface StatusPillProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value?: string
  tone?: StatusTone
}

const pillVariants: Record<StatusTone, string> = {
  neutral: 'bg-muted/70 text-muted-foreground border border-border/60 dark:bg-[#1a1a1a] dark:text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300',
}

function StatusPill({ icon: Icon, label, value, tone = 'neutral' }: StatusPillProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide', pillVariants[tone])}>
      <Icon className="h-3.5 w-3.5" />
      {label}
      {value && (
        <span className="text-[10px] font-normal opacity-75">
          {value}
        </span>
      )}
    </span>
  )
}

export function LovableWorkspaceLayout({
  project,
  initialFiles,
  initialMessages,
  isVercelConnected,
  isGuestMode = false,
}: LovableWorkspaceLayoutProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFiles.length > 0 ? initialFiles[0].id : null
  )
  const [openTabs, setOpenTabs] = useState<string[]>(
    initialFiles.length > 0 ? [initialFiles[0].id] : []
  )
  const [showFileDrawer, setShowFileDrawer] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const activeFile = files.find(f => f.id === activeFileId)
  const totalFiles = files.length
  const lastSavedLabel = lastSavedAt
    ? formatDistanceToNow(lastSavedAt, { addSuffix: true })
    : 'Saving changes...'
  const vercelTone: StatusTone = isVercelConnected ? 'success' : 'warning'
  const vercelLabel = isVercelConnected ? 'Vercel linked' : 'Vercel not linked'

  useEffect(() => {
    setLastSavedAt(new Date())
  }, [])

  const handleFileUpdate = useCallback((updatedFile: File) => {
    setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)))
    setLastSavedAt(new Date())
  }, [])

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId)
    if (!openTabs.includes(fileId)) {
      setOpenTabs([...openTabs, fileId])
    }
    setShowFileDrawer(false)
  }

  // Handle tab close
  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = openTabs.filter(id => id !== fileId)
    setOpenTabs(newTabs)
    if (activeFileId === fileId) {
      setActiveFileId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
    }
  }

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles)
    setLastSavedAt(new Date())
  }, [])

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0a0a]">
        {/* Modern Header */}
        <header className="h-14 border-b bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => router.push('/dashboard')}
            >
              <Home className="h-4 w-4" />
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none">{project.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isGuestMode ? 'Demo Project' : 'Personal Project'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGuestMode && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Demo Mode
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0">
              <Rocket className="h-4 w-4" />
              Deploy
            </Button>
          </div>
        </header>

        {/* Workspace context bar */}
        <div className="border-b bg-white/70 dark:bg-[#101010]/80 backdrop-blur flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill icon={Sparkles} label="Copilot" value="Ready" />
            <StatusPill icon={Code2} label="Files" value={`${totalFiles}`} />
            <StatusPill icon={Rocket} label={vercelLabel} tone={vercelTone} />
            {isGuestMode && (
              <StatusPill icon={Lightbulb} label="Demo mode" tone="warning" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live preview
            </span>
            <span className="hidden sm:inline">Last saved {lastSavedLabel}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* AI Chat Panel */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-r flex flex-col overflow-hidden"
              >
                <AIChatbot
                  projectId={project.id}
                  files={files}
                  onFilesChange={handleFilesChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Chat Button */}
          {!showChat && (
            <div className="w-12 border-r bg-background flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(true)}
                className="h-10 w-10 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20"
              >
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          )}

          {/* Center & Right - Editor and Preview */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col bg-white dark:bg-[#0d0d0d]">
                {/* File Tabs */}
                <div className="h-10 border-b flex items-center gap-1 px-2 bg-muted/30">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg flex-shrink-0"
                        onClick={() => setShowFileDrawer(true)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Files</TooltipContent>
                  </Tooltip>
                  <div className="h-4 w-px bg-border mx-1" />
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
                              ? 'bg-white dark:bg-[#1a1a1a] shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg flex-shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New File</TooltipContent>
                  </Tooltip>
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
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Select a file to edit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-px bg-border hover:bg-violet-500 transition-colors" />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <SimplePreview files={files} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Status bar */}
        <footer className="h-11 border-t bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur flex flex-wrap items-center justify-between gap-3 px-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-foreground">
              {activeFile ? activeFile.path : 'No file selected'}
            </span>
            <span className="hidden sm:inline text-muted-foreground">·</span>
            <span className="hidden sm:inline truncate max-w-[220px]">
              {project.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Synced
            </span>
            <span>Auto-save · On</span>
          </div>
        </footer>

        {/* File Drawer Overlay */}
        <AnimatePresence>
          {showFileDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowFileDrawer(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-[#111] z-50 shadow-2xl"
              >
                {/* Drawer Header */}
                <div className="h-14 border-b flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="font-medium">Files</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowFileDrawer(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File List */}
                <div className="p-2 space-y-1">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        activeFileId === file.id
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'hover:bg-muted'
                      )}
                    >
                      {getFileIcon(file.path)}
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>

                {/* Add File Button */}
                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full gap-2">
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
