-- Template Usage Tracking
-- Tracks each time a user creates a project from a template
CREATE TABLE public.template_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Template Favorites
-- Allows users to bookmark/favorite templates for quick access
CREATE TABLE public.template_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, template_id)
);

-- Template Stats (materialized view for analytics)
-- Aggregates template usage data for displaying popular templates
CREATE TABLE public.template_stats (
  template_id TEXT PRIMARY KEY,
  usage_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_template_usage_user_id ON public.template_usage(user_id);
CREATE INDEX idx_template_usage_template_id ON public.template_usage(template_id);
CREATE INDEX idx_template_usage_created_at ON public.template_usage(created_at DESC);
CREATE INDEX idx_template_favorites_user_id ON public.template_favorites(user_id);
CREATE INDEX idx_template_favorites_template_id ON public.template_favorites(template_id);
CREATE INDEX idx_template_stats_usage_count ON public.template_stats(usage_count DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_usage table
CREATE POLICY "Users can view own template usage"
  ON public.template_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own template usage records"
  ON public.template_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for template_favorites table
CREATE POLICY "Users can view own favorites"
  ON public.template_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.template_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON public.template_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for template_stats table (read-only for all authenticated users)
CREATE POLICY "Anyone can view template stats"
  ON public.template_stats FOR SELECT
  TO authenticated
  USING (true);

-- Function to update template stats after template usage
CREATE OR REPLACE FUNCTION public.update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update template stats
  INSERT INTO public.template_stats (template_id, usage_count, last_used_at, updated_at)
  VALUES (NEW.template_id, 1, NEW.created_at, NOW())
  ON CONFLICT (template_id)
  DO UPDATE SET
    usage_count = template_stats.usage_count + 1,
    last_used_at = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when template is used
CREATE TRIGGER on_template_usage_created
  AFTER INSERT ON public.template_usage
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_template_stats();

-- Function to update favorite count in template stats
CREATE OR REPLACE FUNCTION public.update_template_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment favorite count
    INSERT INTO public.template_stats (template_id, favorite_count, updated_at)
    VALUES (NEW.template_id, 1, NOW())
    ON CONFLICT (template_id)
    DO UPDATE SET
      favorite_count = template_stats.favorite_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement favorite count
    UPDATE public.template_stats
    SET
      favorite_count = GREATEST(favorite_count - 1, 0),
      updated_at = NOW()
    WHERE template_id = OLD.template_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update favorite count
CREATE TRIGGER on_template_favorite_changed
  AFTER INSERT OR DELETE ON public.template_favorites
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_template_favorite_count();

-- Initialize stats for existing templates (optional - can be populated by app)
-- This creates empty records for known templates
INSERT INTO public.template_stats (template_id, usage_count, favorite_count)
VALUES
  ('landing-page', 0, 0),
  ('dashboard', 0, 0),
  ('blog', 0, 0),
  ('ecommerce', 0, 0),
  ('portfolio', 0, 0),
  ('saas', 0, 0),
  ('auth-pages', 0, 0),
  ('admin-panel', 0, 0),
  ('task-manager', 0, 0),
  ('docs-site', 0, 0)
ON CONFLICT (template_id) DO NOTHING;
