'use client'

import { useState } from 'react'
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
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/preview/${project.id}`

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
      <header className="border-b glass px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 flex-shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/dashboard' },
              { label: project.name }
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
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
                // This will be handled by the command palette keyboard shortcut
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
                window.dispatchEvent(event)
                break
            }
          }} />
          <Button
            size="sm"
            onClick={handleDeploy}
            className="gradient-primary text-white border-0 shadow-sm"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Deploy
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download as ZIP
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Code
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
