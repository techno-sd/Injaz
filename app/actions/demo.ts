'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const DEMO_EMAIL = 'demo@ieditor.dev'
const DEMO_PASSWORD = 'demo123456'

export async function loginAsDemo() {
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
      await createDemoProjects(signUpData.user.id)
    }
  } else if (data.user) {
    // Check if demo projects exist, if not create them
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', data.user.id)

    if (!projects || projects.length === 0) {
      await createDemoProjects(data.user.id)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

async function createDemoProjects(userId: string) {
  const supabase = await createClient()

  // Create demo projects
  const demoProjects = [
    {
      user_id: userId,
      name: 'My Landing Page',
      description: 'A beautiful landing page built with AI',
      template: 'landing-page',
    },
    {
      user_id: userId,
      name: 'Dashboard App',
      description: 'Analytics dashboard with charts',
      template: 'dashboard',
    },
    {
      user_id: userId,
      name: 'Personal Blog',
      description: 'A minimal blog for sharing ideas',
      template: 'blog',
    },
  ]

  for (const project of demoProjects) {
    const { data: createdProject } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (createdProject) {
      // Add sample files based on template
      const files = getDemoFilesForTemplate(project.template, createdProject.id)
      await supabase.from('files').insert(files)

      // Add sample AI messages
      const messages = [
        {
          project_id: createdProject.id,
          role: 'assistant' as const,
          content: `Hi! I've created your ${project.name}. Feel free to customize it by chatting with me!`,
        },
      ]
      await supabase.from('messages').insert(messages)
    }
  }
}

function getDemoFilesForTemplate(template: string, projectId: string) {
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
      }, null, 2),
      language: 'json',
    },
  ]

  if (template === 'landing-page') {
    baseFiles.push({
      project_id: projectId,
      path: 'app/page.tsx',
      content: `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your App
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Built with AI in minutes, not hours
        </p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Optimized for speed and performance</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
            <p className="text-gray-600">Modern and responsive layouts</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Easy to Deploy</h3>
            <p className="text-gray-600">One-click deployment ready</p>
          </div>
        </div>
      </section>
    </main>
  )
}`,
      language: 'typescript',
    })
  } else if (template === 'dashboard') {
    baseFiles.push({
      project_id: projectId,
      path: 'app/page.tsx',
      content: `export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">$45,231</p>
            <p className="text-green-500 text-sm mt-2">+20.1%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Active Users</p>
            <p className="text-3xl font-bold mt-2">2,345</p>
            <p className="text-green-500 text-sm mt-2">+15.3%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Projects</p>
            <p className="text-3xl font-bold mt-2">89</p>
            <p className="text-blue-500 text-sm mt-2">+5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Conversion</p>
            <p className="text-3xl font-bold mt-2">3.2%</p>
            <p className="text-green-500 text-sm mt-2">+0.8%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">New user signup</p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
              <span className="text-green-500 text-sm">+1 user</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Project deployed</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
              <span className="text-blue-500 text-sm">Deploy</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}`,
      language: 'typescript',
    })
  } else {
    baseFiles.push({
      project_id: projectId,
      path: 'app/page.tsx',
      content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome!</h1>
      <p className="mt-4 text-lg text-gray-600">
        Start building with AI
      </p>
    </main>
  )
}`,
      language: 'typescript',
    })
  }

  return baseFiles
}
