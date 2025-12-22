'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, MoreHorizontal, Rocket, Share2, Download, ExternalLink, Copy, Check, Loader2, Globe, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { QuickActions } from '@/components/quick-actions'
import type { Project } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error'

interface WorkspaceHeaderProps {
  project: Project
}

export function WorkspaceHeader({ project }: WorkspaceHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deployDialogOpen, setDeployDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle')
  const [deployUrl, setDeployUrl] = useState<string | null>(project.deployment_url || null)
  const [deployProgress, setDeployProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShareUrl(`${window.location.origin}/preview/${project.id}`)
  }, [project.id])

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeploy = async () => {
    setDeployStatus('deploying')
    setDeployDialogOpen(true)
    setDeployProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const data = await response.json()
        setDeployProgress(100)
        setDeployStatus('success')
        setDeployUrl(data.url || `https://${project.name.toLowerCase().replace(/\s+/g, '-')}.vercel.app`)
        toast({
          title: '🎉 Deployed successfully!',
          description: 'Your app is now live',
        })
      } else {
        throw new Error('Deployment failed')
      }
    } catch (error) {
      clearInterval(progressInterval)
      setDeployStatus('error')
      toast({
        title: 'Deployment failed',
        description: 'There was an error deploying your project',
        variant: 'destructive',
      })
    }
  }

  const getDeployButtonContent = () => {
    switch (deployStatus) {
      case 'deploying':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Deploying...</span>
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Live</span>
          </>
        )
      default:
        return (
          <>
            <Rocket className="h-4 w-4" />
            <span>Deploy</span>
          </>
        )
    }
  }

  return (
    <>
      <header className="border-b glass-card backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-sm animate-fade-in">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 hover:scale-105 transition-all flex-shrink-0 rounded-xl">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="flex flex-col min-w-0">
            <Breadcrumbs
              items={[
                { label: 'Projects', href: '/dashboard' },
                { label: project.name }
              ]}
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">Template:</span>
              <span className="text-xs font-medium text-primary capitalize">{project.template}</span>
              <div className="h-1 w-1 bg-muted-foreground/40 rounded-full" />
              <span className="text-xs text-muted-foreground">Last saved: just now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <QuickActions onAction={(action) => {
            switch (action) {
              case 'new-file':
                document.querySelector('[data-action="new-file"]')?.dispatchEvent(new Event('click'))
                break
              case 'git-sync':
                toast({
                  title: 'Syncing changes...',
                  description: 'Pulling latest changes from repository',
                })
                break
              case 'shortcuts':
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
                window.dispatchEvent(event)
                break
            }
          }} />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShareDialogOpen(true)}
            className="gap-2 border-2 hover:border-primary transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={deployStatus === 'deploying'}
            className={cn(
              "text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all gap-2",
              deployStatus === 'success'
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                : deployStatus === 'deploying'
                ? "bg-gradient-to-r from-amber-500 to-orange-600"
                : "gradient-primary"
            )}
          >
            {getDeployButtonContent()}
          </Button>

          {/* Live URL indicator */}
          {deployUrl && deployStatus === 'success' && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{new URL(deployUrl).hostname}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share2 className="mr-3 h-4 w-4" />
                Share Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-3 h-4 w-4" />
                Download as ZIP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className="mr-3 h-4 w-4" />
                View Live Preview
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your project</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
              />
              <Button size="sm" onClick={handleCopyUrl}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20project&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on LinkedIn
                </a>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href={`/preview/${project.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Preview
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deploy Dialog */}
      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deployStatus === 'deploying' && <Loader2 className="h-5 w-5 animate-spin text-amber-400" />}
              {deployStatus === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
              {deployStatus === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
              {deployStatus === 'deploying' ? 'Deploying your app...' :
               deployStatus === 'success' ? 'Deployment successful!' :
               deployStatus === 'error' ? 'Deployment failed' : 'Deploy'}
            </DialogTitle>
            <DialogDescription>
              {deployStatus === 'deploying' && 'Please wait while we deploy your app to production.'}
              {deployStatus === 'success' && 'Your app is now live and accessible worldwide.'}
              {deployStatus === 'error' && 'There was an issue deploying your app. Please try again.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Progress Bar */}
            {deployStatus === 'deploying' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(deployProgress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 ease-out"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Estimated time: ~30 seconds</span>
                </div>
              </div>
            )}

            {/* Deploy Steps */}
            {deployStatus === 'deploying' && (
              <div className="space-y-2">
                {[
                  { label: 'Building application', done: deployProgress > 20 },
                  { label: 'Optimizing assets', done: deployProgress > 50 },
                  { label: 'Deploying to edge', done: deployProgress > 80 },
                  { label: 'Configuring CDN', done: deployProgress >= 100 },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {step.done ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : deployProgress > i * 25 ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Success State */}
            {deployStatus === 'success' && deployUrl && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Live URL</span>
                  </div>
                  <a
                    href={deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-emerald-400 transition-colors break-all"
                  >
                    {deployUrl}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(deployUrl)
                      toast({ title: 'URL copied!' })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    asChild
                  >
                    <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Visit Site
                    </a>
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Deployed with edge network for global fast loading</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {deployStatus === 'error' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">
                    Something went wrong during deployment. Please check your project for errors and try again.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setDeployStatus('idle')
                    setDeployDialogOpen(false)
                    handleDeploy()
                  }}
                  className="w-full gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
