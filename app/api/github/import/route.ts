import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GitHubClient } from '@/lib/github'

interface ImportRequest {
  owner: string
  repo: string
  branch?: string
}

/**
 * Import a GitHub repository into iEditor
 * Creates a new project and imports all files from the repository
 */
export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json()
    const { owner, repo, branch } = body

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get GitHub token
    const { data: tokenData, error: tokenError } = await supabase
      .from('github_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      )
    }

    const githubClient = new GitHubClient(tokenData.access_token)

    // Get repository details
    const repoData = await githubClient.getRepo(owner, repo)
    const targetBranch = branch || repoData.default_branch

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: repoData.name,
        description: repoData.description || `Imported from ${repoData.full_name}`,
        github_repo_url: repoData.html_url,
        github_branch: targetBranch,
        github_connected: true,
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Fetch repository contents recursively
    const files = await fetchRepoContents(
      githubClient,
      owner,
      repo,
      '',
      targetBranch,
      project.id
    )

    // Insert files into database
    if (files.length > 0) {
      const { error: filesError } = await supabase
        .from('files')
        .insert(files)

      if (filesError) {
        console.error('Failed to insert files:', filesError)
        // Don't fail the whole import if files fail
      }
    }

    return NextResponse.json({
      project,
      filesImported: files.length,
    })
  } catch (error) {
    console.error('Failed to import repository:', error)
    return NextResponse.json(
      { error: 'Failed to import repository' },
      { status: 500 }
    )
  }
}

/**
 * Recursively fetch all files from a GitHub repository
 */
async function fetchRepoContents(
  client: GitHubClient,
  owner: string,
  repo: string,
  path: string,
  branch: string,
  projectId: string,
  depth: number = 0
): Promise<any[]> {
  // Limit recursion depth to prevent infinite loops
  if (depth > 10) return []

  try {
    const contents = await client.getContents(owner, repo, path, branch)
    const files: any[] = []

    for (const item of Array.isArray(contents) ? contents : [contents]) {
      if (item.type === 'file') {
        // Download file content
        const response = await fetch(item.download_url)
        const content = await response.text()

        // Determine language from file extension
        const extension = item.name.split('.').pop()?.toLowerCase()
        const languageMap: Record<string, string> = {
          'ts': 'typescript',
          'tsx': 'typescript',
          'js': 'javascript',
          'jsx': 'javascript',
          'json': 'json',
          'css': 'css',
          'html': 'html',
          'md': 'markdown',
          'py': 'python',
          'go': 'go',
          'rs': 'rust',
          'java': 'java',
        }

        files.push({
          project_id: projectId,
          path: item.path,
          content,
          language: languageMap[extension || ''] || 'plaintext',
        })
      } else if (item.type === 'dir') {
        // Recursively fetch directory contents
        const subFiles = await fetchRepoContents(
          client,
          owner,
          repo,
          item.path,
          branch,
          projectId,
          depth + 1
        )
        files.push(...subFiles)
      }
    }

    return files
  } catch (error) {
    console.error(`Failed to fetch contents for ${path}:`, error)
    return []
  }
}
