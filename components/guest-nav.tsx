'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus } from 'lucide-react'

export function GuestNav() {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
      <Button asChild size="sm" className="gradient-primary text-white border-0">
        <Link href="/signup">
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up
        </Link>
      </Button>
    </div>
  )
}
