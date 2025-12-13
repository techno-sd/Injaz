import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientWorkspace } from '@/components/workspace/client-workspace'
import { getGuestTemplateFiles, GUEST_TEMPLATES } from '@/lib/guest-templates'

interface WorkspacePageProps {
  params: {
    projectId: string
  }
  searchParams: {
    template?: string
  }
}

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Handle demo/guest mode
  if (params.projectId === 'demo' || params.projectId === 'new') {
    // Get template from query params or default to blank
    const templateId = searchParams.template || 'blank'
    const template = GUEST_TEMPLATES[templateId] || GUEST_TEMPLATES.blank
    const templateFiles = getGuestTemplateFiles(templateId)

    const demoProject = {
      id: 'demo',
      name: template.name,
      description: template.description,
      template: templateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || 'guest',
      preview_url: null,
      deployment_url: null,
      is_public: false,
      vercel_project_id: null,
      vercel_project_name: null,
    }

    return (
      <ClientWorkspace
        project={demoProject}
        initialFiles={templateFiles}
        initialMessages={[]}
        isVercelConnected={false}
        isGuestMode={!user}
      />
    )
  }

  // For regular projects, try to load from database
  let project = null
  let files: any[] = []
  let messages: any[] = []
  let vercelToken = null

  if (user) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .eq('user_id', user.id)
      .single()

    project = projectData

    if (project) {
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', params.projectId)
        .order('path', { ascending: true })

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', params.projectId)
        .order('created_at', { ascending: true })

      const { data: vToken } = await supabase
        .from('vercel_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single()

      files = filesData || []
      messages = messagesData || []
      vercelToken = vToken
    }
  }

  if (!project) {
    redirect('/dashboard')
  }

  return (
    <ClientWorkspace
      project={project}
      initialFiles={files}
      initialMessages={messages}
      isVercelConnected={!!vercelToken}
      isGuestMode={false}
    />
  )
}
