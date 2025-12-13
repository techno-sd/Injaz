import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

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
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const userId = session.metadata?.user_id
          const planId = session.metadata?.plan_id

          if (userId) {
            // Update subscription in database
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                plan_id: planId || 'pro',
                status: 'active',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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
        const userId = subscription.metadata?.user_id

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status as any,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

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
        const invoice = event.data.object as Stripe.Invoice

        // Record in billing history
        await supabase
          .from('billing_history')
          .insert({
            user_id: invoice.metadata?.user_id || invoice.subscription_details?.metadata?.user_id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount_cents: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            description: invoice.description || `Subscription payment`,
            invoice_pdf_url: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
          })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Update subscription status
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
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
