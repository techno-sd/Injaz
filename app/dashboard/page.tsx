import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { UserNav } from '@/components/user-nav'
import { GuestNav } from '@/components/guest-nav'
import { ProjectCard } from '@/components/project-card'
import { GitHubConnectButton } from '@/components/github/github-connect-button'
import { RepoBrowser } from '@/components/github/repo-browser'
import { VercelConnectButton } from '@/components/vercel/vercel-connect-button'
import { Code2, Sparkles, LayoutTemplate, FolderOpen, Zap, Plus, Layers } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

    const { data: ghToken } = await supabase
      .from('github_tokens')
      .select('github_username')
      .eq('user_id', user.id)
      .single()
    githubToken = ghToken

    const { data: vToken } = await supabase
      .from('vercel_tokens')
      .select('team_name')
      .eq('user_id', user.id)
      .single()
    vercelToken = vToken
  }

  const totalProjects = projects?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-xl group-hover:shadow-violet-500/30 transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">iEditor</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
            <p className="text-gray-500 mt-1">
              {totalProjects > 0
                ? `${totalProjects} project${totalProjects === 1 ? '' : 's'} in your workspace`
                : 'Create your first project to get started'
              }
            </p>
          </div>

          <div className="flex items-center gap-2 animate-fade-in-up delay-100">
            <Button variant="outline" size="sm" asChild className="rounded-xl border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-200">
              <Link href="/templates">
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Templates
              </Link>
            </Button>
            {user && githubToken && <RepoBrowser />}
            <CreateProjectDialog />
          </div>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}

            {/* Add New Project Card */}
            <div className="animate-fade-in-up" style={{ animationDelay: `${projects.length * 50}ms` }}>
              <CreateProjectDialog
                variant="ghost"
                className="h-full min-h-[180px] w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-violet-600 transition-all duration-300 group"
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in-up">
            <div className="relative mb-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <FolderOpen className="h-10 w-10 text-violet-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Building</h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Create your first project from scratch or choose from our professionally designed templates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <CreateProjectDialog />
              <Button variant="outline" asChild className="rounded-xl border-gray-200 hover:border-violet-300 px-6">
                <Link href="/templates">
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Browse Templates
                </Link>
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
              <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
                <p className="text-sm text-gray-500">Describe your idea and let AI build it for you</p>
              </div>

              <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Real-time Preview</h3>
                <p className="text-sm text-gray-500">See your changes instantly as you build</p>
              </div>

              <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Export & Deploy</h3>
                <p className="text-sm text-gray-500">Download your code or deploy with one click</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
