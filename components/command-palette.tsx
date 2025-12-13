'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Command as CommandIcon, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  File as FileIcon,
  FolderPlus,
  Settings,
  Trash,
  GitBranch,
  Play,
  Search,
  Terminal,
  Moon,
  Sun,
  Palette,
  MessageSquare,
  Rocket,
  RefreshCw,
  Save,
  Code2,
  Bug,
  Wand2,
  HelpCircle,
  Keyboard,
  ExternalLink,
  Copy,
  Scissors,
  FileText,
  FileCode,
  FolderOpen,
  Zap,
  Eye,
  Variable,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction?: (action: string, payload?: any) => void
  files?: Array<{ path: string; id: string }>
}

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  category: 'file' | 'edit' | 'view' | 'ai' | 'git' | 'help' | 'navigation'
  keywords?: string[]
}

const commands: CommandItem[] = [
  // File commands
  { id: 'new-file', label: 'New File', description: 'Create a new file', icon: FileIcon, shortcut: '⌘N', category: 'file', keywords: ['create', 'add'] },
  { id: 'new-folder', label: 'New Folder', description: 'Create a new folder', icon: FolderPlus, category: 'file', keywords: ['create', 'directory'] },
  { id: 'save-file', label: 'Save File', description: 'Save current file', icon: Save, shortcut: '⌘S', category: 'file' },
  { id: 'save-all', label: 'Save All', description: 'Save all open files', icon: Save, shortcut: '⌘⇧S', category: 'file' },

  // Edit commands
  { id: 'search', label: 'Search Files', description: 'Quick file search', icon: Search, shortcut: '⌘P', category: 'navigation', keywords: ['find', 'open', 'go to'] },
  { id: 'search-in-files', label: 'Search in Files', description: 'Search text in all files', icon: FileText, shortcut: '⌘⇧F', category: 'edit', keywords: ['find', 'grep'] },
  { id: 'format-code', label: 'Format Document', description: 'Format current file', icon: Code2, shortcut: '⌥⇧F', category: 'edit', keywords: ['prettier', 'beautify'] },

  // View commands
  { id: 'run-preview', label: 'Show Preview', description: 'Open live preview', icon: Play, shortcut: '⌘R', category: 'view' },
  { id: 'terminal', label: 'Toggle Terminal', description: 'Show/hide terminal', icon: Terminal, shortcut: '⌘`', category: 'view' },
  { id: 'toggle-theme', label: 'Toggle Theme', description: 'Switch light/dark mode', icon: Moon, category: 'view', keywords: ['dark', 'light', 'mode'] },
  { id: 'env-panel', label: 'Environment Variables', description: 'Manage env variables', icon: Variable, category: 'view', keywords: ['env', 'secrets'] },

  // AI commands
  { id: 'ai-chat', label: 'AI Chat', description: 'Open AI assistant', icon: MessageSquare, shortcut: '⌘I', category: 'ai', keywords: ['assistant', 'help', 'claude', 'gpt'] },
  { id: 'ai-explain', label: 'AI: Explain Code', description: 'Explain selected code', icon: Wand2, category: 'ai', keywords: ['understand', 'what does'] },
  { id: 'ai-fix', label: 'AI: Fix Error', description: 'Ask AI to fix current error', icon: Bug, category: 'ai', keywords: ['debug', 'solve'] },
  { id: 'ai-generate', label: 'AI: Generate Code', description: 'Generate code with AI', icon: Sparkles, category: 'ai', keywords: ['create', 'write'] },
  { id: 'ai-refactor', label: 'AI: Refactor', description: 'Refactor selected code', icon: RefreshCw, category: 'ai', keywords: ['improve', 'clean'] },

  // Git commands
  { id: 'git-commit', label: 'Git: Commit', description: 'Commit changes', icon: GitBranch, shortcut: '⌘⇧G', category: 'git' },
  { id: 'git-push', label: 'Git: Push', description: 'Push to remote', icon: ExternalLink, category: 'git' },
  { id: 'git-pull', label: 'Git: Pull', description: 'Pull from remote', icon: RefreshCw, category: 'git' },

  // Deploy
  { id: 'deploy', label: 'Deploy to Vercel', description: 'Deploy your project', icon: Rocket, category: 'view', keywords: ['publish', 'ship'] },

  // Help
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', description: 'View all shortcuts', icon: Keyboard, category: 'help', keywords: ['keys', 'hotkeys'] },
  { id: 'settings', label: 'Settings', description: 'Open settings', icon: Settings, shortcut: '⌘,', category: 'help', keywords: ['preferences', 'options'] },
  { id: 'help', label: 'Help & Documentation', description: 'Get help', icon: HelpCircle, category: 'help', keywords: ['docs', 'support'] },
]

