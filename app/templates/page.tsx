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
    <div className="min-h-screen bg-[#08080c] flex flex-col overflow-hidden noise">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none gradient-mesh-dark" />

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] animate-float delay-300" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[80px] animate-float delay-500" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-white/[0.06] text-white/70 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Templates</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <TemplateBrowser
            templates={PROJECT_TEMPLATES}
            onSelectTemplate={handleSelectTemplate}
            favoriteIds={favoriteIds}
            templateStats={templateStats}
            isAuthenticated={!!isAuthenticated}
          />
        )}
      </main>
    </div>
  )
}
