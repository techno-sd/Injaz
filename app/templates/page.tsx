import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PROJECT_TEMPLATES } from '@/lib/templates'
import { Code2, ArrowLeft } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const categories = [...new Set(PROJECT_TEMPLATES.map(t => t.category))]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-purple-50/50">
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Project Templates</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start with a Template
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a template to kickstart your project, then customize with AI
            </p>
          </div>

          {categories.map(category => {
            const categoryTemplates = PROJECT_TEMPLATES.filter(t => t.category === category)

            return (
              <div key={category} className="mb-16">
                <h3 className="text-3xl font-bold mb-8 text-gray-800">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTemplates.map(template => (
                    <Card key={template.id} className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all pointer-events-none" />
                      <CardHeader className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl shadow-sm">
                            {template.icon}
                          </div>
                          <CardTitle className="text-xl">{template.name}</CardTitle>
                        </div>
                        <CardDescription className="text-base leading-relaxed">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="flex flex-wrap gap-2 mb-6">
                          {template.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-primary text-xs font-medium rounded-full border border-primary/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <form action={async () => {
                          'use server'
                          const supabase = await createClient()
                          const { data: { user } } = await supabase.auth.getUser()

                          if (!user) return

                          // Create project from template
                          const { data: project } = await supabase
                            .from('projects')
                            .insert({
                              user_id: user.id,
                              name: `${template.name} Project`,
                              description: template.description,
                              template: template.id,
                            })
                            .select()
                            .single()

                          if (project) {
                            // Create initial files from template
                            const files = template.files.map(file => ({
                              project_id: project.id,
                              path: file.path,
                              content: file.content,
                              language: file.path.endsWith('.tsx') ? 'typescript' : 'plaintext',
                            }))

                            await supabase.from('files').insert(files)

                            redirect(`/workspace/${project.id}`)
                          }
                        }}>
                          <Button type="submit" className="w-full gradient-primary text-white border-0 shadow-md group-hover:shadow-lg transition-shadow">
                            Use Template
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
