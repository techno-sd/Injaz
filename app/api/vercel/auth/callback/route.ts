import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, VercelClient } from '@/lib/vercel'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?error=no_code', request.url)
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      )
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)

    // Get user info from Vercel
    const vercelClient = new VercelClient(tokenData.access_token, tokenData.team_id)
    const vercelUser = await vercelClient.getUser()

    // Store token in database
    const { error: dbError } = await supabase
      .from('vercel_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        team_id: tokenData.team_id || null,
        team_name: null, // Can be fetched if needed
      })

    if (dbError) {
      console.error('Error storing Vercel token:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard?error=failed_to_store_token', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/dashboard?vercel_connected=true', request.url)
    )
  } catch (error) {
    console.error('Error in Vercel OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
