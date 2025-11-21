# iEditor - AI-Powered App Builder Platform

A production-ready AI-powered platform for building web applications, similar to Lovable, v0, and Replit Ghostwriter.

## Features

- **AI-Powered Development**: Chat with AI to build your application
- **Real-Time Code Editor**: Monaco editor with syntax highlighting and auto-save
- **Live Preview**: See your changes in real-time
- **File Management**: Intuitive file tree with CRUD operations
- **Project Dashboard**: Manage multiple projects
- **Authentication**: Secure auth with Supabase
- **Database**: PostgreSQL with Row Level Security
- **GitHub Integration**: Import repositories and sync code
- **Template System**: Browse, search, and favorite project templates
- **Vercel Deployment**: One-click deployment with OAuth integration
- **Real-Time Sync**: Supabase Realtime for collaborative features

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, Server Actions)
- **Database**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **UI**: TailwindCSS + Shadcn UI
- **Editor**: Monaco Editor (VS Code engine)
- **AI**: OpenAI GPT-4 Turbo
- **Deployment**: Vercel
- **State Management**: React Hooks + Zustand (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd iEditor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
NEXT_PUBLIC_VERCEL_CLIENT_ID=your-vercel-oauth-client-id
VERCEL_CLIENT_ID=your-vercel-oauth-client-id
VERCEL_CLIENT_SECRET=your-vercel-oauth-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the Supabase database:

Run the migration file in your Supabase SQL editor:
```bash
supabase/migrations/20240101000000_initial_schema.sql
```

This will create:
- Users table
- Projects table
- Files table
- Messages table
- Deployments table
- RLS policies
- Triggers and functions

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
iEditor/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts              # Authentication actions
│   │   ├── files.ts             # File management actions
│   │   └── projects.ts          # Project management actions
│   ├── api/                     # API Routes
│   │   ├── chat/               # AI chat endpoint (streaming)
│   │   └── deploy/             # Deployment endpoint
│   ├── dashboard/              # Dashboard page
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── workspace/[projectId]/  # Workspace page
│   └── preview/[projectId]/    # Preview page
├── components/                  # React Components
│   ├── ui/                     # Shadcn UI components
│   └── workspace/              # Workspace-specific components
│       ├── workspace-layout.tsx
│       ├── file-tree.tsx
│       ├── code-editor.tsx
│       ├── chat-panel.tsx
│       └── preview-panel.tsx
├── lib/                        # Utilities
│   ├── supabase/              # Supabase clients
│   ├── hooks/                 # Custom React hooks
│   └── utils.ts               # Utility functions
├── types/                      # TypeScript types
├── supabase/                   # Supabase migrations
└── public/                     # Static assets
```

## Architecture

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Session stored in cookies
3. Middleware validates session on each request
4. RLS policies ensure data security

### Workspace Architecture

The workspace uses resizable panels (via `react-resizable-panels`):

```
┌─────────────────────────────────────────────┐
│            Workspace Header                  │
├──────────┬─────────────────┬─────────────────┤
│          │                 │                 │
│   File   │   Code Editor   │   AI Chat      │
│   Tree   ├─────────────────┤                 │
│          │   Preview       │                 │
│          │                 │                 │
└──────────┴─────────────────┴─────────────────┘
```

### AI Workflow

1. User sends message in chat
2. Frontend streams to `/api/chat`
3. Backend builds context with files + messages
4. OpenAI generates response with JSON actions
5. Actions applied to files in real-time
6. Files synced to database
7. UI updates via Supabase Realtime

### File Management

- Files stored in Supabase with full content
- Monaco editor with auto-save (1s debounce)
- File tree supports nested directories
- CRUD operations via Server Actions

## Key Features Explained

### Real-Time Collaboration

Uses Supabase Realtime to sync:
- File changes across sessions
- Chat messages
- Project updates

### AI Code Generation

The AI assistant:
- Understands full project context
- Generates complete, working files
- Never outputs placeholders
- Follows best practices (TypeScript, Next.js 14, accessibility)

### Code Editor

Monaco Editor features:
- Syntax highlighting
- IntelliSense (auto-complete)
- Multi-file tabs
- Auto-save
- Dark theme

### Deployment

One-click deployment:
1. Bundles project files
2. Deploys to Vercel via API
3. Returns preview URL
4. Tracks deployment status

## Database Schema

### Tables

- **users**: User profiles (extends Supabase auth.users)
- **projects**: User projects with metadata
- **files**: Project files with full content
- **messages**: AI chat history
- **deployments**: Deployment records and status

### RLS Policies

All tables have Row Level Security:
- Users can only access their own data
- Public projects accessible to all
- Secure by default

## API Endpoints

### POST /api/chat

Streams AI responses for code generation.

**Request:**
```json
{
  "projectId": "uuid",
  "messages": [...],
  "files": [...]
}
```

**Response:** Server-Sent Events (SSE)

### POST /api/deploy

Deploys project to Vercel.

**Request:**
```json
{
  "projectId": "uuid"
}
```

**Response:**
```json
{
  "deploymentId": "uuid",
  "status": "pending"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub integration |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | For GitHub integration |
| `NEXT_PUBLIC_VERCEL_CLIENT_ID` | Vercel OAuth client ID | For Vercel deployment |
| `VERCEL_CLIENT_ID` | Vercel OAuth client ID (duplicate) | For Vercel deployment |
| `VERCEL_CLIENT_SECRET` | Vercel OAuth client secret | For Vercel deployment |
| `NEXT_PUBLIC_APP_URL` | App base URL | Yes |

### Setting up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: iEditor (or your app name)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/github/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret** to your `.env` file

### Setting up Vercel OAuth

1. Go to [Vercel Integrations Console](https://vercel.com/dashboard/integrations/console)
2. Click "Create" to create a new integration
3. Fill in the integration details:
   - **Name**: iEditor Deployment (or your app name)
   - **Redirect URL**: `http://localhost:3000/api/vercel/auth/callback` (add production URL when deploying)
4. Under "Required Permissions", select:
   - Deployments: Read and Write
   - Projects: Read and Write
5. Click "Create" and copy the **Client ID** and **Client Secret**
6. Add these values to your `.env` file as both `NEXT_PUBLIC_VERCEL_CLIENT_ID` and `VERCEL_CLIENT_ID` (and `VERCEL_CLIENT_SECRET`)

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Database Setup

Run the SQL migration in Supabase:
```sql
-- Run supabase/migrations/20240101000000_initial_schema.sql
```

## Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Type checking
```bash
npm run type-check
```

## Security

- All routes protected by middleware
- RLS enforced on database
- Environment variables for secrets
- XSS protection via React
- CSRF protection via Next.js

## Performance

- Edge runtime for API routes
- Server components by default
- Streaming responses
- Optimistic UI updates
- Debounced auto-save
- Code splitting

## Future Enhancements

- [x] GitHub integration
- [x] Template marketplace with favorites and usage tracking
- [x] Vercel deployment integration
- [ ] Collaborative editing (real-time multi-user)
- [ ] Version control (git branching and commits)
- [ ] Custom domains for deployments
- [ ] Usage analytics and insights
- [ ] Team workspaces with shared projects
- [ ] Export to GitHub repo
- [ ] Environment variable management
- [ ] Deployment rollback functionality

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: See `/docs` folder
- Email: support@ieditor.dev

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- OpenAI for AI capabilities
- Shadcn for beautiful UI components
- Monaco Editor team

---

Built with ❤️ by the iEditor team
