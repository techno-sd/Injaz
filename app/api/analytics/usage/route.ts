import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, createRateLimitHeaders, rateLimitResponse, trackUsage } from '@/lib/rate-limit'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get usage events
    const { data: events, error } = await supabase
      .from('usage_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get user quotas
    const { data: quotas } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Aggregate by day
    const dailyStats: Record<string, { ai_requests: number; deployments: number; file_operations: number }> = {}

    events?.forEach(event => {
      const date = event.created_at.slice(0, 10)
      if (!dailyStats[date]) {
        dailyStats[date] = { ai_requests: 0, deployments: 0, file_operations: 0 }
      }
      if (event.event_type === 'ai_request') dailyStats[date].ai_requests++
      if (event.event_type === 'deployment') dailyStats[date].deployments++
      if (event.event_type === 'file_operation') dailyStats[date].file_operations++
    })

    // Calculate totals
    const totals = {
      ai_requests: events?.filter(e => e.event_type === 'ai_request').length || 0,
      deployments: events?.filter(e => e.event_type === 'deployment').length || 0,
      file_operations: events?.filter(e => e.event_type === 'file_operation').length || 0,
    }

    return new Response(JSON.stringify({
      totals,
      daily: dailyStats,
      quotas: quotas || null,
      recentEvents: events?.slice(0, 20) || [],
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...createRateLimitHeaders(rateLimitResult),
      },
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { event_type, metadata } = await req.json()

    // Validate event type
    const validEventTypes = ['ai_request', 'deployment', 'file_operation', 'api_call']
    if (!validEventTypes.includes(event_type)) {
      return new Response(JSON.stringify({ error: 'Invalid event type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's plan to determine rate limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single()

    const plan = (subscription?.plan_id || 'free') as 'free' | 'pro' | 'team'

    // Check rate limit for the event type
    let rateLimitResult
    if (event_type === 'ai_request') {
      rateLimitResult = await checkRateLimit(user.id, 'ai', plan)
    } else if (event_type === 'deployment') {
      rateLimitResult = await checkRateLimit(user.id, 'deploy')
    } else if (event_type === 'file_operation') {
      rateLimitResult = await checkRateLimit(user.id, 'fileOps')
    } else {
      rateLimitResult = await checkRateLimit(user.id, 'api')
    }

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Record the event
    const { error } = await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        event_type,
        metadata,
      })

    if (error) throw error

    // Track in Redis for real-time analytics
    await trackUsage(user.id, event_type, metadata)

    // Update quotas
    if (event_type === 'ai_request') {
      await supabase
        .from('user_quotas')
        .update({
          ai_requests_used: supabase.rpc('increment_counter', { row_id: user.id, column_name: 'ai_requests_used' }),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return new Response(JSON.stringify({
      success: true,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset,
      },
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...createRateLimitHeaders(rateLimitResult),
      },
    })
  } catch (error: any) {
    console.error('Track usage error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
