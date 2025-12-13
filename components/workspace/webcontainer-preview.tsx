'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Zap } from 'lucide-react'
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

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function WebContainerPreview({ projectId, files }: WebContainerPreviewProps) {
  const { webcontainer, isBooting, error: bootError, restart } = useWebContainer()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isHotReloading, setIsHotReloading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasStarted = useRef(false)
  const previousFilesRef = useRef<Map<string, string>>(new Map())

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
      const packageJsonFile = files.find(f => f.path === 'package.json')
      const hasPackageJson = !!packageJsonFile

      // Listen for server ready event
      webcontainer.on('server-ready', (port, url) => {
        addLog(`Server ready at ${url}`)
        setPreviewUrl(url)
        setIsStarting(false)
      })

      if (hasPackageJson) {
        // npm-based project: Install dependencies and run dev server
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

        // Start dev server
        setIsStarting(true)
        addLog('Starting dev server...')

        // Try to find the dev script in package.json
        let devCommand = 'dev'

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

        const devProcess = await webcontainer.spawn('npm', ['run', devCommand])

        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(data)
            },
          })
        )
      } else {
        // Static HTML project: Use a simple HTTP server
        setIsStarting(true)
        addLog('Starting static file server...')

        // Check if index.html exists
        const hasIndexHtml = files.some(f => f.path === 'index.html')

        if (!hasIndexHtml) {
          // Create a simple index.html if not present
          addLog('No index.html found, creating one...')
          await webcontainer.fs.writeFile('index.html', `<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
  <style>
    body { font-family: system-ui; padding: 2rem; text-align: center; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Add an index.html to see your preview</h1>
</body>
</html>`)
        }

        // Create a simple package.json for serve
        await webcontainer.fs.writeFile('package.json', JSON.stringify({
          name: 'static-preview',
          scripts: {
            start: 'npx -y serve -l 3000'
          }
        }, null, 2))

        // Run npx serve to serve static files (use -y to auto-accept installation)
        addLog('Starting server with npx serve...')
        const serveProcess = await webcontainer.spawn('npx', ['-y', 'serve', '-l', '3000'])

        serveProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(data)
            },
          })
        )
      }
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

  // Debounced file update function
  const updateChangedFiles = useCallback(
    debounce(async (filesToUpdate: File[]) => {
      if (!webcontainer || !previewUrl) return

      try {
        setIsHotReloading(true)
        const changedFiles: string[] = []

        for (const file of filesToUpdate) {
          const previousContent = previousFilesRef.current.get(file.path)

          // Only update files that have actually changed
          if (previousContent !== file.content) {
            await webcontainer.fs.writeFile(file.path, file.content)
            previousFilesRef.current.set(file.path, file.content)
            changedFiles.push(file.path)
          }
        }

        if (changedFiles.length > 0) {
          addLog(`Hot reload: Updated ${changedFiles.join(', ')}`)

          // For static HTML projects, refresh the iframe
          const hasPackageJson = filesToUpdate.some(f => f.path === 'package.json')
          if (!hasPackageJson && iframeRef.current) {
            // Small delay to ensure file is written
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src
              }
            }, 100)
          }
        }
      } catch (err) {
        console.error('Failed to update files:', err)
      } finally {
        setIsHotReloading(false)
      }
    }, 300),
    [webcontainer, previewUrl]
  )

  // Update files when they change
  useEffect(() => {
    if (!webcontainer || !previewUrl) return
    updateChangedFiles(files)
  }, [files, webcontainer, previewUrl, updateChangedFiles])

  // Initialize previous files map when server starts
  useEffect(() => {
    if (previewUrl && files.length > 0) {
      files.forEach(file => {
        previousFilesRef.current.set(file.path, file.content)
      })
    }
  }, [previewUrl])

  if (bootError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">WebContainer Error</h3>
        <p className="text-sm text-muted-foreground max-w-md">{bootError}</p>
        <p className="text-xs text-muted-foreground mt-4">
          WebContainers require a modern browser with SharedArrayBuffer support
        </p>
        <Button
          onClick={async () => {
            await restart()
          }}
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restart WebContainer
        </Button>
      </div>
    )
  }

  if (isBooting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-medium mt-4">Booting WebContainer...</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
          First boot may take 30-60 seconds to download required assets
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Initializing secure environment</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-6 text-xs"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Taking too long? Refresh page
        </Button>
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
          {isHotReloading ? (
            <Badge variant="secondary" className="gap-1 text-xs bg-yellow-500/20 text-yellow-600">
              <Zap className="h-3 w-3 animate-pulse" />
              Updating...
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-xs">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
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
