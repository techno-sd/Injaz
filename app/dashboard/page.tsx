import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { ProjectCard } from '@/components/project-card'
import { RepoBrowser } from '@/components/github/repo-browser'
import { LayoutTemplate, FolderOpen, Plus, Sparkles, Zap, Layers } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {totalProjects > 0
              ? `${totalProjects} project${totalProjects === 1 ? '' : 's'} in your workspace`
              : 'Create your first project to get started'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
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
            className="h-full min-h-[180px] w-full rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 group"
          />
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative mb-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Start Building</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Create your first project from scratch or choose from our professionally designed templates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <CreateProjectDialog />
            <Button variant="outline" asChild>
              <Link href="/templates">
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Browse Templates
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="group p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Describe your idea and let AI build it for you</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Real-time Preview</h3>
              <p className="text-sm text-muted-foreground">See your changes instantly as you build</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Export & Deploy</h3>
              <p className="text-sm text-muted-foreground">Download your code or deploy with one click</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
