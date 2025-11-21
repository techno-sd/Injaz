'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PROJECT_TEMPLATES } from '@/lib/templates'

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
    // Create project from template
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${template.name} Project`,
        description: template.description,
        template: template.id,
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

      return { data: project }
    }

    return { error: 'Failed to create project' }
  } catch (error) {
    console.error('Error in createProjectFromTemplate:', error)
    return { error: 'An unexpected error occurred' }
  }
}
