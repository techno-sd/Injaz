/**
 * Vercel API Client
 * Handles all interactions with Vercel's REST API
 */

const VERCEL_API_URL = 'https://api.vercel.com'

export interface VercelUser {
  id: string
  username: string
  email: string
  name: string
  avatar: string
}

export interface VercelTeam {
  id: string
  slug: string
  name: string
}

export interface VercelProject {
  id: string
  name: string
  framework: string | null
  link: {
    type: string
    repo: string
  } | null
  createdAt: number
  updatedAt: number
}

export interface VercelDeployment {
  id: string
  url: string
  name: string
  state: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  type: string
  createdAt: number
  ready: number | null
  alias: string[]
  aliasAssigned: boolean
  meta: Record<string, string>
}

export interface CreateDeploymentParams {
  name: string
  files: Array<{
    file: string
    data: string
  }>
  projectSettings?: {
    framework?: string
    buildCommand?: string
    outputDirectory?: string
    installCommand?: string
  }
  target?: 'production' | 'preview'
}

export class VercelClient {
  private accessToken: string
  private teamId?: string

  constructor(accessToken: string, teamId?: string) {
    this.accessToken = accessToken
    this.teamId = teamId
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  private getUrl(path: string) {
    const url = new URL(path, VERCEL_API_URL)
    if (this.teamId) {
      url.searchParams.set('teamId', this.teamId)
    }
    return url.toString()
  }

  async getUser(): Promise<VercelUser> {
    const response = await fetch(this.getUrl('/v2/user'), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`)
    }

    const data = await response.json()
    return data.user
  }

  async listTeams(): Promise<VercelTeam[]> {
    const response = await fetch(this.getUrl('/v2/teams'), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to list teams: ${response.statusText}`)
    }

    const data = await response.json()
    return data.teams || []
  }

  async listProjects(): Promise<VercelProject[]> {
    const response = await fetch(this.getUrl('/v9/projects'), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to list projects: ${response.statusText}`)
    }

    const data = await response.json()
    return data.projects || []
  }

  async getProject(projectId: string): Promise<VercelProject> {
    const response = await fetch(this.getUrl(`/v9/projects/${projectId}`), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    return await response.json()
  }

  async createProject(name: string, framework?: string): Promise<VercelProject> {
    const response = await fetch(this.getUrl('/v9/projects'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        framework: framework || null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create project')
    }

    return await response.json()
  }

  async createDeployment(params: CreateDeploymentParams): Promise<VercelDeployment> {
    const response = await fetch(this.getUrl('/v13/deployments'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name: params.name,
        files: params.files,
        projectSettings: params.projectSettings,
        target: params.target || 'production',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create deployment')
    }

    return await response.json()
  }

  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const response = await fetch(this.getUrl(`/v13/deployments/${deploymentId}`), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch deployment: ${response.statusText}`)
    }

    return await response.json()
  }

  async listDeployments(projectId?: string): Promise<VercelDeployment[]> {
    const url = projectId
      ? this.getUrl(`/v6/deployments?projectId=${projectId}`)
      : this.getUrl('/v6/deployments')

    const response = await fetch(url, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to list deployments: ${response.statusText}`)
    }

    const data = await response.json()
    return data.deployments || []
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    const response = await fetch(this.getUrl(`/v12/deployments/${deploymentId}/cancel`), {
      method: 'PATCH',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel deployment: ${response.statusText}`)
    }
  }

  async deleteDeployment(deploymentId: string): Promise<void> {
    const response = await fetch(this.getUrl(`/v13/deployments/${deploymentId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete deployment: ${response.statusText}`)
    }
  }

  async assignAlias(deploymentId: string, alias: string): Promise<void> {
    const response = await fetch(this.getUrl(`/v2/deployments/${deploymentId}/aliases`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ alias }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to assign alias')
    }
  }

  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    const response = await fetch(this.getUrl(`/v2/deployments/${deploymentId}/events`), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch deployment logs: ${response.statusText}`)
    }

    const data = await response.json()
    // Vercel returns logs as events, extract the text from each event
    return data.map((event: any) => event.text || event.payload?.text || JSON.stringify(event))
  }
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  team_id?: string
}> {
  const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.VERCEL_CLIENT_ID!,
      client_secret: process.env.VERCEL_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/vercel/auth/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return await response.json()
}
