"use client"

import * as React from "react"
import { Check, Sparkles, Zap, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface PricingPlan {
  id: string
  name: string
  description: string
  price_monthly_cents: number
  price_yearly_cents: number | null
  features: string[]
  limits: Record<string, number>
}

interface PricingCardsProps {
  plans: PricingPlan[]
  currentPlan: string
  isLoggedIn: boolean
}

const planIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  pro: Zap,
  team: Building2,
}

export function PricingCards({ plans, currentPlan, isLoggedIn }: PricingCardsProps) {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = React.useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (!isLoggedIn) {
      router.push(`/signup?plan=${planId}`)
      return
    }

    if (planId === 'free' || planId === currentPlan) {
      return
    }

    setLoading(planId)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free'
    return `$${(cents / 100).toFixed(0)}`
  }

  return (
    <div className="space-y-8">
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            billingCycle === 'monthly'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
            billingCycle === 'yearly'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yearly
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white"
          >
            Save 17%
          </Badge>
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = planIcons[plan.id] || Sparkles
          const isCurrentPlan = plan.id === currentPlan
          const isPopular = plan.id === 'pro'
          const price = billingCycle === 'yearly' && plan.price_yearly_cents
            ? plan.price_yearly_cents / 12
            : plan.price_monthly_cents

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border bg-card p-6 flex flex-col",
                isPopular && "border-primary shadow-lg shadow-primary/10 scale-105",
                isCurrentPlan && "ring-2 ring-primary"
              )}
            >
              {isPopular && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary"
                >
                  Most Popular
                </Badge>
              )}

              {isCurrentPlan && (
                <Badge
                  variant="outline"
                  className="absolute -top-3 right-4"
                >
                  Current Plan
                </Badge>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      plan.id === 'free' && "bg-muted",
                      plan.id === 'pro' && "bg-primary/10",
                      plan.id === 'team' && "bg-purple-500/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        plan.id === 'free' && "text-muted-foreground",
                        plan.id === 'pro' && "text-primary",
                        plan.id === 'team' && "text-purple-500"
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatPrice(price)}</span>
                  {price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price_yearly_cents && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${(plan.price_yearly_cents / 100).toFixed(0)} billed yearly
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  "w-full",
                  isPopular && "bg-primary hover:bg-primary/90"
                )}
                variant={isPopular ? "default" : "outline"}
                size="lg"
                disabled={isCurrentPlan || loading === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {loading === plan.id ? (
                  "Loading..."
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : plan.id === 'free' ? (
                  "Get Started"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="text-center mt-12 p-8 rounded-2xl border bg-muted/30 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-2">Need more?</h3>
        <p className="text-muted-foreground mb-4">
          Contact us for custom enterprise pricing with unlimited everything,
          dedicated support, and custom integrations.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  )
}
