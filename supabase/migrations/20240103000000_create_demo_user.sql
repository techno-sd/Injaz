-- SQL script to create demo user in Supabase Auth
-- This must be run before the demo_setup migration

-- Create demo user in auth.users table
-- Note: In production, users are typically created via the Auth API
-- This is a direct database insert for testing/demo purposes

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change_token,
  phone_change,
  phone_change_sent_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@ieditor.dev',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  now(),
  '',
  '',
  now(),
  now(),
  '{}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo@ieditor.dev'
);
