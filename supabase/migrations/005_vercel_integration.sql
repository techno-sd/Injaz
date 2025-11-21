-- Vercel Integration
-- Stores Vercel access tokens and team information for users

CREATE TABLE public.vercel_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Vercel Deployments
-- Enhanced deployments table specifically for Vercel deployments
CREATE TABLE public.vercel_deployments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vercel_deployment_id TEXT NOT NULL,
  vercel_project_id TEXT,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELED')),
  alias_url TEXT,
  build_logs TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ready_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(vercel_deployment_id)
);

-- Add Vercel-specific columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vercel_project_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vercel_project_name TEXT;

-- Create indexes for better performance
CREATE INDEX idx_vercel_tokens_user_id ON public.vercel_tokens(user_id);
CREATE INDEX idx_vercel_deployments_project_id ON public.vercel_deployments(project_id);
CREATE INDEX idx_vercel_deployments_user_id ON public.vercel_deployments(user_id);
CREATE INDEX idx_vercel_deployments_status ON public.vercel_deployments(status);
CREATE INDEX idx_vercel_deployments_created_at ON public.vercel_deployments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vercel_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vercel_deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vercel_tokens table
CREATE POLICY "Users can view own Vercel tokens"
  ON public.vercel_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Vercel tokens"
  ON public.vercel_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Vercel tokens"
  ON public.vercel_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Vercel tokens"
  ON public.vercel_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for vercel_deployments table
CREATE POLICY "Users can view own deployments"
  ON public.vercel_deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deployments"
  ON public.vercel_deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments"
  ON public.vercel_deployments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deployments"
  ON public.vercel_deployments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on vercel_tokens
CREATE TRIGGER on_vercel_tokens_updated
  BEFORE UPDATE ON public.vercel_tokens
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Function to get latest deployment for a project
CREATE OR REPLACE FUNCTION public.get_latest_deployment(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  vercel_deployment_id TEXT,
  url TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vd.id,
    vd.vercel_deployment_id,
    vd.url,
    vd.status,
    vd.created_at
  FROM public.vercel_deployments vd
  WHERE vd.project_id = p_project_id
  ORDER BY vd.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
