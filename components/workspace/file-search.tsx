'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, File, Folder } from 'lucide-react'
import type { File as FileType } from '@/types'

interface FileSearchProps {
  files: FileType[]
  onFileSelect: (fileId: string) => void
}

export function FileSearch({ files, onFileSelect }: FileSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard shortcut to open search (Cmd/Ctrl + P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setIsOpen(true)
        setSearchQuery('')
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files

    const query = searchQuery.toLowerCase()
    return files
      .filter(file =>
        file.path.toLowerCase().includes(query) ||
        file.language?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aStartsWith = a.path.toLowerCase().startsWith(query)
        const bStartsWith = b.path.toLowerCase().startsWith(query)
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        return a.path.localeCompare(b.path)
      })
  }, [files, searchQuery])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < filteredFiles.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredFiles[selectedIndex]) {
            onFileSelect(filteredFiles[selectedIndex].id)
            setIsOpen(false)
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredFiles, selectedIndex, onFileSelect])

  // Reset selected index when filtered files change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredFiles])

  const getFileIcon = (file: FileType) => {
    const ext = file.path.split('.').pop()?.toLowerCase()

    // Return appropriate icon based on file type
    if (ext === 'tsx' || ext === 'jsx') return '⚛️'
    if (ext === 'ts' || ext === 'js') return '📜'
    if (ext === 'css' || ext === 'scss') return '🎨'
    if (ext === 'json') return '📋'
    if (ext === 'md') return '📝'
    if (ext === 'html') return '🌐'

    return '📄'
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="bg-yellow-200 dark:bg-yellow-900 font-semibold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[70vh] p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Quick Open
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-4 pb-2">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="px-2 pb-2">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <File className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No files found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFiles.map((file, index) => {
                  const pathParts = file.path.split('/')
                  const fileName = pathParts[pathParts.length - 1]
                  const folderPath = pathParts.slice(0, -1).join('/')

                  return (
                    <button
                      key={file.id}
                      onClick={() => {
                        onFileSelect(file.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xl">{getFileIcon(file)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {highlightMatch(fileName, searchQuery)}
                        </div>
                        {folderPath && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <Folder className="h-3 w-3 flex-shrink-0" />
                            {folderPath}
                          </div>
                        )}
                      </div>
                      {file.language && (
                        <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                          {file.language}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>Use ↑ ↓ to navigate</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-background border rounded">Enter</kbd> to open</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
