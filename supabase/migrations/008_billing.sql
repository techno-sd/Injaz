-- Migration: Billing & Subscriptions
-- Description: Add tables for Stripe billing, subscriptions, and usage tracking

-- Pricing plans
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_yearly_cents INTEGER,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT REFERENCES public.pricing_plans(id) DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing history / invoices
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  description TEXT,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quotas for rate limiting
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'free',
  -- Limits
  ai_requests_limit INTEGER DEFAULT 50,
  storage_limit_mb INTEGER DEFAULT 100,
  projects_limit INTEGER DEFAULT 3,
  deployments_limit INTEGER DEFAULT 10,
  team_members_limit INTEGER DEFAULT 1,
  -- Usage (resets monthly)
  ai_requests_used INTEGER DEFAULT 0,
  storage_used_mb DECIMAL DEFAULT 0,
  deployments_used INTEGER DEFAULT 0,
  -- Reset tracking
  usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage events for analytics
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_user ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_created ON public.billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotas_user ON public.user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON public.usage_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON public.usage_events(event_type, created_at DESC);

-- RLS Policies
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Pricing plans are public
CREATE POLICY "Anyone can view active pricing plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true);

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can only view their own billing history
CREATE POLICY "Users can view own billing history" ON public.billing_history
  FOR SELECT USING (user_id = auth.uid());

-- Users can only view their own quotas
CREATE POLICY "Users can view own quotas" ON public.user_quotas
  FOR SELECT USING (user_id = auth.uid());

-- Users can only view their own usage events
CREATE POLICY "Users can view own usage events" ON public.usage_events
  FOR SELECT USING (user_id = auth.uid());

-- Insert default pricing plans
INSERT INTO public.pricing_plans (id, name, description, price_monthly_cents, price_yearly_cents, features, limits, display_order)
VALUES
  ('free', 'Free', 'Perfect for trying out iEditor', 0, 0,
   '["3 projects", "50 AI requests/month", "100MB storage", "Community support"]'::jsonb,
   '{"projects": 3, "ai_requests": 50, "storage_mb": 100, "deployments": 10, "team_members": 1}'::jsonb,
   1),
  ('pro', 'Pro', 'For professional developers', 1900, 19000,
   '["Unlimited projects", "1000 AI requests/month", "10GB storage", "Priority support", "Custom domains", "Team collaboration (5 members)"]'::jsonb,
   '{"projects": -1, "ai_requests": 1000, "storage_mb": 10240, "deployments": -1, "team_members": 5}'::jsonb,
   2),
  ('team', 'Team', 'For teams building together', 4900, 49000,
   '["Everything in Pro", "5000 AI requests/month", "50GB storage", "Dedicated support", "SSO/SAML", "Unlimited team members", "Advanced analytics"]'::jsonb,
   '{"projects": -1, "ai_requests": 5000, "storage_mb": 51200, "deployments": -1, "team_members": -1}'::jsonb,
   3)
ON CONFLICT (id) DO NOTHING;

-- Function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.user_quotas
  SET
    ai_requests_used = 0,
    deployments_used = 0,
    usage_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month',
    updated_at = NOW()
  WHERE usage_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment AI request count
CREATE OR REPLACE FUNCTION increment_ai_requests(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_used INTEGER;
  current_limit INTEGER;
BEGIN
  SELECT ai_requests_used, ai_requests_limit
  INTO current_used, current_limit
  FROM public.user_quotas
  WHERE user_id = p_user_id;

  IF current_used IS NULL THEN
    -- Create quota record if doesn't exist
    INSERT INTO public.user_quotas (user_id, ai_requests_used)
    VALUES (p_user_id, 1);
    RETURN TRUE;
  END IF;

  IF current_limit = -1 OR current_used < current_limit THEN
    UPDATE public.user_quotas
    SET ai_requests_used = ai_requests_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create quota record when user is created
CREATE OR REPLACE FUNCTION create_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_quotas (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_quota
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_quota();

-- Update timestamp trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotas_updated_at
  BEFORE UPDATE ON public.user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
