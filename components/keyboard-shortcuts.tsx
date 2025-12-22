'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  Keyboard,
  Zap,
  Code2,
  MessageSquare,
  FolderTree,
  GitBranch,
  Search,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Cmd/Ctrl + / to toggle shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const shortcuts = [
    {
      category: 'General',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      items: [
        { keys: ['⌘', 'K'], description: 'Command palette' },
        { keys: ['⌘', 'P'], description: 'Quick file search' },
        { keys: ['⌘', 'S'], description: 'Save current file' },
        { keys: ['⌘', 'N'], description: 'New file' },
        { keys: ['⌘', '/'], description: 'Toggle shortcuts' },
      ],
    },
    {
      category: 'Editor',
      icon: Code2,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      items: [
        { keys: ['⌘', 'F'], description: 'Find in file' },
        { keys: ['⌘', 'H'], description: 'Replace in file' },
        { keys: ['⌘', 'D'], description: 'Add selection to next match' },
        { keys: ['⌘', '/'], description: 'Toggle comment' },
        { keys: ['⌘', 'Z'], description: 'Undo' },
        { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['⌘', 'A'], description: 'Select all' },
        { keys: ['⌘', 'X'], description: 'Cut line' },
      ],
    },
    {
      category: 'AI Assistant',
      icon: MessageSquare,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      items: [
        { keys: ['⌘', 'I'], description: 'Focus AI chat' },
        { keys: ['⌘', 'Enter'], description: 'Send message to AI' },
        { keys: ['Shift', 'Enter'], description: 'New line in chat' },
        { keys: ['⌘', 'L'], description: 'Clear chat history' },
      ],
    },
    {
      category: 'File Tree',
      icon: FolderTree,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      items: [
        { keys: ['⌘', 'B'], description: 'Toggle file tree' },
        { keys: ['⌘', 'N'], description: 'Create new file' },
        { keys: ['Delete'], description: 'Delete selected file' },
        { keys: ['↑', '↓'], description: 'Navigate files' },
      ],
    },
    {
      category: 'Terminal & Preview',
      icon: Command,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      items: [
        { keys: ['⌘', '`'], description: 'Toggle terminal' },
        { keys: ['⌘', 'R'], description: 'Show preview' },
        { keys: ['↑', '↓'], description: 'Command history' },
        { keys: ['Tab'], description: 'Autocomplete command' },
      ],
    },
    {
      category: 'Git & Version Control',
      icon: GitBranch,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      items: [
        { keys: ['⌘', 'Shift', 'G'], description: 'Open Git panel' },
        { keys: ['⌘', 'Enter'], description: 'Commit changes' },
        { keys: ['⌘', 'Shift', 'P'], description: 'Push to remote' },
        { keys: ['⌘', 'Shift', 'L'], description: 'Pull from remote' },
      ],
    },
  ]

  // Filter shortcuts based on search query
  const filteredShortcuts = shortcuts.map(section => ({
    ...section,
    items: section.items.filter(item =>
      searchQuery === '' ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.items.length > 0)

  return (
    <>
      {/* Enhanced floating button */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <Button
          onClick={() => setIsOpen(true)}
          className="group glass-card backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 gap-2.5 px-4 py-6 rounded-2xl border-2 hover:scale-105"
          size="lg"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Keyboard className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-semibold">Shortcuts</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-xs font-mono h-5 px-1.5">
                ⌘
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono h-5 px-1.5">
                /
              </Badge>
            </div>
          </div>
        </Button>
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setSearchQuery('')
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {/* Header with Search */}
          <div className="glass-card border-b backdrop-blur-xl p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Keyboard className="h-6 w-6 text-primary" />
                </div>
                <span>Keyboard Shortcuts</span>
              </DialogTitle>
              <DialogDescription className="text-base">
                Master your workflow with these powerful shortcuts
              </DialogDescription>
            </DialogHeader>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
              />
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background to-muted/10">
            {filteredShortcuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No shortcuts found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : (
              filteredShortcuts.map((section) => {
                const Icon = section.icon
                return (
                  <div key={section.category} className="space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center gap-2.5">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", section.bgColor)}>
                        <Icon className={cn("h-4 w-4", section.color)} />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                        {section.category}
                      </h3>
                      <div className="flex-1 h-px bg-border"></div>
                      <Badge variant="secondary" className="text-xs">
                        {section.items.length}
                      </Badge>
                    </div>

                    {/* Shortcuts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.items.map((item, index) => (
                        <div
                          key={index}
                          className="glass-card rounded-xl p-3 border hover:border-primary/50 hover:bg-accent/50 transition-all group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium flex-1">{item.description}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.keys.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  <Badge
                                    variant="secondary"
                                    className="font-mono text-xs h-6 px-2 bg-muted group-hover:bg-primary/10 transition-colors"
                                  >
                                    {key}
                                  </Badge>
                                  {keyIndex < item.keys.length - 1 && (
                                    <span className="text-muted-foreground text-xs">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="glass-card border-t backdrop-blur-xl p-4 bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5" />
                <span>
                  <strong>Platform:</strong> Use{' '}
                  <Badge variant="secondary" className="mx-1 text-xs">Ctrl</Badge>
                  instead of{' '}
                  <Badge variant="secondary" className="mx-1 text-xs">⌘</Badge>
                  on Windows/Linux
                </span>
              </div>
              <span className="text-muted-foreground/70">
                {filteredShortcuts.reduce((acc, section) => acc + section.items.length, 0)} total shortcuts
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
