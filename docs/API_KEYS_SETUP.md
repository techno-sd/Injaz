# API Keys Setup Guide

This guide will help you obtain and configure all required API keys for the iEditor platform.

## Required API Keys

### 1. Supabase Service Role Key (Required)

**What it's for:** Server-side operations like creating demo users and managing database operations with elevated permissions.

**How to get it:**

1. Go to your Supabase Dashboard: https://bwpktuycjfszvbuzekel.supabase.co
2. Navigate to: **Settings** → **API** (in the left sidebar)
3. Scroll down to **Project API keys** section
4. Find the **service_role** key (it's the secret one, not the anon key)
5. Click the **"Copy"** button next to it

**How to add it:**

Open `.env.local` and replace this line:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...  # Your actual key
```

**⚠️ Security Warning:** Never commit this key to git or share it publicly. It has admin access to your database.

---

### 2. OpenAI API Key (Required for AI Features)

**What it's for:** Powering the AI chat that generates and modifies code in projects.

**How to get it:**

1. Go to OpenAI Platform: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Give it a name (e.g., "iEditor Platform")
5. Click **"Create secret key"**
6. **Copy the key immediately** (you won't be able to see it again)

**How to add it:**

Open `.env.local` and replace this line:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

With:
```env
OPENAI_API_KEY=sk-proj-abc123...  # Your actual key
```

**Cost:** OpenAI charges per API usage. Using GPT-4 Turbo costs approximately:
- $0.01 per 1,000 input tokens
- $0.03 per 1,000 output tokens

Set usage limits in your OpenAI account to avoid unexpected charges.

**Alternative:** If you want to use Claude instead of OpenAI:
1. Get an Anthropic API key: https://console.anthropic.com/
2. Modify `app/api/chat/route.ts` to use Anthropic's SDK instead of OpenAI

---

### 3. Vercel Token (Optional - for deployment features)

**What it's for:** Enabling one-click deployment to Vercel from the platform.

**How to get it:**

1. Go to Vercel: https://vercel.com/account/tokens
2. Sign in or create an account
3. Click **"Create Token"**
4. Give it a name (e.g., "iEditor Deployments")
5. Set scope to **"Full Account"**
6. Click **"Create"**
7. Copy the token

**How to add it:**

Open `.env.local` and replace:
```env
VERCEL_TOKEN=your-vercel-token-here
VERCEL_TEAM_ID=your-vercel-team-id-here
```

With:
```env
VERCEL_TOKEN=your-actual-token
VERCEL_TEAM_ID=team_abc123  # Optional, only if using a team account
```

**Note:** Deployment features will be disabled if this is not configured, but the rest of the platform will work fine.

---

## Current .env.local Status

Your current `.env.local` file has:

✅ **Configured:**
- `NEXT_PUBLIC_SUPABASE_URL` - Already set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already set
- `NEXT_PUBLIC_APP_URL` - Set to localhost:3000

❌ **Needs Configuration:**
- `SUPABASE_SERVICE_ROLE_KEY` - Replace placeholder
- `OPENAI_API_KEY` - Replace placeholder

⚪ **Optional:**
- `VERCEL_TOKEN` - For deployment features
- `VERCEL_TEAM_ID` - Only if using Vercel teams

---

## Verification

After adding the keys, verify they work:

### Test Supabase Service Role Key:

Create a test file `scripts/test-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase.from('users').select('count')
  if (error) {
    console.error('❌ Supabase connection failed:', error.message)
  } else {
    console.log('✅ Supabase service role key works!')
  }
}

test()
```

Run: `node scripts/test-supabase.js`

### Test OpenAI API Key:

Create a test file `scripts/test-openai.js`:

```javascript
const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    })
    console.log('✅ OpenAI API key works!')
    console.log('Response:', response.choices[0].message.content)
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message)
  }
}

test()
```

Run: `node scripts/test-openai.js`

---

## Security Best Practices

1. **Never commit .env.local to git**
   - It's already in `.gitignore`
   - Double-check before committing

2. **Rotate keys periodically**
   - Change keys every few months
   - Immediately rotate if compromised

3. **Use environment-specific keys**
   - Different keys for development/production
   - Use Vercel's environment variables for production

4. **Set up usage alerts**
   - OpenAI: Set monthly spending limits
   - Supabase: Monitor database usage
   - Vercel: Set up usage alerts

5. **Restrict key permissions**
   - Only grant minimum required permissions
   - Use separate keys for different environments

---

## Troubleshooting

### "Invalid API key" error

**For Supabase:**
- Make sure you copied the `service_role` key, not the `anon` key
- Check for extra spaces or line breaks when pasting
- Verify the key starts with `eyJhbGci...`

**For OpenAI:**
- Make sure the key starts with `sk-`
- Verify the key is still active in your OpenAI dashboard
- Check you have credits/payment method set up

### "Insufficient quota" error (OpenAI)

- Add a payment method to your OpenAI account
- Check your usage limits at https://platform.openai.com/usage
- Consider using GPT-3.5 Turbo instead of GPT-4 for testing (cheaper)

### Keys not loading

- Make sure `.env.local` is in the root directory
- Restart the Next.js dev server after adding keys
- Check there are no syntax errors in `.env.local`
- Verify there are no quotes around the values (unless they contain spaces)

---

## Next Steps

After adding the API keys:

1. ✅ Keys configured in `.env.local`
2. Run database migrations (see `docs/MIGRATION_GUIDE.md`)
3. Start development server: `npm run dev`
4. Test the platform at http://localhost:3000
5. Try creating a project and using AI chat

---

## Need Help?

- **Supabase docs:** https://supabase.com/docs
- **OpenAI docs:** https://platform.openai.com/docs
- **Vercel docs:** https://vercel.com/docs
- **iEditor docs:** See `README.md`