// Fuzzy search implementation
function fuzzyMatch(pattern: string, str: string): { matched: boolean; score: number } {
  pattern = pattern.toLowerCase()
  str = str.toLowerCase()

  let patternIdx = 0
  let strIdx = 0
  let score = 0
  let consecutiveMatches = 0

  while (patternIdx < pattern.length && strIdx < str.length) {
    if (pattern[patternIdx] === str[strIdx]) {
      score += 1 + consecutiveMatches * 2
      if (strIdx === 0 || str[strIdx - 1] === ' ' || str[strIdx - 1] === '/') {
        score += 5 // Bonus for word boundary match
      }
      consecutiveMatches++
      patternIdx++
    } else {
      consecutiveMatches = 0
    }
    strIdx++
  }

  return {
    matched: patternIdx === pattern.length,
    score,
  }
}

function searchCommands(query: string, items: CommandItem[]): CommandItem[] {
  if (!query) return items

  const results = items
    .map(item => {
      const labelMatch = fuzzyMatch(query, item.label)
      const descMatch = item.description ? fuzzyMatch(query, item.description) : { matched: false, score: 0 }
      const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
        ? { matched: true, score: 3 }
        : { matched: false, score: 0 }

      const matched = labelMatch.matched || descMatch.matched || keywordMatch.matched
      const score = Math.max(labelMatch.score * 2, descMatch.score, keywordMatch.score)

      return { item, matched, score }
    })
    .filter(r => r.matched)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item)

  return results
}

const categoryLabels: Record<string, string> = {
  file: 'File',
  edit: 'Edit',
  view: 'View',
  ai: 'AI Assistant',
  git: 'Git',
  navigation: 'Navigation',
  help: 'Help',
}

const categoryIcons: Record<string, React.ElementType> = {
  file: FileIcon,
  edit: Scissors,
  view: Eye,
  ai: Sparkles,
  git: GitBranch,
  navigation: Search,
  help: HelpCircle,
}

export function CommandPalette({ open, onOpenChange, onAction, files = [] }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load recent commands from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentCommands')
    if (stored) {
      try {
        setRecentCommands(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Filter and sort commands
  const filtered = useMemo(() => {
    const results = searchCommands(search, commands)

    // If no search, show recent commands first
    if (!search && recentCommands.length > 0) {
      const recentItems = recentCommands
        .map(id => commands.find(c => c.id === id))
        .filter(Boolean) as CommandItem[]
      const otherItems = results.filter(c => !recentCommands.includes(c.id))
      return [...recentItems.slice(0, 3), ...otherItems]
    }

    return results
  }, [search, recentCommands])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const cmd of filtered) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    }
    return groups
  }, [filtered])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex].id)
          }
          break
        case 'Escape':
          onOpenChange(false)
          break
      }
    },
    [filtered, selectedIndex, onOpenChange]
  )

  // Scroll selected item into view
  useEffect(() => {
    const selected = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = (commandId: string) => {
    // Update recent commands
    const updated = [commandId, ...recentCommands.filter(id => id !== commandId)].slice(0, 5)
    setRecentCommands(updated)
    localStorage.setItem('recentCommands', JSON.stringify(updated))

    onAction?.(commandId)
    onOpenChange(false)
    setSearch('')
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [open])

  let flatIndex = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden">
        <div className="flex items-center border-b px-4 py-3 gap-3">
          <CommandIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 px-0 text-base"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold bg-muted border rounded shrink-0">
            ESC
          </kbd>
        </div>
        <ScrollArea className="max-h-[400px]">
          <div ref={listRef} className="p-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No commands found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => {
                const CategoryIcon = categoryIcons[category] || CommandIcon
                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <CategoryIcon className="h-3.5 w-3.5" />
                      {categoryLabels[category] || category}
                    </div>
                    {items.map((cmd) => {
                      flatIndex++
                      const index = flatIndex
                      return (
                        <button
                          key={cmd.id}
                          data-index={index}
                          onClick={() => handleSelect(cmd.id)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left group",
                            selectedIndex === index
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <cmd.icon className={cn(
                              "h-4 w-4 shrink-0",
                              selectedIndex === index ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="min-w-0">
                              <span className="text-sm font-medium block truncate">{cmd.label}</span>
                              {cmd.description && (
                                <span className="text-xs text-muted-foreground block truncate">
                                  {cmd.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium bg-muted border rounded shrink-0 ml-2">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <span>{filtered.length} commands</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
