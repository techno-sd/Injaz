'use client'

import { useState, useRef, useEffect } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Terminal as TerminalIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TerminalProps {
  projectId: string
}

export function Terminal({ projectId }: TerminalProps) {
  const { webcontainer } = useWebContainer()
  const [lines, setLines] = useState<string[]>(['$ Welcome to WebContainer Terminal', ''])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (!webcontainer || !command.trim()) return

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
        addLine(`[Process exited with code ${exitCode}]`)
      }
    } catch (err) {
      addLine(`Error: ${err instanceof Error ? err.message : 'Command failed'}`)
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
    setLines(['$ Terminal cleared', ''])
  }

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTerminal}
          className="text-green-400 hover:text-green-300 hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 text-sm space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line}
          </div>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-gray-800">
        <span className="text-green-400">$</span>
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning || !webcontainer}
          placeholder={webcontainer ? "Enter command..." : "WebContainer not ready..."}
          className="flex-1 bg-transparent border-none text-green-400 placeholder:text-green-700 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          autoFocus
        />
      </form>

      {/* Help text */}
      <div className="px-4 py-2 text-xs text-green-700 border-t border-gray-800">
        Tip: Use ↑/↓ arrows to navigate command history
      </div>
    </div>
  )
}
