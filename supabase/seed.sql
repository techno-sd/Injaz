-- Seed file for initial demo data
-- Run this after the migration completes and after creating the auth user

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Create auth user in Supabase Dashboard → Authentication → Users → Add User
--    Email: techno-sd@hotmail.com
--    Password: Trootpwd@1989
--    Check "Auto Confirm User"
-- 2. Copy the user's UUID from the dashboard
-- 3. Replace 'REPLACE_WITH_AUTH_USER_UUID' below with the actual UUID
-- 4. Run this SQL in Supabase SQL Editor
-- ============================================================================

-- Set the admin user UUID here (get this from Supabase Auth after creating the user)
DO $$
DECLARE
  admin_user_id UUID := 'REPLACE_WITH_AUTH_USER_UUID';
BEGIN
  -- Only proceed if UUID has been set
  IF admin_user_id::text = 'REPLACE_WITH_AUTH_USER_UUID' THEN
    RAISE EXCEPTION 'Please replace REPLACE_WITH_AUTH_USER_UUID with the actual user UUID from Supabase Auth';
  END IF;

  -- Insert admin user profile
  INSERT INTO public.users (id, email, name, role, avatar_url, onboarding_completed, created_at, updated_at)
  VALUES (
    admin_user_id,
    'techno-sd@hotmail.com',
    'Admin',
    'admin',
    NULL,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    name = 'Admin',
    onboarding_completed = true,
    updated_at = NOW();

  -- Set up generous quotas for admin
  INSERT INTO public.user_quotas (user_id, plan_type, ai_requests_limit, ai_requests_used, storage_limit_mb, storage_used_mb, projects_limit, projects_used, deployments_limit, deployments_used, team_members_limit, created_at, updated_at)
  VALUES (
    admin_user_id,
    'pro',
    10000,
    0,
    10000,
    0,
    100,
    0,
    1000,
    0,
    50,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    ai_requests_limit = 10000,
    storage_limit_mb = 10000,
    projects_limit = 100,
    deployments_limit = 1000,
    team_members_limit = 50,
    updated_at = NOW();

  -- Create permanent Pro subscription for admin
  INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
  VALUES (
    admin_user_id,
    'pro',
    'active',
    NOW(),
    NOW() + INTERVAL '100 years',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = 'pro',
    status = 'active',
    current_period_end = NOW() + INTERVAL '100 years',
    updated_at = NOW();

  RAISE NOTICE 'Admin user setup complete for %', admin_user_id;
END $$;

-- ============================================================================
-- Demo Projects (Optional - creates sample projects for the admin user)
-- ============================================================================

-- Uncomment and run after setting up the admin user if you want demo projects
/*
DO $$
DECLARE
  admin_user_id UUID := 'REPLACE_WITH_AUTH_USER_UUID';
BEGIN
  -- Demo Website Project
  INSERT INTO public.projects (id, name, description, platform, user_id, status, settings, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'My Portfolio',
    'Personal portfolio website showcasing my work',
    'website',
    admin_user_id,
    'draft',
    '{"theme": "modern", "responsive": true}'::jsonb,
    NOW(),
    NOW()
  );

  -- Demo Webapp Project
  INSERT INTO public.projects (id, name, description, platform, user_id, status, settings, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Task Manager',
    'A productivity web application for managing tasks',
    'webapp',
    admin_user_id,
    'draft',
    '{"features": ["auth", "realtime"], "responsive": true}'::jsonb,
    NOW(),
    NOW()
  );

  -- Demo Mobile Project
  INSERT INTO public.projects (id, name, description, platform, user_id, status, settings, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Fitness Tracker',
    'Mobile app for tracking workouts and health goals',
    'mobile',
    admin_user_id,
    'draft',
    '{"platform": "react-native", "features": ["offline", "notifications"]}'::jsonb,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Demo projects created for admin user';
END $$;
*/
