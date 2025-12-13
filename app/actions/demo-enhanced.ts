'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getViteTemplateFiles } from '@/lib/vite-templates'

const DEMO_EMAIL = 'demo@ieditor.dev'
const DEMO_PASSWORD = 'demo123456'

export async function loginAsDemoEnhanced() {
  const supabase = await createClient()

  // Try to sign in with demo account
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  if (error) {
    // If demo account doesn't exist, create it
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          full_name: 'Demo User',
        },
        emailRedirectTo: undefined, // Skip email confirmation
      },
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    // Sign in after creating account
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (signInError) {
      return { error: signInError.message }
    }

    // Create demo projects for new demo account
    if (signUpData.user) {
      await createEnhancedDemoProjects(signUpData.user.id)
    }
  } else if (data.user) {
    // Check if demo projects exist, if not create them
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', data.user.id)

    if (!projects || projects.length === 0) {
      await createEnhancedDemoProjects(data.user.id)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

async function createEnhancedDemoProjects(userId: string) {
  const supabase = await createClient()

  // Create demo projects with Vite templates (fast & simple)
  const demoProjects = [
    {
      user_id: userId,
      name: 'Landing Page',
      description: 'Modern landing page built with Vite & React',
      template: 'landing-page',
    },
    {
      user_id: userId,
      name: 'Analytics Dashboard',
      description: 'Beautiful dashboard with Vite & Tailwind CSS',
      template: 'dashboard',
    },
    {
      user_id: userId,
      name: 'Personal Blog',
      description: 'Fast blog powered by Vite & React',
      template: 'blog',
    },
  ]

  // Batch insert all projects at once for better performance
  const { data: createdProjects } = await supabase
    .from('projects')
    .insert(demoProjects)
    .select()

  if (createdProjects && createdProjects.length > 0) {
    // Prepare all files and messages for batch insert
    const allFiles: any[] = []
    const allMessages: any[] = []

    createdProjects.forEach((project, index) => {
      const template = demoProjects[index].template

      // Use Vite templates - faster and simpler for non-developers
      const templateFiles = getViteTemplateFiles(template, project.id)

      // Convert to database format
      const files = templateFiles.map(file => ({
        project_id: project.id,
        path: file.path,
        content: file.content,
        language: file.language
      }))

      allFiles.push(...files)

      allMessages.push({
        project_id: project.id,
        role: 'assistant' as const,
        content: `Hi! I've created your ${project.name} using Vite + React. It includes:\n\n• ⚡ Lightning-fast Vite dev server\n• 🎨 Modern UI with Tailwind CSS\n• 📱 Fully responsive design\n• ✨ Smooth animations & gradients\n\nYou can ask me to:\n• Change colors or styles\n• Add new sections\n• Modify content\n• Add features\n\nWhat would you like to change?`,
      })
    })

    // Batch insert all files and messages
    await Promise.all([
      supabase.from('files').insert(allFiles),
      supabase.from('messages').insert(allMessages),
    ])
  }
}
