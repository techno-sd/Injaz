'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  Loader2,
  Globe,
  RefreshCw,
  ExternalLink,
  QrCode,
  AppWindow,
  Settings2,
  Maximize2,
  Minimize2,
  Smartphone,
  Fullscreen,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File, PlatformType } from '@/types'
import { TooltipProvider } from '@/components/ui/tooltip'

// Import preview components
import {
  usePreviewDevice,
  useViewportDimensions,
  DeviceFrameSelector,
  DeviceFrame,
  ResponsiveIndicators,
  OrientationToggle,
  ViewportInput,
  ViewportDimensions,
  BreakpointBadge,
  ZoomControls,
  ScreenshotButton,
  GridOverlay,
  GridToggle,
  ThemeToggle,
  UrlBar,
  MobileStatusBar,
} from './preview'

interface SimplePreviewProps {
  files: File[]
  platform?: PlatformType
}

const PLATFORM_COLORS: Record<PlatformType, string> = {
  website: 'text-emerald-400',
  webapp: 'text-violet-400',
  mobile: 'text-cyan-400',
}

export function SimplePreview({ files, platform = 'webapp' }: SimplePreviewProps) {
  const { mode, setMode, showFrame, setShowFrame, scale, setScale, device } = usePreviewDevice()
  const { width, height } = useViewportDimensions()
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(0)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showRulers, setShowRulers] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!previewContainerRef.current) return

    if (!document.fullscreenElement) {
      previewContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.error('Fullscreen error:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }, [])

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Fit to screen calculation
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerWidth = container.clientWidth - 48 // padding
    const containerHeight = container.clientHeight - 48
    const scaleX = containerWidth / width
    const scaleY = containerHeight / height
    const newScale = Math.min(scaleX, scaleY, 1)
    setScale(Math.round(newScale * 100) / 100)
  }, [width, height, setScale])

  // Set initial mode based on platform
  useEffect(() => {
    if (platform === 'mobile') {
      setMode('mobile')
    }
  }, [platform, setMode])

  // Build the HTML content from files
  const htmlContent = useMemo(() => {
    // For mobile apps, show a placeholder with Expo instructions
    if (platform === 'mobile') {
      return generateMobilePreview(files)
    }

    // Find index.html
    const indexHtml = files.find(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
    if (!indexHtml) {
      // Check for Next.js app structure
      const pageFile = files.find(f =>
        f.path === 'app/page.tsx' ||
        f.path === 'pages/index.tsx' ||
        f.path === 'src/app/page.tsx'
      )

      if (pageFile) {
        return generateNextJsPreviewPlaceholder(files)
      }

      return generateEmptyPreview(platform)
    }

    let html = indexHtml.content

    // Find and inline CSS files
    const cssFiles = files.filter(f => f.path.endsWith('.css'))
    cssFiles.forEach(cssFile => {
      const cssContent = `<style>\n${cssFile.content}\n</style>`
      const linkRegex = new RegExp(`<link[^>]*href=["']${cssFile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi')
      if (linkRegex.test(html)) {
        html = html.replace(linkRegex, cssContent)
      } else {
        html = html.replace('</head>', `${cssContent}\n</head>`)
      }
    })

    // Find and inline JS files
    const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.includes('node_modules'))
    jsFiles.forEach(jsFile => {
      const jsContent = `<script>\n${jsFile.content}\n</script>`
      const scriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`, 'gi')
      if (scriptRegex.test(html)) {
        html = html.replace(scriptRegex, jsContent)
      } else {
        html = html.replace('</body>', `${jsContent}\n</body>`)
      }
    })

    return html
  }, [files, platform])

  // Create blob URL for the preview (client-side only)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [htmlContent])

  const handleRefresh = () => {
    setKey(prev => prev + 1)
    setIsLoading(true)
  }

  const handleOpenExternal = () => {
    window.open(previewUrl, '_blank')
  }

  const PlatformIcon = platform === 'website' ? Globe : platform === 'mobile' ? Smartphone : AppWindow

  return (
    <TooltipProvider delayDuration={300}>
      <div ref={previewContainerRef} className={cn(
        "h-full flex flex-col bg-[#0d0d12]",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        {/* Header */}
        <div className="h-12 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Platform Badge */}
            <div className="flex items-center gap-2">
              <PlatformIcon className={cn('h-4 w-4', PLATFORM_COLORS[platform])} />
              <Badge
                variant="secondary"
                className={cn(
                  'h-5 text-[10px] border',
                  platform === 'website' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  platform === 'webapp' && 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                  platform === 'mobile' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                )}
              >
                {platform === 'website' ? 'Static' : platform === 'webapp' ? 'Next.js' : 'Expo'}
              </Badge>
            </div>

            <div className="h-4 w-px bg-white/[0.08] mx-1 hidden sm:block" />

            {/* Device Frame Selector */}
            <div className="hidden sm:block">
              <DeviceFrameSelector platform={platform} />
            </div>

            {/* Orientation Toggle */}
            <OrientationToggle />

            {/* Responsive Indicators */}
            <div className="hidden lg:block">
              <ResponsiveIndicators compact />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <div className="hidden md:flex">
              <ZoomControls
                scale={scale}
                onScaleChange={setScale}
                onFitToScreen={handleFitToScreen}
              />
            </div>

            <div className="h-4 w-px bg-white/[0.08] mx-1 hidden md:block" />

            {/* Grid/Ruler Toggle */}
            <div className="hidden sm:flex">
              <GridToggle
                showGrid={showGrid}
                showRulers={showRulers}
                onGridChange={setShowGrid}
                onRulersChange={setShowRulers}
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle
              theme={previewTheme}
              onThemeChange={setPreviewTheme}
            />

            {/* Screenshot Button */}
            <ScreenshotButton
              iframeRef={iframeRef}
              deviceName={device?.name}
            />

            <div className="h-4 w-px bg-white/[0.08] mx-1" />

            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:bg-white/[0.06]',
                showSettings ? 'text-violet-400' : 'text-white/60 hover:text-white'
              )}
              onClick={() => setShowSettings(!showSettings)}
              title="Preview Settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>

            {/* Frame Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:bg-white/[0.06]',
                showFrame ? 'text-violet-400' : 'text-white/60 hover:text-white'
              )}
              onClick={() => setShowFrame(!showFrame)}
              title={showFrame ? 'Hide device frame' : 'Show device frame'}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:bg-white/[0.06]',
                isFullscreen ? 'text-violet-400' : 'text-white/60 hover:text-white'
              )}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* QR Code Button (for mobile) */}
            {platform === 'mobile' && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7 hover:bg-white/[0.06]',
                  showQRCode ? 'text-cyan-400' : 'text-white/60 hover:text-white'
                )}
                onClick={() => setShowQRCode(!showQRCode)}
                title="Show QR Code"
              >
                <QrCode className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/[0.06]"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/[0.06]"
              onClick={handleOpenExternal}
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-white/[0.06] bg-[#0a0a0f] px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Viewport</span>
            <ViewportInput />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Scale</span>
            <input
              type="range"
              min="0.25"
              max="1.5"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-20 h-1 accent-violet-500"
            />
            <span className="text-xs text-white/70 font-mono w-10">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      )}

        {/* URL Bar for web platforms */}
        {(platform === 'website' || platform === 'webapp') && !showFrame && (
          <div className="border-b border-white/[0.06] bg-[#0a0a0f] px-4 py-2 flex items-center justify-center">
            <UrlBar url="localhost:3000" isSecure={true} />
          </div>
        )}

        {/* Fullscreen Exit Button (floating) */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-[60] h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
            onClick={toggleFullscreen}
            title="Exit fullscreen (Esc)"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Preview Content */}
        <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-start justify-center">
          <DeviceFrame className="mx-auto">
            <div className="relative w-full h-full">
              {/* Grid Overlay */}
              <GridOverlay show={showGrid} showRulers={showRulers} />

              {/* QR Code Overlay */}
              {showQRCode && platform === 'mobile' && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-30 p-6">
                  <div className="h-48 w-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-center p-4">
                      <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">QR code will appear when running Expo</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Scan with Expo Go</p>
                  <p className="text-xs text-gray-500 text-center max-w-[200px]">
                    Install Expo Go on your device and scan this code to preview your app
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowQRCode(false)}
                  >
                    Close
                  </Button>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                </div>
              )}
              <iframe
                key={key}
                ref={iframeRef}
                src={previewUrl}
                className={cn(
                  'w-full h-full border-0',
                  previewTheme === 'dark' && 'dark'
                )}
                style={{
                  width,
                  height,
                  colorScheme: previewTheme === 'system' ? 'light dark' : previewTheme,
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
                title="Preview"
              />
            </div>
          </DeviceFrame>
        </div>

        {/* Bottom Bar with Viewport Info */}
        <div className="h-9 border-t border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ViewportDimensions />
            <BreakpointBadge />
          </div>
          <ResponsiveIndicators showLabel />
        </div>
      </div>
    </TooltipProvider>
  )
}

