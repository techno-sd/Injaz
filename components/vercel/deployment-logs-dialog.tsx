'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getDeploymentLogs } from '@/app/actions/vercel'
import { FileText, Loader2 } from 'lucide-react'

interface DeploymentLogsDialogProps {
  deploymentId: string
  deploymentUrl: string
}

export function DeploymentLogsDialog({ deploymentId, deploymentUrl }: DeploymentLogsDialogProps) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDeploymentLogs(deploymentId)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setLogs(result.data)
      }
    } catch (error) {
      setError('Failed to fetch deployment logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Deployment Logs</DialogTitle>
          <DialogDescription className="truncate">
            {deploymentUrl}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={fetchLogs} variant="outline" size="sm" className="mt-4">
                Retry
              </Button>
            </div>
          ) : logs.length > 0 ? (
            <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4">
              <div className="font-mono text-xs text-slate-50 space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No logs available yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
