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
import {
  Command,
  FileText,
  FolderPlus,
  Save,
  Download,
  Upload,
  Trash2,
  Copy,
  Terminal,
  Globe,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react'

interface CommandPaletteProps {
  onCommand: (command: string, args?: any) => void
}

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  keywords?: string[]
  shortcut?: string
}

export function CommandPalette({ onCommand }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: CommandItem[] = [
    {
      id: 'file.new',
      label: 'Create New File',
      description: 'Create a new file in the project',
      icon: <FileText className="h-4 w-4" />,
      keywords: ['new', 'create', 'file', 'add'],
      shortcut: '⌘N',
    },
    {
      id: 'folder.new',
      label: 'Create New Folder',
      description: 'Create a new folder in the project',
      icon: <FolderPlus className="h-4 w-4" />,
      keywords: ['new', 'create', 'folder', 'directory'],
    },
    {
      id: 'file.save',
      label: 'Save Current File',
      description: 'Save the currently open file',
      icon: <Save className="h-4 w-4" />,
      keywords: ['save', 'write'],
      shortcut: '⌘S',
    },
    {
      id: 'file.saveAll',
      label: 'Save All Files',
      description: 'Save all modified files',
      icon: <Save className="h-4 w-4" />,
      keywords: ['save', 'all', 'write'],
      shortcut: '⌘⇧S',
    },
    {
      id: 'file.download',
      label: 'Download Project',
      description: 'Download the entire project as a ZIP file',
      icon: <Download className="h-4 w-4" />,
      keywords: ['download', 'export', 'zip'],
    },
    {
      id: 'file.upload',
      label: 'Upload Files',
      description: 'Upload files to the project',
      icon: <Upload className="h-4 w-4" />,
      keywords: ['upload', 'import'],
    },
    {
      id: 'file.delete',
      label: 'Delete File',
      description: 'Delete the currently selected file',
      icon: <Trash2 className="h-4 w-4" />,
      keywords: ['delete', 'remove', 'trash'],
    },
    {
      id: 'file.duplicate',
      label: 'Duplicate File',
      description: 'Create a copy of the current file',
      icon: <Copy className="h-4 w-4" />,
      keywords: ['duplicate', 'copy', 'clone'],
    },
    {
      id: 'view.terminal',
      label: 'Toggle Terminal',
      description: 'Show or hide the terminal panel',
      icon: <Terminal className="h-4 w-4" />,
      keywords: ['terminal', 'console', 'shell'],
      shortcut: '⌘J',
    },
    {
      id: 'view.preview',
      label: 'Toggle Preview',
      description: 'Show or hide the preview panel',
      icon: <Globe className="h-4 w-4" />,
      keywords: ['preview', 'browser', 'view'],
      shortcut: '⌘E',
    },
    {
      id: 'terminal.clear',
      label: 'Clear Terminal',
      description: 'Clear the terminal output',
      icon: <Terminal className="h-4 w-4" />,
      keywords: ['clear', 'terminal', 'reset'],
    },
    {
      id: 'preview.refresh',
      label: 'Refresh Preview',
      description: 'Reload the preview panel',
      icon: <RefreshCw className="h-4 w-4" />,
      keywords: ['refresh', 'reload', 'preview'],
    },
    {
      id: 'preview.open',
      label: 'Open Preview in New Tab',
      description: 'Open the preview in a new browser tab',
      icon: <Globe className="h-4 w-4" />,
      keywords: ['open', 'preview', 'tab', 'browser'],
    },
    {
      id: 'dev.start',
      label: 'Start Dev Server',
      description: 'Start the development server',
      icon: <Play className="h-4 w-4" />,
      keywords: ['start', 'dev', 'server', 'run'],
    },
    {
      id: 'dev.stop',
      label: 'Stop Dev Server',
      description: 'Stop the development server',
      icon: <Pause className="h-4 w-4" />,
      keywords: ['stop', 'dev', 'server', 'kill'],
    },
    {
      id: 'settings.open',
      label: 'Open Settings',
      description: 'Configure project settings',
      icon: <Settings className="h-4 w-4" />,
      keywords: ['settings', 'preferences', 'config'],
      shortcut: '⌘,',
    },
  ]

  // Keyboard shortcut to open command palette (Cmd/Ctrl + Shift + P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault()
        setIsOpen(true)
        setSearchQuery('')
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands

    const query = searchQuery.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.keywords?.some(kw => kw.includes(query))
    )
  }, [searchQuery])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex].id)
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
  }, [isOpen, filteredCommands, selectedIndex])

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  const executeCommand = (commandId: string) => {
    onCommand(commandId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[70vh] p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Command className="h-4 w-4" />
            Command Palette
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-4 pb-2">
          <Input
            type="text"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="px-2 pb-2">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Command className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No commands found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      executeCommand(cmd.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded font-mono">
                        {cmd.shortcut}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>Use ↑ ↓ to navigate</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-background border rounded">Enter</kbd> to execute</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
