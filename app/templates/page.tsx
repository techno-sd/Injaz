'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROJECT_TEMPLATES, type TemplateMetadata } from '@/lib/templates'
import { GUEST_TEMPLATES } from '@/lib/guest-templates'
import { TemplateBrowser } from '@/components/template-browser'
import {
  Code2,
  ArrowLeft,
  Loader2,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  createProjectFromTemplate,
  getTemplateFavorites,
  getTemplateStats,
} from '@/app/actions/templates'
import { createClient } from '@/lib/supabase/client'

const FEATURED_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Layers, color: 'from-white/10 to-white/5' },
  { id: 'Landing', name: 'Landing Pages', icon: Sparkles, color: 'from-violet-500/20 to-purple-500/20' },
  { id: 'Dashboard', name: 'Dashboards', icon: TrendingUp, color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'E-commerce', name: 'E-commerce', icon: Zap, color: 'from-orange-500/20 to-red-500/20' },
  { id: 'Portfolio', name: 'Portfolio', icon: Star, color: 'from-emerald-500/20 to-teal-500/20' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [templateStats, setTemplateStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)

        const [statsResult, favoritesResult] = await Promise.all([
          getTemplateStats(),
          user ? getTemplateFavorites() : Promise.resolve({ data: [] as string[] }),
        ])

        if (favoritesResult.data) {
          setFavoriteIds(favoritesResult.data)
        }

        if (statsResult.data) {
          setTemplateStats(statsResult.data)
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

  const templates = isAuthenticated
    ? PROJECT_TEMPLATES
    : PROJECT_TEMPLATES.filter((t) => t.id in GUEST_TEMPLATES)

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  // Get featured templates (most used or first few)
  const featuredTemplates = templates.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        {/* Gradient orbs */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl border-b border-white/5 bg-[#0A0A0F]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-white/5 text-white/60 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-50" />
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold">Injaz</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button asChild className="bg-white text-black hover:bg-white/90 font-medium">
                <Link href="/login">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-white/70">{templates.length} production-ready templates</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Start with a{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  template
                </span>
              </h1>

              <p className="text-lg text-white/50 max-w-xl leading-relaxed">
                Choose from our collection of professionally designed templates.
                Each one is fully customizable and ready for production.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-bold">{templates.length}+</div>
                  <div className="text-xs text-white/40">Templates</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold">10K+</div>
                  <div className="text-xs text-white/40">Projects Created</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-xl font-bold">&lt;2min</div>
                  <div className="text-xs text-white/40">To Deploy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills */}
        <section className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {FEATURED_CATEGORIES.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-black font-medium'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Templates (only when showing all) */}
        {selectedCategory === 'all' && !loading && featuredTemplates.length > 0 && (
          <section className="px-6 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Featured Templates</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {featuredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6 text-left hover:border-white/20 transition-all"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative">
                      <div className="text-4xl mb-4">{template.icon}</div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-white/50 line-clamp-2 mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span className="px-2 py-1 rounded-md bg-white/5">{template.category}</span>
                        <span>{template.techStack[0]}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5 text-emerald-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                </div>
                <p className="text-white/40 mt-4">Loading templates...</p>
              </div>
            ) : (
              <TemplateBrowser
                templates={filteredTemplates}
                onSelectTemplate={handleSelectTemplate}
                favoriteIds={favoriteIds}
                templateStats={templateStats}
                isAuthenticated={!!isAuthenticated}
                hideFilters={selectedCategory !== 'all'}
              />
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 sm:p-12 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />

              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Can't find what you need?
                </h2>
                <p className="text-white/50 mb-8 max-w-md mx-auto">
                  Describe your project and let AI build it from scratch.
                  No template required.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium px-8">
                  <Link href="/dashboard">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start from Scratch
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0A0A0F] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-white/40">© 2025 Injaz</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
