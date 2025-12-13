-- COMPLETE CLEANUP SCRIPT
-- Run this in Supabase SQL Editor to delete ALL demo projects and files
-- This will completely reset the demo account

-- ============================================
-- STEP 1: Delete all files for demo user
-- ============================================
DELETE FROM files
WHERE project_id IN (
  SELECT id FROM projects
  WHERE user_id = (
    SELECT id FROM auth.users
    WHERE email = 'demo@ieditor.dev'
  )
);

-- ============================================
-- STEP 2: Delete all messages for demo user
-- ============================================
DELETE FROM messages
WHERE project_id IN (
  SELECT id FROM projects
  WHERE user_id = (
    SELECT id FROM auth.users
    WHERE email = 'demo@ieditor.dev'
  )
);

-- ============================================
-- STEP 3: Delete all projects for demo user
-- ============================================
DELETE FROM projects
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'demo@ieditor.dev'
);

-- ============================================
-- VERIFICATION: Check that everything is deleted
-- ============================================
SELECT
  'VERIFICATION RESULTS' as status,
  (SELECT COUNT(*) FROM projects WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
  )) as remaining_projects,
  (SELECT COUNT(*) FROM files WHERE project_id IN (
    SELECT id FROM projects WHERE user_id = (
      SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
    )
  )) as remaining_files,
  (SELECT COUNT(*) FROM messages WHERE project_id IN (
    SELECT id FROM projects WHERE user_id = (
      SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
    )
  )) as remaining_messages;

-- Expected result:
-- remaining_projects = 0
-- remaining_files = 0
-- remaining_messages = 0

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If all counts are 0, the cleanup was successful!
-- Now you can:
-- 1. Log out from demo account
-- 2. Go to homepage: http://localhost:3002
-- 3. Click "Try Demo" button
-- 4. New Vite projects will be created automatically
