"use client"

import { PricingCards } from "./pricing-cards"

interface PricingPlan {
  id: string
  name: string
  description: string
  price_monthly_cents: number
  price_yearly_cents: number | null
  features: string[]
  limits: Record<string, number>
}

interface PricingPageClientProps {
  plans: PricingPlan[]
  currentPlan: string
  isLoggedIn: boolean
}

export function PricingPageClient({ plans, currentPlan, isLoggedIn }: PricingPageClientProps) {
  return (
    <PricingCards
      plans={plans}
      currentPlan={currentPlan}
      isLoggedIn={isLoggedIn}
    />
  )
}
