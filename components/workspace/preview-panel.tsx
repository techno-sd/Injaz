'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink } from 'lucide-react'

interface PreviewPanelProps {
  projectId: string
}

export function PreviewPanel({ projectId }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  // In a real implementation, this would be a dynamic preview URL
  // For now, we'll show a placeholder
  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/preview/${projectId}`

  return (
    <div className="h-full flex flex-col bg-muted/50">
      <div className="border-b p-2 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Preview</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          key={refreshKey}
          src={previewUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Preview"
        />
      </div>
    </div>
  )
}
