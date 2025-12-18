'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
        <div className="glass-card border-b backdrop-blur-sm p-3 flex items-center gap-2 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          <Github className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Source Control</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-700/20 mx-auto flex items-center justify-center backdrop-blur-sm border-2 border-gray-500/30">
                <Github className="h-10 w-10 text-gray-500" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <X className="h-3 w-3 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                GitHub not connected
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect this project to GitHub to enable version control, collaboration, and deployment features
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                Connect Repository
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Enhanced Header */}
      <div className="glass-card border-b backdrop-blur-sm p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Source Control
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:scale-105 transition-all rounded-lg"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Repository Info Card */}
        <div className="glass-card bg-muted/30 rounded-lg p-2.5 border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-900/50 flex items-center justify-center flex-shrink-0">
              <Github className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {project.github_repo_url?.replace('https://github.com/', '')}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-xs h-5 px-1.5 border-primary/50 text-primary">
                  <GitBranch className="h-2.5 w-2.5 mr-1" />
                  {project.github_branch || 'main'}
                </Badge>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  <Check className="h-2.5 w-2.5 mr-1 text-green-600" />
                  Connected
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Sync Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePull}
            disabled={isPulling}
            className="gap-2 border-2 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
          >
            {isPulling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="font-medium">Pull</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePush}
            disabled={isPushing || !commitMessage}
            className="gap-2 border-2 hover:border-green-500/50 hover:bg-green-500/10 transition-all"
          >
            {isPushing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="font-medium">Push</span>
          </Button>
        </div>

        {/* Modified Files */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Changes
            </h4>
            <Badge variant="secondary" className="text-xs h-5">
              {modifiedFiles.length} file{modifiedFiles.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {modifiedFiles.length === 0 ? (
            <div className="glass-card rounded-lg p-6 text-center border-2 border-dashed">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-xs text-muted-foreground">No changes</p>
              <p className="text-xs text-muted-foreground/70 mt-1">All files are up to date</p>
            </div>
          ) : (
            <div className="glass-card rounded-lg border bg-muted/20 max-h-[180px] overflow-y-auto">
              <div className="divide-y divide-border/50">
                {modifiedFiles.slice(0, 10).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2.5 text-xs px-3 py-2.5 hover:bg-accent/50 transition-colors group"
                  >
                    <FileCode className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="flex-1 truncate font-mono text-xs">{file.path}</span>
                    <Badge
                      variant="outline"
                      className="text-xs h-5 px-1.5 bg-green-500/10 border-green-500/50 text-green-600 font-bold"
                    >
                      M
                    </Badge>
                  </div>
                ))}
                {modifiedFiles.length > 10 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 text-center">
                    + {modifiedFiles.length - 10} more file{modifiedFiles.length - 10 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Commit Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Commit
            </h4>
            {commitMessage.trim() && (
              <Badge variant="secondary" className="text-xs h-5">
                {commitMessage.trim().length} chars
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message...&#10;&#10;Describe your changes in detail"
              className="min-h-[90px] text-sm resize-none border-2 focus:border-primary transition-all rounded-lg"
            />

            <Button
              onClick={handleCommit}
              disabled={isCommitting || !commitMessage.trim() || modifiedFiles.length === 0}
              className={cn(
                "w-full gap-2 shadow-lg hover:shadow-xl transition-all",
                commitMessage.trim() && modifiedFiles.length > 0
                  ? "gradient-primary text-white border-0"
                  : ""
              )}
              size="sm"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <GitCommit className="h-4 w-4" />
                  <span>Commit {modifiedFiles.length > 0 && `${modifiedFiles.length} file${modifiedFiles.length !== 1 ? 's' : ''}`}</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick commit suggestions */}
          {!commitMessage.trim() && modifiedFiles.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {['feat: ', 'fix: ', 'docs: ', 'style: ', 'refactor: ', 'test: '].map((prefix) => (
                  <Button
                    key={prefix}
                    variant="outline"
                    size="sm"
                    onClick={() => setCommitMessage(prefix)}
                    className="h-6 text-xs px-2 hover:bg-primary/10"
                  >
                    {prefix}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Tips */}
        <div className="glass-card rounded-lg p-3 bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <GitBranch className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs font-medium text-foreground">Git Workflow</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                1. Write commit message<br />
                2. Commit changes locally<br />
                3. Push to remote repository
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
