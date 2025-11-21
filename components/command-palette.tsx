'use client'

import { useState, useEffect } from 'react'
import { Command } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  File as FileIcon,
  FolderPlus,
  Settings,
  Trash,
  Copy,
  Download,
  GitBranch,
  Play,
  Search
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction?: (action: string) => void
}

const commands = [
  { id: 'new-file', label: 'New File', icon: FileIcon, shortcut: 'Ctrl+N' },
  { id: 'search', label: 'Search Files', icon: Search, shortcut: 'Ctrl+P' },
  { id: 'git-commit', label: 'Open Git Panel', icon: GitBranch, shortcut: 'Ctrl+Shift+G' },
  { id: 'run-preview', label: 'Show Preview', icon: Play, shortcut: 'Ctrl+R' },
  { id: 'terminal', label: 'Toggle Terminal', icon: Copy, shortcut: 'Ctrl+`' },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+,' },
]

export function CommandPalette({ open, onOpenChange, onAction }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(commands)

  useEffect(() => {
    if (search) {
      setFiltered(
        commands.filter(cmd =>
          cmd.label.toLowerCase().includes(search.toLowerCase())
        )
      )
    } else {
      setFiltered(commands)
    }
  }, [search])

  const handleSelect = (commandId: string) => {
    onAction?.(commandId)
    onOpenChange(false)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <div className="flex items-center border-b px-4 py-3 gap-3">
          <Command className="h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 px-0"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No commands found
              </div>
            ) : (
              filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <cmd.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm">{cmd.label}</span>
                  </div>
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold bg-muted border rounded">
                    {cmd.shortcut}
                  </kbd>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
