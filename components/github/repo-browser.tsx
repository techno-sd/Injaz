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
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Star, GitBranch, Lock, Globe, Search, Loader2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import type { GitHubRepo } from '@/lib/github'

export function RepoBrowser() {
  const [open, setOpen] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (open && repos.length === 0) {
      fetchRepos()
    }
  }, [open])

  useEffect(() => {
    if (searchQuery) {
      const filtered = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRepos(filtered)
    } else {
      setFilteredRepos(repos)
    }
  }, [searchQuery, repos])

  const fetchRepos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/github/repos')
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepos(data.repos || [])
      setFilteredRepos(data.repos || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load repositories',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (repo: GitHubRepo) => {
    setImporting(repo.full_name)
    try {
      const [owner, repoName] = repo.full_name.split('/')

      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo: repoName,
          branch: repo.default_branch,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to import repository')
      }

      const data = await response.json()

      toast({
        title: 'Repository imported!',
        description: `${repo.name} has been imported with ${data.filesImported} files`,
      })

      setOpen(false)
      router.push(`/workspace/${data.project.id}`)
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import repository',
        variant: 'destructive',
      })
    } finally {
      setImporting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Github className="h-4 w-4" />
          Import from GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import Repository from GitHub
          </DialogTitle>
          <DialogDescription>
            Select a repository to import into iEditor
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Repository List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No repositories found' : 'No repositories available'}
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <Card key={repo.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2 mb-1">
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate">{repo.name}</span>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {repo.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleImport(repo)}
                      disabled={importing === repo.full_name}
                      className="flex-shrink-0"
                    >
                      {importing === repo.full_name ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {repo.language && (
                      <Badge variant="secondary" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>{repo.default_branch}</span>
                    </div>
                    <span className="text-xs">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
