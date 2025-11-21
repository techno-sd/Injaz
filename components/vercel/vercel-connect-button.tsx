'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { disconnectVercel } from '@/app/actions/vercel'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ExternalLink } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface VercelConnectButtonProps {
  isConnected: boolean
  teamName?: string | null
}

export function VercelConnectButton({ isConnected, teamName }: VercelConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/vercel/auth/callback`
    const vercelAuthUrl = `https://vercel.com/integrations/YOUR_INTEGRATION_ID/new`

    // For actual OAuth flow
    const authUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`

    window.location.href = authUrl
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const result = await disconnectVercel()

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Disconnected from Vercel',
          description: 'Your Vercel account has been disconnected',
        })
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Vercel',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
            <svg viewBox="0 0 116 100" className="h-4 w-4 fill-white">
              <path d="M57.5 0L115 100H0L57.5 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Vercel</p>
            {teamName && <p className="text-xs text-muted-foreground">{teamName}</p>}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Vercel?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your Vercel integration. You won't be able to deploy to Vercel until you reconnect.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDisconnect}>
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      <svg viewBox="0 0 116 100" className="h-4 w-4 fill-current">
        <path d="M57.5 0L115 100H0L57.5 0z" />
      </svg>
      Connect Vercel
      <ExternalLink className="h-3 w-3" />
    </Button>
  )
}
