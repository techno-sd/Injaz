# 🚨 DELETE OLD PROJECTS NOW

Your terminal shows:
```
Found 1 files to mount
Has package.json: false
```

This means **old Next.js projects are still in database**. You need to delete them!

---

## Quick 2-Minute Fix

### Step 1: Open Supabase (30 seconds)

1. Go to: **https://supabase.com/dashboard**
2. Click your **iEditor project**
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"**

### Step 2: Paste & Run SQL (30 seconds)

Copy this entire block:

```sql
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

Click **"Run"** or press **Ctrl+Enter**

✅ Should see: **"Success. No rows returned"**

### Step 3: Create New Projects (1 minute)

1. **Log out** (if logged in as demo)
2. Go to: **http://localhost:3002**
3. Click **"Try Demo"**
4. Wait 10 seconds

---

## What You'll See After

Terminal will show:
```
Found 10 files to mount          ← Changed from 1 to 10!
Has package.json: true            ← Changed from false to true!
Installing dependencies...
npm install completed
Starting dev server...
Running: npm run dev
Server ready at http://localhost:3000/
```

Preview will load a **working Vite app** with:
- Modern design
- Hot reload
- All 10 files present

---

## Why This Happens

- ✅ New Vite code is already in your app (done!)
- ✅ Templates show "Vite 5" correctly (done!)
- ❌ **Old database records blocking new projects**

Once you delete old records, the "Try Demo" button will create **3 new Vite projects** automatically.

---

## Time Required

- Delete SQL: **5 seconds**
- Click "Try Demo": **10 seconds**
- First load: **30-60 seconds**

**Total: ~1 minute** ⏱️

---

**Ready?** Open Supabase and paste that SQL! 🚀
