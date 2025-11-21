import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/login?error=not_authenticated', request.url)
    )
  }

  const searchParams = request.nextUrl.searchParams
  const redirectUri = searchParams.get('redirect_uri') || `${process.env.NEXT_PUBLIC_APP_URL}/api/vercel/auth/callback`

  // Construct Vercel OAuth URL with client ID from environment
  const clientId = process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/dashboard?error=vercel_not_configured', request.url)
    )
  }

  const vercelAuthUrl = new URL('https://vercel.com/oauth/authorize')
  vercelAuthUrl.searchParams.set('client_id', clientId)
  vercelAuthUrl.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(vercelAuthUrl.toString())
}
