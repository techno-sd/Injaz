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
import {
  Plus,
  Loader2,
  Globe,
  AppWindow,
  Smartphone,
  Check,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  FileText,
  Rocket,
  Building,
  LayoutDashboard,
  ShoppingCart,
  Cloud,
  Users,
  MessageSquare,
  Store,
  Dumbbell,
  Wrench,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { PROJECT_TEMPLATES } from '@/lib/templates'
import { GUEST_TEMPLATES } from '@/lib/guest-templates'
import { createClient } from '@/lib/supabase/client'
import type { PlatformType, SubPlatformType } from '@/types/app-schema'
import { cn } from '@/lib/utils'
import {
  PLATFORM_CONFIGS,
  getCategoriesForPlatform,
  type PlatformCategory,
} from '@/lib/platform-config'

interface CreateProjectDialogProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

// Wizard steps
type WizardStep = 'platform' | 'category' | 'template' | 'details'

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, typeof Briefcase> = {
  portfolio: Briefcase,
  blog: FileText,
  landing: Rocket,
  business: Building,
  dashboard: LayoutDashboard,
  ecommerce: ShoppingCart,
  saas: Cloud,
  social: Users,
  fitness: Dumbbell,
  utility: Wrench,
}

// Platform icons
const PLATFORM_ICONS: Record<PlatformType, typeof Globe> = {
  website: Globe,
  webapp: AppWindow,
}

export function CreateProjectDialog({ variant, size, className }: CreateProjectDialogProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('webapp')
  const [selectedCategory, setSelectedCategory] = useState<SubPlatformType | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Get categories for selected platform
  const categories = getCategoriesForPlatform(selectedPlatform)
  const platformConfig = PLATFORM_CONFIGS[selectedPlatform]

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('platform')
        setSelectedCategory(null)
        setSelectedTemplate('blank')
        setProjectName('')
      }, 200)
    }
  }, [open])

  // Reset category when platform changes
  useEffect(() => {
    setSelectedCategory(null)
    setSelectedTemplate('blank')
  }, [selectedPlatform])

  const handleNext = () => {
    if (step === 'platform') setStep('category')
    else if (step === 'category') setStep('template')
    else if (step === 'template') setStep('details')
  }

  const handleBack = () => {
    if (step === 'category') setStep('platform')
    else if (step === 'template') setStep('category')
    else if (step === 'details') setStep('template')
  }

  const handleSkipCategory = () => {
    setSelectedCategory(null)
    setStep('template')
  }

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
        const params = new URLSearchParams({
          template: selectedTemplate,
          platform: selectedPlatform,
        })
        if (selectedCategory) {
          params.append('subPlatform', selectedCategory)
        }
        router.push(`/workspace/demo?${params.toString()}`)
        return
      }

      if (selectedTemplate === 'blank') {
        const formData = new FormData()
        formData.append('name', projectName)
        formData.append('platform', selectedPlatform)
        if (selectedCategory) {
          formData.append('subPlatform', selectedCategory)
        }
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

  // Filter templates by platform and category
  const availableTemplates = isAuthenticated === false
    ? Object.values(GUEST_TEMPLATES).filter(t => t.id !== 'blank')
    : PROJECT_TEMPLATES.filter(t => {
        if ((t as any).platform && (t as any).platform !== selectedPlatform) return false
        if (selectedCategory && (t as any).subPlatform && (t as any).subPlatform !== selectedCategory) return false
        return true
      })

  const template = isAuthenticated === false
    ? GUEST_TEMPLATES[selectedTemplate]
    : PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)

  // Calculate step number
  const stepNumber = step === 'platform' ? 1 : step === 'category' ? 2 : step === 'template' ? 3 : 4

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size || 'sm'} className={className}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>New Project</span>
            {/* Step Indicator */}
            <div className="flex items-center gap-1.5 ml-auto">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    s === stepNumber
                      ? 'bg-emerald-500'
                      : s < stepNumber
                      ? 'bg-emerald-500/50'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 'platform' && 'Choose what type of project you want to build'}
            {step === 'category' && `Select a category for your ${platformConfig.name.toLowerCase()}`}
            {step === 'template' && 'Start from a template or blank project'}
            {step === 'details' && 'Enter your project details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Platform Selection */}
          {step === 'platform' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {Object.values(PLATFORM_CONFIGS).map((platform) => {
                  const Icon = PLATFORM_ICONS[platform.id]
                  const isSelected = selectedPlatform === platform.id
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200',
                        isSelected
                          ? `border-emerald-500 ${platform.bgColor}`
                          : 'border-border hover:border-emerald-500/50 hover:bg-accent/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          isSelected ? platform.bgColor : 'bg-muted'
                        )}
                      >
                        <Icon className={cn('h-6 w-6', isSelected ? platform.color : 'text-muted-foreground')} />
                      </div>
                      <div className="text-center">
                        <p className={cn('font-semibold', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
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

              {/* Platform Features */}
              <div className={cn('rounded-lg p-4', platformConfig.bgColor)}>
                <p className="text-xs font-medium text-muted-foreground mb-2">Includes:</p>
                <div className="flex flex-wrap gap-2">
                  {platformConfig.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-xs bg-background/50 text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {step === 'category' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = CATEGORY_ICONS[category.id] || Sparkles
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-emerald-500/50 hover:bg-accent/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br',
                          category.gradient
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn('font-medium text-sm', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                          {category.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {category.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Skip Category */}
              <button
                type="button"
                onClick={handleSkipCategory}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip this step
              </button>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {step === 'template' && (
            <div className="space-y-4">
              {/* Blank Project Option */}
              <button
                type="button"
                onClick={() => setSelectedTemplate('blank')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  selectedTemplate === 'blank'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border hover:border-emerald-500/50 hover:bg-accent/50'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Blank Project</p>
                  <p className="text-xs text-muted-foreground">Start from scratch with AI assistance</p>
                </div>
                {selectedTemplate === 'blank' && (
                  <Check className="h-5 w-5 text-emerald-400 ml-auto" />
                )}
              </button>

              {/* Templates */}
              {availableTemplates.length > 0 && (
                <>
                  <div className="text-xs font-medium text-muted-foreground">Or choose a template:</div>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {availableTemplates.map((t: any) => {
                      const isSelected = selectedTemplate === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTemplate(t.id)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left',
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border hover:border-emerald-500/50 hover:bg-accent/50'
                          )}
                        >
                          <span className="text-xl shrink-0">{t.icon}</span>
                          <div className="min-w-0">
                            <p className={cn('font-medium text-sm truncate', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                              {t.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {t.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Project Details */}
          {step === 'details' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = PLATFORM_ICONS[selectedPlatform]
                    return (
                      <>
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', platformConfig.bgColor)}>
                          <Icon className={cn('h-5 w-5', platformConfig.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{platformConfig.name}</p>
                          <p className="text-xs text-muted-foreground">{platformConfig.tech}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
                {selectedCategory && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium capitalize">{selectedCategory}</span>
                  </div>
                )}
                {selectedTemplate !== 'blank' && template && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">{template.icon} {template.name}</span>
                  </div>
                )}
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 pt-2">
            {step !== 'platform' ? (
              <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
            )}

            {step !== 'details' ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 gap-2"
                disabled={step === 'category' && !selectedCategory}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                disabled={loading || !projectName.trim()}
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
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
