import { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']
export type Project = Database['public']['Tables']['projects']['Row'] & {
  github_repo_url?: string | null
  github_branch?: string | null
  github_connected?: boolean | null
  github_last_sync?: string | null
}
export type File = Database['public']['Tables']['files']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Deployment = Database['public']['Tables']['deployments']['Row']

export type ProjectWithFiles = Project & {
  files: File[]
}

export interface GitHubToken {
  id: string
  user_id: string
  access_token: string
  github_user_id: number
  github_username: string
  github_avatar?: string | null
  created_at: string
  updated_at: string
}

export type AIAction =
  | {
      type: 'create_or_update_file'
      path: string
      content: string
    }
  | {
      type: 'delete_file'
      path: string
    }
  | {
      type: 'modify_config'
      config: string
      changes: Record<string, any>
    }

export interface AIResponse {
  actions: AIAction[]
  messages: string[]
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}
