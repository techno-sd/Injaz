'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { deployToVercel, getDeployments, checkDeploymentStatus } from '@/app/actions/vercel'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ExternalLink, CheckCircle2, XCircle, Clock, Rocket } from 'lucide-react'
import type { Project } from '@/types'

interface DeploymentPanelProps {
  project: Project
  isVercelConnected: boolean
}

interface Deployment {
  id: string
  vercel_deployment_id: string
  url: string
  status: string
  created_at: string
  ready_at?: string | null
}

export function DeploymentPanel({ project, isVercelConnected }: DeploymentPanelProps) {
  const [deploying, setDeploying] = useState(false)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isVercelConnected) {
      fetchDeployments()
    } else {
      setLoading(false)
    }
  }, [isVercelConnected, project.id])

  const fetchDeployments = async () => {
    try {
      const result = await getDeployments(project.id)
      if (result.data) {
        setDeployments(result.data)
      }
    } catch (error) {
      console.error('Error fetching deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    try {
      const result = await deployToVercel(project.id)

      if (result.error) {
        toast({
          title: 'Deployment failed',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.data) {
        toast({
          title: 'Deployment started!',
          description: 'Your project is being deployed to Vercel',
        })

        // Refresh deployments list
        await fetchDeployments()

        // Poll for status updates
        const deploymentId = result.data.id
        const pollInterval = setInterval(async () => {
          const status = await checkDeploymentStatus(deploymentId)
          if (status.data && (status.data.status === 'READY' || status.data.status === 'ERROR')) {
            clearInterval(pollInterval)
            await fetchDeployments()

            if (status.data.status === 'READY') {
              toast({
                title: 'Deployment successful!',
                description: 'Your project is now live on Vercel',
              })
            } else {
              toast({
                title: 'Deployment failed',
                description: 'There was an error deploying your project',
                variant: 'destructive',
              })
            }
          }
        }, 5000) // Poll every 5 seconds

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deploy to Vercel',
        variant: 'destructive',
      })
    } finally {
      setDeploying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'ERROR':
      case 'CANCELED':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {status === 'ERROR' ? 'Failed' : 'Canceled'}
          </Badge>
        )
      case 'BUILDING':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Building
          </Badge>
        )
      case 'QUEUED':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isVercelConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg viewBox="0 0 116 100" className="h-5 w-5">
              <path d="M57.5 0L115 100H0L57.5 0z" />
            </svg>
            Vercel Deployments
          </CardTitle>
          <CardDescription>
            Connect your Vercel account to deploy this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deploy your project to Vercel with one click. Connect your account to get started.
          </p>
          <Button variant="outline" asChild>
            <a href="/dashboard">Go to Settings</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg viewBox="0 0 116 100" className="h-5 w-5">
              <path d="M57.5 0L115 100H0L57.5 0z" />
            </svg>
            Vercel Deployments
          </CardTitle>
          <CardDescription>
            Deploy and manage your project on Vercel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleDeploy}
            disabled={deploying}
            className="w-full gradient-primary text-white border-0"
          >
            {deploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy to Vercel
              </>
            )}
          </Button>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : deployments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recent Deployments</h4>
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(deployment.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(deployment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                    >
                      {deployment.url.replace('https://', '')}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No deployments yet</p>
              <p className="text-xs mt-1">Deploy your project to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
