'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Zap, CheckCircle2, Circle, Package, Server, Code2, Cpu, Shield, Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File, PlatformType } from '@/types'

// Enhanced progress step with beautiful animations
interface ProgressStepProps {
  icon: React.ReactNode
  label: string
  description?: string
  status: 'pending' | 'active' | 'done'
  isLast?: boolean
}

function ProgressStep({ icon, label, description, status, isLast = false }: ProgressStepProps) {
  const statusLabel = status === 'done' ? 'Completed' : status === 'active' ? 'In progress' : 'Pending'

  return (
    <div
      className="flex items-start gap-4"
      role="listitem"
      aria-label={`${label}: ${statusLabel}`}
    >
      {/* Step indicator with connecting line */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <div
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
            status === 'done' && 'border-emerald-500 bg-emerald-500/20',
            status === 'active' && 'border-primary bg-primary/20 animate-pulse',
            status === 'pending' && 'border-muted-foreground/30 bg-muted/30'
          )}
        >
          {status === 'done' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          ) : status === 'active' ? (
            <div className="relative">
              {icon}
              <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping" aria-hidden="true" />
            </div>
          ) : (
            <div className="text-muted-foreground/50">{icon}</div>
          )}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            className={cn(
              'w-0.5 h-8 transition-all duration-500',
              status === 'done' ? 'bg-emerald-500' : 'bg-muted-foreground/20'
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pt-2">
        <p
          className={cn(
            'text-sm font-medium transition-colors duration-300',
            status === 'done' && 'text-emerald-500',
            status === 'active' && 'text-foreground',
            status === 'pending' && 'text-muted-foreground/60'
          )}
        >
          {label}
          <span className="sr-only"> - {statusLabel}</span>
        </p>
        {description && status === 'active' && (
          <p className="text-xs text-muted-foreground mt-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// Animated dots for loading states
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
    </span>
  )
}

// Gradient progress bar with accessibility
function GradientProgressBar({ progress, className, label = 'Loading progress' }: { progress: number; className?: string; label?: string }) {
  return (
    <div
      className={cn('h-1.5 w-full rounded-full bg-muted/50 overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-primary to-cyan-500 transition-all duration-700 ease-out relative will-change-[width]"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" aria-hidden="true" />
      </div>
    </div>
  )
}

// Floating particles background (purely decorative)
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
    </div>
  )
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface WebContainerPreviewProps {
  projectId: string
  files: File[]
  platform?: PlatformType
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

export function WebContainerPreview({ projectId, files, platform = 'webapp' }: WebContainerPreviewProps) {
  const {
    webcontainer,
    isBooting,
    error: bootError,
    bootStage,
    restart,
    previewUrl,
    setPreviewUrl,
    isServerRunning,
    setIsServerRunning,
  } = useWebContainer()
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
  const buildFileTree = useCallback((fileList: File[]) => {
    const tree: any = {}

    fileList.forEach(file => {
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
  }, [])

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message])
  }, [])

  // Start the WebContainer dev server
  const startDevServer = useCallback(async () => {
    if (!webcontainer) {
      console.log('[Preview] startDevServer: No webcontainer available')
      return
    }
    if (hasStarted.current) {
      console.log('[Preview] startDevServer: Already started')
      return
    }

    console.log('[Preview] startDevServer: Beginning server start')

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
        setIsServerRunning(true)
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
  }, [webcontainer, files, buildFileTree, addLog, setPreviewUrl, setIsServerRunning])

  // Start dev server when WebContainer is ready and all conditions are met
  useEffect(() => {
    // Don't start if conditions aren't met
    if (!webcontainer || isBooting || files.length === 0) {
      return
    }

    // Don't start if already started or server is running
    if (hasStarted.current || isServerRunning || previewUrl) {
      return
    }

    // Don't start if currently installing or starting
    if (isInstalling || isStarting) {
      return
    }

    // All conditions met - start the dev server
    console.log('[Preview] Starting dev server - all conditions met')
    startDevServer()
  }, [webcontainer, isBooting, files.length, isServerRunning, previewUrl, isInstalling, isStarting, startDevServer])

  // Fallback: Auto-retry if we're in the waiting state for too long
  // This handles edge cases where the main effect doesn't trigger properly
  useEffect(() => {
    // Only run if we're in the "waiting" state (ready but not started)
    const shouldBeStarting = webcontainer && !isBooting && files.length > 0 &&
                             !hasStarted.current && !isServerRunning && !previewUrl &&
                             !isInstalling && !isStarting && !error

    if (!shouldBeStarting) {
      return
    }

    // Set a fallback timer to auto-start after 500ms if nothing else triggered it
    const fallbackTimer = setTimeout(() => {
      if (!hasStarted.current && !previewUrl && !isInstalling && !isStarting) {
        console.log('[Preview] Fallback timer triggering startDevServer')
        startDevServer()
      }
    }, 500)

    return () => clearTimeout(fallbackTimer)
  }, [webcontainer, isBooting, files.length, isServerRunning, previewUrl, isInstalling, isStarting, error, startDevServer])

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

  // Show boot UI while booting OR while waiting to start (before install begins)
  // This prevents the gap between boot completion and install start
  const isPreparingToInstall = !isBooting && !isInstalling && !isStarting && !previewUrl && !error && files.length > 0

  if (isBooting || isPreparingToInstall) {
    // Determine progress based on boot stage
    const getProgress = () => {
      if (isPreparingToInstall) return 100
      if (bootStage.includes('Checking')) return 15
      if (bootStage.includes('Verifying')) return 30
      if (bootStage.includes('Connecting')) return 50
      if (bootStage.includes('Downloading')) return 75
      if (bootStage.includes('ready')) return 100
      return 5
    }
    const progress = getProgress()

    // Step statuses
    const getStepStatus = (stepProgress: number): 'pending' | 'active' | 'done' => {
      if (progress > stepProgress) return 'done'
      if (progress >= stepProgress - 20) return 'active'
      return 'pending'
    }

    return (
      <div className="h-full relative flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-8">
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-primary shadow-lg shadow-primary/25 mb-4">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {isPreparingToInstall ? 'Preparing Your Environment' : 'Starting WebContainer'}
              <LoadingDots />
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Setting up a full Node.js environment in your browser
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <GradientProgressBar progress={progress} />
          </div>

          {/* Progress steps */}
          <div
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 shadow-lg"
            role="list"
            aria-label="WebContainer boot progress steps"
          >
            <ProgressStep
              icon={<Shield className="h-5 w-5 text-primary" />}
              label="Checking browser compatibility"
              description="Verifying WebContainer requirements"
              status={bootStage.includes('Checking') ? 'active' : getStepStatus(15)}
            />
            <ProgressStep
              icon={<Globe className="h-5 w-5 text-primary" />}
              label="Verifying security isolation"
              description="Ensuring cross-origin isolation is enabled"
              status={bootStage.includes('Verifying') ? 'active' : getStepStatus(30)}
            />
            <ProgressStep
              icon={<Download className="h-5 w-5 text-primary" />}
              label="Downloading runtime"
              description="Fetching WebContainer assets (~20MB, cached)"
              status={bootStage.includes('Downloading') ? 'active' : getStepStatus(75)}
            />
            <ProgressStep
              icon={<Server className="h-5 w-5 text-primary" />}
              label="Initializing environment"
              description="Setting up Node.js runtime"
              status={bootStage.includes('ready') || isPreparingToInstall ? 'done' : getStepStatus(100)}
            />
            <ProgressStep
              icon={<Package className="h-5 w-5 text-primary" />}
              label="Mounting project files"
              description="Preparing to install dependencies"
              status={isPreparingToInstall ? 'active' : 'pending'}
              isLast
            />
          </div>

          {/* Help section */}
          {showDownloadHelp ? (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Download taking longer than expected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    This could be due to network issues or browser extensions blocking requests.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Retry
                    </Button>
                    <Button variant="ghost" size="sm" onClick={runNetworkDiagnostic}>
                      Run Diagnostics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center mt-6">
              {isPreparingToInstall
                ? 'Mounting project files and preparing npm install...'
                : 'First boot downloads ~20MB. Assets are cached for faster future loads.'}
            </p>
          )}
        </div>
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
      const lastLogs = logs.slice(-30)
      let packagesAdded = 0
      let currentPackage = ''
      let currentAction = ''

      for (const log of lastLogs) {
        if (log.includes('added') && log.includes('packages')) {
          const match = log.match(/added (\d+) packages/)
          if (match) packagesAdded = parseInt(match[1])
        }
        if (log.includes('npm') && log.includes('install')) {
          currentAction = 'Resolving dependencies'
        }
        if (log.includes('reify:')) {
          const match = log.match(/reify:([^\s]+)/)
          if (match) {
            currentPackage = match[1].split('/').pop() || ''
            currentAction = `Installing ${currentPackage}`
          }
        }
        if (log.includes('WARN') || log.includes('warn')) {
          // Skip warnings
        }
      }
      return { packagesAdded, currentPackage, currentAction }
    }

    const { packagesAdded, currentAction } = getPackageProgress()
    const estimatedTotal = 20
    const progress = isInstalling
      ? Math.min(85, 10 + (packagesAdded / estimatedTotal) * 75)
      : 92

    return (
      <div className="h-full relative flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-8">
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={cn(
              'inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 transition-all duration-500',
              isInstalling
                ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/30'
            )}>
              {isInstalling ? (
                <Package className="h-10 w-10 text-white animate-pulse" />
              ) : (
                <Play className="h-10 w-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold">
              {isInstalling ? (
                <>Installing Dependencies<LoadingDots /></>
              ) : (
                <>Starting Dev Server<LoadingDots /></>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isInstalling
                ? 'Running npm install to set up your project'
                : 'Launching Vite development server'}
            </p>
          </div>

          {/* Large progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
                <span className="text-muted-foreground text-sm ml-2">complete</span>
              </div>
              {packagesAdded > 0 && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {packagesAdded} packages
                </Badge>
              )}
            </div>
            <GradientProgressBar progress={progress} className="h-2" />
          </div>

          {/* Current action indicator */}
          {currentAction && (
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentAction}</p>
                <p className="text-xs text-muted-foreground">Processing...</p>
              </div>
            </div>
          )}

          {/* Progress steps */}
          <div
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 shadow-lg"
            role="list"
            aria-label="Installation progress steps"
          >
            <ProgressStep
              icon={<Code2 className="h-5 w-5 text-primary" />}
              label="Mount project files"
              description="Project files ready"
              status="done"
            />
            <ProgressStep
              icon={<Package className="h-5 w-5 text-primary" />}
              label="Install npm packages"
              description={packagesAdded > 0 ? `${packagesAdded} packages installed` : 'Resolving dependencies...'}
              status={isInstalling ? 'active' : 'done'}
            />
            <ProgressStep
              icon={<Server className="h-5 w-5 text-primary" />}
              label="Start development server"
              description="Launching Vite..."
              status={isStarting ? 'active' : isInstalling ? 'pending' : 'done'}
            />
            <ProgressStep
              icon={<Globe className="h-5 w-5 text-primary" />}
              label="Preview ready"
              description="Your app will appear shortly"
              status="pending"
              isLast
            />
          </div>

          {/* Terminal toggle */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTerminal(!showTerminal)}
              className="text-muted-foreground hover:text-foreground"
            >
              <TerminalIcon className="h-4 w-4 mr-2" />
              {showTerminal ? 'Hide' : 'Show'} Terminal Output
            </Button>
          </div>

          {/* Terminal logs */}
          {showTerminal && (
            <div className="mt-4 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">terminal</span>
              </div>
              <div className="p-4 font-mono text-xs max-h-48 overflow-y-auto">
                {logs.slice(-15).map((log, i) => (
                  <div key={i} className="text-emerald-400/80 leading-relaxed py-0.5">
                    <span className="text-zinc-600 mr-2 select-none">$</span>
                    {log}
                  </div>
                ))}
              </div>
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
