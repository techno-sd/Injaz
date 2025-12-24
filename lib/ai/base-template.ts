// Fixed Base Template - NEVER AI-generated
// These files are always the same for every generated app
// This ensures framer-motion, react-router-dom, etc. are ALWAYS present

export interface TemplateFile {
  path: string
  content: string
}

// Package.json - Minimal but with Tailwind for proper CSS
const PACKAGE_JSON = `{
  "name": "vite-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}`

// Simplified vite config - all npm packages load via CDN URLs in imports
// CRITICAL: Disable optimizeDeps for fast startup (we use CDN, not npm bundles)
const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 5173,
    warmup: {
      clientFiles: [],  // Don't pre-transform files
    },
  },
  build: {
    target: 'esnext',
  },
  // CRITICAL: Disable pre-bundling for instant startup
  // We use CDN URLs directly, so Vite doesn't need to scan/bundle deps
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  // Disable clearing console for faster feedback
  clearScreen: false,
})`

const TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`

const POSTCSS_CONFIG = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`

const TSCONFIG_NODE = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <!-- Import maps for CDN - runtime packages load from esm.sh -->
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom": "https://esm.sh/react-dom@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
        "react/jsx-dev-runtime": "https://esm.sh/react@18.2.0/jsx-dev-runtime",
        "react-router-dom": "https://esm.sh/react-router-dom@6.20.0?external=react",
        "framer-motion": "https://esm.sh/framer-motion@10.16.0?external=react",
        "lucide-react": "https://esm.sh/lucide-react@0.294.0?external=react",
        "react-hot-toast": "https://esm.sh/react-hot-toast@2.4.1?external=react,react-dom",
        "sonner": "https://esm.sh/sonner@1.3.1?external=react,react-dom",
        "zustand": "https://esm.sh/zustand@4.4.7?external=react",
        "clsx": "https://esm.sh/clsx@2.0.0",
        "tailwind-merge": "https://esm.sh/tailwind-merge@2.0.0",
        "class-variance-authority": "https://esm.sh/class-variance-authority@0.7.0",
        "@radix-ui/react-slot": "https://esm.sh/@radix-ui/react-slot@1.0.2?external=react,react-dom"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`

// CRITICAL: Use CDN URLs directly - bypasses Vite resolution entirely
const MAIN_TSX = `import React from 'https://esm.sh/react@18.2.0'
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`

const INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 17 24 39;
  --foreground: 249 250 251;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: rgb(var(--background));
  color: rgb(var(--foreground));
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}`

const VITE_ENV_DTS = `/// <reference types="vite/client" />`

// Common utility for className merging (used by shadcn-style components)
// CRITICAL: Use CDN URLs directly - bypasses Vite resolution entirely
const LIB_UTILS = `import { type ClassValue, clsx } from "https://esm.sh/clsx@2.0.0"
import { twMerge } from "https://esm.sh/tailwind-merge@2.0.0"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

// All base files - these are ALWAYS included and NEVER modified by AI
export const BASE_FILES: TemplateFile[] = [
  { path: 'package.json', content: PACKAGE_JSON },
  { path: 'vite.config.ts', content: VITE_CONFIG },
  { path: 'tailwind.config.js', content: TAILWIND_CONFIG },
  { path: 'postcss.config.js', content: POSTCSS_CONFIG },
  { path: 'tsconfig.json', content: TSCONFIG },
  { path: 'tsconfig.node.json', content: TSCONFIG_NODE },
  { path: 'index.html', content: INDEX_HTML },
  { path: 'src/main.tsx', content: MAIN_TSX },
  { path: 'src/index.css', content: INDEX_CSS },
  { path: 'src/vite-env.d.ts', content: VITE_ENV_DTS },
  { path: 'src/lib/utils.ts', content: LIB_UTILS },
]

// Get base files as a map for easy lookup
export function getBaseFilesMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const file of BASE_FILES) {
    map.set(file.path, file.content)
  }
  return map
}

// Check if a path is a base file (should not be AI-generated)
export function isBaseFile(path: string): boolean {
  return BASE_FILES.some(f => f.path === path)
}
