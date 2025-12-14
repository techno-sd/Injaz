'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROJECT_TEMPLATES, type TemplateMetadata } from '@/lib/templates'
import { GUEST_TEMPLATES } from '@/lib/guest-templates'
import { TemplateBrowser } from '@/components/template-browser'
import { Code2, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  createProjectFromTemplate,
  getTemplateFavorites,
  getTemplateStats,
} from '@/app/actions/templates'
import { createClient } from '@/lib/supabase/client'

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [templateStats, setTemplateStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)

        if (user) {
          const [favoritesResult, statsResult] = await Promise.all([
            getTemplateFavorites(),
            getTemplateStats(),
          ])

          if (favoritesResult.data) {
            setFavoriteIds(favoritesResult.data)
          }

          if (statsResult.data) {
            setTemplateStats(statsResult.data)
          }
        }
      } catch (error) {
        console.error('Error fetching template data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleSelectTemplate(template: TemplateMetadata) {
    if (!isAuthenticated) {
      const guestTemplate = GUEST_TEMPLATES[template.id]
      if (guestTemplate) {
        toast({
          title: 'Demo Mode',
          description: `Starting with ${guestTemplate.name} template. Sign in to save your projects!`,
        })
        router.push(`/workspace/demo?template=${template.id}`)
      } else {
        toast({
          title: 'Demo Mode',
          description: 'Sign in to access all templates. Starting with blank project.',
        })
        router.push('/workspace/demo?template=blank')
      }
      return
    }

    try {
      const result = await createProjectFromTemplate(template.id)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.data) {
        toast({
          title: 'Project created!',
          description: `${template.name} project has been created successfully`,
        })
        router.push(`/workspace/${result.data.id}`)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project from template',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">Templates</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h1>
          <p className="text-muted-foreground">
            {PROJECT_TEMPLATES.length} templates available
            {isAuthenticated === false && (
              <span className="text-amber-600 dark:text-amber-400 ml-2">
                (Sign in to save projects)
              </span>
            )}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : (
          <TemplateBrowser
            templates={PROJECT_TEMPLATES}
            onSelectTemplate={handleSelectTemplate}
            favoriteIds={favoriteIds}
            templateStats={templateStats}
          />
        )}
      </main>
    </div>
  )
}
