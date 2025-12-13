'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Heart, TrendingUp, Clock } from 'lucide-react'
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteIds))
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Get unique categories, difficulties, and tags
  const categories = useMemo(
    () => ['all', ...new Set(templates.map(t => t.category))],
    [templates]
  )

  const difficulties = useMemo(
    () => ['all', ...new Set(templates.map(t => t.difficulty))],
    [templates]
  )

  const allTags = useMemo(
    () => [...new Set(templates.flatMap(t => t.tags))],
    [templates]
  )

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search filter
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === 'all' || template.difficulty === selectedDifficulty

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every(tag => template.tags.includes(tag))

      return matchesSearch && matchesCategory && matchesDifficulty && matchesTags
    })
  }, [templates, searchQuery, selectedCategory, selectedDifficulty, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSelectedTags([])
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

        toast({
          title: result.data.favorited ? 'Added to favorites' : 'Removed from favorites',
          description: result.data.favorited
            ? 'Template added to your favorites'
            : 'Template removed from your favorites',
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

  const getTemplateStats = (templateId: string) => {
    return templateStats.find(s => s.template_id === templateId)
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedTags.length > 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="glass-card border-2 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base border-2 focus:border-primary transition-colors rounded-2xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] h-12 border-2 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[200px] h-12 border-2 rounded-xl">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Levels' : difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="lg"
              onClick={clearFilters}
              className="gap-2 border-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:shadow-lg transition-all"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tag Filters */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
            <Filter className="h-4 w-4" />
            Filter by Tags:
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={`cursor-pointer hover:scale-105 transition-all px-4 py-2 text-sm rounded-xl ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0 shadow-md'
                    : 'hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-muted-foreground">
          {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const stats = getTemplateStats(template.id)
          const isFavorited = favorites.has(template.id)
          const isLoadingFavorite = favoriteLoading.has(template.id)

          return (
            <Card
              key={template.id}
              className="hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 cursor-pointer group border-2 hover:border-purple-500/50 glass-card overflow-hidden"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-violet-500/0 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-300 pointer-events-none" />

              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 flex items-center justify-center text-4xl shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110 transition-all">
                    {template.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getDifficultyColor(template.difficulty)} font-semibold px-3 py-1`}>
                      {template.difficulty}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-red-50 transition-all"
                      onClick={(e) => handleToggleFavorite(template.id, e)}
                      disabled={isLoadingFavorite}
                    >
                      <Heart
                        className={`h-5 w-5 transition-all ${
                          isFavorited
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-muted-foreground hover:text-red-500 hover:scale-110'
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{template.name}</CardTitle>
                <CardDescription className="text-base leading-relaxed line-clamp-2">
                  {template.description}
                </CardDescription>

                {/* Stats */}
                {stats && (stats.usage_count > 0 || stats.favorite_count > 0) && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    {stats.usage_count > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">{stats.usage_count} uses</span>
                      </div>
                    )}
                    {stats.favorite_count > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{stats.favorite_count}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>

            <CardContent className="relative space-y-5 pt-0">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template.techStack.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-muted text-xs font-medium rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 hover:border hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold text-lg leading-none">✓</span>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                  {template.features.length > 3 && (
                    <li className="text-primary font-semibold text-sm">
                      +{template.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-0 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/30 group-hover:scale-105 transition-all font-semibold text-base">
                Use Template
              </Button>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="glass-card border-2 rounded-3xl p-12 max-w-2xl mx-auto shadow-xl">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold mb-4 text-gradient">No templates found</h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We couldn't find any templates matching your criteria. Try adjusting your filters or search query.
            </p>
            <Button onClick={clearFilters} size="lg" className="gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <X className="mr-2 h-5 w-5" />
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
