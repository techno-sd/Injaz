-- ============================================================================
-- INJAZ.AI - Complete Database Schema Migration
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up all tables, functions, and policies.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('website', 'webapp', 'mobile');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_mode AS ENUM ('auto', 'controller', 'codegen');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PART 1: CREATE ALL TABLES (without RLS policies)
-- ============================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);

-- 3. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- 4. TEAM INVITATIONS
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, email)
);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);

-- 5. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  template TEXT DEFAULT 'blank',
  platform platform_type DEFAULT 'webapp',
  preview_url TEXT,
  deployment_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  github_repo_url TEXT,
  github_branch TEXT DEFAULT 'main',
  github_connected BOOLEAN DEFAULT FALSE,
  github_last_sync TIMESTAMPTZ,
  vercel_project_id TEXT,
  vercel_project_name TEXT,
  app_schema JSONB,
  schema_version INTEGER DEFAULT 1,
  last_schema_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_platform ON public.projects(platform);

-- 6. FILES
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT DEFAULT '',
  language TEXT DEFAULT 'typescript',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, path)
);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);

-- 7. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);

-- 8. DEPLOYMENTS
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error', 'canceled')),
  url TEXT,
  logs TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);

-- 9. GITHUB TOKENS
CREATE TABLE IF NOT EXISTS public.github_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  github_user_id BIGINT,
  github_username TEXT,
  github_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_github_tokens_user_id ON public.github_tokens(user_id);

-- 10. VERCEL TOKENS
CREATE TABLE IF NOT EXISTS public.vercel_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_vercel_tokens_user_id ON public.vercel_tokens(user_id);

-- 11. VERCEL DEPLOYMENTS
CREATE TABLE IF NOT EXISTS public.vercel_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vercel_deployment_id TEXT,
  vercel_project_id TEXT,
  url TEXT,
  status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELED')),
  alias_url TEXT,
  build_logs TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ready_at TIMESTAMPTZ,
  UNIQUE(vercel_deployment_id)
);
CREATE INDEX IF NOT EXISTS idx_vercel_deployments_project_id ON public.vercel_deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_vercel_deployments_user_id ON public.vercel_deployments(user_id);

-- 12. TEMPLATE STATS
CREATE TABLE IF NOT EXISTS public.template_stats (
  template_id TEXT PRIMARY KEY,
  usage_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TEMPLATE USAGE
CREATE TABLE IF NOT EXISTS public.template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON public.template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template_id ON public.template_usage(template_id);

-- 14. TEMPLATE FAVORITES
CREATE TABLE IF NOT EXISTS public.template_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);
CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON public.template_favorites(user_id);

-- 15. PROJECT SESSIONS
CREATE TABLE IF NOT EXISTS public.project_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cursor_position JSONB DEFAULT '{"line": 1, "column": 1}',
  active_file_path TEXT,
  cursor_color TEXT DEFAULT '#3B82F6',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON public.project_sessions(project_id);

-- 16. FILE LOCKS
CREATE TABLE IF NOT EXISTS public.file_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  UNIQUE(file_id)
);
CREATE INDEX IF NOT EXISTS idx_locks_project ON public.file_locks(project_id);

-- 17. PRICING PLANS
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly_cents INTEGER DEFAULT 0,
  price_yearly_cents INTEGER DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (id, name, description, price_monthly_cents, price_yearly_cents, features, limits, display_order)
VALUES
  ('free', 'Free', 'Perfect for getting started', 0, 0,
    '["3 projects", "50 AI requests/month", "100MB storage", "Community support"]'::jsonb,
    '{"projects": 3, "ai_requests": 50, "storage_mb": 100, "deployments": 10, "team_members": 1}'::jsonb, 1),
  ('pro', 'Pro', 'For professional developers', 1900, 19000,
    '["Unlimited projects", "1000 AI requests/month", "10GB storage", "5 team members", "Priority support"]'::jsonb,
    '{"projects": -1, "ai_requests": 1000, "storage_mb": 10240, "deployments": 100, "team_members": 5}'::jsonb, 2),
  ('team', 'Team', 'For growing teams', 4900, 49000,
    '["Everything in Pro", "5000 AI requests/month", "50GB storage", "Unlimited team members"]'::jsonb,
    '{"projects": -1, "ai_requests": 5000, "storage_mb": 51200, "deployments": -1, "team_members": -1}'::jsonb, 3)
ON CONFLICT (id) DO NOTHING;

-- 18. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free' REFERENCES public.pricing_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 19. BILLING HISTORY
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'paid' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  description TEXT,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_user ON public.billing_history(user_id);

