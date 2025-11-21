import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GitHubClient } from '@/lib/github'

/**
 * List user's GitHub repositories
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get GitHub token from database
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

    // Fetch repositories from GitHub
    const githubClient = new GitHubClient(tokenData.access_token)
    const repos = await githubClient.listRepos({
      type: 'all',
      sort: 'updated',
      per_page: 100,
    })

    return NextResponse.json({ repos })
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}
