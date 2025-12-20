'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  Loader2,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Zap,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
  Bug,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Wrench,
  Copy,
  Check,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File, PlatformType } from '@/types'
import type { DebugResult, CodeFix } from '@/lib/ai/debugger'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface RuntimeError {
  message: string
  filename?: string
  lineno?: number
  colno?: number
}

interface LivePreviewProps {
  files: File[]
  platform?: PlatformType
  onError?: (error: RuntimeError) => void
  onFilesChange?: (files: File[]) => void
  className?: string
}

const deviceModes = {
  desktop: { width: '100%', maxWidth: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', maxWidth: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', maxWidth: '375px', icon: Smartphone, label: 'Mobile' },
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

export function LivePreview({
  files,
  platform = 'website',
  onError,
  onFilesChange,
  className
}: LivePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  const [isHotReloading, setIsHotReloading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [previewKey, setPreviewKey] = useState(0)
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())

  // AI Debugging state
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([])
  const [copiedFix, setCopiedFix] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previousContentRef = useRef<string>('')
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ensure device mode is valid for the platform
  useEffect(() => {
    const availableModes = getAvailableDeviceModes(platform)
    if (!availableModes.includes(deviceMode)) {
      setDeviceMode(availableModes[0])
    }
  }, [platform, deviceMode])

  // AI Debug function
  const analyzeWithAI = async () => {
    if (!runtimeError) return

    setIsDebugging(true)
    setShowDebugPanel(true)
    setDebugResult(null)

    try {
      // First get quick suggestions
      const quickRes = await fetch('/api/ai/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: runtimeError,
          mode: 'quick'
        })
      })
      const quickData = await quickRes.json()
      setQuickSuggestions(quickData.suggestions || [])

      // Then get full analysis
      const fullRes = await fetch('/api/ai/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: runtimeError,
          files: files.map(f => ({ path: f.path, content: f.content })),
          mode: 'full'
        })
      })
      const fullData = await fullRes.json()
      setDebugResult(fullData)
    } catch (err) {
      console.error('AI Debug failed:', err)
      setDebugResult({
        analysis: 'Failed to analyze error',
        rootCause: 'Could not connect to AI service',
        suggestions: []
      })
    } finally {
      setIsDebugging(false)
    }
  }

  // Apply fix function
  const applyFix = (fix: CodeFix) => {
    if (!onFilesChange) return

    const updatedFiles = files.map(file => {
      if (file.path === fix.file) {
        return {
          ...file,
          content: file.content.replace(fix.oldCode, fix.newCode)
        }
      }
      return file
    })

    onFilesChange(updatedFiles)
    setRuntimeError(null)
    setShowDebugPanel(false)
  }

  // Copy fix to clipboard
  const copyFix = async (fix: CodeFix) => {
    await navigator.clipboard.writeText(fix.newCode)
    setCopiedFix(fix.file)
    setTimeout(() => setCopiedFix(null), 2000)
  }

  // Build the preview HTML content
  const buildPreviewHtml = useCallback(() => {
    // Find index.html
    const indexHtml = files.find(f =>
      f.path === 'index.html' ||
      f.path.endsWith('/index.html') ||
      f.path === './index.html'
    )

    if (!indexHtml || !indexHtml.content) {
      return generatePlaceholder(files, platform)
    }

    let html = indexHtml.content

    // Inject CSS files
    const cssFiles = files.filter(f => f.path.endsWith('.css') && f.content)
    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(f => f.content).join('\n\n')
      const styleTag = `<style data-live-preview="injected-css">\n${cssContent}\n</style>`

      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}\n</head>`)
      } else {
        html = `${styleTag}\n${html}`
      }
    }

    // Inject JS files
    const jsFiles = files.filter(f =>
      f.path.endsWith('.js') &&
      !f.path.includes('node_modules') &&
      f.content
    )
    if (jsFiles.length > 0) {
      const jsContent = jsFiles.map(f => f.content).join('\n\n')
      const scriptTag = `<script data-live-preview="injected-js">\n${jsContent}\n</script>`

      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`)
      } else {
        html = `${html}\n${scriptTag}`
      }
    }

    // Inject console capture and error handling script
    const helperScript = `
<script data-live-preview="helper">
(function() {
  // Console capture
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  function sendToParent(type, args) {
    try {
      const message = Array.from(args).map(arg => {
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg, null, 2); }
          catch { return String(arg); }
        }
        return String(arg);
      }).join(' ');

      window.parent.postMessage({
        type: 'live-preview-console',
        logType: type,
        message: message,
        timestamp: Date.now()
      }, '*');
    } catch (e) {}
  }

  console.log = function() { sendToParent('log', arguments); originalConsole.log.apply(console, arguments); };
  console.warn = function() { sendToParent('warn', arguments); originalConsole.warn.apply(console, arguments); };
  console.error = function() { sendToParent('error', arguments); originalConsole.error.apply(console, arguments); };
  console.info = function() { sendToParent('info', arguments); originalConsole.info.apply(console, arguments); };

  // Error capture
  window.onerror = function(message, filename, lineno, colno, error) {
    window.parent.postMessage({
      type: 'live-preview-error',
      error: {
        message: message,
        filename: filename,
        lineno: lineno,
        colno: colno
      }
    }, '*');
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    window.parent.postMessage({
      type: 'live-preview-error',
      error: {
        message: 'Unhandled Promise Rejection: ' + (event.reason?.message || event.reason || 'Unknown error'),
        filename: '',
        lineno: 0,
        colno: 0
      }
    }, '*');
  });

  // Signal ready
  window.parent.postMessage({ type: 'live-preview-ready' }, '*');
})();
</script>`

    // Inject helper script at the beginning of head or body
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${helperScript}`)
    } else if (html.includes('<body>')) {
      html = html.replace('<body>', `<body>\n${helperScript}`)
    } else {
      html = `${helperScript}\n${html}`
    }

    return html
  }, [files, platform])

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return

      switch (event.data.type) {
        case 'live-preview-error':
          setRuntimeError(event.data.error)
          onError?.(event.data.error)
          break
        case 'live-preview-ready':
          setIsLoading(false)
          setIsHotReloading(false)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onError])

  // Debounced update function
  const updatePreview = useMemo(() =>
    debounce(() => {
      const newContent = buildPreviewHtml()

      // Check if content actually changed
      if (newContent === previousContentRef.current) {
        return
      }

      previousContentRef.current = newContent
      setIsHotReloading(true)
      setRuntimeError(null)

      // Create new blob URL
      const blob = new Blob([newContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Revoke old URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      setPreviewUrl(url)
      setPreviewKey(prev => prev + 1)
      setLastUpdateTime(Date.now())
    }, 150),
    [buildPreviewHtml]
  )

  // Update preview when files change
  useEffect(() => {
    updatePreview()
  }, [files, updatePreview])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setRuntimeError(null)
    previousContentRef.current = ''
    updatePreview()
  }

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  const clearError = () => {
    setRuntimeError(null)
  }

  return (
    <div className={cn("h-full flex flex-col bg-[#0d0d12]", className)}>
      {/* Header Toolbar */}
      <div className="h-11 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-3 flex-shrink-0">
        {/* Left - Status & Device Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-white">Live Preview</span>
          </div>

          {/* Status Badge */}
          {isHotReloading ? (
            <Badge
              variant="secondary"
              className="h-5 gap-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20"
            >
              <Zap className="h-3 w-3 animate-pulse" />
              Syncing...
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="h-5 gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            >
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        {/* Center - Device Switcher */}
        <div className={cn(
          'flex items-center gap-1 rounded-lg p-0.5',
          'bg-white/[0.04]'
        )}>
          {getAvailableDeviceModes(platform).map((mode) => {
            const DeviceIcon = deviceModes[mode].icon
            return (
              <button
                key={mode}
                onClick={() => setDeviceMode(mode)}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200',
                  deviceMode === mode
                    ? 'bg-white/[0.1] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                )}
                title={deviceModes[mode].label}
              >
                <DeviceIcon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/[0.06]"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/[0.06]"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/[0.06]"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full flex items-center justify-center">
            <div
              className={cn(
                "h-full bg-white rounded-xl overflow-hidden transition-all duration-300 relative",
                deviceMode !== 'desktop' && "ring-[12px] ring-[#1a1a1f] shadow-2xl shadow-black/40",
                deviceMode === 'desktop' && "shadow-2xl shadow-black/30 w-full"
              )}
              style={{
                maxWidth: deviceModes[deviceMode].maxWidth,
                width: deviceModes[deviceMode].width
              }}
            >
              {/* Device Notch for Mobile */}
              {deviceMode === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1a1a1f] rounded-b-2xl z-10" />
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-500">Loading preview...</span>
                  </div>
                </div>
              )}

              {/* Error Overlay with AI Debug */}
              {runtimeError && (
                <div className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-red-500/95 to-red-600/95 backdrop-blur-sm text-white">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Runtime Error</p>
                        <p className="text-xs text-white/90 mt-1 font-mono break-all">
                          {runtimeError.message}
                        </p>
                        {runtimeError.filename && runtimeError.lineno && (
                          <p className="text-xs text-white/70 mt-1">
                            at {runtimeError.filename}:{runtimeError.lineno}:{runtimeError.colno}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={clearError}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* AI Debug Button */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={analyzeWithAI}
                        disabled={isDebugging}
                        className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
                      >
                        {isDebugging ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Debug
                          </>
                        )}
                      </Button>
                      {!showDebugPanel && quickSuggestions.length > 0 && (
                        <button
                          onClick={() => setShowDebugPanel(true)}
                          className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                        >
                          <Lightbulb className="h-3 w-3" />
                          View suggestions
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Debug Panel */}
                  {showDebugPanel && (
                    <div className="border-t border-white/20 bg-black/30 max-h-[300px] overflow-y-auto">
                      <div className="p-4">
                        {/* Quick Suggestions */}
                        {quickSuggestions.length > 0 && !debugResult && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" />
                              Quick Suggestions
                            </p>
                            <ul className="space-y-1">
                              {quickSuggestions.map((suggestion, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-white/40" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Loading State */}
                        {isDebugging && (
                          <div className="flex items-center gap-2 text-white/70">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is analyzing the error...</span>
                          </div>
                        )}

                        {/* Debug Result */}
                        {debugResult && (
                          <div className="space-y-4">
                            {/* Analysis */}
                            <div>
                              <p className="text-xs font-medium text-white/60 mb-1">Analysis</p>
                              <p className="text-sm text-white/90">{debugResult.analysis}</p>
                            </div>

                            {/* Root Cause */}
                            <div>
                              <p className="text-xs font-medium text-white/60 mb-1">Root Cause</p>
                              <p className="text-sm text-white/90 font-mono bg-black/30 px-2 py-1 rounded">
                                {debugResult.rootCause}
                              </p>
                            </div>

                            {/* Quick Fix */}
                            {debugResult.quickFix && (
                              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    Quick Fix Available
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => copyFix(debugResult.quickFix!)}
                                      className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
                                      title="Copy fix"
                                    >
                                      {copiedFix === debugResult.quickFix.file ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                    {onFilesChange && (
                                      <Button
                                        size="sm"
                                        onClick={() => applyFix(debugResult.quickFix!)}
                                        className="h-6 px-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-white border-0"
                                      >
                                        Apply Fix
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-white/70 mb-2">{debugResult.quickFix.description}</p>
                                <div className="bg-black/40 rounded p-2 font-mono text-xs">
                                  <p className="text-red-400 line-through opacity-70">{debugResult.quickFix.oldCode}</p>
                                  <p className="text-emerald-400 mt-1">{debugResult.quickFix.newCode}</p>
                                </div>
                              </div>
                            )}

                            {/* Other Suggestions */}
                            {debugResult.suggestions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-white/60 mb-2">Other Suggestions</p>
                                <div className="space-y-2">
                                  {debugResult.suggestions.slice(0, 3).map((suggestion, i) => (
                                    <div
                                      key={i}
                                      className="bg-white/5 border border-white/10 rounded-lg p-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-white/90">{suggestion.title}</p>
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "h-4 text-[9px] border",
                                            suggestion.confidence === 'high' && "border-emerald-500/50 text-emerald-400",
                                            suggestion.confidence === 'medium' && "border-amber-500/50 text-amber-400",
                                            suggestion.confidence === 'low' && "border-white/30 text-white/50"
                                          )}
                                        >
                                          {suggestion.confidence}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-white/60 mt-1">{suggestion.description}</p>
                                      {suggestion.fix && onFilesChange && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => applyFix(suggestion.fix!)}
                                          className="h-6 px-2 text-xs text-white/70 hover:text-white mt-2"
                                        >
                                          <Wrench className="h-3 w-3 mr-1" />
                                          Apply this fix
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Close debug panel */}
                      <div className="border-t border-white/10 p-2 flex justify-end">
                        <button
                          onClick={() => setShowDebugPanel(false)}
                          className="text-xs text-white/50 hover:text-white/70"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hot Reload Indicator */}
              {isHotReloading && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-violet-500/90 text-white text-xs rounded-full shadow-lg">
                  <Zap className="h-3 w-3 animate-pulse" />
                  <span>Updating...</span>
                </div>
              )}

              {/* Preview iframe */}
              <iframe
                key={previewKey}
                ref={iframeRef}
                src={previewUrl}
                className={cn(
                  "w-full h-full border-0 bg-white",
                  deviceMode === 'mobile' && "pt-6"
                )}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                onLoad={() => {
                  setIsLoading(false)
                  setIsHotReloading(false)
                }}
                title="Live Preview"
              />

              {/* Made with Badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur border border-white/10 rounded-full text-[10px] text-white/80 shadow-lg z-10">
                <Zap className="h-3 w-3 text-violet-400" />
                <span>Injaz.ai</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Placeholder generator
function generatePlaceholder(files: File[], platform: PlatformType): string {
  const fileCount = files.length
  const fileList = files.slice(0, 5).map(f => f.path).join(', ')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 24px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 13px;
      color: #a78bfa;
    }
    .files {
      margin-top: 24px;
      text-align: left;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 16px;
    }
    .files-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 12px;
    }
    .file {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-family: 'Monaco', 'Menlo', monospace;
    }
    .file:last-child { border-bottom: none; }
    .pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon pulse">${platform === 'webapp' ? '⚡' : '🌐'}</div>
    <h1>Waiting for Preview</h1>
    <p>Add an <strong>index.html</strong> file to see your live preview. The preview will automatically update as you code.</p>
    <div class="badge">
      <span>📁</span>
      <span>${fileCount} files loaded</span>
    </div>
    ${fileCount > 0 ? `
    <div class="files">
      <div class="files-title">Project Files</div>
      ${files.slice(0, 5).map(f => `<div class="file">${f.path}</div>`).join('')}
      ${fileCount > 5 ? `<div class="file" style="color: rgba(255,255,255,0.3);">+${fileCount - 5} more...</div>` : ''}
    </div>
    ` : ''}
  </div>
</body>
</html>`
}
