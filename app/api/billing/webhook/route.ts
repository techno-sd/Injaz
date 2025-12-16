import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

// Lazy initialization to avoid build errors when STRIPE_SECRET_KEY is not set
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  })
}

// Helper to safely get subscription period dates
function getSubscriptionPeriod(subscription: any): { start: string; end: string } {
  const start = subscription.current_period_start || subscription.items?.data?.[0]?.current_period_start
  const end = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end
  return {
    start: start ? new Date(start * 1000).toISOString() : new Date().toISOString(),
    end: end ? new Date(end * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription as any)?.id

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const period = getSubscriptionPeriod(subscription)

          const userId = session.metadata?.user_id
          const planId = session.metadata?.plan_id

          if (userId) {
            // Update subscription in database
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id,
                stripe_subscription_id: subscription.id,
                plan_id: planId || 'pro',
                status: 'active',
                current_period_start: period.start,
                current_period_end: period.end,
              })

            // Update user quotas based on plan
            const { data: plan } = await supabase
              .from('pricing_plans')
              .select('limits')
              .eq('id', planId)
              .single()

            if (plan?.limits) {
              await supabase
                .from('user_quotas')
                .upsert({
                  user_id: userId,
                  plan_type: planId,
                  ai_requests_limit: plan.limits.ai_requests || 50,
                  storage_limit_mb: plan.limits.storage_mb || 100,
                  projects_limit: plan.limits.projects || 3,
                  deployments_limit: plan.limits.deployments || 10,
                  team_members_limit: plan.limits.team_members || 1,
                })
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = (subscription.metadata as Record<string, string>)?.user_id
        const period = getSubscriptionPeriod(subscription)

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status as any,
              current_period_start: period.start,
              current_period_end: period.end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = (subscription.metadata as Record<string, string>)?.user_id

        if (userId) {
          // Downgrade to free plan
          await supabase
            .from('subscriptions')
            .update({
              plan_id: 'free',
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          // Reset quotas to free tier
          await supabase
            .from('user_quotas')
            .update({
              plan_type: 'free',
              ai_requests_limit: 50,
              storage_limit_mb: 100,
              projects_limit: 3,
              deployments_limit: 10,
              team_members_limit: 1,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        }
        break
      }

      case 'invoice.paid': {
        // Cast to any to access properties that may vary by API version
        const invoice = event.data.object as any

        // Get user_id from metadata or subscription
        const invoiceMetadata = invoice.metadata as Record<string, string> | null
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id

        let userId = invoiceMetadata?.user_id

        // Try to get user_id from subscription if not in invoice metadata
        if (!userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          userId = (sub.metadata as Record<string, string>)?.user_id
        }

        // Record in billing history
        if (userId) {
          const paymentIntentId = typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : invoice.payment_intent?.id

          await supabase
            .from('billing_history')
            .insert({
              user_id: userId,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: paymentIntentId || null,
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              description: invoice.description || 'Subscription payment',
              invoice_pdf_url: invoice.invoice_pdf,
              hosted_invoice_url: invoice.hosted_invoice_url,
            })
        }
        break
      }

      case 'invoice.payment_failed': {
        // Cast to any to access properties that may vary by API version
        const invoice = event.data.object as any
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id

        // Update subscription status
        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
