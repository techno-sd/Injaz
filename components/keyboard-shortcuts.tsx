'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Command, Keyboard } from 'lucide-react'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['⌘', 'K'], description: 'Show keyboard shortcuts' },
        { keys: ['⌘', 'P'], description: 'Quick open file' },
        { keys: ['⌘', 'S'], description: 'Save current file' },
        { keys: ['⌘', 'Shift', 'P'], description: 'Command palette' },
      ],
    },
    {
      category: 'Editor',
      items: [
        { keys: ['⌘', 'F'], description: 'Find in file' },
        { keys: ['⌘', 'H'], description: 'Replace in file' },
        { keys: ['⌘', 'D'], description: 'Add selection to next match' },
        { keys: ['⌘', '/'], description: 'Toggle comment' },
        { keys: ['⌘', 'Z'], description: 'Undo' },
        { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
      ],
    },
    {
      category: 'AI Assistant',
      items: [
        { keys: ['⌘', 'I'], description: 'Focus AI chat' },
        { keys: ['⌘', 'Enter'], description: 'Send message to AI' },
        { keys: ['⌘', 'L'], description: 'Clear chat history' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘', 'B'], description: 'Toggle file tree' },
        { keys: ['⌘', 'J'], description: 'Toggle terminal' },
        { keys: ['⌘', 'E'], description: 'Toggle preview' },
        { keys: ['⌘', '1-9'], description: 'Switch to file 1-9' },
      ],
    },
  ]

  return (
    <>
      {/* Hint button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-background border shadow-lg rounded-lg hover:shadow-xl transition-all text-sm"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline">Shortcuts</span>
          <Badge variant="secondary" className="text-xs">
            ⌘K
          </Badge>
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your workflow with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Use <Badge variant="secondary" className="mx-1 text-xs">Ctrl</Badge> instead of <Badge variant="secondary" className="mx-1 text-xs">⌘</Badge> on Windows/Linux
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
