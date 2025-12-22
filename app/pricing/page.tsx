import { createClient } from "@/lib/supabase/server"
import { PricingPageClient } from "@/components/pricing/pricing-page-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code2, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Pricing - Injaz.ai",
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
      description: "Perfect for trying out Injaz.ai",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Achievement-themed gradient mesh overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-emerald-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-teal-600/10 to-emerald-600/10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Animated gradient orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md border-b border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">Injaz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/templates" className="text-sm text-white/80 hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-white font-medium transition-colors border-b-2 border-emerald-500">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-white/80 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="/community" className="text-sm text-white/80 hover:text-white transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-medium">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:flex text-white hover:bg-white/10 transition-all">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-medium">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Start for free, upgrade when you need more. All plans include our
            core features to help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <PricingPageClient
            plans={JSON.parse(JSON.stringify(plans))}
            currentPlan={currentPlan}
            isLoggedIn={!!user}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-2 text-white text-lg">Can I change plans later?</h3>
              <p className="text-white/60 leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we'll prorate your billing.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-teal-500/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-2 text-white text-lg">What happens when I exceed my limits?</h3>
              <p className="text-white/60 leading-relaxed">
                We'll notify you when you're approaching your limits. If you exceed
                them, some features may be temporarily restricted until the next
                billing cycle or until you upgrade.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-amber-500/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-2 text-white text-lg">Do you offer refunds?</h3>
              <p className="text-white/60 leading-relaxed">
                We offer a 14-day money-back guarantee on all paid plans. If you're
                not satisfied, contact support for a full refund.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="font-semibold mb-2 text-white text-lg">Is there a free trial?</h3>
              <p className="text-white/60 leading-relaxed">
                The Free plan is available forever with generous limits. You can
                use it to try all core features before upgrading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/templates" className="text-white/60 hover:text-white transition-colors text-sm">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white/60 hover:text-white transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/60 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/60 hover:text-white transition-colors text-sm">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/docs" className="text-white/60 hover:text-white transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-white/60 hover:text-white transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-white/60 hover:text-white transition-colors text-sm">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-white/60 hover:text-white transition-colors text-sm">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/60 text-sm">© 2025 Injaz. Ship faster, achieve more.</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
