import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { UserNav } from '@/components/user-nav'
import { GuestNav } from '@/components/guest-nav'
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

  // Fetch projects - for logged in users get their projects, for guests show none
  let projects: any[] = []
  let githubToken = null
  let vercelToken = null

  if (user) {
    const { data: userProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    projects = userProjects || []

    // Check if user has GitHub connected
    const { data: ghToken } = await supabase
      .from('github_tokens')
      .select('github_username')
      .eq('user_id', user.id)
      .single()
    githubToken = ghToken

    // Check if user has Vercel connected
    const { data: vToken } = await supabase
      .from('vercel_tokens')
      .select('team_name')
      .eq('user_id', user.id)
      .single()
    vercelToken = vToken
  }

  // Calculate stats
  const totalProjects = projects?.length || 0
  const recentProjects = projects?.filter(p => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceUpdate <= 7
  }).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 border-b glass backdrop-blur-xl shadow-sm animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/30 group-hover:scale-105 group-hover:rotate-6 transition-all">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">iEditor</h1>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <GitHubConnectButton
                  isConnected={!!githubToken}
                  githubUsername={githubToken?.github_username}
                />
                <VercelConnectButton
                  isConnected={!!vercelToken}
                  teamName={vercelToken?.team_name}
                />
                <UserNav user={user} />
              </>
            ) : (
              <GuestNav />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
        {/* Stats Section */}
        {totalProjects > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
            <div className="glass-card border-2 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 hover-lift transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Total Projects</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    {totalProjects}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Code2 className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="glass-card border-2 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 hover-lift transition-all group animate-slide-up animate-delay-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Active This Week</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    {recentProjects}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Sparkles className="h-7 w-7 text-white group-hover:animate-spin-slow" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transition-all group relative overflow-hidden animate-slide-up animate-delay-200">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-5 right-5 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90 mb-2">Quick Action</p>
                  <p className="text-lg font-bold">Start New Project</p>
                </div>
                <CreateProjectDialog variant="secondary" className="shadow-lg hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in animate-delay-300">
          <div>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-slide-up">Your Projects</h2>
            <p className="text-muted-foreground text-lg animate-slide-up animate-delay-100">
              Manage and create AI-powered applications
            </p>
          </div>
          <div className="flex flex-wrap gap-3 animate-slide-up animate-delay-200">
            <Button asChild variant="outline" className="shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105 border-2">
              <Link href="/templates">
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Browse Templates
              </Link>
            </Button>
            {user && githubToken && <RepoBrowser />}
            <CreateProjectDialog className="shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105" />
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
            <div className="mt-16 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 rounded-3xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden group animate-scale-in animate-delay-500">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
              </div>
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left animate-slide-up">
                  <h3 className="text-4xl font-bold mb-3 flex items-center gap-3 justify-center md:justify-start">
                    <Sparkles className="h-9 w-9 animate-pulse-slow" />
                    Start Something New
                  </h3>
                  <p className="text-white/90 text-xl leading-relaxed">
                    Choose from our templates or start from scratch with AI
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animate-delay-100">
                  <Button asChild variant="secondary" size="lg" className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                    <Link href="/templates">
                      <LayoutTemplate className="mr-2 h-5 w-5" />
                      View Templates
                    </Link>
                  </Button>
                  <CreateProjectDialog variant="outline" size="lg" className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 shadow-xl hover:scale-105 transition-all" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center h-28 w-28 rounded-3xl gradient-primary mb-8 shadow-2xl animate-scale-in">
                <Sparkles className="h-14 w-14 text-white animate-pulse-slow" />
              </div>
              <h3 className="text-5xl font-bold mb-4 text-gradient animate-slide-up">
                Welcome to iEditor!
              </h3>
              <p className="text-muted-foreground mb-16 text-xl leading-relaxed max-w-2xl mx-auto animate-slide-up animate-delay-100">
                Start building your first AI-powered application in seconds. Choose your path below.
              </p>

              {/* Options Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card className="text-left hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer border-2 hover:border-purple-500/50 glass-card group animate-slide-up animate-delay-200">
                  <CardHeader className="space-y-5 pb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-xl group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <Sparkles className="h-8 w-8 text-white group-hover:animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Start from Scratch</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Chat with AI to build your custom application from the ground up. Perfect for unique ideas.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <CreateProjectDialog className="w-full shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105" size="lg" />
                  </CardFooter>
                </Card>

                <Card className="text-left hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer border-2 hover:border-purple-500/50 glass-card group animate-slide-up animate-delay-300">
                  <CardHeader className="space-y-5 pb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-xl group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <LayoutTemplate className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Use a Template</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Kickstart your project with ready-made templates for common use cases. Fast and easy.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:scale-105 border-2" size="lg">
                      <Link href="/templates">
                        Browse Templates
                        <LayoutTemplate className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/10 dark:to-violet-500/10 rounded-3xl p-10 border-2 border-purple-200 dark:border-purple-500/30 shadow-xl animate-slide-up animate-delay-400">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 font-semibold">
                  <Sparkles className="inline h-5 w-5 text-purple-600 dark:text-purple-400 mr-2 animate-pulse" />
                  <strong className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Pro Tip:</strong> Describe your app idea in natural language, and our AI will build it for you!
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  {['Landing Pages', 'Dashboards', 'E-commerce', 'Blogs', 'Portfolios', 'SaaS Apps'].map((tag, index) => (
                    <span
                      key={tag}
                      className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-500/30 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:scale-110 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-500 transition-all cursor-pointer animate-scale-in"
                      style={{ animationDelay: `${500 + index * 50}ms` }}
                    >
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
