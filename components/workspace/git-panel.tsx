'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  GitBranch,
  GitCommit,
  Upload,
  Download,
  RefreshCw,
  Github,
  Check,
  X,
  Loader2,
  FileCode,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Project, File } from '@/types'
import { cn } from '@/lib/utils'

interface GitPanelProps {
  project: Project
  files: File[]
  onRefresh?: () => void
}

export function GitPanel({ project, files, onRefresh }: GitPanelProps) {
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const { toast } = useToast()

  const isGitHubConnected = project.github_connected && project.github_repo_url

  const modifiedFiles = files.filter(f => {
    // In a real implementation, track which files have been modified
    // For now, we'll show all files as potentially modified
    return true
  })

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit message required',
        description: 'Please enter a commit message',
        variant: 'destructive',
      })
      return
    }

    setIsCommitting(true)
    try {
      const response = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: commitMessage,
          files: modifiedFiles.map(f => ({
            path: f.path,
            content: f.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to commit changes')
      }

      toast({
        title: 'Changes committed',
        description: 'Your changes have been committed locally',
      })

      setCommitMessage('')
    } catch (error) {
      toast({
        title: 'Commit failed',
        description: 'Failed to commit changes',
        variant: 'destructive',
      })
    } finally {
      setIsCommitting(false)
    }
  }

  const handlePush = async () => {
    setIsPushing(true)
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to push changes')
      }

      toast({
        title: 'Changes pushed',
        description: 'Your changes have been pushed to GitHub',
      })

      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Push failed',
        description: 'Failed to push changes to GitHub',
        variant: 'destructive',
      })
    } finally {
      setIsPushing(false)
    }
  }

  const handlePull = async () => {
    setIsPulling(true)
    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to pull changes')
      }

      const data = await response.json()

      toast({
        title: 'Changes pulled',
        description: `Synced ${data.filesUpdated} files from GitHub`,
      })

      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Pull failed',
        description: 'Failed to pull changes from GitHub',
        variant: 'destructive',
      })
    } finally {
      setIsPulling(false)
    }
  }

  if (!isGitHubConnected) {
    return (
      <div className="h-full flex flex-col bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Github className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Source Control</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              This project is not connected to GitHub
            </p>
            <p className="text-xs text-muted-foreground">
              Import a repository or connect this project to enable Git features
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-muted/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Source Control
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Github className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">
              {project.github_repo_url?.replace('https://github.com/', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Sync Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePull}
            disabled={isPulling}
            className="flex-1 gap-2"
          >
            {isPulling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Pull
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePush}
            disabled={isPushing || !commitMessage}
            className="flex-1 gap-2"
          >
            {isPushing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Push
          </Button>
        </div>

        {/* Modified Files */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            CHANGES ({modifiedFiles.length})
          </h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {modifiedFiles.slice(0, 10).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 text-xs p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 truncate">{file.path}</span>
                <span className="text-green-600 font-medium">M</span>
              </div>
            ))}
            {modifiedFiles.length > 10 && (
              <p className="text-xs text-muted-foreground px-2 py-1">
                +{modifiedFiles.length - 10} more files
              </p>
            )}
          </div>
        </div>

        {/* Commit Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            COMMIT
          </h4>
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="min-h-[80px] text-sm"
          />
          <Button
            onClick={handleCommit}
            disabled={isCommitting || !commitMessage.trim()}
            className="w-full gap-2"
            size="sm"
          >
            {isCommitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCommit className="h-4 w-4" />
            )}
            Commit Changes
          </Button>
        </div>

        {/* Branch Info */}
        <Card className="p-3 bg-muted/50">
          <div className="flex items-center gap-2 text-xs">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{project.github_branch || 'main'}</span>
            <div className="flex-1"></div>
            <Check className="h-3.5 w-3.5 text-green-600" />
          </div>
        </Card>
      </div>
    </div>
  )
}
