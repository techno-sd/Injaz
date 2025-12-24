import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { ProjectCard } from '@/components/project-card'
import { RepoBrowser } from '@/components/github/repo-browser'
import { LayoutTemplate, FolderOpen, Plus, Sparkles, Zap, Layers, Rocket, Search, Grid3X3, List, Filter, TrendingUp, Clock, Star } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let projects: any[] = []
  let githubToken = null

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
  }

  const totalProjects = projects?.length || 0
  const recentProjects = projects.filter(p => {
    const updated = new Date(p.updated_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return updated > weekAgo
  }).length

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-white/5 p-8">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-white/50 text-lg">
                {totalProjects > 0
                  ? `You have ${totalProjects} project${totalProjects === 1 ? '' : 's'} in your workspace`
                  : 'Start your first project and bring your ideas to life'
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" asChild className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20 rounded-xl">
                <Link href="/templates">
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Templates
                </Link>
              </Button>
              {user && githubToken && <RepoBrowser />}
              <CreateProjectDialog />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {totalProjects > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalProjects}</p>
                  <p className="text-sm text-white/40">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{recentProjects}</p>
                  <p className="text-sm text-white/40">Active This Week</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Pro</p>
                  <p className="text-sm text-white/40">Current Plan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Projects</h2>
              <p className="text-white/40 text-sm mt-1">
                {totalProjects > 0 ? 'Manage and edit your projects' : 'Create your first project to get started'}
              </p>
            </div>

            {totalProjects > 0 && (
              <div className="flex items-center gap-2">
                {/* Search (placeholder) */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="h-10 w-48 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/10 transition-colors"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/5">
                  <button className="p-2 rounded-md bg-white/10 text-white">
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-md text-white/40 hover:text-white/60 transition-colors">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}

              {/* Add New Project Card */}
              <CreateProjectDialog
                variant="ghost"
                className="h-full min-h-[200px] w-full rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white/40 hover:text-emerald-400 transition-all duration-300 group bg-white/[0.01]"
              />
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Rocket className="h-12 w-12 text-emerald-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white text-center">Start Building</h2>
              <p className="text-white/50 text-center max-w-md mb-8 text-lg">
                Create your first project from scratch or choose from professionally designed templates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <CreateProjectDialog />
                <Button variant="outline" size="lg" asChild className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20 backdrop-blur-sm rounded-xl">
                  <Link href="/templates">
                    <LayoutTemplate className="h-5 w-5 mr-2" />
                    Browse Templates
                  </Link>
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.03] backdrop-blur-sm transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white text-lg">AI-Powered</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Describe your idea and let AI build it for you instantly</p>
                </div>

                <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-white/[0.03] backdrop-blur-sm transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white text-lg">Real-time Preview</h3>
                  <p className="text-sm text-white/40 leading-relaxed">See your changes instantly as you build and iterate</p>
                </div>

                <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.03] backdrop-blur-sm transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="h-7 w-7 text-amber-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white text-lg">Export & Deploy</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Download your code or deploy with one click</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
