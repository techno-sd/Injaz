'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFileIcon } from '@/lib/file-icons'
import type { File } from '@/types'

interface FileSearchProps {
  files: File[]
  onFileSelect: (fileId: string) => void
}

export function FileSearch({ files, onFileSelect }: FileSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = files.filter(file =>
    file.path.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (fileId: string) => {
    onFileSelect(fileId)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-muted-foreground gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search files...</span>
        <kbd className="ml-auto px-2 py-0.5 text-xs font-semibold bg-muted border rounded">
          Ctrl+P
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          <div className="flex items-center border-b px-4 py-3 gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files by name or path..."
              className="border-0 focus-visible:ring-0 px-0"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {query ? 'No files found' : 'Start typing to search'}
                </div>
              ) : (
                filtered.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    {getFileIcon(file.path)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {file.path.split('/').pop()}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {file.path}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
