import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all project files
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files to deploy' }, { status: 400 })
    }

    // Create deployment record
    const { data: deployment } = await supabase
      .from('deployments')
      .insert({
        project_id: projectId,
        status: 'pending',
      })
      .select()
      .single()

    if (!deployment) {
      return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 })
    }

    // In a real implementation, this would:
    // 1. Bundle the project files
    // 2. Create a deployment on Vercel
    // 3. Update the deployment status and URL
    // 4. Return the deployment URL

    // For now, we'll simulate a deployment
    setTimeout(async () => {
      await supabase
        .from('deployments')
        .update({
          status: 'ready',
          url: `https://${project.name.toLowerCase().replace(/\s+/g, '-')}-${projectId.slice(0, 8)}.vercel.app`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', deployment.id)
    }, 3000)

    return NextResponse.json({
      deploymentId: deployment.id,
      status: 'pending',
      message: 'Deployment started',
    })
  } catch (error) {
    console.error('Error in deploy API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const deploymentId = searchParams.get('deploymentId')

    if (!deploymentId) {
      return NextResponse.json({ error: 'Missing deploymentId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: deployment } = await supabase
      .from('deployments')
      .select('*, projects!inner(*)')
      .eq('id', deploymentId)
      .single()

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }

    return NextResponse.json(deployment)
  } catch (error) {
    console.error('Error fetching deployment:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
