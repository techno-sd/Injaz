'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createFile(projectId: string, path: string, content: string = '') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify user owns the project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  const language = getLanguageFromPath(path)

  const { data, error } = await supabase
    .from('files')
    .insert({
      project_id: projectId,
      path,
      content,
      language,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/workspace/${projectId}`)
  return { data }
}

export async function updateFile(fileId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('files')
    .update({ content })
    .eq('id', fileId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteFile(fileId: string, projectId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/workspace/${projectId}`)
  return { success: true }
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    html: 'html',
    md: 'markdown',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
  }

  return languageMap[ext || ''] || 'plaintext'
}
