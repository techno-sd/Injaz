import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DemoLoginButton } from '@/components/demo-login-button'
import { Sparkles } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50/50 via-white to-purple-50/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-12 w-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              iEditor
            </span>
          </Link>
        </div>

        {/* Demo CTA Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mx-auto shadow-md">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Try iEditor for free
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore the platform with a demo account. No signup required!
              </p>
              <DemoLoginButton className="w-full gradient-primary text-white border-0 shadow-md hover:shadow-lg" size="lg" />
            </div>
          </CardContent>
        </Card>

        {/* Login Card */}
        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary text-white border-0 shadow-md hover:shadow-lg transition-shadow">
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
