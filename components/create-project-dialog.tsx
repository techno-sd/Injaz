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
import { Plus, Loader2, Globe, AppWindow, Smartphone, Check } from 'lucide-react'
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
import type { PlatformType } from '@/types'
import { cn } from '@/lib/utils'

interface CreateProjectDialogProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

const PLATFORM_OPTIONS: {
  id: PlatformType
  name: string
  description: string
  icon: typeof Globe
  color: string
  tech: string
}[] = [
  {
    id: 'website',
    name: 'Website',
    description: 'Static HTML/CSS/JS',
    icon: Globe,
    color: 'text-emerald-400',
    tech: 'Vanilla',
  },
  {
    id: 'webapp',
    name: 'Web App',
    description: 'Full-stack application',
    icon: AppWindow,
    color: 'text-violet-400',
    tech: 'Next.js + Supabase',
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    description: 'iOS & Android',
    icon: Smartphone,
    color: 'text-cyan-400',
    tech: 'React Native + Expo',
  },
]

export function CreateProjectDialog({ variant, size, className }: CreateProjectDialogProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('webapp')
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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
      if (!isAuthenticated) {
        setOpen(false)
        const guestTemplate = GUEST_TEMPLATES[selectedTemplate] || GUEST_TEMPLATES.blank
        toast({
          title: 'Demo Mode',
          description: `Starting with ${guestTemplate.name}. Sign in to save your work.`,
        })
        router.push(`/workspace/demo?template=${selectedTemplate}&platform=${selectedPlatform}`)
        return
      }

      if (selectedTemplate === 'blank') {
        const formData = new FormData()
        formData.append('name', projectName)
        formData.append('platform', selectedPlatform)
        const result = await createProject(formData)

        if (result?.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
          setOpen(false)
          toast({ title: 'Project created', description: `Your ${selectedPlatform} project is ready` })
        }
      } else {
        const result = await createProjectFromTemplate(selectedTemplate)

        if (result?.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else if (result?.data) {
          setOpen(false)
          toast({ title: 'Project created', description: 'Created from template' })
          router.push(`/workspace/${result.data.id}`)
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const availableTemplates = isAuthenticated === false
    ? Object.values(GUEST_TEMPLATES).filter(t => t.id !== 'blank')
    : PROJECT_TEMPLATES

  const template = isAuthenticated === false
    ? GUEST_TEMPLATES[selectedTemplate]
    : PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size || 'sm'} className={className}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            {isAuthenticated === false
              ? 'Demo mode - sign in to save your projects'
              : 'Choose platform and template for your new project'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform Selector */}
          <div className="space-y-3">
            <Label>Platform</Label>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORM_OPTIONS.map((platform) => {
                const Icon = platform.icon
                const isSelected = selectedPlatform === platform.id
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      isSelected
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-border hover:border-violet-500/50 hover:bg-accent/50'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-violet-400" />
                      </div>
                    )}
                    <Icon className={cn('h-6 w-6', isSelected ? platform.color : 'text-muted-foreground')} />
                    <div className="text-center">
                      <p className={cn('font-medium text-sm', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                        {platform.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {platform.tech}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">
                  <span className="flex items-center gap-2">
                    <span>Blank Project</span>
                  </span>
                </SelectItem>
                {availableTemplates.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {template && selectedTemplate !== 'blank' && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Name (for blank projects) */}
          {selectedTemplate === 'blank' && (
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Project"
                required
              />
            </div>
          )}

          {/* Selected Platform Info */}
          <div className="rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-3">
            <div className="flex items-center gap-2 text-sm">
              {(() => {
                const platform = PLATFORM_OPTIONS.find(p => p.id === selectedPlatform)
                const Icon = platform?.icon || Globe
                return (
                  <>
                    <Icon className={cn('h-4 w-4', platform?.color)} />
                    <span className="font-medium">{platform?.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{platform?.description}</span>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              disabled={loading || (selectedTemplate === 'blank' && !projectName)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
