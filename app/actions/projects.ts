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
