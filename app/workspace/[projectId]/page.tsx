import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceLayout } from '@/components/workspace/workspace-layout'
import { WebContainerProvider } from '@/lib/webcontainer-context'

interface WorkspacePageProps {
  params: {
    projectId: string
  }
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    redirect('/dashboard')
  }

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', params.projectId)
    .order('path', { ascending: true })

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', params.projectId)
    .order('created_at', { ascending: true })

  return (
    <WebContainerProvider>
      <WorkspaceLayout
        project={project}
        initialFiles={files || []}
        initialMessages={messages || []}
      />
    </WebContainerProvider>
  )
}
