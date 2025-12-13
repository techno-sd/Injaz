'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { Loader2, Globe, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { File } from '@/types'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface SimplePreviewProps {
  files: File[]
}

const deviceModes = {
  desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
}

export function SimplePreview({ files }: SimplePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build the HTML content from files
  const htmlContent = useMemo(() => {
    // Find index.html
    const indexHtml = files.find(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
    if (!indexHtml) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <p>No index.html found</p>
            <p style="font-size: 12px;">Create an index.html file to see the preview</p>
          </div>
        </body>
        </html>
      `
    }

    let html = indexHtml.content

    // Find and inline CSS files
    const cssFiles = files.filter(f => f.path.endsWith('.css'))
    cssFiles.forEach(cssFile => {
      const cssContent = `<style>\n${cssFile.content}\n</style>`
      // Try to replace link tag with inline style
      const linkRegex = new RegExp(`<link[^>]*href=["']${cssFile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi')
      if (linkRegex.test(html)) {
        html = html.replace(linkRegex, cssContent)
      } else {
        // If no link tag found, add before </head>
        html = html.replace('</head>', `${cssContent}\n</head>`)
      }
    })

    // Find and inline JS files
    const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.includes('node_modules'))
    jsFiles.forEach(jsFile => {
      const jsContent = `<script>\n${jsFile.content}\n</script>`
      // Try to replace script tag with inline script
      const scriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`, 'gi')
      if (scriptRegex.test(html)) {
        html = html.replace(scriptRegex, jsContent)
      } else {
        // If no script tag found, add before </body>
        html = html.replace('</body>', `${jsContent}\n</body>`)
      }
    })

    return html
  }, [files])

  // Create blob URL for the preview (client-side only to avoid hydration mismatch)
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

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="h-10 border-b bg-white dark:bg-[#111] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium">Preview</span>
          <Badge variant="secondary" className="h-5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {/* Device Switcher */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            {(Object.keys(deviceModes) as DeviceMode[]).map((mode) => {
              const DeviceIcon = deviceModes[mode].icon
              return (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    deviceMode === mode
                      ? 'bg-white dark:bg-[#222] shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={deviceModes[mode].label}
                >
                  <DeviceIcon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div
          className="h-full bg-white dark:bg-white rounded-xl shadow-lg overflow-hidden mx-auto transition-all duration-300 relative"
          style={{ maxWidth: deviceModes[deviceMode].width }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <iframe
            key={key}
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
