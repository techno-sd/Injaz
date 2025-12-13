'use client'

import { useState, useEffect } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProject } from '@/app/actions/projects'
import { createProjectFromTemplate } from '@/app/actions/templates'
import { Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { PROJECT_TEMPLATES } from '@/lib/templates'
import { GUEST_TEMPLATES } from '@/lib/guest-templates'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface CreateProjectDialogProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

export function CreateProjectDialog({ variant, size, className }: CreateProjectDialogProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // If not authenticated, redirect to demo workspace with template
      if (!isAuthenticated) {
        setOpen(false)
        const guestTemplate = GUEST_TEMPLATES[selectedTemplate] || GUEST_TEMPLATES.blank
        toast({
          title: 'Demo Mode',
          description: `Starting with ${guestTemplate.name} template. Sign in to save your projects!`,
        })
        router.push(`/workspace/demo?template=${selectedTemplate}`)
        return
      }

      if (selectedTemplate === 'blank') {
        // Create blank project
        const formData = new FormData()
        formData.append('name', projectName)
        formData.append('description', description)
        const result = await createProject(formData)

        if (result?.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          setOpen(false)
          toast({
            title: 'Project created!',
            description: 'Your blank project has been created successfully',
          })
        }
      } else {
        // Create from template
        const result = await createProjectFromTemplate(selectedTemplate)

        if (result?.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else if (result?.data) {
          setOpen(false)
          toast({
            title: 'Project created!',
            description: 'Your project has been created from template',
          })
          router.push(`/workspace/${result.data.id}`)
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Use guest templates for unauthenticated users, project templates for authenticated
  const availableTemplates = isAuthenticated === false
    ? Object.values(GUEST_TEMPLATES).filter(t => t.id !== 'blank')
    : PROJECT_TEMPLATES

  const template = isAuthenticated === false
    ? GUEST_TEMPLATES[selectedTemplate]
    : PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated === false
              ? 'Try templates in demo mode - sign in to save your projects'
              : 'Start from scratch or choose a template to kickstart your project'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template">Choose a Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="blank">
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span>Blank Project</span>
                  </div>
                </SelectItem>
                {availableTemplates.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                      {t.difficulty && (
                        <span className="text-xs text-muted-foreground">
                          ({t.difficulty})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {template && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{template.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  {'tags' in template && Array.isArray((template as any).tags) && (
                    <div className="flex flex-wrap gap-2">
                      {((template as any).tags as string[]).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-background text-xs rounded-md border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTemplate === 'blank' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome App"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your app do?"
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-white border-0"
              disabled={loading || (selectedTemplate === 'blank' && !projectName)}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
