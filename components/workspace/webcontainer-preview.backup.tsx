'use client'

import { useEffect, useState, useRef } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { File } from '@/types'

interface WebContainerPreviewProps {
  projectId: string
  files: File[]
}

export function WebContainerPreview({ projectId, files }: WebContainerPreviewProps) {
  const { webcontainer, isBooting, error: bootError } = useWebContainer()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasStarted = useRef(false)

  // Build file tree from files array
  function buildFileTree(files: File[]) {
    const tree: any = {}

    files.forEach(file => {
      const parts = file.path.split('/')
      let current = tree

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = {
            file: {
              contents: file.content,
            },
          }
        } else {
          // It's a directory
          if (!current[part]) {
            current[part] = {
              directory: {},
            }
          }
          current = current[part].directory
        }
      })
    })

    return tree
  }

  // Start the WebContainer dev server
  async function startDevServer() {
    if (!webcontainer || hasStarted.current) return

    try {
      hasStarted.current = true
      setError(null)
      addLog('Mounting project files...')

      // Mount files to WebContainer
      const fileTree = buildFileTree(files)
      await webcontainer.mount(fileTree)
      addLog('Files mounted successfully')

      // Check if package.json exists
      const hasPackageJson = files.some(f => f.path === 'package.json')

      if (hasPackageJson) {
        // Install dependencies
        setIsInstalling(true)
        addLog('Installing dependencies...')

        const installProcess = await webcontainer.spawn('npm', ['install'])

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(data)
            },
          })
        )

        const installExitCode = await installProcess.exit

        if (installExitCode !== 0) {
          throw new Error(`Installation failed with exit code ${installExitCode}`)
        }

        setIsInstalling(false)
        addLog('Dependencies installed successfully')
      }

      // Start dev server
      setIsStarting(true)
      addLog('Starting dev server...')

      // Try to find the dev script in package.json
      const packageJsonFile = files.find(f => f.path === 'package.json')
      let devCommand = 'dev'

      if (packageJsonFile) {
        try {
          const packageJson = JSON.parse(packageJsonFile.content)
          if (packageJson.scripts) {
            // Prefer these commands in order
            if (packageJson.scripts.dev) devCommand = 'dev'
            else if (packageJson.scripts.start) devCommand = 'start'
            else if (packageJson.scripts.serve) devCommand = 'serve'
          }
        } catch (e) {
          console.warn('Failed to parse package.json:', e)
        }
      }

      const devProcess = await webcontainer.spawn('npm', ['run', devCommand])

      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(data)
          },
        })
      )

      // Wait for server to be ready
      webcontainer.on('server-ready', (port, url) => {
        addLog(`Server ready at ${url}`)
        setPreviewUrl(url)
        setIsStarting(false)
      })
    } catch (err) {
      console.error('Failed to start dev server:', err)
      setError(err instanceof Error ? err.message : 'Failed to start dev server')
      setIsInstalling(false)
      setIsStarting(false)
      hasStarted.current = false
    }
  }

  function addLog(message: string) {
    setLogs(prev => [...prev, message])
  }

  // Start dev server when WebContainer is ready
  useEffect(() => {
    if (webcontainer && !isBooting && files.length > 0) {
      startDevServer()
    }
  }, [webcontainer, isBooting, files.length])

  // Update files when they change
  useEffect(() => {
    if (!webcontainer || !previewUrl) return

    async function updateFiles() {
      try {
        for (const file of files) {
          await webcontainer.fs.writeFile(file.path, file.content)
        }
      } catch (err) {
        console.error('Failed to update files:', err)
      }
    }

    updateFiles()
  }, [files, webcontainer, previewUrl])

  if (bootError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">WebContainer Error</h3>
        <p className="text-sm text-muted-foreground max-w-md">{bootError}</p>
        <p className="text-xs text-muted-foreground mt-4">
          WebContainers require a modern browser with SharedArrayBuffer support
        </p>
      </div>
    )
  }

  if (isBooting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Booting WebContainer...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Start</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button
          onClick={() => {
            hasStarted.current = false
            setError(null)
            setLogs([])
            startDevServer()
          }}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (isInstalling || isStarting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium mb-2">
          {isInstalling ? 'Installing dependencies...' : 'Starting dev server...'}
        </p>
        <div className="w-full max-w-2xl bg-muted rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
          {logs.slice(-10).map((log, i) => (
            <div key={i} className="text-muted-foreground">
              {log}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">Live Preview</span>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Open in new tab
            </a>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTerminal(!showTerminal)}
        >
          <TerminalIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview iframe */}
      {previewUrl && !showTerminal && (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="flex-1 w-full border-0"
          title="Preview"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      )}

      {/* Terminal logs */}
      {showTerminal && (
        <div className="flex-1 bg-black text-green-400 font-mono text-xs p-4 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}

      {!previewUrl && !showTerminal && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Waiting for preview...</p>
        </div>
      )}
    </div>
  )
}
