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

const planColors: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  free: {
    bg: "bg-slate-800/50",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
  pro: {
    bg: "bg-slate-800/70",
    border: "border-teal-500/30",
    icon: "text-teal-400",
    badge: "bg-teal-500/10 text-teal-400",
  },
  team: {
    bg: "bg-slate-800/50",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400",
  },
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
            "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
            billingCycle === 'monthly'
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
            billingCycle === 'yearly'
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          Yearly
          <Badge
            className="absolute -top-2 -right-2 text-[10px] bg-amber-500 text-black border-0 font-semibold px-2"
          >
            Save 17%
          </Badge>
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = planIcons[plan.id] || Sparkles
          const colors = planColors[plan.id] || planColors.free
          const isCurrentPlan = plan.id === currentPlan
          const isPopular = plan.id === 'pro'
          const price = billingCycle === 'yearly' && plan.price_yearly_cents
            ? plan.price_yearly_cents / 12
            : plan.price_monthly_cents

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col backdrop-blur-sm transition-all duration-300",
                colors.bg,
                colors.border,
                isPopular && "scale-105 shadow-2xl shadow-teal-500/20",
                "hover:shadow-2xl hover:-translate-y-1",
                isCurrentPlan && "ring-2 ring-emerald-400"
              )}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-4 py-1 shadow-lg shadow-teal-500/50"
                  >
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <Badge
                  className="absolute -top-3 right-4 bg-emerald-500 text-white border-0 px-3"
                >
                  Current Plan
                </Badge>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center backdrop-blur-sm",
                      plan.id === 'free' && "bg-emerald-500/10 border border-emerald-500/20",
                      plan.id === 'pro' && "bg-teal-500/10 border border-teal-500/20",
                      plan.id === 'team' && "bg-amber-500/10 border border-amber-500/20"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", colors.icon)} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-sm text-white/60">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-white/50">/month</span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price_yearly_cents && (
                  <p className="text-sm text-white/50 mt-1">
                    ${(plan.price_yearly_cents / 100).toFixed(0)} billed yearly
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  "w-full h-12 rounded-xl font-semibold transition-all duration-300",
                  isPopular
                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 border-0"
                    : plan.id === 'free'
                    ? "bg-white/5 hover:bg-white/10 text-white border border-emerald-500/30 hover:border-emerald-500/50"
                    : "bg-white/5 hover:bg-white/10 text-white border border-amber-500/30 hover:border-amber-500/50"
                )}
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
      <div className="text-center mt-16 p-8 rounded-2xl border border-emerald-500/20 bg-slate-800/50 backdrop-blur-sm max-w-3xl mx-auto group hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">Need more?</h3>
        <p className="text-white/60 mb-6 max-w-xl mx-auto leading-relaxed">
          Contact us for custom enterprise pricing with unlimited everything,
          dedicated support, and custom integrations.
        </p>
        <Button
          className="bg-white/5 hover:bg-white/10 text-white border border-emerald-500/30 hover:border-emerald-500/50 px-8 h-12 rounded-xl font-semibold transition-all duration-300"
        >
          Contact Sales
        </Button>
      </div>
    </div>
  )
}
