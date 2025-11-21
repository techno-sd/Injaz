'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PROJECT_TEMPLATES, type TemplateMetadata } from '@/lib/templates'
import { TemplateBrowser } from '@/components/template-browser'
import { Code2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createProjectFromTemplate } from '@/app/actions/templates'

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()

  async function handleSelectTemplate(template: TemplateMetadata) {
    try {
      const result = await createProjectFromTemplate(template.id)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.data) {
        toast({
          title: 'Project created!',
          description: `${template.name} project has been created successfully`,
        })
        router.push(`/workspace/${result.data.id}`)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project from template',
        variant: 'destructive',
      })
    }
  }

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Project Templates
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start with a Template
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from {PROJECT_TEMPLATES.length} professional templates to kickstart your project, then customize with AI
            </p>
          </div>

          <TemplateBrowser
            templates={PROJECT_TEMPLATES}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </main>
    </div>
  )
}
