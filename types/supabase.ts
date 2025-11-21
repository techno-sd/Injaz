export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          template: string
          preview_url: string | null
          deployment_url: string | null
          is_public: boolean
          vercel_project_id: string | null
          vercel_project_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          template?: string
          preview_url?: string | null
          deployment_url?: string | null
          is_public?: boolean
          vercel_project_id?: string | null
          vercel_project_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          template?: string
          preview_url?: string | null
          deployment_url?: string | null
          is_public?: boolean
          vercel_project_id?: string | null
          vercel_project_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          project_id: string
          path: string
          content: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          path: string
          content?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          path?: string
          content?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
      deployments: {
        Row: {
          id: string
          project_id: string
          status: 'pending' | 'building' | 'ready' | 'error' | 'canceled'
          url: string | null
          logs: string | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          status: 'pending' | 'building' | 'ready' | 'error' | 'canceled'
          url?: string | null
          logs?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          status?: 'pending' | 'building' | 'ready' | 'error' | 'canceled'
          url?: string | null
          logs?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      template_usage: {
        Row: {
          id: string
          user_id: string
          template_id: string
          project_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          project_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          project_id?: string | null
          created_at?: string
        }
      }
      template_favorites: {
        Row: {
          id: string
          user_id: string
          template_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          created_at?: string
        }
      }
      template_stats: {
        Row: {
          template_id: string
          usage_count: number
          favorite_count: number
          last_used_at: string | null
          updated_at: string
        }
        Insert: {
          template_id: string
          usage_count?: number
          favorite_count?: number
          last_used_at?: string | null
          updated_at?: string
        }
        Update: {
          template_id?: string
          usage_count?: number
          favorite_count?: number
          last_used_at?: string | null
          updated_at?: string
        }
      }
      vercel_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          team_id: string | null
          team_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          team_id?: string | null
          team_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          team_id?: string | null
          team_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vercel_deployments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          vercel_deployment_id: string
          vercel_project_id: string | null
          url: string
          status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
          alias_url: string | null
          build_logs: string | null
          error_message: string | null
          created_at: string
          ready_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          vercel_deployment_id: string
          vercel_project_id?: string | null
          url: string
          status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
          alias_url?: string | null
          build_logs?: string | null
          error_message?: string | null
          created_at?: string
          ready_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          vercel_deployment_id?: string
          vercel_project_id?: string | null
          url?: string
          status?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
          alias_url?: string | null
          build_logs?: string | null
          error_message?: string | null
          created_at?: string
          ready_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
