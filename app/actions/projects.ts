'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const template = formData.get('template') as string || 'blank'

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description,
      template,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Create initial files based on template
  const initialFiles = getInitialFiles(template, project.id)

  if (initialFiles.length > 0) {
    await supabase.from('files').insert(initialFiles)
  }

  revalidatePath('/dashboard')
  redirect(`/workspace/${project.id}`)
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProject(projectId: string, updates: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/workspace/${projectId}`)
  return { success: true }
}

/**
 * Save a guest project with files to the database
 * Used when a guest user wants to save their generated project
 */
export async function saveGuestProject(input: {
  name: string
  description?: string
  platform?: 'website' | 'webapp' | 'mobile'
  files: { path: string; content: string; language?: string }[]
}): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please sign in to save your project' }
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: input.name || 'Untitled Project',
        description: input.description || 'AI-generated project',
        platform: input.platform || 'website',
        user_id: user.id,
        is_public: false,
      })
      .select('id')
      .single()

    if (projectError || !project) {
      console.error('Error creating project:', projectError)
      return { success: false, error: 'Failed to create project' }
    }

    // Save all files
    if (input.files.length > 0) {
      const filesToInsert = input.files.map(file => ({
        project_id: project.id,
        path: file.path,
        content: file.content,
        language: file.language || 'plaintext',
      }))

      const { error: filesError } = await supabase
        .from('files')
        .insert(filesToInsert)

      if (filesError) {
        console.error('Error saving files:', filesError)
        // Delete the project if files failed to save
        await supabase.from('projects').delete().eq('id', project.id)
        return { success: false, error: 'Failed to save files' }
      }
    }

    revalidatePath('/dashboard')
    return { success: true, projectId: project.id }
  } catch (error: any) {
    console.error('Save guest project error:', error)
    return { success: false, error: error.message || 'An error occurred' }
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return { isAuthenticated: !!user, userId: user?.id }
  } catch {
    return { isAuthenticated: false }
  }
}

/**
 * Save files to an existing project (upsert)
 */
export async function saveFilesToProject(
  projectId: string,
  files: { path: string; content: string; language?: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    // Upsert files (update if exists, insert if not)
    for (const file of files) {
      await supabase
        .from('files')
        .upsert({
          project_id: projectId,
          path: file.path,
          content: file.content,
          language: file.language || 'plaintext',
        }, {
          onConflict: 'project_id,path',
        })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Save files error:', error)
    return { success: false, error: error.message || 'An error occurred' }
  }
}

function getInitialFiles(template: string, projectId: string) {
  const baseFiles = [
    {
      project_id: projectId,
      path: 'package.json',
      content: JSON.stringify({
        name: 'my-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '14.1.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          typescript: '^5',
        },
      }, null, 2),
      language: 'json',
    },
    {
      project_id: projectId,
      path: 'app/page.tsx',
      content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to your new app!</h1>
      <p className="mt-4 text-lg text-gray-600">
        Start editing to see changes in real-time.
      </p>
    </main>
  )
}
`,
      language: 'typescript',
    },
    {
      project_id: projectId,
      path: 'app/layout.tsx',
      content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
      language: 'typescript',
    },
  ]

  return baseFiles
}