-- 20. USER QUOTAS
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free',
  ai_requests_limit INTEGER DEFAULT 50,
  storage_limit_mb INTEGER DEFAULT 100,
  projects_limit INTEGER DEFAULT 3,
  deployments_limit INTEGER DEFAULT 10,
  team_members_limit INTEGER DEFAULT 1,
  ai_requests_used INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  deployments_used INTEGER DEFAULT 0,
  usage_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_quotas_user ON public.user_quotas(user_id);

-- 21. USAGE EVENTS
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON public.usage_events(user_id);

-- 22. GENERATION HISTORY
CREATE TABLE IF NOT EXISTS public.generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  mode ai_mode DEFAULT 'auto',
  input_prompt TEXT,
  controller_output JSONB,
  codegen_output JSONB,
  files_generated TEXT[] DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generation_history_project_id ON public.generation_history(project_id);

-- 23. SCHEMA SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.schema_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  schema JSONB NOT NULL,
  version INTEGER NOT NULL,
  change_description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_schema_snapshots_project_id ON public.schema_snapshots(project_id);

-- ============================================================================
-- PART 2: FUNCTIONS & TRIGGERS
-- ============================================================================

-- User profile auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Team slug generator
CREATE OR REPLACE FUNCTION public.generate_team_slug(team_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(team_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.teams WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Auto-add team owner as member
CREATE OR REPLACE FUNCTION public.add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id)
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.add_team_owner_as_member();

-- Template stats updates
CREATE OR REPLACE FUNCTION public.update_template_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.template_stats (template_id, usage_count, last_used_at, updated_at)
  VALUES (NEW.template_id, 1, NOW(), NOW())
  ON CONFLICT (template_id) DO UPDATE SET
    usage_count = template_stats.usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_used ON public.template_usage;
CREATE TRIGGER on_template_used
  AFTER INSERT ON public.template_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_template_usage_stats();

CREATE OR REPLACE FUNCTION public.update_template_favorite_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.template_stats (template_id, favorite_count, updated_at)
    VALUES (NEW.template_id, 1, NOW())
    ON CONFLICT (template_id) DO UPDATE SET
      favorite_count = template_stats.favorite_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.template_stats
    SET favorite_count = GREATEST(0, favorite_count - 1), updated_at = NOW()
    WHERE template_id = OLD.template_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_template_favorited ON public.template_favorites;
CREATE TRIGGER on_template_favorited
  AFTER INSERT OR DELETE ON public.template_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_template_favorite_stats();

-- User quota auto-creation
CREATE OR REPLACE FUNCTION public.create_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_quotas (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_quota ON public.users;
CREATE TRIGGER on_user_created_quota
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_quota();

-- AI request increment
CREATE OR REPLACE FUNCTION public.increment_ai_requests(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_used INTEGER;
  current_limit INTEGER;
BEGIN
  SELECT ai_requests_used, ai_requests_limit INTO current_used, current_limit
  FROM public.user_quotas WHERE user_id = p_user_id;
  IF current_limit = -1 OR current_used < current_limit THEN
    UPDATE public.user_quotas SET ai_requests_used = ai_requests_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schema snapshot on update
CREATE OR REPLACE FUNCTION public.save_schema_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.app_schema IS DISTINCT FROM OLD.app_schema AND NEW.app_schema IS NOT NULL THEN
    INSERT INTO public.schema_snapshots (project_id, schema, version, created_by)
    VALUES (NEW.id, NEW.app_schema, COALESCE(NEW.schema_version, 1), NEW.user_id);
    NEW.schema_version := COALESCE(OLD.schema_version, 0) + 1;
    NEW.last_schema_update := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_schema_update ON public.projects;
CREATE TRIGGER on_project_schema_update
  BEFORE UPDATE OF app_schema ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.save_schema_snapshot();

-- Latest deployment function
CREATE OR REPLACE FUNCTION public.get_latest_deployment(p_project_id UUID)
RETURNS public.vercel_deployments AS $$
  SELECT * FROM public.vercel_deployments
  WHERE project_id = p_project_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vercel_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vercel_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (ignore errors)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
  DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
  DROP POLICY IF EXISTS "Team owners can update their teams" ON public.teams;
  DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
  DROP POLICY IF EXISTS "Team owners can delete their teams" ON public.teams;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- USERS policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- TEAMS policies
CREATE POLICY "Team members can view their teams" ON public.teams FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()
  ));
CREATE POLICY "Team owners can update their teams" ON public.teams FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Team owners can delete their teams" ON public.teams FOR DELETE USING (owner_id = auth.uid());

-- TEAM MEMBERS policies
CREATE POLICY "Team members can view their team members" ON public.team_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()));
CREATE POLICY "Team admins can manage members" ON public.team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));

