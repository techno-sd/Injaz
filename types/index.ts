import { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type File = Database['public']['Tables']['files']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Deployment = Database['public']['Tables']['deployments']['Row']

export type ProjectWithFiles = Project & {
  files: File[]
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
