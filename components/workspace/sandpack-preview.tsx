'use client'

import { useState, useMemo, useCallback } from 'react'
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview as SandpackPreviewPane,
} from '@codesandbox/sandpack-react'
import type { File } from '@/types'
import type { SandpackFiles } from '@codesandbox/sandpack-react'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface SandpackPreviewProps {
  files: File[]
  platform?: 'webapp' | 'mobile' | 'website'
}

// Convert our File[] format to Sandpack's files format
function convertToSandpackFiles(files: File[]): SandpackFiles {
  const sandpackFiles: SandpackFiles = {}

  for (const file of files) {
    if (!file.content) continue

    // Sandpack expects paths starting with /
    let path = file.path
    if (!path.startsWith('/')) {
      path = '/' + path
    }

    sandpackFiles[path] = {
      code: file.content,
      active: path.includes('Index') || path.includes('App'),
    }
  }

  return sandpackFiles
}

// Dark theme matching the editor
const customTheme = {
  colors: {
    surface1: '#0a0a0f',
    surface2: '#0d0d12',
    surface3: '#1a1a2e',
    clickable: '#808080',
    base: '#ffffff',
    disabled: '#4D4D4D',
    hover: '#c5c5c5',
    accent: '#a855f7',
    error: '#ef4444',
    errorSurface: '#1a1a2e',
  },
  syntax: {
    plain: '#FFFFFF',
    comment: { color: '#757575', fontStyle: 'italic' as const },
    keyword: '#c792ea',
    tag: '#ff7b72',
    punctuation: '#89DDFF',
    definition: '#82AAFF',
    property: '#c792ea',
    static: '#f78c6c',
    string: '#c3e88d',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    size: '13px',
    lineHeight: '20px',
  },
}

export function SandpackPreview({ files }: SandpackPreviewProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)

  // Convert files to Sandpack format
  const sandpackFiles = useMemo(() => {
    if (files.length === 0) return null
    return convertToSandpackFiles(files)
  }, [files])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Determine the entry file
  const entryFile = useMemo(() => {
    const paths = files.map(f => f.path)
    if (paths.some(p => p.includes('src/main.tsx'))) return '/src/main.tsx'
    if (paths.some(p => p.includes('src/main.ts'))) return '/src/main.ts'
    if (paths.some(p => p.includes('src/index.tsx'))) return '/src/index.tsx'
    if (paths.some(p => p.includes('src/App.tsx'))) return '/src/App.tsx'
    return '/src/main.tsx'
  }, [files])

  // No files - show placeholder
  if (!sandpackFiles || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0f]">
        <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#0d0d12]">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white/80">Preview</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#1a1a2e]">
          <div className="text-center space-y-4">
            <div className="text-5xl">✨</div>
            <h2 className="text-xl font-semibold text-white">No Preview Available</h2>
            <p className="text-gray-400 max-w-xs">
              Start chatting with AI to generate your app
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#0d0d12]">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white/80">Preview</span>
          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
            Live
          </Badge>
          <span className="text-[10px] text-white/40 ml-1">({files.length} files)</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => {
            const Icon = mode === 'desktop' ? Monitor : mode === 'tablet' ? Tablet : Smartphone
            return (
              <Button
                key={mode}
                variant={deviceMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode(mode)}
                className={cn('h-7 w-7 p-0', deviceMode === mode && 'bg-purple-600')}
                title={mode}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            )
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden bg-[#1a1a2e] flex items-start justify-center p-4">
        <div
          key={refreshKey}
          className={cn(
            'bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full',
            deviceMode === 'mobile' && 'w-[375px]',
            deviceMode === 'tablet' && 'w-[768px]',
            deviceMode === 'desktop' && 'w-full'
          )}
        >
          <SandpackProvider
            template="vite-react-ts"
            files={sandpackFiles}
            theme={customTheme}
            options={{
              externalResources: [
                'https://cdn.tailwindcss.com',
              ],
              visibleFiles: [entryFile],
              activeFile: entryFile,
              recompileMode: 'delayed',
              recompileDelay: 500,
            }}
            customSetup={{
              dependencies: {
                'react': '^18.3.1',
                'react-dom': '^18.3.1',
                'react-router-dom': '^6.26.0',
                '@tanstack/react-query': '^5.51.1',
                'lucide-react': '^0.396.0',
                'clsx': '^2.1.1',
                'tailwind-merge': '^2.3.0',
                'class-variance-authority': '^0.7.0',
                'sonner': '^1.5.0',
                'framer-motion': '^11.0.0',
              },
            }}
          >
            <SandpackLayout>
              <SandpackPreviewPane
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{ height: '100%', minHeight: '500px' }}
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  )
}
