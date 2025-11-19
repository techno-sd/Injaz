import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          Build Apps with <span className="text-primary">AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          iEditor is an AI-powered platform for building web applications.
          Chat with AI, edit code in real-time, and deploy instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-16 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">AI-Powered</h3>
            <p className="text-muted-foreground">
              Chat with AI to build your app. No coding required.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Real-Time Editor</h3>
            <p className="text-muted-foreground">
              Edit code directly with Monaco editor and see changes instantly.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">One-Click Deploy</h3>
            <p className="text-muted-foreground">
              Deploy your application to production with a single click.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
