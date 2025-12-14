'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PROJECT_TEMPLATES } from '@/lib/templates'

function inferPlatformFromTemplateFiles(files: { path: string }[]): 'website' | 'webapp' {
  const paths = files.map((f) => f.path)

  // Next.js / app router conventions
  if (
    paths.some((p) => p.startsWith('app/')) ||
    paths.some((p) => p.startsWith('pages/')) ||
    paths.includes('next.config.js') ||
    paths.includes('next.config.mjs') ||
    paths.includes('next.config.ts')
  ) {
    return 'webapp'
  }

  // Simple static templates
  if (paths.includes('index.html')) {
    return 'website'
  }

  // Default to webapp for project templates
  return 'webapp'
}

export async function createProjectFromTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const template = PROJECT_TEMPLATES.find(t => t.id === templateId)

  if (!template) {
    return { error: 'Template not found' }
  }

  try {
    const platform = inferPlatformFromTemplateFiles(template.files)

    // Create project from template
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${template.name} Project`,
        description: template.description,
        template: template.id,
        platform,
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return { error: 'Failed to create project' }
    }

    if (project) {
      // Create initial files from template
      const files = template.files.map(file => ({
        project_id: project.id,
        path: file.path,
        content: file.content,
        language: file.path.endsWith('.tsx') || file.path.endsWith('.ts')
          ? 'typescript'
          : file.path.endsWith('.jsx') || file.path.endsWith('.js')
          ? 'javascript'
          : 'plaintext',
      }))

      const { error: filesError } = await supabase.from('files').insert(files)

      if (filesError) {
        console.error('Error creating files:', filesError)
        // Delete the project if files creation fails
        await supabase.from('projects').delete().eq('id', project.id)
        return { error: 'Failed to create project files' }
      }

      // Track template usage
      const { error: usageError } = await supabase
        .from('template_usage')
        .insert({
          user_id: user.id,
          template_id: template.id,
          project_id: project.id,
        })

      if (usageError) {
        console.error('Error tracking template usage:', usageError)
        // Don't fail the operation if usage tracking fails
      }

      return { data: project }
    }

    return { error: 'Failed to create project' }
  } catch (error) {
    console.error('Error in createProjectFromTemplate:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function toggleTemplateFavorite(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('template_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .single()

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('template_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('template_id', templateId)

      if (error) {
        console.error('Error removing favorite:', error)
        return { error: 'Failed to remove favorite' }
      }

      return { data: { favorited: false } }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('template_favorites')
        .insert({
          user_id: user.id,
          template_id: templateId,
        })

      if (error) {
        console.error('Error adding favorite:', error)
        return { error: 'Failed to add favorite' }
      }

      return { data: { favorited: true } }
    }
  } catch (error) {
    console.error('Error in toggleTemplateFavorite:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getTemplateFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [] }
  }

  try {
    const { data, error } = await supabase
      .from('template_favorites')
      .select('template_id')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching favorites:', error)
      return { data: [] }
    }

    return { data: data.map(f => f.template_id) }
  } catch (error) {
    console.error('Error in getTemplateFavorites:', error)
    return { data: [] }
  }
}

export async function getTemplateStats() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('template_stats')
      .select('*')
      .order('usage_count', { ascending: false })

    if (error) {
      console.error('Error fetching template stats:', error)
      return { data: [] }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error in getTemplateStats:', error)
    return { data: [] }
  }
}
