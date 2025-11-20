# Demo Account Setup

## Automatic Setup (Recommended)

The demo account is **automatically created** when a user clicks the "Try Demo" button on the home page or login page. No manual setup required!

## Manual Setup (Optional)

If you want to manually set up the demo account in Supabase:

### Step 1: Create Demo User in Supabase Auth

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: `demo@ieditor.dev`
4. Password: `demo123456`
5. Click "Create User"
6. Copy the User ID

**Option B: Via SQL**
```sql
-- Run in Supabase SQL Editor
-- See: supabase/migrations/20240102000001_create_demo_user.sql
```

### Step 2: Create Demo Projects and Files

1. Open Supabase SQL Editor
2. Copy the SQL from: `supabase/migrations/20240102000000_demo_setup.sql`
3. Replace `'YOUR_DEMO_USER_ID'` with the actual demo user ID from Step 1
4. Run the SQL script

This will create:
- ✅ Demo user profile in `public.users`
- ✅ 3 sample projects (Landing Page, Dashboard, Blog)
- ✅ Sample files for each project
- ✅ AI welcome messages

### Step 3: Verify

Run this query to verify:
```sql
SELECT p.name, p.template, COUNT(f.id) as file_count
FROM public.projects p
LEFT JOIN public.files f ON f.project_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev')
GROUP BY p.id, p.name, p.template;
```

Expected output:
```
My Landing Page  | landing-page | 2
Dashboard App    | dashboard    | 2
Personal Blog    | blog         | 2
```

## Demo Account Details

**Credentials:**
- Email: `demo@ieditor.dev`
- Password: `demo123456` (only for manual setup)

**Sample Projects:**
1. **My Landing Page** (landing-page template)
   - Modern landing page with hero and features
   - Gradient text, CTA button

2. **Dashboard App** (dashboard template)
   - Analytics dashboard with stats cards
   - Revenue, users, projects metrics

3. **Personal Blog** (blog template)
   - Simple blog starter
   - Ready for customization

## How It Works

When a user clicks "Try Demo":
1. App checks if `demo@ieditor.dev` exists in Supabase Auth
2. If not, creates the account automatically
3. Creates 3 sample projects with files
4. Signs in the user
5. Redirects to dashboard

If demo user deletes projects, they're **automatically regenerated** on next login!

## For Development

Add these to your `.env.local`:
```env
# Demo account is auto-created, no special config needed
# Just ensure Supabase credentials are set
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## Testing Demo Login

1. Click "Try Demo" on home page
2. Should redirect to dashboard with 3 projects
3. Open any project to see sample code
4. Try chatting with AI to modify code

That's it! The demo is fully automated. 🚀
