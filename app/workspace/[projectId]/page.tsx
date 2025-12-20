import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientWorkspace } from '@/components/workspace/client-workspace'
import { getGuestTemplateFiles, GUEST_TEMPLATES } from '@/lib/guest-templates'

interface WorkspacePageProps {
  params: {
    projectId: string
  }
  searchParams: {
    template?: string
  }
}

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Handle demo/guest mode or new projects from home page
  const isNewProject = params.projectId === 'demo' || params.projectId === 'new' || params.projectId.startsWith('new-')
  const isAIGeneratedProject = params.projectId.startsWith('new-')

  if (isNewProject) {
    // For AI-generated projects from home page, start with empty files
    // For demo/templates, use the template files
    const templateId = searchParams.template || 'blank'
    const template = GUEST_TEMPLATES[templateId] || GUEST_TEMPLATES.blank

    // Vite + React + TypeScript + Tailwind + shadcn/ui starter (Lovable-like stack)
    const emptyStarterFiles = [
      {
        id: 'package-json',
        project_id: params.projectId,
        path: 'package.json',
        content: JSON.stringify({
          name: 'my-app',
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview'
          },
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            'react-router-dom': '^6.22.0',
            '@tanstack/react-query': '^5.17.0',
            'lucide-react': '^0.312.0',
            'clsx': '^2.1.0',
            'tailwind-merge': '^2.2.0',
            'class-variance-authority': '^0.7.0',
            '@radix-ui/react-slot': '^1.0.2',
            'sonner': '^1.4.0'
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.2.0',
            'autoprefixer': '^10.4.0',
            'postcss': '^8.4.0',
            'tailwindcss': '^3.4.0',
            'tailwindcss-animate': '^1.0.7',
            'typescript': '^5.3.0',
            'vite': '^5.0.0'
          }
        }, null, 2),
        language: 'json',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'index-html',
        project_id: params.projectId,
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        language: 'html',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'vite-config',
        project_id: params.projectId,
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173
  }
})`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tsconfig',
        project_id: params.projectId,
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            noFallthroughCasesInSwitch: true,
            baseUrl: '.',
            paths: {
              '@/*': ['./src/*']
            }
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2),
        language: 'json',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tsconfig-node',
        project_id: params.projectId,
        path: 'tsconfig.node.json',
        content: JSON.stringify({
          compilerOptions: {
            composite: true,
            skipLibCheck: true,
            module: 'ESNext',
            moduleResolution: 'bundler',
            allowSyntheticDefaultImports: true
          },
          include: ['vite.config.ts']
        }, null, 2),
        language: 'json',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'src-main',
        project_id: params.projectId,
        path: 'src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'src-app',
        project_id: params.projectId,
        path: 'src/App.tsx',
        content: `import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'src-index-css',
        project_id: params.projectId,
        path: 'src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262.1 83.3% 57.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: Inter, system-ui, sans-serif;
    margin: 0;
    min-height: 100vh;
  }
}`,
        language: 'css',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tailwind-config',
        project_id: params.projectId,
        path: 'tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`,
        language: 'javascript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'postcss-config',
        project_id: params.projectId,
        path: 'postcss.config.js',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
        language: 'javascript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'lib-utils',
        project_id: params.projectId,
        path: 'src/lib/utils.ts',
        content: `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'components-button',
        project_id: params.projectId,
        path: 'src/components/ui/button.tsx',
        content: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pages-index',
        project_id: params.projectId,
        path: 'src/pages/Index.tsx',
        content: `const Index = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-white/40">Your preview will appear here</p>
      </div>
    </div>
  )
}

export default Index`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pages-notfound',
        project_id: params.projectId,
        path: 'src/pages/NotFound.tsx',
        content: `import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Home } from "lucide-react"

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-gray-300">Page not found</p>
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default NotFound`,
        language: 'typescript',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    // Transform simple template files to full File format
    const rawTemplateFiles = getGuestTemplateFiles(templateId)
    const formattedTemplateFiles = rawTemplateFiles.map((file, index) => {
      const ext = file.path.split('.').pop() || ''
      const langMap: Record<string, string> = {
        ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
        json: 'json', css: 'css', html: 'html', md: 'markdown'
      }
      return {
        id: `template-file-${index}`,
        project_id: params.projectId,
        path: file.path,
        content: file.content,
        language: langMap[ext] || 'plaintext',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })
    const templateFiles = isAIGeneratedProject ? emptyStarterFiles : formattedTemplateFiles

    const newProject = {
      id: params.projectId,
      name: isAIGeneratedProject ? 'New Project' : template.name,
      description: isAIGeneratedProject ? 'AI-generated project' : template.description,
      template: templateId,
      // Set platform to 'webapp' for Next.js projects (App Router + Tailwind)
      platform: 'webapp' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || 'guest',
      preview_url: null,
      deployment_url: null,
      is_public: false,
      vercel_project_id: null,
      vercel_project_name: null,
    }

    return (
      <ClientWorkspace
        project={newProject}
        initialFiles={templateFiles}
        initialMessages={[]}
        isVercelConnected={false}
        isGuestMode={!user}
      />
    )
  }

  // For regular projects, try to load from database
  let project = null
  let files: any[] = []
  let messages: any[] = []
  let vercelToken = null

  if (user) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .eq('user_id', user.id)
      .single()

    project = projectData

    if (project) {
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', params.projectId)
        .order('path', { ascending: true })

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', params.projectId)
        .order('created_at', { ascending: true })

      const { data: vToken } = await supabase
        .from('vercel_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single()

      files = filesData || []
      messages = messagesData || []
      vercelToken = vToken
    }
  }

  if (!project) {
    redirect('/dashboard')
  }

  return (
    <ClientWorkspace
      project={project}
      initialFiles={files}
      initialMessages={messages}
      isVercelConnected={!!vercelToken}
      isGuestMode={false}
    />
  )
}
