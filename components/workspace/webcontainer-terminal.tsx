'use client'

import { useEffect, useRef, useState } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Terminal as TerminalIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WebContainerTerminalProps {
  onClose?: () => void
  className?: string
}

export function WebContainerTerminal({ onClose, className = '' }: WebContainerTerminalProps) {
  const { webcontainer } = useWebContainer()
  const [output, setOutput] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [currentProcess, setCurrentProcess] = useState<any>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const addOutput = (text: string) => {
    setOutput(prev => [...prev, text])
  }

  const handleCommand = async (command: string) => {
    if (!webcontainer || !command.trim()) return

    addOutput(`$ ${command}`)
    setInput('')

    try {
      const args = command.split(' ')
      const cmd = args[0]
      const cmdArgs = args.slice(1)

      // Kill previous process if running
      if (currentProcess) {
        currentProcess.kill()
      }

      // Spawn new process
      const process = await webcontainer.spawn(cmd, cmdArgs)
      setCurrentProcess(process)

      // Stream output
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addOutput(data)
          },
        })
      )

      // Wait for process to finish
      const exitCode = await process.exit
      if (exitCode !== 0) {
        addOutput(`Process exited with code ${exitCode}`)
      }
      setCurrentProcess(null)
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setCurrentProcess(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    } else if (e.key === 'c' && e.ctrlKey) {
      // Ctrl+C to kill current process
      if (currentProcess) {
        currentProcess.kill()
        setCurrentProcess(null)
        addOutput('^C')
      }
    }
  }

  return (
    <div className={`flex flex-col bg-black text-green-400 ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">WebContainer Terminal</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 font-mono text-sm p-4 overflow-y-auto min-h-[300px] max-h-[500px]"
        onClick={() => inputRef.current?.focus()}
      >
        {output.length === 0 && (
          <div className="text-gray-500">
            WebContainer Terminal Ready. Type commands to interact with your project.
          </div>
        )}
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}

        {/* Command Input */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder="Enter command..."
            disabled={!webcontainer}
            autoFocus
          />
        </div>
      </div>

      {/* Terminal Footer with Quick Commands */}
      <div className="bg-gray-900 px-3 py-2 border-t border-gray-700 flex gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('npm run dev')}
          className="text-xs h-6 text-gray-400 hover:text-white"
        >
          npm run dev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('npm install')}
          className="text-xs h-6 text-gray-400 hover:text-white"
        >
          npm install
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('npm run build')}
          className="text-xs h-6 text-gray-400 hover:text-white"
        >
          npm run build
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('ls')}
          className="text-xs h-6 text-gray-400 hover:text-white"
        >
          ls
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOutput([])}
          className="text-xs h-6 text-gray-400 hover:text-white ml-auto"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
