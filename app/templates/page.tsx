'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROJECT_TEMPLATES, type TemplateMetadata } from '@/lib/templates'
import { GUEST_TEMPLATES } from '@/lib/guest-templates'
import { TemplateBrowser } from '@/components/template-browser'
import { Code2, ArrowLeft } from 'lucide-react'
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
        // Check authentication
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)

        // Only fetch favorites/stats if authenticated
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
    // For unauthenticated users, redirect to demo workspace
    if (!isAuthenticated) {
      // Check if there's a matching guest template
      const guestTemplate = GUEST_TEMPLATES[template.id]
      if (guestTemplate) {
        toast({
          title: 'Demo Mode',
          description: `Starting with ${guestTemplate.name} template. Sign in to save your projects!`,
        })
        router.push(`/workspace/demo?template=${template.id}`)
      } else {
        // For templates without guest versions, redirect to blank demo
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 border-b glass backdrop-blur-xl shadow-sm animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:scale-105 transition-all">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/30 group-hover:scale-105 transition-all">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Project Templates
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-600 mb-6 shadow-2xl shadow-purple-500/20 animate-scale-in">
              <Code2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
              Start with a Template
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up animate-delay-100">
              Choose from <span className="font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{PROJECT_TEMPLATES.length}</span> professional templates to kickstart your project, then customize with AI
            </p>
            {isAuthenticated === false && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 animate-slide-up animate-delay-200">
                Demo mode - Sign in to save your projects and access all templates
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-6"></div>
              <p className="text-xl text-muted-foreground">Loading templates...</p>
            </div>
          ) : (
            <div className="animate-slide-up animate-delay-200">
              <TemplateBrowser
                templates={PROJECT_TEMPLATES}
                onSelectTemplate={handleSelectTemplate}
                favoriteIds={favoriteIds}
                templateStats={templateStats}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
