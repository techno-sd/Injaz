-- Migration: Collaboration Features
-- Description: Add tables for real-time collaboration, presence, and file locking

-- Project sessions for tracking active users
CREATE TABLE IF NOT EXISTS public.project_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  cursor_position JSONB DEFAULT '{"line": 1, "column": 1}'::jsonb,
  active_file_path TEXT,
  cursor_color TEXT DEFAULT '#3B82F6',
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- File locks for preventing conflicts
CREATE TABLE IF NOT EXISTS public.file_locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  UNIQUE(file_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_project ON public.project_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON public.project_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_locks_project ON public.file_locks(project_id);
CREATE INDEX IF NOT EXISTS idx_locks_expires ON public.file_locks(expires_at);

-- RLS Policies for project_sessions
ALTER TABLE public.project_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions in their projects" ON public.project_sessions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own sessions" ON public.project_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for file_locks
ALTER TABLE public.file_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view locks in their projects" ON public.file_locks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own locks" ON public.file_locks
  FOR ALL USING (user_id = auth.uid());

-- Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.file_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up stale sessions (inactive for more than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.project_sessions
  WHERE last_seen_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for sessions (for presence)
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_sessions;
