-- Quick SQL to create demo user via Supabase Auth
-- Run this in Supabase SQL Editor to manually create the demo account

-- Create demo user in auth.users table
-- Note: This bypasses normal signup flow - use for testing only
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- or use specific UUID
  'authenticated',
  'authenticated',
  'demo@ieditor.dev',
  crypt('demo123456', gen_salt('bf')), -- Hashed password
  NOW(),
  '{"full_name": "Demo User"}'::jsonb,
  NOW(),
  NOW(),
  '',
  ''
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- Note: The above is for manual setup only.
-- In production, the demo login button automatically handles this!
