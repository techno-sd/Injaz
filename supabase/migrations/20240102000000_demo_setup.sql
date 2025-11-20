-- SQL script to set up demo projects for existing demo user
-- Prerequisites: Demo user must already exist in Supabase Auth
-- Either created via the "Try Demo" button or manually via Supabase Dashboard

-- IMPORTANT: This SQL creates the projects and files ONLY
-- The demo user (demo@ieditor.dev) must be created via:
-- 1. Supabase Dashboard → Authentication → Users → Add User
--    OR
-- 2. Clicking "Try Demo" button in the app (automatic)

-- Step 1: Verify demo user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@ieditor.dev') THEN
    RAISE EXCEPTION 'Demo user does not exist. Create user demo@ieditor.dev in Supabase Dashboard first.';
  END IF;
END $$;

-- Step 2: Create user profile if it doesn't exist
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  id,
  'demo@ieditor.dev',
  'Demo User',
  NULL
FROM auth.users
WHERE email = 'demo@ieditor.dev'
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name;

-- Step 3: Delete any existing demo projects (for clean slate)
DELETE FROM public.projects
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev');

-- Step 4: Create sample projects for demo user
WITH demo_user AS (
  SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev' LIMIT 1
),
project1 AS (
  INSERT INTO public.projects (user_id, name, description, template)
  SELECT
    id,
    'My Landing Page',
    'A beautiful landing page built with AI',
    'landing-page'
  FROM demo_user
  RETURNING id, name
),
project2 AS (
  INSERT INTO public.projects (user_id, name, description, template)
  SELECT
    id,
    'Dashboard App',
    'Analytics dashboard with charts',
    'dashboard'
  FROM demo_user
  RETURNING id, name
),
project3 AS (
  INSERT INTO public.projects (user_id, name, description, template)
  SELECT
    id,
    'Personal Blog',
    'A minimal blog for sharing ideas',
    'blog'
  FROM demo_user
  RETURNING id, name
),

-- Step 5: Insert files for Project 1 (Landing Page)
files1 AS (
  INSERT INTO public.files (project_id, path, content, language)
  SELECT
    p.id,
    'package.json',
    '{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}',
    'json'
  FROM project1 p
  UNION ALL
  SELECT
    p.id,
    'app/page.tsx',
    'export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your App
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Built with AI in minutes, not hours
        </p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Optimized for speed and performance</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
            <p className="text-gray-600">Modern and responsive layouts</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Easy to Deploy</h3>
            <p className="text-gray-600">One-click deployment ready</p>
          </div>
        </div>
      </section>
    </main>
  )
}',
    'typescript'
  FROM project1 p
  RETURNING project_id
),

-- Insert files for Project 2 (Dashboard)
files2 AS (
  INSERT INTO public.files (project_id, path, content, language)
  SELECT
    p.id,
    'package.json',
    '{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}',
    'json'
  FROM project2 p
  UNION ALL
  SELECT
    p.id,
    'app/page.tsx',
    'export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">$45,231</p>
            <p className="text-green-500 text-sm mt-2">+20.1%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Active Users</p>
            <p className="text-3xl font-bold mt-2">2,345</p>
            <p className="text-green-500 text-sm mt-2">+15.3%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Projects</p>
            <p className="text-3xl font-bold mt-2">89</p>
            <p className="text-blue-500 text-sm mt-2">+5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Conversion</p>
            <p className="text-3xl font-bold mt-2">3.2%</p>
            <p className="text-green-500 text-sm mt-2">+0.8%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">New user signup</p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
              <span className="text-green-500 text-sm">+1 user</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Project deployed</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
              <span className="text-blue-500 text-sm">Deploy</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}',
    'typescript'
  FROM project2 p
  RETURNING project_id
),

-- Insert files for Project 3 (Blog)
files3 AS (
  INSERT INTO public.files (project_id, path, content, language)
  SELECT
    p.id,
    'package.json',
    '{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}',
    'json'
  FROM project3 p
  UNION ALL
  SELECT
    p.id,
    'app/page.tsx',
    'export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome!</h1>
      <p className="mt-4 text-lg text-gray-600">
        Start building with AI
      </p>
    </main>
  )
}',
    'typescript'
  FROM project3 p
  RETURNING project_id
)

-- Step 6: Insert welcome messages for each project
INSERT INTO public.messages (project_id, role, content)
SELECT id, 'assistant', 'Hi! I''ve created your My Landing Page. Feel free to customize it by chatting with me!'
FROM project1
UNION ALL
SELECT id, 'assistant', 'Hi! I''ve created your Dashboard App. Feel free to customize it by chatting with me!'
FROM project2
UNION ALL
SELECT id, 'assistant', 'Hi! I''ve created your Personal Blog. Feel free to customize it by chatting with me!'
FROM project3;

-- Step 7: Verify the setup
SELECT
  '✅ Demo setup complete!' as status,
  COUNT(*) as total_projects
FROM public.projects
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev');

-- Show created projects
SELECT
  p.name,
  p.template,
  COUNT(f.id) as file_count,
  COUNT(m.id) as message_count
FROM public.projects p
LEFT JOIN public.files f ON f.project_id = p.id
LEFT JOIN public.messages m ON m.project_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev')
GROUP BY p.id, p.name, p.template
ORDER BY p.created_at;
