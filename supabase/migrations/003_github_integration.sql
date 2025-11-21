-- GitHub Integration Tables
-- Run this migration in your Supabase dashboard

-- Create github_tokens table to store user GitHub OAuth tokens
CREATE TABLE IF NOT EXISTS github_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  github_user_id BIGINT NOT NULL,
  github_username TEXT NOT NULL,
  github_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_github_tokens_user_id ON github_tokens(user_id);

-- Enable Row Level Security
ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only access their own tokens
CREATE POLICY "Users can access their own GitHub tokens"
  ON github_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Add GitHub-related columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
  ADD COLUMN IF NOT EXISTS github_branch TEXT DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS github_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS github_last_sync TIMESTAMP WITH TIME ZONE;

-- Create index for GitHub-connected projects
CREATE INDEX idx_projects_github_connected ON projects(github_connected) WHERE github_connected = TRUE;

-- Comments for documentation
COMMENT ON TABLE github_tokens IS 'Stores GitHub OAuth access tokens for users';
COMMENT ON COLUMN github_tokens.access_token IS 'Encrypted GitHub personal access token';
COMMENT ON COLUMN projects.github_repo_url IS 'Full GitHub repository URL (e.g., https://github.com/user/repo)';
COMMENT ON COLUMN projects.github_branch IS 'Default branch for syncing (e.g., main, master)';
COMMENT ON COLUMN projects.github_connected IS 'Whether project is connected to a GitHub repository';
COMMENT ON COLUMN projects.github_last_sync IS 'Timestamp of last successful sync with GitHub';
