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
  SandpackConsole,
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

  let hasIndexCss = false
  let indexPageContent: string | null = null

  // First pass: collect files and check what we have
  for (const file of files) {
    if (!file.content) continue

    // Sandpack expects paths starting with /
    let path = file.path
    if (!path.startsWith('/')) {
      path = '/' + path
    }

    // Track CSS and Index page
    if (path === '/src/index.css') hasIndexCss = true
    if (path.includes('pages/Index.tsx')) {
      // Clean up Index content for Sandpack
      let content = file.content
      content = content.replace(/import\s*{\s*Link[^}]*}\s*from\s*['"]react-router-dom['"];?\n?/g, '')
      content = content.replace(/import\s*{\s*useNavigate[^}]*}\s*from\s*['"]react-router-dom['"];?\n?/g, '')
      content = content.replace(/<Link\s+to=/g, '<a href=')
      content = content.replace(/<\/Link>/g, '</a>')
      indexPageContent = content
    }

    // Skip files that we'll override for Sandpack compatibility
    if (path === '/src/main.tsx' || path === '/src/App.tsx' || path === '/index.html') {
      continue
    }

    // Skip config files that don't work in Sandpack
    if (path.includes('vite.config') || path.includes('tsconfig') || path.includes('postcss.config') || path.includes('tailwind.config')) {
      continue
    }

    // Skip NotFound page (routing doesn't work in Sandpack)
    if (path.includes('NotFound')) {
      continue
    }

    // Clean up content for Sandpack compatibility
    let content = file.content
    // Remove react-router-dom imports and replace Link with <a>
    content = content.replace(/import\s*{\s*Link[^}]*}\s*from\s*['"]react-router-dom['"];?\n?/g, '')
    content = content.replace(/import\s*{\s*useNavigate[^}]*}\s*from\s*['"]react-router-dom['"];?\n?/g, '')
    content = content.replace(/<Link\s+to=/g, '<a href=')
    content = content.replace(/<\/Link>/g, '</a>')
    // Remove sonner imports if present
    content = content.replace(/import\s*{\s*toast[^}]*}\s*from\s*['"]sonner['"];?\n?/g, '')
    content = content.replace(/import\s*{\s*Toaster[^}]*}\s*from\s*['"]sonner['"];?\n?/g, '')

    sandpackFiles[path] = {
      code: content,
      active: path.includes('Index'),
    }
  }

  // Add Sandpack-compatible index.html
  sandpackFiles['/index.html'] = {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  }

  // Add simplified main.tsx (no BrowserRouter, no React Query - just render)
  sandpackFiles['/src/main.tsx'] = {
    code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
${hasIndexCss ? "import './index.css'" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
  }

  // Add simplified App.tsx that directly renders Index (no routing)
  const hasIndexPage = Object.keys(sandpackFiles).some(p => p.includes('pages/Index'))

  if (hasIndexPage) {
    sandpackFiles['/src/App.tsx'] = {
      code: `import Index from './pages/Index'

export default function App() {
  return <Index />
}`,
    }
  } else if (indexPageContent) {
    // If we have Index content but maybe wrong path, inline it
    sandpackFiles['/src/App.tsx'] = {
      code: indexPageContent.replace(/export default function Index/, 'export default function App'),
    }
  } else {
    sandpackFiles['/src/App.tsx'] = {
      code: `export default function App() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-white/40">Your preview will appear here</p>
      </div>
    </div>
  )
}`,
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

  // No files - show placeholder
  if (!sandpackFiles || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0f]">
        <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#0d0d12]">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-white/40" />
            <span className="text-sm font-medium text-white/40">Preview</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#0d0d12]">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
              <Monitor className="h-6 w-6 text-white/20" />
            </div>
            <p className="text-sm text-white/40">Your preview will appear here</p>
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
            template="react-ts"
            files={sandpackFiles}
            theme={customTheme}
            options={{
              externalResources: [
                'https://cdn.tailwindcss.com',
              ],
              recompileMode: 'delayed',
              recompileDelay: 300,
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
              entry: '/src/main.tsx',
            }}
          >
            <SandpackLayout style={{ height: '100%', flexDirection: 'column' }}>
              <SandpackPreviewPane
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{ flex: 1, minHeight: '400px' }}
              />
              <SandpackConsole style={{ height: '100px' }} />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  )
}
