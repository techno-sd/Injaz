# Database Migration Guide

## Running Migrations Manually via Supabase Dashboard

Since the Supabase CLI is not installed, follow these steps to set up your database:

### Step 1: Run Main Schema Migration

1. Go to your Supabase Dashboard: https://bwpktuycjfszvbuzekel.supabase.co
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open the file: `supabase/migrations/20240101000000_initial_schema.sql`
5. Copy the **entire contents** of the file
6. Paste into the SQL Editor
7. Click **"Run"** or press `Ctrl+Enter`

**What this creates:**
- `public.users` table for user profiles
- `public.projects` table for user projects
- `public.files` table for project files
- `public.messages` table for AI chat history
- `public.deployments` table for deployment tracking
- Row Level Security (RLS) policies for all tables
- Triggers for automatic timestamp updates
- Function to auto-create user profiles on signup

### Step 2: Create Demo User (Optional)

If you want to set up the demo login feature:

1. In Supabase Dashboard, go to: **Authentication** → **Users**
2. Click **"Add User"** (or "Invite user")
3. Fill in:
   - **Email**: `demo@ieditor.dev`
   - **Password**: `demo123456`
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create User"** or **"Send Invitation"**

### Step 3: Run Demo Setup (Optional)

Only after creating the demo user:

1. Go back to: **SQL Editor**
2. Click **"New Query"**
3. Open the file: `supabase/migrations/20240102000000_demo_setup.sql`
4. Copy the **entire contents**
5. Paste into SQL Editor
6. Click **"Run"**

**What this creates:**
- Demo user profile in `public.users`
- 3 sample projects (Landing Page, Dashboard, Blog)
- Sample files for each project
- AI welcome messages

### Step 4: Verify Setup

After running the main schema migration, verify it worked:

```sql
-- Check that all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: deployments, files, messages, projects, users
```

After running the demo setup (if applicable):

```sql
-- Check demo projects
SELECT name, template, description
FROM public.projects
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev');

-- Should show 3 projects
```

### Troubleshooting

**Error: "relation already exists"**
- This means the migration was already run
- You can safely ignore this if tables already exist

**Error: "permission denied"**
- Make sure you're running as Supabase admin
- Check you're in the SQL Editor, not the Table Editor

**Error: "Demo user does not exist"** (for demo setup)
- Create the demo user first (see Step 2 above)
- Then run the demo setup SQL

### Alternative: Use Supabase CLI (Optional)

If you want to install the Supabase CLI for easier migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bwpktuycjfszvbuzekel

# Run all migrations
supabase db push
```

### Next Steps

After running migrations:

1. ✅ Database schema is set up
2. Add API keys to `.env.local`:
   - `SUPABASE_SERVICE_ROLE_KEY` (from Dashboard > Settings > API)
   - `OPENAI_API_KEY` (from OpenAI dashboard)
3. Start development server: `npm run dev`
4. Test the application at http://localhost:3000

---

## Need Help?

See detailed demo setup instructions in `docs/DEMO_SETUP.md`
