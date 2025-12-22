import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { ProjectCard } from '@/components/project-card'
import { RepoBrowser } from '@/components/github/repo-browser'
import { LayoutTemplate, FolderOpen, Plus, Sparkles, Zap, Layers, Code2, Rocket } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Achievement-themed gradient mesh overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-emerald-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-teal-600/10 to-emerald-600/10 pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md border-b border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">Injaz</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/templates" className="text-sm text-white/80 hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-sm text-white font-medium transition-colors border-b-2 border-emerald-500">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Your Projects</h1>
          <p className="text-white/60 mt-2 text-lg">
            {totalProjects > 0
              ? `${totalProjects} achievement${totalProjects === 1 ? '' : 's'} in progress`
              : 'Start your first project and achieve greatness'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="border-emerald-500/30 text-white hover:bg-emerald-500/10 hover:border-emerald-500/50">
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
          <CreateProjectDialog
            variant="ghost"
            className="h-full min-h-[200px] w-full rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white/60 hover:text-emerald-400 transition-all duration-300 group bg-slate-800/30"
          />
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
              <Rocket className="h-12 w-12 text-emerald-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Plus className="h-5 w-5 text-white" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">Start Your Achievement</h2>
          <p className="text-white/60 text-center max-w-md mb-8 text-lg">
            Create your first project from scratch or choose from professionally designed templates to accelerate your success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <CreateProjectDialog />
            <Button variant="outline" size="lg" asChild className="border-emerald-500/30 text-white hover:bg-emerald-500/10 hover:border-emerald-500/50 backdrop-blur-sm">
              <Link href="/templates">
                <LayoutTemplate className="h-5 w-5 mr-2" />
                Browse Templates
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 text-center">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">AI-Powered</h3>
              <p className="text-sm text-white/60 leading-relaxed">Describe your idea and let AI build it for you instantly</p>
            </div>

            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-teal-500/20 hover:border-teal-500/40 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 text-center">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-teal-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">Real-time Preview</h3>
              <p className="text-sm text-white/60 leading-relaxed">See your changes instantly as you build and iterate</p>
            </div>

            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-amber-500/20 hover:border-amber-500/40 hover:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 text-center">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">Export & Deploy</h3>
              <p className="text-sm text-white/60 leading-relaxed">Download your code or deploy with one click</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
