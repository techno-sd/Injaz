import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DemoLoginButton } from '@/components/demo-login-button'
import { Code2, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Achievement-themed gradient mesh overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-emerald-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-teal-600/10 to-emerald-600/10 pointer-events-none" />

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md border-b border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">Injaz</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/60">Sign in to continue building amazing apps</p>
          </div>

          {/* Demo Card */}
          <Card className="border-emerald-500/20 bg-slate-800/50 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Try Demo Mode</p>
                  <p className="text-xs text-white/60">No account required</p>
                </div>
              </div>
              <DemoLoginButton className="w-full rounded-xl h-11" />
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-4 text-white/60 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-emerald-500/20 bg-slate-800/50 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardHeader className="space-y-1 pb-4 pt-6">
              <CardTitle className="text-xl font-semibold text-white">Sign in to your account</CardTitle>
              <CardDescription className="text-white/60">
                Enter your email and password below
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form action={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="h-12 rounded-xl border-emerald-500/20 bg-slate-900/50 text-white placeholder:text-white/40 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 rounded-xl border-emerald-500/20 bg-slate-900/50 text-white placeholder:text-white/40 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-white/60">
                Don't have an account?{' '}
                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                  Sign up for free
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-xs text-white/60">Fast & Easy</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-teal-400" />
              </div>
              <p className="text-xs text-white/60">Secure</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-xs text-white/60">AI-Powered</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-white/40 pt-2">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-white/60 hover:text-white underline">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-white/60 hover:text-white underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