function generateMobilePreview(files: File[]): string {
  const appLayout = files.find(f => f.path === 'app/_layout.tsx')
  const indexScreen = files.find(f => f.path === 'app/index.tsx' || f.path === 'app/(tabs)/index.tsx')
  const packageJson = files.find(f => f.path === 'package.json')

  let appName = 'Mobile App'
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content)
      appName = pkg.name || 'Mobile App'
    } catch {}
  }

  const screenCount = files.filter(f => f.path.startsWith('app/') && f.path.endsWith('.tsx')).length

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: white;
        }
        .header {
          padding: 60px 24px 24px;
          text-align: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          border-radius: 20px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 14px;
        }
        .content {
          flex: 1;
          padding: 24px;
        }
        .card {
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }
        .card-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: rgba(255,255,255,0.9);
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .stat:last-child { border: none; }
        .stat-icon {
          width: 40px;
          height: 40px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .stat-value {
          font-size: 16px;
          font-weight: 600;
        }
        .tab-bar {
          display: flex;
          justify-content: space-around;
          padding: 16px 24px 32px;
          background: rgba(0,0,0,0.3);
        }
        .tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.4);
          font-size: 10px;
        }
        .tab.active {
          color: #8b5cf6;
        }
        .tab-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: currentColor;
          opacity: 0.3;
        }
        .tab.active .tab-icon {
          opacity: 1;
          background: #8b5cf6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="icon">📱</div>
        <h1>${appName}</h1>
        <p class="subtitle">React Native + Expo</p>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-title">Project Overview</div>
          <div class="stat">
            <div class="stat-icon">📄</div>
            <div>
              <div class="stat-label">Screens</div>
              <div class="stat-value">${screenCount}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">📦</div>
            <div>
              <div class="stat-label">Files</div>
              <div class="stat-value">${files.length}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">🚀</div>
            <div>
              <div class="stat-label">Platform</div>
              <div class="stat-value">iOS & Android</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">To Preview</div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.6;">
            1. Install Expo Go on your device<br>
            2. Run <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npx expo start</code><br>
            3. Scan the QR code
          </p>
        </div>
      </div>
      <div class="tab-bar">
        <div class="tab active">
          <div class="tab-icon"></div>
          <span>Home</span>
        </div>
        <div class="tab">
          <div class="tab-icon"></div>
          <span>Explore</span>
        </div>
        <div class="tab">
          <div class="tab-icon"></div>
          <span>Profile</span>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateNextJsPreviewPlaceholder(files: File[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        h1 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        p {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          max-width: 280px;
          line-height: 1.5;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          margin-top: 24px;
        }
        .files {
          margin-top: 24px;
          text-align: left;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          width: 100%;
          max-width: 280px;
        }
        .files-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
        }
        .file {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .file::before {
          content: '📄';
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="icon">⚡</div>
      <h1>Next.js Application</h1>
      <p>This is a Next.js app. Run <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npm run dev</code> to see the full preview.</p>
      <div class="badge">
        <span>🔧</span>
        <span>${files.length} files generated</span>
      </div>
      <div class="files">
        <div class="files-title">Key Files</div>
        ${files.slice(0, 5).map(f => `<div class="file">${f.path}</div>`).join('')}
        ${files.length > 5 ? `<div class="file" style="color: rgba(255,255,255,0.3);">+${files.length - 5} more...</div>` : ''}
      </div>
    </body>
    </html>
  `
}

function generateEmptyPreview(platform: PlatformType): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: #f5f5f5;
          color: #666;
        }
        .container {
          text-align: center;
          padding: 24px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        h2 {
          font-size: 18px;
          color: #333;
          margin-bottom: 8px;
        }
        p {
          font-size: 14px;
          max-width: 300px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${platform === 'website' ? '🌐' : platform === 'mobile' ? '📱' : '⚡'}</div>
        <h2>No preview available</h2>
        <p>Start building your ${platform} and the preview will appear here automatically.</p>
      </div>
    </body>
    </html>
  `
}
