import { createClient } from "@/lib/supabase/server"
import { PricingPageClient } from "@/components/pricing/pricing-page-client"

export const metadata = {
  title: "Pricing - iEditor",
  description: "Choose the perfect plan for your needs",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current subscription if logged in
  let currentPlan = "free"
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .single()

    if (subscription) {
      currentPlan = subscription.plan_id
    }
  }

  // Get pricing plans
  const { data: dbPlans } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  // Fallback plans if database is empty
  const defaultPlans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for trying out iEditor",
      price_monthly_cents: 0,
      price_yearly_cents: null,
      features: [
        "3 projects",
        "50 AI requests/month",
        "100 MB storage",
        "Community support",
      ],
      limits: { projects: 3, ai_requests: 50, storage_mb: 100 },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For professional developers",
      price_monthly_cents: 1900,
      price_yearly_cents: 19000,
      features: [
        "Unlimited projects",
        "500 AI requests/month",
        "10 GB storage",
        "Priority support",
        "Custom domains",
        "Team collaboration",
      ],
      limits: { projects: -1, ai_requests: 500, storage_mb: 10240 },
    },
    {
      id: "team",
      name: "Team",
      description: "For teams and organizations",
      price_monthly_cents: 4900,
      price_yearly_cents: 49000,
      features: [
        "Everything in Pro",
        "Unlimited AI requests",
        "100 GB storage",
        "SSO & SAML",
        "Dedicated support",
        "Custom integrations",
        "Audit logs",
      ],
      limits: { projects: -1, ai_requests: -1, storage_mb: 102400 },
    },
  ]

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : defaultPlans

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            iEditor
          </a>
          <nav className="flex items-center gap-4">
            {user ? (
              <a
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Get Started
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you need more. All plans include our
            core features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <PricingPageClient
            plans={JSON.parse(JSON.stringify(plans))}
            currentPlan={currentPlan}
            isLoggedIn={!!user}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we'll prorate your billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when I exceed my limits?</h3>
              <p className="text-muted-foreground">
                We'll notify you when you're approaching your limits. If you exceed
                them, some features may be temporarily restricted until the next
                billing cycle or until you upgrade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 14-day money-back guarantee on all paid plans. If you're
                not satisfied, contact support for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                The Free plan is available forever with generous limits. You can
                use it to try all core features before upgrading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} iEditor. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
