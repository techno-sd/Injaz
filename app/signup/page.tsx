import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DemoLoginButton } from '@/components/demo-login-button'
import { Sparkles, Code2, ArrowRight, Check, Rocket, Users, Clock } from 'lucide-react'

interface SignUpPageProps {
  searchParams: {
    prompt?: string
  }
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const prompt = searchParams.prompt

  return (
    <div className="flex min-h-screen bg-[#08080c] overflow-hidden noise">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none gradient-mesh-dark opacity-50" />

      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-primary opacity-20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-white/10">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Injaz.ai</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6 leading-tight animate-slide-in">
            Start building
            <br />
            in minutes
          </h1>

          <p className="text-xl text-white/90 mb-12 leading-relaxed animate-slide-in animate-delay-100">
            Join 5,000+ developers who are building faster with AI-powered development.
          </p>

          <div className="space-y-4 animate-slide-in animate-delay-200">
            {[
              { icon: Rocket, text: 'Launch your first project in under 5 minutes' },
              { icon: Users, text: 'Access 100+ pre-built templates' },
              { icon: Clock, text: 'Deploy to production instantly' }
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <span className="text-lg">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-fade-in animate-delay-300">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold mb-1">Free to start</p>
                <p className="text-sm text-white/80">No credit card required. Start building immediately with our generous free tier.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-scale-in">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-8">
              <div className="h-12 w-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                Injaz.ai
              </span>
            </Link>
          </div>

          {/* Prompt Card */}
          {prompt && (
            <Card className="glass-card border-white/[0.08] shadow-lg animate-slide-up">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="h-6 w-6 text-white animate-pulse-slow" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-2">Your AI Project:</p>
                    <p className="text-sm text-white/60 italic leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/[0.05]">
                      "{prompt}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo CTA Card */}
          {!prompt && (
            <>
              <Card className="glass-card border-white/[0.08] shadow-xl hover:shadow-2xl transition-all hover-lift animate-slide-up">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-primary mx-auto shadow-lg">
                      <Sparkles className="h-7 w-7 text-white animate-pulse-slow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">
                        Try without signing up
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Explore the platform with a demo account first
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
                  <div className="w-full border-t border-white/[0.1]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#08080c] text-white/40 font-medium">
                    Or create your account
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Signup Card */}
          <Card className="glass-card border-white/[0.08] shadow-2xl hover:shadow-3xl transition-shadow animate-slide-up animate-delay-100">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-white">
                {prompt ? 'Create account to continue' : 'Get started free'}
              </CardTitle>
              <CardDescription className="text-base text-white/60">
                {prompt
                  ? 'Sign up to start building your AI project'
                  : 'Create your account and start building amazing apps'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signUp} className="space-y-5">
                {prompt && (
                  <input type="hidden" name="initial_prompt" value={prompt} />
                )}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-white">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-violet-500/50 transition-colors"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-white">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-violet-500/50 transition-colors"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-white">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-violet-500/50 transition-colors"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-white/40">Minimum 6 characters</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gradient-primary text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  {prompt ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Building with AI
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-violet-400 hover:text-violet-300 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Sign in
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t border-white/[0.1] flex items-center justify-center gap-6 text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer links */}
          <div className="text-center text-xs text-white/40 space-x-4">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
