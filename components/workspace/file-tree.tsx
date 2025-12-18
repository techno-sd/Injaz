'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createFile, deleteFile } from '@/app/actions/files'
import { ChevronDown, ChevronRight, Plus, Trash, Copy, Edit2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { File, FileNode } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { getFileIcon, getFolderIcon } from '@/lib/file-icons'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { FileSearch } from '@/components/file-search'

interface FileTreeProps {
  files: File[]
  projectId: string
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFilesChange: (files: File[]) => void
}

export function FileTree({ files, projectId, activeFileId, onFileSelect, onFilesChange }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']))
  const [newFileName, setNewFileName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const fileTree = buildFileTree(files)

  async function handleCreateFile() {
    if (!newFileName.trim()) return

    const result = await createFile(projectId, newFileName, '')

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else if (result.data) {
      onFilesChange([...files, result.data])
      setNewFileName('')
      setIsCreating(false)
    }
  }

  function confirmDeleteFile(fileId: string) {
    setFileToDelete(fileId)
    setDeleteConfirmOpen(true)
  }

  async function handleDeleteFile() {
    if (!fileToDelete) return

    const result = await deleteFile(fileToDelete, projectId)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      onFilesChange(files.filter(f => f.id !== fileToDelete))
      if (activeFileId === fileToDelete && files[0]) {
        onFileSelect(files[0].id)
      }
      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted',
      })
    }
    setDeleteConfirmOpen(false)
    setFileToDelete(null)
  }

  function toggleDirectory(path: string) {
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedDirs(newExpanded)
  }

  function renderNode(node: FileNode, level: number = 0) {
    const isExpanded = expandedDirs.has(node.path)

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm transition-colors"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleDirectory(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            {getFolderIcon(isExpanded)}
            <span className="text-sm truncate">{node.name}</span>
          </div>
          {isExpanded && node.children?.map(child => renderNode(child, level + 1))}
        </div>
      )
    }

    const file = files.find(f => f.path === node.path)
    if (!file) return null

    return (
      <ContextMenu key={node.path}>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center justify-between gap-1.5 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm group transition-colors",
              activeFileId === file.id && "bg-accent"
            )}
            style={{ paddingLeft: `${level * 12 + 24}px` }}
          >
            <div
              className="flex items-center gap-1.5 flex-1 min-w-0"
              onClick={() => onFileSelect(file.id)}
            >
              {getFileIcon(file.path)}
              <span className="text-sm truncate">{node.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                confirmDeleteFile(file.id)
              }}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onFileSelect(file.id)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Open
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              navigator.clipboard.writeText(file.path)
              toast({ title: 'Path copied to clipboard' })
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Path
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              const blob = new Blob([file.content], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = node.name
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => confirmDeleteFile(file.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  const fileToDeleteName = fileToDelete
    ? files.find(f => f.id === fileToDelete)?.path
    : ''

  return (
    <>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDeleteName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteFile}
        variant="destructive"
      />
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Enhanced Header */}
      <div className="border-b glass-card backdrop-blur-sm p-3 flex items-center justify-between shadow-sm">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
          Explorer
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all rounded-lg"
          onClick={() => setIsCreating(!isCreating)}
          data-action="new-file"
          title="New File"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* File Search */}
      <div className="p-3 border-b bg-muted/30">
        <FileSearch files={files} onFileSelect={onFileSelect} />
      </div>

      {/* File Count Badge */}
      <div className="px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">{files.length} files</span>
          {files.length > 0 && (
            <span className="text-muted-foreground">{expandedDirs.size - 1} folders</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isCreating && (
          <div className="mb-3 p-3 glass-card border-2 border-primary/50 rounded-xl shadow-lg animate-slide-up">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
                placeholder="path/to/file.tsx"
                className="flex-1 px-3 py-2 text-sm border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCreateFile}
                className="gradient-primary text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all px-4"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd> to create,
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        )}
        {files.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-sm text-muted-foreground">No files yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Click + to create your first file</p>
          </div>
        ) : (
          fileTree.map(node => renderNode(node))
        )}
      </div>
    </div>
    </>
  )
}

function buildFileTree(files: File[]): FileNode[] {
  const root: FileNode[] = []
  const directories = new Map<string, FileNode>()

  files.forEach(file => {
    const parts = file.path.split('/')
    let currentPath = ''

    parts.forEach((part, index) => {
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (index === parts.length - 1) {
        // It's a file
        const node: FileNode = {
          name: part,
          path: file.path,
          type: 'file',
        }

        if (parentPath) {
          const parent = directories.get(parentPath)
          if (parent && !parent.children) {
            parent.children = []
          }
          parent?.children?.push(node)
        } else {
          root.push(node)
        }
      } else {
        // It's a directory
        if (!directories.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: 'directory',
            children: [],
          }
          directories.set(currentPath, node)

          if (parentPath) {
            const parent = directories.get(parentPath)
            if (parent && !parent.children) {
              parent.children = []
            }
            parent?.children?.push(node)
          } else {
            root.push(node)
          }
        }
      }
    })
  })

  return root
}
