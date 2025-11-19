import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface PreviewPageProps {
  params: {
    projectId: string
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single()

  if (!project) {
    notFound()
  }

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', params.projectId)

  // Find the main page file
  const mainPage = files?.find(f => f.path === 'app/page.tsx') || files?.find(f => f.path.endsWith('page.tsx'))

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Preview: {project.name}</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            This is a static preview. For a full interactive preview, deploy your project.
          </p>
        </div>

        {mainPage ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <pre className="whitespace-pre-wrap text-sm">
              <code>{mainPage.content}</code>
            </pre>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            No preview available. Add an app/page.tsx file to see a preview.
          </div>
        )}
      </div>
    </div>
  )
}
