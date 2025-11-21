'use server'

import { createClient } from '@/lib/supabase/server'
import { VercelClient } from '@/lib/vercel'
import { revalidatePath } from 'next/cache'

export async function getVercelToken() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('vercel_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { data: null }
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Vercel token:', error)
    return { data: null }
  }
}

export async function disconnectVercel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('vercel_tokens')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error disconnecting Vercel:', error)
      return { error: 'Failed to disconnect Vercel' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error in disconnectVercel:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deployToVercel(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get Vercel token
    const { data: tokenData } = await supabase
      .from('vercel_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!tokenData) {
      return { error: 'Vercel not connected. Please connect your Vercel account first.' }
    }

    // Get project and files
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (!project || project.user_id !== user.id) {
      return { error: 'Project not found' }
    }

    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)

    if (!files || files.length === 0) {
      return { error: 'No files found in project' }
    }

    // Create Vercel client
    const vercelClient = new VercelClient(tokenData.access_token, tokenData.team_id)

    // Prepare files for deployment
    const deploymentFiles = files.map(file => ({
      file: file.path,
      data: Buffer.from(file.content).toString('base64'),
    }))

    // Add package.json if not exists
    const hasPackageJson = files.some(f => f.path === 'package.json')
    if (!hasPackageJson) {
      deploymentFiles.push({
        file: 'package.json',
        data: Buffer.from(JSON.stringify({
          name: project.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@types/node': '^20.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            'typescript': '^5.0.0',
            'tailwindcss': '^3.3.0',
            'autoprefixer': '^10.4.0',
            'postcss': '^8.4.0',
          },
        }, null, 2)).toString('base64'),
      })
    }

    // Create or get Vercel project
    let vercelProjectId = project.vercel_project_id
    if (!vercelProjectId) {
      try {
        const vercelProject = await vercelClient.createProject(
          project.name.toLowerCase().replace(/\s+/g, '-'),
          'nextjs'
        )
        vercelProjectId = vercelProject.id

        // Update project with Vercel project ID
        await supabase
          .from('projects')
          .update({
            vercel_project_id: vercelProject.id,
            vercel_project_name: vercelProject.name,
          })
          .eq('id', projectId)
      } catch (error: any) {
        console.error('Error creating Vercel project:', error)
        return { error: `Failed to create Vercel project: ${error.message}` }
      }
    }

    // Create deployment
    try {
      const deployment = await vercelClient.createDeployment({
        name: project.vercel_project_name || project.name.toLowerCase().replace(/\s+/g, '-'),
        files: deploymentFiles,
        projectSettings: {
          framework: 'nextjs',
          buildCommand: 'next build',
          outputDirectory: '.next',
          installCommand: 'npm install',
        },
        target: 'production',
      })

      // Store deployment in database
      const { data: deploymentData, error: deploymentError } = await supabase
        .from('vercel_deployments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          vercel_deployment_id: deployment.id,
          vercel_project_id: vercelProjectId,
          url: `https://${deployment.url}`,
          status: deployment.state,
        })
        .select()
        .single()

      if (deploymentError) {
        console.error('Error storing deployment:', deploymentError)
        return { error: 'Deployment created but failed to store in database' }
      }

      // Update project deployment URL
      await supabase
        .from('projects')
        .update({ deployment_url: `https://${deployment.url}` })
        .eq('id', projectId)

      revalidatePath(`/workspace/${projectId}`)
      return {
        success: true,
        data: {
          id: deploymentData.id,
          url: `https://${deployment.url}`,
          vercelUrl: `https://vercel.com/${tokenData.team_id || user.id}/${project.vercel_project_name}`,
        },
      }
    } catch (error: any) {
      console.error('Error creating deployment:', error)
      return { error: `Failed to deploy: ${error.message}` }
    }
  } catch (error) {
    console.error('Error in deployToVercel:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getDeployments(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  try {
    const { data, error } = await supabase
      .from('vercel_deployments')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching deployments:', error)
      return { error: 'Failed to fetch deployments', data: [] }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error in getDeployments:', error)
    return { error: 'An unexpected error occurred', data: [] }
  }
}

export async function checkDeploymentStatus(deploymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get deployment from database
    const { data: deployment } = await supabase
      .from('vercel_deployments')
      .select('*')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single()

    if (!deployment) {
      return { error: 'Deployment not found' }
    }

    // Get Vercel token
    const { data: tokenData } = await supabase
      .from('vercel_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!tokenData) {
      return { error: 'Vercel not connected' }
    }

    // Check status on Vercel
    const vercelClient = new VercelClient(tokenData.access_token, tokenData.team_id)
    const vercelDeployment = await vercelClient.getDeployment(deployment.vercel_deployment_id)

    // Update status in database if changed
    if (vercelDeployment.state !== deployment.status) {
      await supabase
        .from('vercel_deployments')
        .update({
          status: vercelDeployment.state,
          ready_at: vercelDeployment.ready ? new Date(vercelDeployment.ready).toISOString() : null,
        })
        .eq('id', deploymentId)

      revalidatePath(`/workspace/${deployment.project_id}`)
    }

    return {
      data: {
        id: deployment.id,
        status: vercelDeployment.state,
        url: deployment.url,
        ready_at: vercelDeployment.ready ? new Date(vercelDeployment.ready).toISOString() : null,
      },
    }
  } catch (error: any) {
    console.error('Error checking deployment status:', error)
    return { error: `Failed to check status: ${error.message}` }
  }
}

export async function cancelDeployment(deploymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get deployment from database
    const { data: deployment } = await supabase
      .from('vercel_deployments')
      .select('*')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single()

    if (!deployment) {
      return { error: 'Deployment not found' }
    }

    // Only allow canceling if deployment is in progress
    if (deployment.status !== 'BUILDING' && deployment.status !== 'QUEUED') {
      return { error: 'Can only cancel deployments that are building or queued' }
    }

    // Get Vercel token
    const { data: tokenData } = await supabase
      .from('vercel_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!tokenData) {
      return { error: 'Vercel not connected' }
    }

    // Cancel deployment on Vercel
    const vercelClient = new VercelClient(tokenData.access_token, tokenData.team_id)
    await vercelClient.cancelDeployment(deployment.vercel_deployment_id)

    // Update status in database
    await supabase
      .from('vercel_deployments')
      .update({ status: 'CANCELED' })
      .eq('id', deploymentId)

    revalidatePath(`/workspace/${deployment.project_id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error canceling deployment:', error)
    return { error: `Failed to cancel deployment: ${error.message}` }
  }
}

export async function getDeploymentLogs(deploymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get deployment from database
    const { data: deployment } = await supabase
      .from('vercel_deployments')
      .select('*')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single()

    if (!deployment) {
      return { error: 'Deployment not found' }
    }

    // Get Vercel token
    const { data: tokenData } = await supabase
      .from('vercel_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!tokenData) {
      return { error: 'Vercel not connected' }
    }

    // Get logs from Vercel
    const vercelClient = new VercelClient(tokenData.access_token, tokenData.team_id)
    const logs = await vercelClient.getDeploymentLogs(deployment.vercel_deployment_id)

    return { data: logs }
  } catch (error: any) {
    console.error('Error fetching deployment logs:', error)
    return { error: `Failed to fetch logs: ${error.message}` }
  }
}
