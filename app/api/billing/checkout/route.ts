import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Lazy initialization to avoid build errors when STRIPE_SECRET_KEY is not set
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  })
}

export async function POST(req: Request) {
  const stripe = getStripe()

  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    const { planId, billingCycle } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the pricing plan
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get or create Stripe customer
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_id: 'free',
          status: 'active',
        })
    }

    // Determine which price to use
    const priceId = billingCycle === 'yearly'
      ? plan.stripe_price_id_yearly
      : plan.stripe_price_id_monthly

    if (!priceId) {
      return new Response(JSON.stringify({
        error: 'Stripe price not configured for this plan'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create checkout session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
