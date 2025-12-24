'use client'

// Template browser component
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Heart, ArrowRight, Sparkles, Loader2, Grid3X3, LayoutList } from 'lucide-react'
import type { TemplateMetadata } from '@/lib/templates'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toggleTemplateFavorite } from '@/app/actions/templates'
import { useToast } from '@/components/ui/use-toast'

interface TemplateBrowserProps {
  templates: TemplateMetadata[]
  onSelectTemplate: (template: TemplateMetadata) => void | Promise<void>
  favoriteIds?: string[]
  templateStats?: Array<{
    template_id: string
    usage_count: number
    favorite_count: number
    last_used_at: string | null
  }>
  isAuthenticated?: boolean
  hideFilters?: boolean
}

export function TemplateBrowser({
  templates,
  onSelectTemplate,
  favoriteIds = [],
  templateStats = [],
  isAuthenticated = false,
  hideFilters = false
}: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteIds))
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set())
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { toast } = useToast()

  useEffect(() => {
    setFavorites(new Set(favoriteIds))
  }, [favoriteIds])

  const statsById = useMemo(() => {
    const map = new Map<
      string,
      {
        template_id: string
        usage_count: number
        favorite_count: number
        last_used_at: string | null
      }
    >()

    for (const stat of templateStats) {
      map.set(stat.template_id, stat)
    }
    return map
  }, [templateStats])

  const categories = useMemo(
    () => ['all', ...new Set(templates.map(t => t.category))],
    [templates]
  )

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  const handleToggleFavorite = async (templateId: string, e: MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Sign in to favorite templates.',
      })
      return
    }

    setFavoriteLoading(prev => new Set(prev).add(templateId))

    try {
      const result = await toggleTemplateFavorite(templateId)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.data) {
        setFavorites(prev => {
          const newFavorites = new Set(prev)
          if (result.data.favorited) {
            newFavorites.add(templateId)
          } else {
            newFavorites.delete(templateId)
          }
          return newFavorites
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorite',
        variant: 'destructive',
      })
    } finally {
      setFavoriteLoading(prev => {
        const newLoading = new Set(prev)
        newLoading.delete(templateId)
        return newLoading
      })
    }
  }

  const handleSelect = async (template: TemplateMetadata) => {
    if (creatingTemplateId) return

    setCreatingTemplateId(template.id)
    try {
      await onSelectTemplate(template)
    } finally {
      setCreatingTemplateId(null)
    }
  }

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {!hideFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.05]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-[#1a1a1f] border-white/10 text-white">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="rounded-lg focus:bg-white/[0.08] focus:text-white">
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/10 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-12 px-4 rounded-xl hover:bg-white/[0.05] text-white/60 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          <span className="font-medium text-white">{filteredTemplates.length}</span> template{filteredTemplates.length !== 1 ? 's' : ''} available
        </p>
        {hasActiveFilters && (
          <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            Filtered
          </Badge>
        )}
      </div>

      {/* Template Grid */}
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        : "flex flex-col gap-3"
      }>
        {filteredTemplates.map((template, index) => {
          const isFavorited = favorites.has(template.id)
          const isLoadingFavorite = favoriteLoading.has(template.id)
          const isCreating = creatingTemplateId === template.id
          const stats = statsById.get(template.id)

          if (viewMode === 'list') {
            return (
              <div
                key={template.id}
                className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => handleSelect(template)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 rounded-xl bg-white/[0.05] flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {template.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {template.name}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-1 mt-0.5">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/50">{template.category}</span>
                      <span className="text-xs text-white/30">{template.techStack.slice(0, 2).join(' • ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/[0.08]"
                      onClick={(e) => handleToggleFavorite(template.id, e)}
                      disabled={isLoadingFavorite || isCreating}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isFavorited
                            ? 'fill-red-500 text-red-500'
                            : isAuthenticated
                              ? 'text-white/40 hover:text-red-500'
                              : 'text-white/25'
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white transition-all"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Use
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={template.id}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
              onClick={() => handleSelect(template)}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Hover glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {template.icon}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/[0.08]"
                    onClick={(e) => handleToggleFavorite(template.id, e)}
                    disabled={isLoadingFavorite || isCreating}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isFavorited
                          ? 'fill-red-500 text-red-500'
                          : isAuthenticated
                            ? 'text-white/40 hover:text-red-500'
                            : 'text-white/25'
                      }`}
                    />
                  </Button>
                </div>

                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1.5">
                  {template.name}
                </h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-white/50 border border-white/[0.05]"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-white/30 border border-white/[0.05]">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Tech Stack */}
                <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>{template.techStack.slice(0, 3).join(' • ')}</span>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="flex items-center gap-3 text-xs text-white/30 pb-4 border-b border-white/5 mb-4">
                    <span>{stats.usage_count} uses</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{stats.favorite_count} favorites</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:bg-emerald-500 hover:text-white hover:border-transparent transition-all"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Use Template</span>
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="relative h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <Search className="h-8 w-8 text-white/20" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">No templates found</h3>
          <p className="text-white/40 mb-6 max-w-sm mx-auto">
            Try adjusting your search query or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
