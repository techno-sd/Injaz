import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, GitHubClient } from '@/lib/github'

/**
 * GitHub OAuth callback handler
 * Exchanges authorization code for access token and stores it
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=github_${error}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?error=no_code', request.url)
    )
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get user information from GitHub
    const githubClient = new GitHubClient(accessToken)
    const githubUser = await githubClient.getUser()

    // Store token in database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      )
    }

    // Store GitHub token
    const { error: dbError } = await supabase
      .from('github_tokens')
      .upsert({
        user_id: user.id,
        access_token: accessToken,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        github_avatar: githubUser.avatar_url,
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Failed to store GitHub token:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard?error=token_storage_failed', request.url)
      )
    }

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?github_connected=true', request.url)
    )
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    return NextResponse.redirect(
      new URL('/dashboard?error=github_auth_failed', request.url)
    )
  }
}
