'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  FolderOpen,
  Folder,
  FileJson,
  FileCode,
  Image as ImageIcon,
  FileType,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FilePlus,
  FolderPlus
} from 'lucide-react'
import type { File } from '@/types'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnhancedFileTreeProps {
  files: File[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFileCreate?: () => void
  onFolderCreate?: () => void
}

// Get icon and color based on file extension
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()

  const icons = {
    json: { icon: FileJson, color: 'text-yellow-500' },
    tsx: { icon: FileCode, color: 'text-blue-500' },
    ts: { icon: FileCode, color: 'text-blue-500' },
    jsx: { icon: FileCode, color: 'text-yellow-600' },
    js: { icon: FileCode, color: 'text-yellow-600' },
    css: { icon: FileType, color: 'text-purple-500' },
    scss: { icon: FileType, color: 'text-pink-500' },
    html: { icon: FileCode, color: 'text-orange-500' },
    png: { icon: ImageIcon, color: 'text-green-500' },
    jpg: { icon: ImageIcon, color: 'text-green-500' },
    jpeg: { icon: ImageIcon, color: 'text-green-500' },
    svg: { icon: ImageIcon, color: 'text-green-500' },
    md: { icon: FileText, color: 'text-blue-400' },
  }

  const config = icons[ext as keyof typeof icons] || { icon: FileText, color: 'text-gray-500' }
  const Icon = config.icon

  return <Icon className={cn("h-4 w-4", config.color)} />
}

// Organize files into tree structure
interface TreeNode {
  name: string
  type: 'file' | 'folder'
  file?: File
  children?: TreeNode[]
  path: string
}

function buildFileTree(files: File[]): TreeNode[] {
  const root: TreeNode[] = []
  const folderMap = new Map<string, TreeNode>()

  // Sort files by path
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

  sortedFiles.forEach((file) => {
    const parts = file.path.split('/')
    let currentLevel = root
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFile = index === parts.length - 1

      if (isFile) {
        // It's a file
        currentLevel.push({
          name: part,
          type: 'file',
          file,
          path: currentPath
        })
      } else {
        // It's a folder
        let folder = folderMap.get(currentPath)

        if (!folder) {
          folder = {
            name: part,
            type: 'folder',
            children: [],
            path: currentPath
          }
          folderMap.set(currentPath, folder)
          currentLevel.push(folder)
        }

        currentLevel = folder.children!
      }
    })
  })

  return root
}

interface FileTreeNodeProps {
  node: TreeNode
  level: number
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  expandedFolders: Set<string>
  toggleFolder: (path: string) => void
}

function FileTreeNode({
  node,
  level,
  activeFileId,
  onFileSelect,
  expandedFolders,
  toggleFolder
}: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.path)
  const isActive = node.file && node.file.id === activeFileId

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => toggleFolder(node.path)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors group",
            "hover:bg-muted"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500 shrink-0" />
          )}
          <span className="truncate font-medium">{node.name}</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                activeFileId={activeFileId}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // File node
  return (
    <button
      onClick={() => node.file && onFileSelect(node.file.id)}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all group",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "hover:bg-muted"
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
    >
      {getFileIcon(node.name)}
      <span className={cn(
        "truncate font-mono text-xs",
        isActive && "font-medium"
      )}>
        {node.name}
      </span>
      {!isActive && (
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </button>
  )
}

export function EnhancedFileTree({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFolderCreate
}: EnhancedFileTreeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const fileTree = useMemo(() => buildFileTree(files), [files])

  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map((node) => {
          if (node.type === 'file') {
            return node.name.toLowerCase().includes(searchQuery.toLowerCase())
              ? node
              : null
          }
          const filteredChildren = filterTree(node.children || [])
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren }
          }
          return node.name.toLowerCase().includes(searchQuery.toLowerCase())
            ? node
            : null
        })
        .filter((node): node is TreeNode => node !== null)
    }

    return filterTree(fileTree)
  }, [fileTree, searchQuery])

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const expandAll = () => {
    const allFolders = new Set<string>()
    const collectFolders = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'folder') {
          allFolders.add(node.path)
          if (node.children) {
            collectFolders(node.children)
          }
        }
      })
    }
    collectFolders(fileTree)
    setExpandedFolders(allFolders)
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-2 space-y-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onFileCreate}
            className="h-7 flex-1 text-xs"
          >
            <FilePlus className="h-3.5 w-3.5 mr-1" />
            File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFolderCreate}
            className="h-7 flex-1 text-xs"
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1" />
            Folder
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filteredTree.length > 0 ? (
            filteredTree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                level={0}
                activeFileId={activeFileId}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No files found' : 'No files yet'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-6 text-xs"
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-6 text-xs"
          >
            Collapse
          </Button>
        </div>
      </div>
    </div>
  )
}
