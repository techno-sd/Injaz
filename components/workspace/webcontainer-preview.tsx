'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Zap, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File, PlatformType } from '@/types'

// Boot step component for showing progress
function BootStep({ label, status }: { label: string; status: 'pending' | 'active' | 'done' }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'done' ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : status === 'active' ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40" />
      )}
      <span className={cn(
        status === 'done' && 'text-green-500',
        status === 'active' && 'text-primary font-medium',
        status === 'pending' && 'text-muted-foreground/60'
      )}>
        {label}
      </span>
    </div>
  )
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface WebContainerPreviewProps {
  projectId: string
  files: File[]
  platform?: PlatformType
  onFallbackToSandpack?: () => void
}

const deviceModes = {
  desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
}

// Platform-specific device modes
// Websites/Webapps: All device types
const getAvailableDeviceModes = (platform: PlatformType): DeviceMode[] => {
  return ['desktop', 'tablet', 'mobile']
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function WebContainerPreview({ projectId, files, platform = 'webapp', onFallbackToSandpack }: WebContainerPreviewProps) {
  const { webcontainer, isBooting, error: bootError, bootStage, restart } = useWebContainer()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isHotReloading, setIsHotReloading] = useState(false)
  const [showDownloadHelp, setShowDownloadHelp] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasStarted = useRef(false)
  const previousFilesRef = useRef<Map<string, string>>(new Map())
  const downloadTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Show download help after 15 seconds of being stuck on download stage
  useEffect(() => {
    if (bootStage.includes('Downloading')) {
      downloadTimerRef.current = setTimeout(() => {
        setShowDownloadHelp(true)
      }, 15000)
    } else {
      setShowDownloadHelp(false)
      if (downloadTimerRef.current) {
        clearTimeout(downloadTimerRef.current)
        downloadTimerRef.current = null
      }
    }

    return () => {
      if (downloadTimerRef.current) {
        clearTimeout(downloadTimerRef.current)
      }
    }
  }, [bootStage])

  // Network diagnostic function
  const runNetworkDiagnostic = async () => {
    const diagnosticResults: string[] = []

    // Check cross-origin isolation
    diagnosticResults.push(`Cross-origin isolated: ${window.crossOriginIsolated ? '✓ Yes' : '✗ No'}`)
    diagnosticResults.push(`SharedArrayBuffer: ${typeof SharedArrayBuffer !== 'undefined' ? '✓ Available' : '✗ Not available'}`)

    // Try to fetch from WebContainer CDN
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@webcontainer/api/dist/index.js', {
        method: 'HEAD',
        mode: 'cors'
      })
      diagnosticResults.push(`CDN access: ${response.ok ? '✓ OK' : '✗ Blocked'}`)
    } catch (e) {
      diagnosticResults.push('CDN access: ✗ Blocked (check ad blocker/network)')
    }

    alert(`WebContainer Diagnostics:\n\n${diagnosticResults.join('\n')}\n\nIf CDN is blocked, try:\n• Disable browser extensions\n• Use incognito mode\n• Check firewall/network settings`)
  }

  // Ensure device mode is valid for the platform
  useEffect(() => {
    const availableModes = getAvailableDeviceModes(platform)
    if (!availableModes.includes(deviceMode)) {
      setDeviceMode(availableModes[0])
    }
  }, [platform, deviceMode])

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
    // Determine progress based on boot stage
    const getProgress = () => {
      if (bootStage.includes('Checking')) return 20
      if (bootStage.includes('Verifying')) return 40
      if (bootStage.includes('Connecting')) return 60
      if (bootStage.includes('Downloading')) return 80
      if (bootStage.includes('ready')) return 100
      return 10
    }
    const progress = getProgress()

    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-muted" />
          {/* Progress ring */}
          <svg className="absolute inset-0 h-20 w-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary/30"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.26} 226`}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <p className="text-sm font-medium mt-6">Booting WebContainer...</p>
        <p className="text-xs text-muted-foreground mt-1">
          {progress}% complete
        </p>

        {/* Progress steps */}
        <div className="mt-6 space-y-2 text-left">
          <BootStep
            label="Checking browser compatibility"
            status={bootStage.includes('Checking') ? 'active' : progress > 20 ? 'done' : 'pending'}
          />
          <BootStep
            label="Verifying cross-origin isolation"
            status={bootStage.includes('Verifying') ? 'active' : progress > 40 ? 'done' : 'pending'}
          />
          <BootStep
            label="Downloading WebContainer runtime"
            status={bootStage.includes('Downloading') ? 'active' : progress > 80 ? 'done' : 'pending'}
          />
          <BootStep
            label="Initializing environment"
            status={bootStage.includes('ready') ? 'done' : 'pending'}
          />
        </div>

        {showDownloadHelp ? (
          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 max-w-sm">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-2">
              Download taking too long?
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Try: Disable ad blockers, use Chrome/Edge, or check your network connection.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1"
                onClick={runNetworkDiagnostic}
              >
                <AlertCircle className="h-3 w-3 mr-1.5" />
                Diagnose
              </Button>
            </div>
            {onFallbackToSandpack && (
              <Button
                variant="default"
                size="sm"
                className="w-full mt-3 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={onFallbackToSandpack}
              >
                <Zap className="h-3 w-3 mr-1.5" />
                Use Sandpack Preview (No Download)
              </Button>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-6 max-w-xs">
            First boot downloads ~20MB of runtime assets. This is cached for future use.
          </p>
        )}

        {!showDownloadHelp && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-xs"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Taking too long? Refresh page
          </Button>
        )}
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
    // Parse logs to extract package info
    const getPackageProgress = () => {
      const lastLogs = logs.slice(-20)
      let packagesAdded = 0
      let currentPackage = ''

      for (const log of lastLogs) {
        if (log.includes('added') && log.includes('packages')) {
          const match = log.match(/added (\d+) packages/)
          if (match) packagesAdded = parseInt(match[1])
        }
        if (log.includes('npm') && log.includes('install')) {
          currentPackage = 'Resolving dependencies...'
        }
        if (log.includes('reify:')) {
          const match = log.match(/reify:([^\s]+)/)
          if (match) currentPackage = match[1].split('/').pop() || ''
        }
      }
      return { packagesAdded, currentPackage }
    }

    const { packagesAdded, currentPackage } = getPackageProgress()
    const estimatedTotal = 15 // Approximate number of packages
    const progress = isInstalling
      ? Math.min(90, (packagesAdded / estimatedTotal) * 100)
      : 95

    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Circular Progress */}
          <div className="relative mb-8">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white/10"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.83} 283`}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {isInstalling ? (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="h-6 w-6 text-white animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            {isInstalling ? 'Installing Dependencies' : 'Starting Dev Server'}
          </h3>

          {/* Progress percentage */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {Math.round(progress)}%
            </span>
            <span className="text-white/40 text-sm">complete</span>
          </div>

          {/* Current action */}
          {currentPackage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full mb-6">
              <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
              <span className="text-xs text-white/60 font-mono truncate max-w-[200px]">
                {currentPackage}
              </span>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <BootStep
              label="Mounting project files"
              status="done"
            />
            <BootStep
              label="Installing npm packages"
              status={isInstalling ? 'active' : 'done'}
            />
            <BootStep
              label="Starting Vite dev server"
              status={isStarting ? 'active' : isInstalling ? 'pending' : 'done'}
            />
            <BootStep
              label="Ready to preview"
              status="pending"
            />
          </div>

          {/* Packages count */}
          {packagesAdded > 0 && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span>{packagesAdded} packages installed</span>
            </div>
          )}

          {/* Terminal toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-6 text-xs text-white/40 hover:text-white/60"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <TerminalIcon className="h-3 w-3 mr-1.5" />
            {showTerminal ? 'Hide' : 'Show'} Terminal Output
          </Button>

          {/* Terminal logs */}
          {showTerminal && (
            <div className="w-full max-w-lg mt-4 bg-black/50 backdrop-blur rounded-lg border border-white/10 p-4 font-mono text-xs max-h-48 overflow-y-auto">
              {logs.slice(-15).map((log, i) => (
                <div key={i} className="text-green-400/80 leading-relaxed">
                  <span className="text-white/20 mr-2">$</span>
                  {log}
                </div>
              ))}
            </div>
          )}
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
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            {getAvailableDeviceModes(platform).map((mode) => {
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
