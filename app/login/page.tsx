import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DemoLoginButton } from '@/components/demo-login-button'
import { Sparkles, Code2, ArrowRight, Check, Zap, Shield } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">iEditor</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6 leading-tight animate-slide-in">
            Build amazing apps
            <br />
            with AI assistance
          </h1>

          <p className="text-xl text-white/90 mb-12 leading-relaxed animate-slide-in animate-delay-100">
            Join thousands of developers building faster with our AI-powered platform.
          </p>

          <div className="space-y-4 animate-slide-in animate-delay-200">
            {[
              { icon: Zap, text: 'AI-powered code generation' },
              { icon: Code2, text: 'Real-time code editing' },
              { icon: Shield, text: 'One-click deployment' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-6 text-sm text-white/80 animate-fade-in animate-delay-300">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-white/30 border-2 border-white/50"></div>
                ))}
              </div>
              <span>5,000+ developers</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Trusted by teams worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-scale-in">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-8">
              <div className="h-12 w-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                iEditor
              </span>
            </Link>
          </div>

          {/* Demo CTA Card */}
          <Card className="glass-card border-2 shadow-xl hover:shadow-2xl transition-all hover-lift animate-slide-up">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-primary mx-auto shadow-lg">
                  <Sparkles className="h-7 w-7 text-white animate-pulse-slow" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gradient mb-2">
                    Try iEditor for free
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore the platform with a demo account. No signup required!
                  </p>
                </div>
                <DemoLoginButton
                  className="w-full gradient-primary text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  size="lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-muted-foreground font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-2 hover:shadow-3xl transition-shadow animate-slide-up animate-delay-100">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-gradient">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to your account to continue building
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <Link
                      href="#"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gradient-primary text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Create account
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure login</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>256-bit encryption</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer links */}
          <div className="text-center text-xs text-muted-foreground space-x-4">
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
