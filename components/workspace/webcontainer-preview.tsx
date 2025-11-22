'use client'

import { useEffect, useState, useRef } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File } from '@/types'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface WebContainerPreviewProps {
  projectId: string
  files: File[]
}

const deviceModes = {
  desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
}

export function WebContainerPreview({ projectId, files }: WebContainerPreviewProps) {
  const { webcontainer, isBooting, error: bootError } = useWebContainer()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
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

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/10">
      {/* Enhanced Header */}
      <div className="glass-card border-b px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Live Preview</span>
          <Badge variant="secondary" className="gap-1 text-xs">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {(Object.keys(deviceModes) as DeviceMode[]).map((mode) => {
              const DeviceIcon = deviceModes[mode].icon
              return (
                <Button
                  key={mode}
                  variant={deviceMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode(mode)}
                  className={cn(
                    'h-8 w-8 p-0',
                    deviceMode === mode && 'gradient-primary shadow-md'
                  )}
                  title={deviceModes[mode].label}
                >
                  <DeviceIcon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Open in New Tab */}
          {previewUrl && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8"
              title="Open in new tab"
            >
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          {/* Terminal Toggle */}
          <Button
            variant={showTerminal ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setShowTerminal(!showTerminal)}
            className={cn('h-8 w-8', showTerminal && 'gradient-primary')}
            title="Toggle terminal"
          >
            <TerminalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/20 p-4">
        {previewUrl && !showTerminal && (
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out bg-background shadow-2xl rounded-lg overflow-hidden',
              deviceMode === 'mobile' && 'max-w-[375px]',
              deviceMode === 'tablet' && 'max-w-[768px]',
              deviceMode === 'desktop' && 'w-full'
            )}
            style={{ width: deviceModes[deviceMode].width }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
        )}

        {/* Terminal logs */}
        {showTerminal && (
          <div className="w-full h-full bg-black text-green-400 font-mono text-sm p-6 overflow-y-auto rounded-lg shadow-2xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-green-800">
              <TerminalIcon className="h-4 w-4" />
              <span className="font-semibold">Console Output</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="mb-1 leading-relaxed">{log}</div>
            ))}
          </div>
        )}

        {!previewUrl && !showTerminal && (
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Waiting for preview...</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Dev server is starting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
