# Quick Reset - Delete All Old Projects

## 🚨 Simple 3-Step Process

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your iEditor project
3. Click "SQL Editor" in left sidebar
4. Click "New query"

### Step 2: Copy & Run This SQL

```sql
-- Delete all demo projects and files
DELETE FROM files WHERE project_id IN (
  SELECT id FROM projects WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
  )
);

DELETE FROM messages WHERE project_id IN (
  SELECT id FROM projects WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
  )
);

DELETE FROM projects WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@ieditor.dev'
);
```

**Click "Run" button** (or press Ctrl+Enter)

✅ **Expected result**: "Success. No rows returned"

### Step 3: Create New Projects

1. **Log out** if logged in as demo
2. **Go to**: http://localhost:3002
3. **Click**: "Try Demo" button
4. **Wait**: 5-10 seconds

✅ **Done!** 3 new Vite projects created

---

## Verify It Worked

After clicking "Try Demo", you should see:

- ✅ **3 projects** in dashboard:
  - Landing Page
  - Analytics Dashboard
  - Personal Blog

- ✅ Each project shows:
  - "Vite 5, React 18, Tailwind CSS"
  - 10 files in file tree
  - Modern, complete design

- ✅ Open any project:
  - WebContainer starts automatically
  - Terminal shows: "Found 10 files to mount"
  - npm install runs
  - Vite dev server starts
  - Preview loads within 30-60 seconds

---

## That's It!

**Total time**: ~2 minutes
- Delete: ~5 seconds
- Create new: ~10 seconds
- First load: ~30-60 seconds

---

## Need the Full SQL Script?

See: [COMPLETE_CLEANUP.sql](COMPLETE_CLEANUP.sql)

Or run this in Supabase:

```bash
# Copy the SQL file content and paste into Supabase SQL Editor
cat COMPLETE_CLEANUP.sql
```

---

## What Gets Deleted?

- ❌ All old projects for demo@ieditor.dev
- ❌ All old files (Next.js templates with 2-6 files)
- ❌ All old chat messages

## What Gets Created?

- ✅ 3 new projects with Vite templates
- ✅ 10 files per project (complete Vite setup)
- ✅ Welcome messages from AI assistant

---

**Ready?** Copy the SQL above and run it in Supabase! 🚀
