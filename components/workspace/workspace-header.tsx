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
import { ArrowLeft, MoreHorizontal, Rocket, Share2, Download, ExternalLink, Copy, Check } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { QuickActions } from '@/components/quick-actions'
import type { Project } from '@/types'
import { useToast } from '@/components/ui/use-toast'

interface WorkspaceHeaderProps {
  project: Project
}

export function WorkspaceHeader({ project }: WorkspaceHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
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
    toast({
      title: 'Deploying...',
      description: 'Your project is being deployed',
    })

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Deployment started!',
          description: 'Your app will be ready in a few moments',
        })
      } else {
        throw new Error('Deployment failed')
      }
    } catch (error) {
      toast({
        title: 'Deployment failed',
        description: 'There was an error deploying your project',
        variant: 'destructive',
      })
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
            className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all gap-2"
          >
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>

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
    </>
  )
}
