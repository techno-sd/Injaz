/**
 * GitHub API Client
 * Handles all GitHub API interactions for repository syncing
 */

const GITHUB_API_BASE = 'https://api.github.com'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  private: boolean
  default_branch: string
  language: string | null
  stargazers_count: number
  updated_at: string
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export class GitHubClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get authenticated user information
   */
  async getUser(): Promise<GitHubUser> {
    return this.fetch('/user')
  }

  /**
   * List user's repositories
   */
  async listRepos(options: {
    type?: 'all' | 'owner' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}): Promise<GitHubRepo[]> {
    const params = new URLSearchParams({
      type: options.type || 'owner',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: String(options.per_page || 100),
      page: String(options.page || 1),
    })

    return this.fetch(`/user/repos?${params}`)
  }

  /**
   * Get repository details
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetch(`/repos/${owner}/${repo}`)
  }

  /**
   * List repository branches
   */
  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.fetch(`/repos/${owner}/${repo}/branches`)
  }

  /**
   * Get repository contents
   */
  async getContents(owner: string, repo: string, path: string = '', ref?: string) {
    const params = ref ? `?ref=${ref}` : ''
    return this.fetch(`/repos/${owner}/${repo}/contents/${path}${params}`)
  }

  /**
   * Create or update file contents
   */
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ) {
    return this.fetch(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      }),
    })
  }

  /**
   * Delete a file
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ) {
    return this.fetch(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message,
        sha,
        branch,
      }),
    })
  }

  /**
   * Create a new repository
   */
  async createRepo(name: string, description?: string, isPrivate: boolean = true) {
    return this.fetch('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    })
  }

  /**
   * Get latest commit on a branch
   */
  async getLatestCommit(owner: string, repo: string, branch: string) {
    return this.fetch(`/repos/${owner}/${repo}/commits/${branch}`)
  }

  /**
   * Compare two commits
   */
  async compareCommits(owner: string, repo: string, base: string, head: string) {
    return this.fetch(`/repos/${owner}/${repo}/compare/${base}...${head}`)
  }
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || 'Failed to exchange code for token')
  }

  return data.access_token
}
