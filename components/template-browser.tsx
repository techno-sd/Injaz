'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import type { TemplateMetadata } from '@/lib/templates'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TemplateBrowserProps {
  templates: TemplateMetadata[]
  onSelectTemplate: (template: TemplateMetadata) => void
}

export function TemplateBrowser({ templates, onSelectTemplate }: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Tags:
          </div>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card
            key={template.id}
            className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all pointer-events-none" />

            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl shadow-sm">
                  {template.icon}
                </div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-primary text-xs font-medium rounded-full border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {template.techStack.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-muted text-xs rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Features
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                  {template.features.length > 3 && (
                    <li className="text-primary">
                      +{template.features.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <Button className="w-full gradient-primary text-white border-0 shadow-md group-hover:shadow-lg transition-shadow">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
