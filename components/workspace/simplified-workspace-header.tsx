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
import {
  ArrowLeft,
  Rocket,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Save,
  Play,
  HelpCircle,
  Settings
} from 'lucide-react'
import type { Project } from '@/types'
import { useToast } from '@/components/ui/use-toast'

interface SimplifiedWorkspaceHeaderProps {
  project: Project
  onSave?: () => void
  onPreview?: () => void
  onAskAI?: () => void
}

export function SimplifiedWorkspaceHeader({
  project,
  onSave,
  onPreview,
  onAskAI
}: SimplifiedWorkspaceHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/preview/${project.id}`
    : ''

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: '✅ Link copied!',
      description: 'Share this link with anyone',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeploy = async () => {
    toast({
      title: '🚀 Deploying your app...',
      description: 'This will take a few moments',
    })

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (response.ok) {
        toast({
          title: '✅ App deployed!',
          description: 'Your app is now live',
        })
      } else {
        throw new Error('Deployment failed')
      }
    } catch (error) {
      toast({
        title: '❌ Deployment failed',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <header className="border-b bg-gradient-to-r from-background via-background to-primary/5 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and project name */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-primary/10 rounded-full h-10 w-10"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-3">
            {/* Ask AI - Primary action */}
            <Button
              size="lg"
              onClick={onAskAI}
              className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl transition-all gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Ask AI to Edit</span>
            </Button>

            {/* Preview */}
            <Button
              variant="outline"
              size="lg"
              onClick={onPreview}
              className="gap-2 border-2"
            >
              <Play className="h-4 w-4" />
              Preview
            </Button>

            {/* Deploy */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleDeploy}
              className="gap-2 border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Rocket className="h-4 w-4" />
              Deploy
            </Button>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="mr-3 h-4 w-4" />
                  <span className="font-medium">Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSave}>
                  <Save className="mr-3 h-4 w-4" />
                  <span className="font-medium">Save Changes</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-3 h-4 w-4" />
                  <span className="font-medium">Download Code</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span className="font-medium">Help & Tutorials</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Share your project</DialogTitle>
            <DialogDescription className="text-base">
              Anyone with this link can view your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 border-2 rounded-lg bg-muted text-sm font-mono"
              />
              <Button size="lg" onClick={handleCopyUrl} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                asChild
              >
                <Link href={`/preview/${project.id}`} target="_blank">
                  <Play className="h-4 w-4" />
                  Open Preview in New Tab
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
