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

  // Handle demo/guest mode or new projects from home page
  const isNewProject = params.projectId === 'demo' || params.projectId === 'new' || params.projectId.startsWith('new-')
  const isAIGeneratedProject = params.projectId.startsWith('new-')

  if (isNewProject) {
    // For AI-generated projects from home page, start with empty files
    // For demo/templates, use the template files
    const templateId = searchParams.template || 'blank'
    const template = GUEST_TEMPLATES[templateId] || GUEST_TEMPLATES.blank

    // Empty starter files for AI to build from scratch
    const emptyStarterFiles = [
      {
        id: 'index-html',
        project_id: params.projectId,
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="app.js"></script>
</body>
</html>`,
        language: 'html',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'styles-css',
        project_id: params.projectId,
        path: 'styles.css',
        content: `/* Your styles will be generated here */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}`,
        language: 'css',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'app-js',
        project_id: params.projectId,
        path: 'app.js',
        content: `// Your JavaScript will be generated here
console.log('App ready');`,
        language: 'javascript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    const templateFiles = isAIGeneratedProject ? emptyStarterFiles : getGuestTemplateFiles(templateId)

    const newProject = {
      id: params.projectId,
      name: isAIGeneratedProject ? 'New Project' : template.name,
      description: isAIGeneratedProject ? 'AI-generated project' : template.description,
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
        project={newProject}
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