-- TEAM INVITATIONS policies
CREATE POLICY "Team admins can manage invitations" ON public.team_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_invitations.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "Users can view invitations sent to their email" ON public.team_invitations FOR SELECT
  USING (email = (SELECT email FROM public.users WHERE id = auth.uid()));

-- PROJECTS policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE OR (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.team_members WHERE team_members.team_id = projects.team_id AND team_members.user_id = auth.uid()
  )));
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE
  USING (user_id = auth.uid() OR (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.team_members WHERE team_members.team_id = projects.team_id AND team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'admin', 'editor')
  )));
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (user_id = auth.uid());

-- FILES policies
CREATE POLICY "Users can view files in their projects" ON public.files FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND (projects.user_id = auth.uid() OR projects.is_public = TRUE)));
CREATE POLICY "Users can manage files in their projects" ON public.files FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = files.project_id AND projects.user_id = auth.uid()));

-- MESSAGES policies
CREATE POLICY "Users can view messages in their projects" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = messages.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create messages in their projects" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = messages.project_id AND projects.user_id = auth.uid()));

-- DEPLOYMENTS policies
CREATE POLICY "Users can view deployments in their projects" ON public.deployments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = deployments.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create deployments in their projects" ON public.deployments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = deployments.project_id AND projects.user_id = auth.uid()));

-- GITHUB TOKENS policies
CREATE POLICY "Users can view their own GitHub tokens" ON public.github_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own GitHub tokens" ON public.github_tokens FOR ALL USING (user_id = auth.uid());

-- VERCEL TOKENS policies
CREATE POLICY "Users can view their own Vercel tokens" ON public.vercel_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own Vercel tokens" ON public.vercel_tokens FOR ALL USING (user_id = auth.uid());

-- VERCEL DEPLOYMENTS policies
CREATE POLICY "Users can view their project deployments" ON public.vercel_deployments FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects WHERE projects.id = vercel_deployments.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create deployments for their projects" ON public.vercel_deployments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their deployments" ON public.vercel_deployments FOR UPDATE USING (user_id = auth.uid());

-- TEMPLATE policies
CREATE POLICY "Anyone can view template stats" ON public.template_stats FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can view their template usage" ON public.template_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can record template usage" ON public.template_usage FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their favorites" ON public.template_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their favorites" ON public.template_favorites FOR ALL USING (user_id = auth.uid());

-- PROJECT SESSIONS policies
CREATE POLICY "Users can view sessions in their projects" ON public.project_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_sessions.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can manage their own sessions" ON public.project_sessions FOR ALL USING (user_id = auth.uid());

-- FILE LOCKS policies
CREATE POLICY "Users can view locks in their projects" ON public.file_locks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = file_locks.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can manage their own locks" ON public.file_locks FOR ALL USING (user_id = auth.uid());

-- PRICING PLANS policies
CREATE POLICY "Anyone can view active pricing plans" ON public.pricing_plans FOR SELECT USING (is_active = TRUE);

-- SUBSCRIPTIONS policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own subscription" ON public.subscriptions FOR ALL USING (user_id = auth.uid());

-- BILLING HISTORY policies
CREATE POLICY "Users can view their billing history" ON public.billing_history FOR SELECT USING (user_id = auth.uid());

-- USER QUOTAS policies
CREATE POLICY "Users can view their own quotas" ON public.user_quotas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own quotas" ON public.user_quotas FOR UPDATE USING (user_id = auth.uid());

-- USAGE EVENTS policies
CREATE POLICY "Users can view their own usage events" ON public.usage_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create usage events" ON public.usage_events FOR INSERT WITH CHECK (user_id = auth.uid());

-- GENERATION HISTORY policies
CREATE POLICY "Users can view generation history in their projects" ON public.generation_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = generation_history.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create generation history in their projects" ON public.generation_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = generation_history.project_id AND projects.user_id = auth.uid()));

-- SCHEMA SNAPSHOTS policies
CREATE POLICY "Users can view schema snapshots in their projects" ON public.schema_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = schema_snapshots.project_id AND projects.user_id = auth.uid()));

-- ============================================================================
-- PART 4: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- DONE: 23 tables, functions, triggers, and RLS policies created
-- ============================================================================
