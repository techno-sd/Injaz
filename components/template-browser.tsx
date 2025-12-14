'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Heart, ArrowRight, Sparkles } from 'lucide-react'
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
  onSelectTemplate: (template: TemplateMetadata) => void
  favoriteIds?: string[]
  templateStats?: Array<{
    template_id: string
    usage_count: number
    favorite_count: number
    last_used_at: string | null
  }>
}

export function TemplateBrowser({ templates, onSelectTemplate, favoriteIds = [], templateStats = [] }: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteIds))
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set())
  const { toast } = useToast()

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

  const handleToggleFavorite = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all'

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-background shadow-sm transition-all"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-background shadow-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {categories.map(category => (
              <SelectItem key={category} value={category} className="rounded-lg">
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-12 px-4 rounded-xl hover:bg-accent"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredTemplates.length}</span> template{filteredTemplates.length !== 1 ? 's' : ''} available
        </p>
        {hasActiveFilters && (
          <Badge variant="secondary" className="rounded-full">
            Filtered
          </Badge>
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template, index) => {
          const isFavorited = favorites.has(template.id)
          const isLoadingFavorite = favoriteLoading.has(template.id)

          return (
            <div
              key={template.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                className="group cursor-pointer bg-card rounded-2xl border-border hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden h-full"
                onClick={() => onSelectTemplate(template)}
              >
                {/* Gradient top border on hover */}
                <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {template.icon}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10"
                      onClick={(e) => handleToggleFavorite(template.id, e)}
                      disabled={isLoadingFavorite}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isFavorited
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                      />
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-card-foreground text-lg group-hover:text-primary transition-colors duration-200">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-5 space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-normal rounded-full px-2.5 py-0.5 bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs font-normal rounded-full px-2.5 py-0.5">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>{template.techStack.slice(0, 3).join(' • ')}</span>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
