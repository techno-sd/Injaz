'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createFile, deleteFile } from '@/app/actions/files'
import { ChevronDown, ChevronRight, FileIcon, FolderIcon, Plus, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { File, FileNode } from '@/types'
import { useToast } from '@/components/ui/use-toast'

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

  async function handleDeleteFile(fileId: string) {
    const result = await deleteFile(fileId, projectId)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      onFilesChange(files.filter(f => f.id !== fileId))
      if (activeFileId === fileId) {
        onFileSelect(files[0]?.id || null)
      }
    }
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
            className="flex items-center gap-1 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleDirectory(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FolderIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children?.map(child => renderNode(child, level + 1))}
        </div>
      )
    }

    const file = files.find(f => f.path === node.path)
    if (!file) return null

    return (
      <div
        key={node.path}
        className={cn(
          "flex items-center justify-between gap-1 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm group",
          activeFileId === file.id && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 12 + 24}px` }}
      >
        <div
          className="flex items-center gap-1 flex-1"
          onClick={() => onFileSelect(file.id)}
        >
          <FileIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{node.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteFile(file.id)
          }}
        >
          <Trash className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-muted/50">
      <div className="border-b p-2 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Files</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCreating(!isCreating)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isCreating && (
          <div className="mb-2 flex gap-1">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              placeholder="path/to/file.tsx"
              className="flex-1 px-2 py-1 text-sm border rounded"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFile}>
              Add
            </Button>
          </div>
        )}
        {fileTree.map(node => renderNode(node))}
      </div>
    </div>
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
