'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Github, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GitHubConnectButtonProps {
  isConnected?: boolean
  githubUsername?: string
  className?: string
}

export function GitHubConnectButton({ isConnected, githubUsername, className }: GitHubConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)

    // Build GitHub OAuth URL
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/github/auth/callback`
    const scope = 'repo,user'

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`

    // Redirect to GitHub OAuth
    window.location.href = authUrl
  }

  if (isConnected && githubUsername) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
        disabled
      >
        <Check className="h-4 w-4 text-green-600" />
        <Github className="h-4 w-4" />
        <span className="text-sm">{githubUsername}</span>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className={cn("gap-2 hover:bg-gray-100", className)}
    >
      <Github className="h-4 w-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect GitHub'}</span>
    </Button>
  )
}
