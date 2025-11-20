'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { loginAsDemo } from '@/app/actions/demo'

interface DemoLoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function DemoLoginButton({
  variant = 'outline',
  size = 'default',
  className = ''
}: DemoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      await loginAsDemo()
    } catch (error) {
      console.error('Demo login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDemoLogin}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading Demo...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Try Demo
        </>
      )}
    </Button>
  )
}
