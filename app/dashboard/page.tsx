import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { UserNav } from '@/components/user-nav'
import { Code2, FolderOpen, Sparkles, LayoutTemplate } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">iEditor</h1>
          </div>
          <UserNav user={user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
            <p className="text-muted-foreground mt-1">
              Manage and create AI-powered applications
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/templates">
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Browse Templates
              </Link>
            </Button>
            <CreateProjectDialog />
          </div>
        </div>

        {projects && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/workspace/${project.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 group-hover:text-primary transition-colors" />
                        {project.name}
                      </CardTitle>
                      <CardDescription>
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <p>Updated {formatDate(project.updated_at)}</p>
                        <p className="mt-1 capitalize">Template: {project.template}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full group-hover:bg-primary/10 group-hover:text-primary">
                        Open Project
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Quick Start Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Start Something New
                  </h3>
                  <p className="text-muted-foreground">
                    Choose from our templates or start from scratch with AI
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="bg-white">
                    <Link href="/templates">
                      <LayoutTemplate className="mr-2 h-4 w-4" />
                      View Templates
                    </Link>
                  </Button>
                  <CreateProjectDialog />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Welcome to iEditor!</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Start building your first AI-powered application
              </p>

              {/* Options Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="text-left hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <CardTitle>Start from Scratch</CardTitle>
                    <CardDescription>
                      Chat with AI to build your custom application from the ground up
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <CreateProjectDialog />
                  </CardFooter>
                </Card>

                <Card className="text-left hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                      <LayoutTemplate className="h-6 w-6" />
                    </div>
                    <CardTitle>Use a Template</CardTitle>
                    <CardDescription>
                      Kickstart your project with ready-made templates for common use cases
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/templates">
                        Browse Templates
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Pro Tip:</strong> Describe your app idea in natural language, and our AI will build it for you!
                </p>
                <div className="flex gap-2 flex-wrap justify-center text-xs">
                  <span className="px-3 py-1 bg-white rounded-full">Landing Pages</span>
                  <span className="px-3 py-1 bg-white rounded-full">Dashboards</span>
                  <span className="px-3 py-1 bg-white rounded-full">E-commerce</span>
                  <span className="px-3 py-1 bg-white rounded-full">Blogs</span>
                  <span className="px-3 py-1 bg-white rounded-full">Portfolios</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
