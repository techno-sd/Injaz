'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  FileText,
  FolderOpen,
  Folder,
  FileJson,
  FileCode,
  Image as ImageIcon,
  FileType,
  Plus,
  Search,
  Sparkles
} from 'lucide-react'
import type { File } from '@/types'
import { Input } from '@/components/ui/input'

interface SimplifiedFileTreeProps {
  files: File[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onAskAI: () => void
}

// Get icon based on file extension
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-500" />
    case 'tsx':
    case 'ts':
      return <FileCode className="h-4 w-4 text-blue-500" />
    case 'jsx':
    case 'js':
      return <FileCode className="h-4 w-4 text-yellow-600" />
    case 'css':
    case 'scss':
      return <FileType className="h-4 w-4 text-purple-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <ImageIcon className="h-4 w-4 text-green-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// Organize files into folders
function organizeFiles(files: File[]) {
  const structure: Record<string, File[]> = {}

  files.forEach(file => {
    const parts = file.path.split('/')
    if (parts.length === 1) {
      // Root level file
      if (!structure['root']) structure['root'] = []
      structure['root'].push(file)
    } else {
      // File in folder
      const folder = parts[0]
      if (!structure[folder]) structure[folder] = []
      structure[folder].push(file)
    }
  })

  return structure
}

export function SimplifiedFileTree({
  files,
  activeFileId,
  onFileSelect,
  onAskAI
}: SimplifiedFileTreeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'app', 'components']))

  const fileStructure = organizeFiles(files)

  const filteredFiles = files.filter(file =>
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder)
    } else {
      newExpanded.add(folder)
    }
    setExpandedFolders(newExpanded)
  }

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b bg-background/50 backdrop-blur">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          Project Files
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={onAskAI}
            className="w-full justify-start gap-2 gradient-primary text-white border-0"
            size="sm"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI to Add Files
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            size="sm"
            data-action="new-file"
          >
            <Plus className="h-4 w-4" />
            Create New File
          </Button>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchQuery ? (
            // Search results
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-3 py-2">
                {filteredFiles.length} results
              </p>
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => onFileSelect(file.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150
                    ${
                      activeFileId === file.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted'
                    }
                  `}
                >
                  {getFileIcon(file.path)}
                  <span className="text-sm font-medium truncate">
                    {file.path}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            // Folder structure
            <div className="space-y-1">
              {Object.entries(fileStructure).map(([folder, folderFiles]) => {
                const isExpanded = expandedFolders.has(folder)

                return (
                  <div key={folder} className="space-y-1">
                    {/* Folder header */}
                    {folder !== 'root' && (
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-primary" />
                        ) : (
                          <Folder className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-semibold">{folder}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {folderFiles.length}
                        </span>
                      </button>
                    )}

                    {/* Files in folder */}
                    {(folder === 'root' || isExpanded) && (
                      <div className={folder !== 'root' ? 'ml-4 space-y-1' : 'space-y-1'}>
                        {folderFiles.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => onFileSelect(file.id)}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                              transition-all duration-150
                              ${
                                activeFileId === file.id
                                  ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                                  : 'hover:bg-muted'
                              }
                            `}
                          >
                            {getFileIcon(file.path)}
                            <span className="text-sm font-medium truncate">
                              {file.path.split('/').pop()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Helper text */}
      <div className="p-4 border-t bg-background/50">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">💡 Tip:</p>
          <p>Click "Ask AI" to add or modify files without coding!</p>
        </div>
      </div>
    </div>
  )
}
