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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Project Templates</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Start with a Template</h2>
            <p className="text-xl text-muted-foreground">
              Choose a template to kickstart your project, then customize with AI
            </p>
          </div>

          {categories.map(category => {
            const categoryTemplates = PROJECT_TEMPLATES.filter(t => t.category === category)

            return (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-bold mb-6">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTemplates.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-4xl">{template.icon}</div>
                          <CardTitle>{template.name}</CardTitle>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
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
                          <Button type="submit" className="w-full group-hover:bg-primary">
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
