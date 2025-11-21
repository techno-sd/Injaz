import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { UserNav } from '@/components/user-nav'
import { ProjectCard } from '@/components/project-card'
import { GitHubConnectButton } from '@/components/github/github-connect-button'
import { RepoBrowser } from '@/components/github/repo-browser'
import { VercelConnectButton } from '@/components/vercel/vercel-connect-button'
import { DashboardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { PageTransition } from '@/components/page-transition'
import { Code2, Sparkles, LayoutTemplate, FolderPlus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Check if user has GitHub connected
  const { data: githubToken } = await supabase
    .from('github_tokens')
    .select('github_username')
    .eq('user_id', user.id)
    .single()

  // Check if user has Vercel connected
  const { data: vercelToken } = await supabase
    .from('vercel_tokens')
    .select('team_name')
    .eq('user_id', user.id)
    .single()

  // Calculate stats
  const totalProjects = projects?.length || 0
  const recentProjects = projects?.filter(p => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceUpdate <= 7
  }).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-purple-50/50">
      <header className="border-b glass">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iEditor</h1>
          </div>
          <div className="flex items-center gap-3">
            <GitHubConnectButton
              isConnected={!!githubToken}
              githubUsername={githubToken?.github_username}
            />
            <VercelConnectButton
              isConnected={!!vercelToken}
              teamName={vercelToken?.team_name}
            />
            <UserNav user={user} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
        {/* Stats Section */}
        {totalProjects > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                    {totalProjects}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active This Week</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                    {recentProjects}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Quick Action</p>
                  <p className="text-lg font-semibold mt-1">Start New Project</p>
                </div>
                <CreateProjectDialog variant="secondary" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
            <p className="text-muted-foreground mt-1">
              Manage and create AI-powered applications
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="shadow-sm">
              <Link href="/templates">
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Browse Templates
              </Link>
            </Button>
            {githubToken && <RepoBrowser />}
            <CreateProjectDialog />
          </div>
        </div>

        {projects && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>

            {/* Quick Start Section */}
            <div className="mt-12 gradient-primary rounded-3xl p-8 md:p-10 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="h-7 w-7" />
                    Start Something New
                  </h3>
                  <p className="text-white/90 text-lg">
                    Choose from our templates or start from scratch with AI
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="secondary" size="lg" className="shadow-lg">
                    <Link href="/templates">
                      <LayoutTemplate className="mr-2 h-5 w-5" />
                      View Templates
                    </Link>
                  </Button>
                  <CreateProjectDialog variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl gradient-primary mb-6 shadow-lg">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to iEditor!
              </h3>
              <p className="text-muted-foreground mb-12 text-xl">
                Start building your first AI-powered application in seconds
              </p>

              {/* Options Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <Card className="text-left hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader className="space-y-4">
                    <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Start from Scratch</CardTitle>
                    <CardDescription className="text-base">
                      Chat with AI to build your custom application from the ground up. Perfect for unique ideas.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <CreateProjectDialog className="w-full" />
                  </CardFooter>
                </Card>

                <Card className="text-left hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 hover:border-purple-300">
                  <CardHeader className="space-y-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                      <LayoutTemplate className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Use a Template</CardTitle>
                    <CardDescription className="text-base">
                      Kickstart your project with ready-made templates for common use cases. Fast and easy.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full shadow-sm">
                      <Link href="/templates">
                        Browse Templates
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="gradient-secondary rounded-2xl p-8 border-2 border-blue-200/50 shadow-lg">
                <p className="text-base text-gray-700 mb-5 font-medium">
                  <strong className="text-primary">Pro Tip:</strong> Describe your app idea in natural language, and our AI will build it for you!
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['Landing Pages', 'Dashboards', 'E-commerce', 'Blogs', 'Portfolios', 'SaaS Apps'].map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-white/80 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </PageTransition>
      </main>
    </div>
  )
}
