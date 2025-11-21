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
      if (activeFileId === fileToDelete) {
        onFileSelect(files[0]?.id || null)
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
    <div className="h-full flex flex-col bg-muted/30">
      <div className="border-b bg-muted/50 p-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
          Files
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => setIsCreating(!isCreating)}
          data-action="new-file"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* File Search */}
      <div className="p-2 border-b">
        <FileSearch files={files} onFileSelect={onFileSelect} />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isCreating && (
          <div className="mb-3 p-2 bg-background border-2 border-primary/30 rounded-lg shadow-sm">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
                placeholder="path/to/file.tsx"
                className="flex-1 px-2.5 py-1.5 text-sm border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateFile} className="gradient-primary text-white border-0 shadow-sm">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Press Enter to create, Esc to cancel</p>
          </div>
        )}
        {fileTree.map(node => renderNode(node))}
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
