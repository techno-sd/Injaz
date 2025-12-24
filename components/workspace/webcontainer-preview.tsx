'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useWebContainer } from '@/lib/webcontainer-context'
import { Loader2, Terminal as TerminalIcon, Globe, AlertCircle, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Zap, Package, Cpu, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File, PlatformType } from '@/types'

// Animated dots for loading states
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-2">
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
        style={{ animation: 'dotBounce 1.4s ease-in-out infinite' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
        style={{ animation: 'dotBounce 1.4s ease-in-out 0.2s infinite' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
        style={{ animation: 'dotBounce 1.4s ease-in-out 0.4s infinite' }}
      />
    </span>
  )
}

// Building overlay - shows while app is being generated
function BuildingOverlay({ message, progress, filesCount }: { message: string; progress: number; filesCount: number }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* Animated logo/icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-16 h-16 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Cpu className="h-7 w-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">
          Building Your App
          <LoadingDots />
        </h2>

        {/* Status message */}
        <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">
          {message}
        </p>

        {/* Progress bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Pulse overlay for shimmer effect */}
              <div
                className="absolute inset-0 bg-white/20 animate-pulse"
              />
            </div>
          </div>
        </div>

        {/* Files count */}
        {filesCount > 0 && (
          <p className="text-xs text-white/40 font-mono">
            {filesCount} file{filesCount !== 1 ? 's' : ''} ready
          </p>
        )}

        {/* Tip */}
        <div className="mt-8 px-4 py-2 rounded-lg bg-white/5 border border-white/10 max-w-sm mx-auto">
          <p className="text-xs text-white/40">
            <span className="text-emerald-400">Tip:</span> Your app will appear automatically when ready
          </p>
        </div>
      </div>

    </div>
  )
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface WebContainerPreviewProps {
  projectId: string
  files: File[]
  platform?: PlatformType
  onError?: (error: { message: string; stack?: string }) => void
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

export function WebContainerPreview({ projectId, files, platform = 'webapp', onError }: WebContainerPreviewProps) {
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
  const [isBuildingApp, setIsBuildingApp] = useState(true) // Show loading overlay during initial build
  const [buildProgress, setBuildProgress] = useState(0)
  const [buildMessage, setBuildMessage] = useState('Preparing your app...')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasStarted = useRef(false)
  const devProcessRef = useRef<any>(null)
  const serverReadyListenerRegisteredRef = useRef(false)
  const autoInstallInFlightRef = useRef(false)
  const attemptedAutoInstallsRef = useRef<Set<string>>(new Set())
  const previousFilesRef = useRef<Map<string, string>>(new Map())
  const downloadTimerRef = useRef<NodeJS.Timeout | null>(null)
  const serverStartTimeRef = useRef<number>(0)
  const initialFilesBufferRef = useRef<File[]>([])
  const lastFileReceiveTimeRef = useRef<number>(0)
  const initialRefreshScheduledRef = useRef<boolean>(false)
  const batchMountTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialGenerationCompleteRef = useRef<boolean>(false)

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

  // Cleanup batch mount timeout on unmount
  useEffect(() => {
    return () => {
      if (batchMountTimeoutRef.current) {
        clearTimeout(batchMountTimeoutRef.current)
      }
    }
  }, [])

  // Propagate errors to parent component for AI Fix feature
  useEffect(() => {
    if (error && onError) {
      onError({ message: error })
    }
  }, [error, onError])

  // Also propagate boot errors
  useEffect(() => {
    if (bootError && onError) {
      onError({ message: bootError })
    }
  }, [bootError, onError])

  // Hide building overlay when server is ready and running
  // This ensures the overlay hides even if batch mount didn't trigger
  useEffect(() => {
    if (previewUrl && isServerRunning && isBuildingApp) {
      // Give a short delay to allow initial content to load
      const timer = setTimeout(() => {
        setIsBuildingApp(false)
        initialGenerationCompleteRef.current = true
      }, 1000) // Reduced from 2s to 1s
      return () => clearTimeout(timer)
    }
  }, [previewUrl, isServerRunning, isBuildingApp])

  // Maximum timeout for building overlay - prevent infinite loading
  useEffect(() => {
    if (isBuildingApp) {
      const maxTimeout = setTimeout(() => {
        console.log('[Preview] Max overlay timeout reached, hiding overlay')
        setIsBuildingApp(false)
        initialGenerationCompleteRef.current = true
      }, 30000) // 30 second max
      return () => clearTimeout(maxTimeout)
    }
  }, [isBuildingApp])

  // Reset building state when projectId changes (new project)
  useEffect(() => {
    setIsBuildingApp(true)
    setBuildProgress(0)
    setBuildMessage('Preparing your app...')
    initialGenerationCompleteRef.current = false
    initialFilesBufferRef.current = []
    previousFilesRef.current.clear()
  }, [projectId])

  // Detect new generation starting (when files are replaced with new content)
  // This helps reset the overlay if user starts a new generation
  const prevFileCountRef = useRef(files.length)
  useEffect(() => {
    // If files dropped to near zero or very few base files, likely a new generation starting
    if (prevFileCountRef.current > 5 && files.length <= 3) {
      setIsBuildingApp(true)
      setBuildProgress(0)
      setBuildMessage('Starting new generation...')
      initialGenerationCompleteRef.current = false
      initialFilesBufferRef.current = []
    }
    prevFileCountRef.current = files.length
  }, [files.length])

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

  // Base UI components that should always be available for AI-generated code
  const getBaseUIComponents = useCallback((): File[] => {
    const baseComponents: File[] = []

    // Utils helper
    baseComponents.push({
      id: 'base-utils',
      project_id: projectId,
      path: 'src/lib/utils.ts',
      content: `import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
`,
      language: 'typescript',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Button component
    baseComponents.push({
      id: 'base-button',
      project_id: projectId,
      path: 'src/components/ui/button.tsx',
      content: `import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      default: "bg-emerald-600 text-white hover:bg-emerald-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white",
      secondary: "bg-white/10 text-white hover:bg-white/20",
      ghost: "hover:bg-white/10 text-white",
      link: "text-emerald-400 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(baseStyles, variants[variant], sizes[size], className, (children as any).props?.className),
        ref,
        ...props
      })
    }

    return (
      <button className={cn(baseStyles, variants[variant], sizes[size], className)} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
`,
      language: 'typescript',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Card component
    baseComponents.push({
      id: 'base-card',
      project_id: projectId,
      path: 'src/components/ui/card.tsx',
      content: `import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-white/10 bg-white/5 text-white shadow-sm", className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
`,
      language: 'typescript',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return baseComponents
  }, [projectId])

  // Build file tree from files array, ensuring base UI components exist
  const buildFileTree = useCallback((fileList: File[]) => {
    const tree: any = {}

    // Check if base UI components are missing and add them
    const paths = new Set(fileList.map(f => f.path))
    const baseComponents = getBaseUIComponents()
    const filesToMount = [...fileList]

    for (const baseComponent of baseComponents) {
      if (!paths.has(baseComponent.path)) {
        filesToMount.push(baseComponent)
      }
    }

    filesToMount.forEach(file => {
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
  }, [getBaseUIComponents])

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message])
  }, [])

  const chunkToText = useCallback((chunk: any) => {
    if (typeof chunk === 'string') return chunk
    try {
      // WebContainer outputs Uint8Array chunks
      return new TextDecoder().decode(chunk)
    } catch {
      return String(chunk)
    }
  }, [])

  const extractMissingDependency = useCallback((text: string): string | null => {
    // Vite overlay / import-analysis
    // Example: Failed to resolve import "framer-motion" from "src/pages/Home.tsx".
    const m1 = text.match(/Failed to resolve import\s+"([^"]+)"\s+from\s+"/)
    if (m1?.[1]) return m1[1]

    // Node-style resolution error
    // Example: Cannot find module 'framer-motion'
    const m2 = text.match(/Cannot find module\s+'([^']+)'/)
    if (m2?.[1]) return m2[1]

    return null
  }, [])

  // NOTE: restartDevServer must be defined BEFORE maybeAutoInstallDependency
  // to avoid "Cannot access before initialization" error
  const restartDevServerRef = useRef<((reason: string) => Promise<void>) | null>(null)

  const restartDevServer = useCallback(async (reason: string) => {
    if (!webcontainer) return

    addLog(`Restarting dev server (${reason})...`)

    try {
      if (devProcessRef.current?.kill) {
        devProcessRef.current.kill()
      }
    } catch {
      // ignore
    }

    devProcessRef.current = null
    hasStarted.current = false
    setIsServerRunning(false)
    setPreviewUrl('')
    setIsInstalling(false)
    setIsStarting(false)

    // Give the container a moment to settle before restarting
    setTimeout(() => {
      startDevServer()
    }, 250)
  }, [webcontainer, addLog, setIsServerRunning, setPreviewUrl])

  // Update ref so maybeAutoInstallDependency can access it
  restartDevServerRef.current = restartDevServer

  const maybeAutoInstallDependency = useCallback(async (dep: string) => {
    if (!webcontainer) return
    if (!dep || dep.startsWith('.') || dep.startsWith('/')) return
    if (autoInstallInFlightRef.current) return
    if (attemptedAutoInstallsRef.current.has(dep)) return

    attemptedAutoInstallsRef.current.add(dep)
    autoInstallInFlightRef.current = true

    try {
      addLog(`Detected missing dependency "${dep}" — auto-installing...`)
      setIsInstalling(true)

      const installProcess = await webcontainer.spawn('npm', [
        'install',
        dep,
        '--prefer-offline',
        '--no-audit',
        '--no-fund'
      ])
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(chunkToText(data))
          },
        })
      )

      const exitCode = await installProcess.exit
      setIsInstalling(false)

      if (exitCode !== 0) {
        addLog(`Auto-install failed for ${dep} (exit ${exitCode})`)
        return
      }

      addLog(`Installed ${dep}. Restarting dev server...`)
      if (restartDevServerRef.current) {
        await restartDevServerRef.current(`installed ${dep}`)
      }
    } finally {
      autoInstallInFlightRef.current = false
      setIsInstalling(false)
    }
  }, [webcontainer, addLog, chunkToText])

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

      // Listen for server ready event (register once to avoid duplicate listeners on restarts)
      if (!serverReadyListenerRegisteredRef.current) {
        serverReadyListenerRegisteredRef.current = true
        webcontainer.on('server-ready', (port, url) => {
          addLog(`Server ready at ${url}`)
          setPreviewUrl(url)
          setIsServerRunning(true)
          setIsStarting(false)
          // Track when server started to avoid unnecessary restarts during initial generation
          serverStartTimeRef.current = Date.now()
        })
      }

      if (hasPackageJson) {
        // npm-based project: Install dependencies and run dev server
        setIsInstalling(true)
        addLog('Installing dependencies (this may take a moment)...')

        // Use optimization flags to speed up npm install:
        // --prefer-offline: Use cached packages when possible
        // --no-audit: Skip security audit (saves time)
        // --no-fund: Skip funding messages
        // --loglevel=error: Reduce output noise
        const installProcess = await webcontainer.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--loglevel=error'
        ])

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              const text = chunkToText(data)
              addLog(text)
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
        devProcessRef.current = devProcess

        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              const text = chunkToText(data)
              addLog(text)

              // Self-heal missing dependencies reported by Vite
              const missingDep = extractMissingDependency(text)
              if (missingDep) {
                // fire-and-forget, but guarded by refs
                void maybeAutoInstallDependency(missingDep)
              }
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
              addLog(chunkToText(data))
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
  }, [webcontainer, files, buildFileTree, addLog, setPreviewUrl, setIsServerRunning, chunkToText, extractMissingDependency, maybeAutoInstallDependency])

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

    // CRITICAL: Wait for package.json to be present before starting
    // This prevents race conditions where npm install runs before all dependencies are defined
    const hasPackageJson = files.some(f => f.path === 'package.json')
    if (!hasPackageJson) {
      console.log('[Preview] Waiting for package.json before starting...')
      return
    }

    // Also ensure we have at least a main entry file (App.tsx or index.tsx)
    const hasMainFile = files.some(f =>
      f.path === 'src/App.tsx' ||
      f.path === 'src/main.tsx' ||
      f.path === 'index.html'
    )
    if (!hasMainFile) {
      console.log('[Preview] Waiting for main entry file...')
      return
    }

    // All conditions met - start the dev server
    console.log('[Preview] Starting dev server - all conditions met, files:', files.length)
    startDevServer()
  }, [webcontainer, isBooting, files, isServerRunning, previewUrl, isInstalling, isStarting, startDevServer])

  // Fallback: Auto-retry if we're in the waiting state for too long
  // This handles edge cases where the main effect doesn't trigger properly
  useEffect(() => {
    // Check for required files
    const hasPackageJson = files.some(f => f.path === 'package.json')
    const hasMainFile = files.some(f =>
      f.path === 'src/App.tsx' ||
      f.path === 'src/main.tsx' ||
      f.path === 'index.html'
    )

    // Only run if we're in the "waiting" state (ready but not started) AND have required files
    const shouldBeStarting = webcontainer && !isBooting && files.length > 0 &&
                             hasPackageJson && hasMainFile &&
                             !hasStarted.current && !isServerRunning && !previewUrl &&
                             !isInstalling && !isStarting && !error

    if (!shouldBeStarting) {
      return
    }

    // Set a fallback timer to auto-start after 500ms if nothing else triggered it
    const fallbackTimer = setTimeout(() => {
      if (!hasStarted.current && !previewUrl && !isInstalling && !isStarting) {
        console.log('[Preview] Fallback timer triggering startDevServer with', files.length, 'files')
        startDevServer()
      }
    }, 500)

    return () => clearTimeout(fallbackTimer)
  }, [webcontainer, isBooting, files, isServerRunning, previewUrl, isInstalling, isStarting, error, startDevServer])

  // Build partial file tree for changed files only
  const buildPartialFileTree = useCallback((changedFiles: File[]) => {
    const tree: any = {}

    changedFiles.forEach(file => {
      const parts = file.path.split('/')
      let current = tree

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = {
            file: {
              contents: file.content,
            },
          }
        } else {
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

  // Config files that require a server restart when changed
  const CONFIG_FILES = [
    'package.json',
    'vite.config.ts',
    'vite.config.js',
    'tsconfig.json',
    'tailwind.config.js',
    'tailwind.config.ts',
    'postcss.config.js',
    'postcss.config.cjs',
  ]

  // Batch mount all buffered files at once - called after initial generation settles
  const performBatchMount = useCallback(async () => {
    if (!webcontainer || !previewUrl) return
    if (initialFilesBufferRef.current.length === 0) return

    const filesToMount = [...initialFilesBufferRef.current]
    initialFilesBufferRef.current = []
    initialGenerationCompleteRef.current = true

    try {
      setIsHotReloading(true)
      setBuildProgress(90)
      setBuildMessage('Mounting files...')
      addLog(`Batch mounting ${filesToMount.length} files...`)

      // Update tracking
      for (const file of filesToMount) {
        previousFilesRef.current.set(file.path, file.content)
      }

      // Mount all files at once
      const partialTree = buildPartialFileTree(filesToMount)
      await webcontainer.mount(partialTree)

      addLog(`Mounted ${filesToMount.length} files successfully`)
      setBuildProgress(100)
      setBuildMessage('Launching preview...')

      // Single refresh after all files are mounted, then hide overlay
      setTimeout(() => {
        if (iframeRef.current) {
          addLog('Refreshing preview after batch mount...')
          iframeRef.current.src = iframeRef.current.src
        }
        setIsHotReloading(false)
        // Hide building overlay after a short delay for smooth transition
        setTimeout(() => {
          setIsBuildingApp(false)
        }, 500)
      }, 800)
    } catch (err) {
      console.error('Failed to batch mount files:', err)
      setIsHotReloading(false)
      setIsBuildingApp(false) // Hide overlay even on error to show the actual error
    }
  }, [webcontainer, previewUrl, buildPartialFileTree, addLog])

  // Debounced file update function - uses mount() for bulk updates
  const updateChangedFiles = useCallback(
    debounce(async (filesToUpdate: File[]) => {
      if (!webcontainer || !previewUrl) return

      // Check if we're in initial generation phase
      // Reduced to 30s - overlay now auto-hides when server is ready
      const timeSinceServerStart = Date.now() - (serverStartTimeRef.current || 0)
      const isInitialPhase = timeSinceServerStart < 30000 && !initialGenerationCompleteRef.current

      // During initial generation, buffer files instead of mounting immediately
      if (isInitialPhase) {
        const changedFiles: File[] = []

        for (const file of filesToUpdate) {
          const previousContent = previousFilesRef.current.get(file.path)
          if (previousContent === undefined || previousContent !== file.content) {
            changedFiles.push(file)
          }
        }

        if (changedFiles.length > 0) {
          // Add to buffer
          for (const file of changedFiles) {
            // Remove old version if exists
            const existingIdx = initialFilesBufferRef.current.findIndex(f => f.path === file.path)
            if (existingIdx >= 0) {
              initialFilesBufferRef.current.splice(existingIdx, 1)
            }
            initialFilesBufferRef.current.push(file)
          }

          lastFileReceiveTimeRef.current = Date.now()
          addLog(`Buffered ${changedFiles.length} file(s) (${initialFilesBufferRef.current.length} total)`)

          // Update building overlay progress
          const totalBuffered = initialFilesBufferRef.current.length
          // Estimate progress based on typical app size (15-25 files)
          const estimatedProgress = Math.min((totalBuffered / 20) * 80, 80) // Cap at 80% until fully mounted
          setBuildProgress(estimatedProgress)

          // Update message based on file types being received
          const lastFile = changedFiles[changedFiles.length - 1]
          if (lastFile.path.includes('App.tsx') || lastFile.path.includes('App.jsx')) {
            setBuildMessage('Creating main application...')
          } else if (lastFile.path.includes('components/')) {
            setBuildMessage('Generating components...')
          } else if (lastFile.path.includes('pages/') || lastFile.path.includes('routes/')) {
            setBuildMessage('Setting up routes...')
          } else if (lastFile.path.endsWith('.css')) {
            setBuildMessage('Applying styles...')
          } else if (lastFile.path.includes('package.json')) {
            setBuildMessage('Configuring dependencies...')
          } else {
            setBuildMessage(`Creating ${lastFile.path.split('/').pop()}...`)
          }

          // Clear existing timeout and set new one
          if (batchMountTimeoutRef.current) {
            clearTimeout(batchMountTimeoutRef.current)
          }

          // Wait 2s after last file before batch mounting
          batchMountTimeoutRef.current = setTimeout(() => {
            performBatchMount()
          }, 2000)
        }
        return
      }

      // Normal update flow (after initial generation)
      try {
        setIsHotReloading(true)
        const changedFiles: File[] = []
        const newFiles: File[] = []

        // Collect all changed and new files
        for (const file of filesToUpdate) {
          const previousContent = previousFilesRef.current.get(file.path)
          if (previousContent === undefined) {
            // New file that wasn't in the previous state
            newFiles.push(file)
            changedFiles.push(file)
            previousFilesRef.current.set(file.path, file.content)
          } else if (previousContent !== file.content) {
            // Existing file with changed content
            changedFiles.push(file)
            previousFilesRef.current.set(file.path, file.content)
          }
        }

        if (changedFiles.length > 0) {
          // Use mount() for bulk updates
          const partialTree = buildPartialFileTree(changedFiles)
          await webcontainer.mount(partialTree)

          addLog(`Updated ${changedFiles.length} file(s)${newFiles.length > 0 ? ` (${newFiles.length} new)` : ''}`)

          // Check if any config files changed (requires restart or full refresh)
          const hasConfigChange = changedFiles.some(f =>
            CONFIG_FILES.some(cfg => f.path === cfg || f.path.endsWith('/' + cfg))
          )

          // If package.json changed, dependencies may have changed. Reinstall + restart.
          const packageJsonChanged = changedFiles.some(f => f.path === 'package.json' || f.path.endsWith('/package.json'))

          if (packageJsonChanged) {
            addLog('Detected package.json change - reinstalling dependencies...')
            try {
              setIsInstalling(true)
              const installProcess = await webcontainer.spawn('npm', [
                'install',
                '--prefer-offline',
                '--no-audit',
                '--no-fund'
              ])
              installProcess.output.pipeTo(
                new WritableStream({
                  write(data) {
                    addLog(chunkToText(data))
                  },
                })
              )
              const exitCode = await installProcess.exit
              setIsInstalling(false)
              if (exitCode !== 0) {
                throw new Error(`npm install failed with exit code ${exitCode}`)
              }
              addLog('Dependencies updated successfully')
              // Restart server so Vite can resolve new deps
              await restartDevServer('dependencies updated')
              return
            } catch (e) {
              setIsInstalling(false)
              addLog(`Failed to reinstall deps: ${e instanceof Error ? e.message : String(e)}`)
              // Fall through to refresh behavior
            }
          }

          // For config changes or bulk updates (3+ files), do a full page refresh
          if ((hasConfigChange || changedFiles.length >= 3) && iframeRef.current) {
            const delay = hasConfigChange ? 1000 : 600 // More time for config changes
            setTimeout(() => {
              if (iframeRef.current) {
                addLog('Refreshing preview...')
                iframeRef.current.src = iframeRef.current.src
              }
            }, delay)
          } else if (changedFiles.length >= 1) {
            // Even for small changes, give Vite a moment to process
            setTimeout(() => {
              // Trigger a soft refresh by touching the iframe
              if (iframeRef.current?.contentWindow) {
                try {
                  iframeRef.current.contentWindow.postMessage({ type: 'vite:invalidate' }, '*')
                } catch {
                  // Cross-origin, just let HMR handle it
                }
              }
            }, 200)
          }
        }
      } catch (err) {
        console.error('Failed to update files:', err)
      } finally {
        setIsHotReloading(false)
      }
    }, 500), // Reduced debounce to be more responsive
    [webcontainer, previewUrl, buildPartialFileTree, addLog, restartDevServer, performBatchMount]
  )

  // Track if we need to refresh after server starts
  const pendingRefreshRef = useRef(false)
  const initialMountDoneRef = useRef(false)

  // Update files when they change
  useEffect(() => {
    if (!webcontainer || !previewUrl) {
      // If files changed but server not ready, mark for refresh
      if (files.length > 0 && previousFilesRef.current.size > 0) {
        const hasChanges = files.some(f => {
          const prev = previousFilesRef.current.get(f.path)
          return prev === undefined || prev !== f.content
        })
        if (hasChanges) {
          pendingRefreshRef.current = true
        }
      }
      return
    }
    updateChangedFiles(files)
  }, [files, webcontainer, previewUrl, updateChangedFiles])

  // Initialize previous files map when server starts or when first files arrive
  useEffect(() => {
    if (previewUrl && files.length > 0) {
      // Only set files that aren't already tracked (to preserve change detection)
      files.forEach(file => {
        if (!previousFilesRef.current.has(file.path)) {
          previousFilesRef.current.set(file.path, file.content)
        }
      })

      // If we have pending changes from before server was ready, refresh now
      if (pendingRefreshRef.current && !initialMountDoneRef.current) {
        pendingRefreshRef.current = false
        initialMountDoneRef.current = true

        // Remount all files and refresh
        setTimeout(async () => {
          if (webcontainer && iframeRef.current) {
            try {
              const fileTree = buildFileTree(files)
              await webcontainer.mount(fileTree)
              addLog('Synced pending file changes')
              // Force refresh after mount
              setTimeout(() => {
                if (iframeRef.current) {
                  addLog('Refreshing preview with new files...')
                  iframeRef.current.src = iframeRef.current.src
                }
              }, 800)
            } catch (err) {
              console.error('Failed to sync pending files:', err)
            }
          }
        }, 100)
      } else if (!initialMountDoneRef.current) {
        initialMountDoneRef.current = true
      }
    }
  }, [previewUrl, files, webcontainer, buildFileTree, addLog])

  // Enhanced refresh that syncs files before reloading
  // NOTE: This hook must be called before any early returns
  const handleRefresh = useCallback(async () => {
    if (!webcontainer || !iframeRef.current) return

    setIsHotReloading(true)
    addLog('Syncing all files...')

    try {
      // Remount all current files to ensure sync
      const fileTree = buildFileTree(files)
      await webcontainer.mount(fileTree)

      // Update previousFilesRef with current state
      files.forEach(file => {
        previousFilesRef.current.set(file.path, file.content)
      })

      addLog('Files synced, refreshing preview...')

      // Wait for mount to complete before refreshing
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src
        }
        setIsHotReloading(false)
      }, 500)
    } catch (err) {
      console.error('Failed to sync files:', err)
      addLog('Sync failed, attempting refresh anyway...')
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
      setIsHotReloading(false)
    }
  }, [webcontainer, files, buildFileTree, addLog])

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
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/10 p-8">
        <div className="text-center">
          {/* Animated icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg shadow-primary/25 mb-4">
            <Cpu className="h-8 w-8 text-white" />
          </div>

          {/* Status text */}
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {isPreparingToInstall ? 'Preparing environment' : 'Starting WebContainer'}
            <LoadingDots />
          </h2>
          <p className="text-sm text-muted-foreground">
            Setting up Node.js in your browser
          </p>

          {/* Simple spinner */}
          <div className="mt-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>

          {/* Help section for slow downloads */}
          {showDownloadHelp && (
            <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-xs mx-auto">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                Taking longer than expected
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Retry
              </Button>
            </div>
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
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/10 p-8">
        <div className="text-center">
          {/* Animated icon */}
          <div className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4',
            isInstalling
              ? 'bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-emerald-500/25'
              : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/25'
          )}>
            {isInstalling ? (
              <Package className="h-8 w-8 text-white animate-pulse" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </div>

          {/* Status text */}
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {isInstalling ? 'Installing dependencies' : 'Starting server'}
            <LoadingDots />
          </h2>
          <p className="text-sm text-muted-foreground">
            {isInstalling ? 'This may take a moment' : 'Almost ready'}
          </p>

          {/* Simple spinner */}
          <div className="mt-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        </div>
      </div>
    )
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
              'h-full transition-all duration-300 ease-out bg-background shadow-2xl rounded-lg overflow-hidden relative',
              deviceMode === 'mobile' && 'max-w-[375px]',
              deviceMode === 'tablet' && 'max-w-[768px]',
              deviceMode === 'desktop' && 'w-full'
            )}
            style={{ width: deviceModes[deviceMode].width }}
          >
            {/* Building overlay - shows during initial generation to prevent error display */}
            {isBuildingApp && (
              <BuildingOverlay
                message={buildMessage}
                progress={buildProgress}
                filesCount={initialFilesBufferRef.current.length}
              />
            )}
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
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Subtle animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6">
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="absolute w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
                  <Monitor className="h-5 w-5 text-muted-foreground/40" />
                </div>
              </div>

              <h3 className="text-base font-medium text-muted-foreground/70 mb-1.5">Your preview will appear here</h3>
              <p className="text-xs text-muted-foreground/40 max-w-[200px] mx-auto">Start a conversation with AI to build your application</p>

              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '0s' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
