"use client"

import * as React from "react"
import { Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, slug: string) => Promise<void>
}

export function CreateTeamDialog({ open, onOpenChange, onCreate }: CreateTeamDialogProps) {
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Auto-generate slug from name
  React.useEffect(() => {
    const generated = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
    setSlug(generated)
  }, [name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    if (!slug.trim()) {
      setError("Team URL is required")
      return
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Team URL can only contain lowercase letters, numbers, and hyphens")
      return
    }

    setLoading(true)
    try {
      await onCreate(name.trim(), slug.trim())
      setName("")
      setSlug("")
    } catch (err: any) {
      setError(err.message || "Failed to create team")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create a Team
          </DialogTitle>
          <DialogDescription>
            Teams allow you to collaborate on projects with others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Team URL</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted text-muted-foreground text-sm border border-r-0 rounded-l-md">
                  /teams/
                </span>
                <Input
                  id="slug"
                  placeholder="my-team"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="rounded-l-none"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
