# Demo Account Setup - Fixed Version

## ⚠️ IMPORTANT: Create Demo User First!

The demo user **MUST be created** via Supabase Auth Dashboard before running the SQL script.

---

## Quick Setup (3 Steps)

### Step 1: Create Demo User in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Users**
3. Click **"Add User"** (or "Invite user")
4. Fill in:
   - **Email**: `demo@ieditor.dev`
   - **Password**: `demo123456`
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create User"** or **"Send Invitation"**

**Screenshot reference:**
```
Authentication → Users → Add User
┌─────────────────────────────────┐
│ Email: demo@ieditor.dev        │
│ Password: demo123456            │
│ ☑ Auto Confirm User            │
│                                 │
│ [Create User]                   │
└─────────────────────────────────┘
```

### Step 2: Run Demo Setup SQL

1. Go to: **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Copy **entire contents** of: `supabase/migrations/20240102000000_demo_setup.sql`
4. Paste into SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`

The script will:
- ✅ Verify demo user exists (fails with clear error if not)
- ✅ Create user profile in `public.users`
- ✅ Delete any old demo projects
- ✅ Create 3 fresh sample projects
- ✅ Add sample files to each project
- ✅ Add AI welcome messages
- ✅ Show verification results

### Step 3: Verify Setup

The SQL will automatically show:
```
✅ Demo setup complete! | total_projects: 3

name              | template      | file_count | message_count
------------------|---------------|------------|---------------
My Landing Page   | landing-page  | 2          | 1
Dashboard App     | dashboard     | 2          | 1
Personal Blog     | blog          | 2          | 1
```

---

## Alternative: Automatic Setup (Recommended for Production)

Just use the **"Try Demo"** button in the app! It handles everything automatically:
- ✅ Creates demo user if needed
- ✅ Creates 3 sample projects
- ✅ Adds all files and messages
- ✅ Signs user in
- ✅ No SQL required!

---

## Demo Account Details

**Credentials:**
- Email: `demo@ieditor.dev`
- Password: `demo123456`

**Sample Projects Created:**

1. **My Landing Page** (landing-page template)
   - Modern landing page with gradient hero
   - Features grid with 3 cards
   - Responsive design

2. **Dashboard App** (dashboard template)
   - Analytics dashboard
   - 4 stat cards (Revenue, Users, Projects, Conversion)
   - Activity feed

3. **Personal Blog** (blog template)
   - Simple blog starter
   - Ready for customization

**Each project includes:**
- ✅ `package.json` with Next.js dependencies
- ✅ `app/page.tsx` with working React code
- ✅ AI welcome message in chat

---

## Troubleshooting

### Error: "Demo user does not exist"

**Solution:** Create the demo user in Supabase Dashboard first (see Step 1 above)

### Error: "ON CONFLICT specification"

**Solution:** Make sure you're running the FIXED version of the SQL (this file)

### Error: "permission denied"

**Solution:** Make sure you're running the SQL as a Supabase admin, not as a regular user

### Projects not showing in app

**Solution:**
1. Check RLS policies are set up (run main schema migration first)
2. Verify demo user ID matches in both `auth.users` and `public.users`
3. Run verification query:
   ```sql
   SELECT * FROM public.projects
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev');
   ```

---

## For Developers

### Re-running the Script

The script is **idempotent** - you can run it multiple times safely:
- Deletes old demo projects first
- Creates fresh projects every time
- Updates user profile if exists

### Manual Cleanup

To remove demo projects:
```sql
DELETE FROM public.projects
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev');
```

To remove demo user entirely:
```sql
-- Delete from public.users (cascades to projects, files, messages)
DELETE FROM public.users
WHERE email = 'demo@ieditor.dev';

-- Delete from auth.users (via Supabase Dashboard)
-- Authentication → Users → Find demo@ieditor.dev → Delete
```

---

## Production Deployment

For production, **DON'T run the SQL manually**. Instead:

1. Deploy the app with demo login code
2. Let users click "Try Demo" button
3. Demo account auto-creates on first use
4. Projects auto-regenerate if deleted

This ensures:
- ✅ Consistent experience
- ✅ No manual maintenance
- ✅ Always fresh demo data

---

## Testing the Demo

### Via App (Recommended)
1. Go to home page or login page
2. Click **"Try Demo"** button
3. Should redirect to dashboard with 3 projects
4. Open any project to explore

### Via Manual Login
1. Go to login page
2. Enter:
   - Email: `demo@ieditor.dev`
   - Password: `demo123456`
3. Should see 3 projects in dashboard

---

## Summary

**For Quick Setup:**
1. Create demo user in Supabase Dashboard (Authentication → Users → Add User)
2. Run `20240102000000_demo_setup.sql` in SQL Editor
3. Done! ✅

**For Production:**
- Just deploy the app
- Users click "Try Demo"
- Everything automatic! 🚀
