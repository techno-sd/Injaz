'use client'

import { useState, useRef, useEffect } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Terminal as TerminalIcon, X, Copy, Loader2, Zap, Settings, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface TerminalProps {
  projectId: string
}

const commonCommands = [
  { command: 'npm install', description: 'Install dependencies', icon: '📦' },
  { command: 'npm run dev', description: 'Start dev server', icon: '🚀' },
  { command: 'npm run build', description: 'Build for production', icon: '🔨' },
  { command: 'npm test', description: 'Run tests', icon: '✅' },
  { command: 'ls -la', description: 'List all files', icon: '📂' },
  { command: 'clear', description: 'Clear terminal', icon: '🧹' },
]

export function Terminal({ projectId }: TerminalProps) {
  const { webcontainer } = useWebContainer()
  const [lines, setLines] = useState<string[]>([
    '╔════════════════════════════════════════════════╗',
    '║   Welcome to iEditor WebContainer Terminal    ║',
    '║   Type "help" for common commands              ║',
    '╚════════════════════════════════════════════════╝',
    '',
  ])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [fontSize, setFontSize] = useState(13)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  function addLine(line: string) {
    setLines(prev => [...prev, line])
  }

  async function runCommand(command: string) {
    if (!command.trim()) return

    // Handle special commands
    if (command.trim() === 'clear') {
      clearTerminal()
      return
    }

    if (command.trim() === 'help') {
      addLine(`$ ${command}`)
      addLine('')
      addLine('Common commands:')
      commonCommands.forEach(({ command, description, icon }) => {
        addLine(`  ${icon} ${command.padEnd(20)} - ${description}`)
      })
      addLine('')
      return
    }

    if (!webcontainer) {
      addLine(`$ ${command}`)
      addLine('⚠️  WebContainer not ready yet. Please wait...')
      addLine('')
      return
    }

    setIsRunning(true)
    addLine(`$ ${command}`)

    // Add to history
    setHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    try {
      const args = command.split(' ')
      const cmd = args[0]
      const cmdArgs = args.slice(1)

      const process = await webcontainer.spawn(cmd, cmdArgs)

      // Stream output
      const reader = process.output.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        addLine(value)
      }

      const exitCode = await process.exit
      if (exitCode !== 0) {
        addLine(`❌ Process exited with code ${exitCode}`)
      } else {
        addLine(`✅ Command completed successfully`)
      }
    } catch (err) {
      addLine(`❌ Error: ${err instanceof Error ? err.message : 'Command failed'}`)
    }

    setIsRunning(false)
    addLine('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim() && !isRunning) {
      runCommand(input)
      setInput('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = Math.min(history.length - 1, historyIndex + 1)
        if (newIndex === history.length - 1) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(history[newIndex])
        }
      }
    }
  }

  function clearTerminal() {
    setLines([
      '╔════════════════════════════════════════════════╗',
      '║   Terminal cleared                             ║',
      '╚════════════════════════════════════════════════╝',
      '',
    ])
  }

  function copyOutput() {
    const output = lines.join('\n')
    navigator.clipboard.writeText(output)
    toast({
      title: 'Output copied!',
      description: 'Terminal output copied to clipboard',
    })
  }

  function quickCommand(cmd: string) {
    setInput(cmd)
    inputRef.current?.focus()
  }

  const filteredSuggestions = input.trim()
    ? commonCommands.filter(c => c.command.toLowerCase().includes(input.toLowerCase()))
    : []

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0e1a] via-[#0d1117] to-[#161b22] text-emerald-400 font-mono">
      {/* Enhanced Header */}
      <div className="glass-card border-b backdrop-blur-sm px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-gray-200">Terminal</span>
          </div>
          {isRunning && (
            <Badge variant="secondary" className="gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </Badge>
          )}
          {webcontainer && !isRunning && (
            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
              <Check className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyOutput}
            className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            title="Copy output"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFontSize(12)}>
                <span className="flex-1">Font: Small</span>
                {fontSize === 12 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize(13)}>
                <span className="flex-1">Font: Medium</span>
                {fontSize === 13 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize(14)}>
                <span className="flex-1">Font: Large</span>
                {fontSize === 14 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            title="Clear terminal"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="px-3 py-2 border-b border-gray-800/50 bg-muted/5 overflow-x-auto">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {commonCommands.slice(0, 4).map(({ command, icon }) => (
              <Button
                key={command}
                variant="outline"
                size="sm"
                onClick={() => quickCommand(command)}
                className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 whitespace-nowrap flex-shrink-0"
                disabled={isRunning}
              >
                <span className="mr-1.5">{icon}</span>
                {command}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 relative"
        style={{ fontSize: `${fontSize}px` }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 text-gray-500">
              <div className="text-4xl">⚡</div>
              <p className="text-sm">Terminal ready</p>
              <p className="text-xs">Type a command to get started</p>
            </div>
          </div>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap break-words leading-relaxed",
                line.startsWith('$') && "text-cyan-400 font-semibold",
                line.includes('❌') && "text-red-400",
                line.includes('✅') && "text-green-400",
                line.includes('⚠️') && "text-yellow-400",
                line.startsWith('╔') || line.startsWith('║') || line.startsWith('╚') ? "text-cyan-500" : "text-emerald-400"
              )}
            >
              {line}
            </div>
          ))
        )}
        {isRunning && (
          <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Command Suggestions */}
      {filteredSuggestions.length > 0 && showSuggestions && (
        <div className="border-t border-gray-800/50 bg-[#0d1117] p-2">
          <div className="text-xs text-gray-500 mb-1.5">Suggestions:</div>
          <div className="space-y-1">
            {filteredSuggestions.map(({ command, description, icon }) => (
              <button
                key={command}
                onClick={() => {
                  setInput(command)
                  setShowSuggestions(false)
                  inputRef.current?.focus()
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-emerald-500/10 text-left transition-colors"
              >
                <span>{icon}</span>
                <span className="text-emerald-400 font-medium">{command}</span>
                <span className="text-gray-500 text-xs">- {description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-3 border-t border-gray-800/50 bg-[#0a0e1a]/50 backdrop-blur-sm">
        <span className="text-cyan-400 font-bold text-sm">$</span>
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value)
            setShowSuggestions(e.target.value.length > 0)
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => input.length > 0 && setShowSuggestions(true)}
          disabled={isRunning || !webcontainer}
          placeholder={webcontainer ? "Type command or 'help' for suggestions..." : "⏳ WebContainer initializing..."}
          className="flex-1 bg-transparent border-none text-emerald-400 placeholder:text-emerald-700/50 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
          style={{ fontSize: `${fontSize}px` }}
          autoComplete="off"
          autoFocus
        />
        {isRunning && (
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
        )}
      </form>

      {/* Enhanced Help text */}
      <div className="px-4 py-2 text-xs flex items-center justify-between border-t border-gray-800/30 bg-[#0a0e1a]/30">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">↓</kbd>
            History
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Tab</kbd>
            Autocomplete
          </span>
        </div>
        <div className="text-gray-600">
          {history.length > 0 && <span>{history.length} commands in history</span>}
        </div>
      </div>
    </div>
  )
}
