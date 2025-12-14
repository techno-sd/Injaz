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
    <div className="min-h-screen bg-[#08080c] flex flex-col overflow-hidden noise">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none gradient-mesh-dark" />

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] animate-float delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-dark border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl icon-box-brand group-hover:glow-purple transition-all duration-300">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">iEditor</span>
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
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-violet-500/5 rounded-2xl overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Try Demo Mode</p>
                  <p className="text-xs text-gray-500">No account required</p>
                </div>
              </div>
              <DemoLoginButton className="w-full rounded-xl h-11" />
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-br from-gray-50 via-white to-violet-50/30 px-4 text-gray-400 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-gray-200/80 bg-white shadow-xl shadow-gray-200/30 rounded-2xl">
            <CardHeader className="space-y-1 pb-4 pt-6">
              <CardTitle className="text-xl font-semibold text-gray-900">Sign in to your account</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your email and password below
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form action={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <Link href="#" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
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
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/signup" className="text-violet-600 hover:text-violet-700 font-semibold">
                  Sign up for free
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Zap className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">Fast & Easy</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">Secure</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">AI-Powered</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 pt-2">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-gray-500 hover:text-gray-700 underline">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-gray-500 hover:text-gray-700 underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
