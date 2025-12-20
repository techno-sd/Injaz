// Vite-based Template Definitions for Demo Projects
// Vite is faster and simpler than Next.js, perfect for non-developers

interface TemplateFile {
  path: string
  content: string
  language: string
}

// Base package.json with Vite
export function getVitePackageJson(): string {
  return JSON.stringify({
    name: 'my-app',
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'lucide-react': '^0.263.1',
      'clsx': '^2.0.0'
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.2.1',
      'typescript': '^5.2.2',
      'vite': '^5.0.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32',
      'tailwindcss': '^3.4.0'
    }
  }, null, 2)
}

// Vite configuration
export function getViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  }
})
`
}

// Tailwind CSS configuration
export function getTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'gradient-xy': 'gradientXY 6s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientY: {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        gradientXY: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,0.3) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,0.3) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,0.3) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'glow-xl': '0 0 60px rgba(139, 92, 246, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'colored': '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
`
}

// PostCSS configuration
export function getPostCSSConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}

// TypeScript configuration
export function getTSConfig(): string {
  return JSON.stringify({
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
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  }, null, 2)
}

// TypeScript Node configuration
export function getTSNodeConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true
    },
    include: ['vite.config.ts']
  }, null, 2)
}

// index.html
export function getIndexHTML(): string {
  return `<!DOCTYPE html>
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
</html>
`
}

// Main entry point
export function getMainTSX(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`
}

// Global CSS with Tailwind directives
export function getIndexCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --gradient-start: #6366f1;
    --gradient-mid: #8b5cf6;
    --gradient-end: #06b6d4;
  }

  body {
    @apply antialiased;
    font-feature-settings: 'kern' 1, 'liga' 1;
  }

  ::selection {
    @apply bg-purple-200 text-purple-900;
  }
}

@layer components {
  /* Glass morphism cards */
  .glass {
    @apply bg-white/70 backdrop-blur-xl border border-white/20 shadow-glass;
  }

  .glass-dark {
    @apply bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-glass;
  }

  /* Gradient buttons */
  .btn-gradient {
    @apply relative overflow-hidden px-8 py-4 rounded-xl font-semibold text-white
           bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600
           bg-[length:200%_100%] animate-gradient-x
           hover:shadow-colored hover:scale-[1.02] active:scale-[0.98]
           transition-all duration-300;
  }

  .btn-gradient::before {
    content: '';
    @apply absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0
           translate-x-[-100%] animate-shimmer;
  }

  .btn-glow {
    @apply px-8 py-4 rounded-xl font-semibold text-white
           bg-gradient-to-r from-purple-600 to-blue-600
           shadow-glow hover:shadow-glow-lg
           hover:scale-[1.02] active:scale-[0.98]
           transition-all duration-300;
  }

  .btn-outline-glow {
    @apply px-8 py-4 rounded-xl font-semibold
           border-2 border-purple-500/50 text-purple-600
           hover:bg-purple-500/10 hover:border-purple-500 hover:shadow-glow
           transition-all duration-300;
  }

  /* Modern cards */
  .card-modern {
    @apply bg-white rounded-2xl shadow-soft hover:shadow-soft-xl
           transition-all duration-500 hover:-translate-y-1;
  }

  .card-glass {
    @apply glass rounded-2xl p-8 hover:shadow-glass-lg
           transition-all duration-500 hover:-translate-y-1;
  }

  .card-gradient-border {
    @apply relative rounded-2xl p-8 bg-white;
  }

  .card-gradient-border::before {
    content: '';
    @apply absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 -z-10;
    padding: 2px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* Animated backgrounds */
  .bg-mesh {
    background:
      radial-gradient(at 40% 20%, hsla(280, 100%, 74%, 0.15) 0px, transparent 50%),
      radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%),
      radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.15) 0px, transparent 50%),
      radial-gradient(at 80% 50%, hsla(340, 100%, 76%, 0.15) 0px, transparent 50%),
      radial-gradient(at 0% 100%, hsla(22, 100%, 77%, 0.15) 0px, transparent 50%),
      radial-gradient(at 80% 100%, hsla(242, 100%, 70%, 0.15) 0px, transparent 50%);
  }

  .bg-dots {
    background-image: radial-gradient(circle, rgba(99, 102, 241, 0.15) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .bg-grid {
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Glowing orbs */
  .orb {
    @apply absolute rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob;
  }

  .orb-purple {
    @apply orb bg-purple-300;
  }

  .orb-blue {
    @apply orb bg-blue-300;
  }

  .orb-cyan {
    @apply orb bg-cyan-300;
  }

  .orb-pink {
    @apply orb bg-pink-300;
  }
}

@layer utilities {
  /* Gradient utilities */
  .gradient-primary {
    @apply bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600;
  }

  .gradient-secondary {
    @apply bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500;
  }

  .gradient-warm {
    @apply bg-gradient-to-r from-orange-500 via-red-500 to-pink-500;
  }

  .gradient-cool {
    @apply bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500;
  }

  .gradient-sunset {
    @apply bg-gradient-to-r from-amber-500 via-orange-500 to-red-500;
  }

  .gradient-ocean {
    @apply bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600;
  }

  .gradient-forest {
    @apply bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent;
  }

  .gradient-text-warm {
    @apply bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent;
  }

  .gradient-text-animated {
    @apply bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600
           bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x;
  }

  /* Text effects */
  .text-shadow-glow {
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
  }

  .text-shadow-soft {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  /* Hover effects */
  .hover-lift {
    @apply transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-xl;
  }

  .hover-glow {
    @apply transition-all duration-300 hover:shadow-glow;
  }

  .hover-scale {
    @apply transition-transform duration-300 hover:scale-105;
  }

  .hover-rotate {
    @apply transition-transform duration-300 hover:rotate-3;
  }

  /* Border gradient */
  .border-gradient {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4) border-box;
  }

  /* Smooth scrolling */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Hide scrollbar */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Stagger children animations */
  .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
  .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
  .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
  .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
  .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
  .stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
}
`
}

// Simple Placeholder Template (Default)
function getPlaceholderApp(): string {
  return `export default function App() {
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
`
}

// Landing Page Template
function getLandingPageApp(): string {
  return `import { Sparkles, Zap, Shield, ArrowRight, Check, Star, Play, ChevronRight } from 'lucide-react'

export default function App() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Build and deploy applications in minutes with our optimized workflow.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and security protocols protect your data.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Cutting-edge AI creates, customizes, and optimizes automatically.',
      gradient: 'from-violet-500 to-purple-600',
    },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'Founder, TechFlow', avatar: 'SC', quote: 'Absolutely transformed how we build products. Shipped 3x faster!' },
    { name: 'Marcus Johnson', role: 'CTO, StartupXYZ', avatar: 'MJ', quote: 'The AI capabilities are mind-blowing. Best investment we made.' },
    { name: 'Emily Rodriguez', role: 'Lead Developer', avatar: 'ER', quote: 'Finally, a tool that actually delivers on its promises.' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Lumina
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <button className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium hover:bg-white/20 transition-all">
                Sign In
              </button>
              <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105">
                Get Started Free
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-8 animate-fade-in-down">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-sm text-gray-300">New: AI-powered code generation is here</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight animate-fade-in-up">
            Build the future with
            <span className="block mt-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                AI-powered magic
              </span>
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Create stunning web applications without writing a single line of code.
            Our AI understands your vision and brings it to life instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                Start Building Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="h-4 w-4 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Floating Cards Preview */}
        <div className="relative mt-20 max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative bg-gradient-to-b from-white/5 to-white/0 rounded-2xl border border-white/10 p-1 backdrop-blur-sm">
            <div className="bg-slate-900/80 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 mb-4">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-gray-400">Your amazing app preview will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative container mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ship faster
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features that help you build, deploy, and scale your applications effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: \`\${index * 0.1}s\` }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={\`relative w-14 h-14 rounded-2xl bg-gradient-to-br \${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300\`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="relative text-xl font-bold mb-3">{feature.title}</h3>
              <p className="relative text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative px-8 py-16 md:py-20">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">10K+</div>
                <div className="text-white/70">Active Creators</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">50K+</div>
                <div className="text-white/70">Projects Shipped</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">99.9%</div>
                <div className="text-white/70">Uptime SLA</div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">4.9</div>
                <div className="flex items-center justify-center gap-1 text-white/70">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative container mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by creators
            <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              worldwide
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 text-lg">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-6 py-32">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/10 p-12 md:p-16 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of creators who are already building the future with AI-powered tools.
            </p>
            <button className="group px-10 py-5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105">
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-400">Lumina</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-500">© 2024 Lumina. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
`
}

// Dashboard Template
function getDashboardApp(): string {
  return `import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Activity, BarChart3, ArrowUpRight, Bell, Search, Settings, ChevronDown, MoreHorizontal, Wallet, Target, Zap } from 'lucide-react'

export default function App() {
  const stats = [
    { name: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-500/10 to-teal-500/10' },
    { name: 'Active Users', value: '2,345', change: '+15.3%', trend: 'up', icon: Users, gradient: 'from-blue-500 to-indigo-600', bgGradient: 'from-blue-500/10 to-indigo-500/10' },
    { name: 'Total Orders', value: '1,234', change: '+8.2%', trend: 'up', icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600', bgGradient: 'from-violet-500/10 to-purple-500/10' },
    { name: 'Conversion', value: '3.2%', change: '-2.5%', trend: 'down', icon: Target, gradient: 'from-amber-500 to-orange-600', bgGradient: 'from-amber-500/10 to-orange-500/10' },
  ]

  const chartData = [
    { day: 'Mon', value: 65, sales: 45 },
    { day: 'Tue', value: 78, sales: 52 },
    { day: 'Wed', value: 55, sales: 38 },
    { day: 'Thu', value: 90, sales: 70 },
    { day: 'Fri', value: 82, sales: 65 },
    { day: 'Sat', value: 95, sales: 82 },
    { day: 'Sun', value: 70, sales: 55 },
  ]

  const activities = [
    { user: 'Sarah Chen', action: 'completed purchase', amount: '$249.00', time: '2m ago', avatar: 'SC', status: 'success' },
    { user: 'Mike Johnson', action: 'started trial', amount: 'Pro Plan', time: '5m ago', avatar: 'MJ', status: 'info' },
    { user: 'Emma Davis', action: 'upgraded plan', amount: '$99.00/mo', time: '12m ago', avatar: 'ED', status: 'success' },
    { user: 'Alex Kim', action: 'submitted ticket', amount: '#4521', time: '25m ago', avatar: 'AK', status: 'warning' },
    { user: 'Lisa Wang', action: 'cancelled subscription', amount: 'Basic', time: '1h ago', avatar: 'LW', status: 'error' },
  ]

  const topProducts = [
    { name: 'Premium Template', sales: 2451, revenue: '$24,510', growth: '+12.5%' },
    { name: 'Pro Dashboard', sales: 1832, revenue: '$18,320', growth: '+8.2%' },
    { name: 'UI Kit Bundle', sales: 1245, revenue: '$12,450', growth: '+15.3%' },
    { name: 'Icon Pack', sales: 987, revenue: '$4,935', growth: '+5.1%' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Nexus</span>
        </div>

        <nav className="space-y-1">
          {[
            { icon: BarChart3, label: 'Dashboard', active: true },
            { icon: Users, label: 'Customers' },
            { icon: ShoppingCart, label: 'Orders' },
            { icon: Wallet, label: 'Payments' },
            { icon: Activity, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map((item, i) => (
            <button
              key={i}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all \${
                item.active
                  ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white border border-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, here's what's happening</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-sm">
                  JD
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: \`\${index * 0.1}s\` }}
              >
                <div className={\`absolute inset-0 rounded-2xl bg-gradient-to-br \${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300\`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${stat.gradient} flex items-center justify-center shadow-lg\`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={\`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full \${
                      stat.trend === 'up'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }\`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Revenue Analytics</h2>
                  <p className="text-sm text-gray-400">Daily revenue & sales overview</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                    Revenue
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-cyan-500/50" />
                    Sales
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-4 px-2">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex justify-center gap-1">
                        <div
                          className="w-6 rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-500 transition-all duration-500 hover:from-violet-500 hover:to-purple-400"
                          style={{ height: \`\${item.value * 2}px\` }}
                        />
                        <div
                          className="w-6 rounded-t-lg bg-cyan-500/30 transition-all duration-500"
                          style={{ height: \`\${item.sales * 2}px\` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors animate-fade-in"
                    style={{ animationDelay: \`\${index * 0.1}s\` }}
                  >
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold \${
                      activity.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      activity.status === 'info' ? 'bg-blue-500/20 text-blue-400' :
                      activity.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }\`}>
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-400"> {activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-violet-400">{activity.amount}</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Top Products</h2>
                <p className="text-sm text-gray-400">Best performing products this month</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-colors">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                    <th className="pb-4 font-medium">Product</th>
                    <th className="pb-4 font-medium">Sales</th>
                    <th className="pb-4 font-medium">Revenue</th>
                    <th className="pb-4 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-violet-400" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-400">{product.sales.toLocaleString()}</td>
                      <td className="py-4 font-medium">{product.revenue}</td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <TrendingUp className="h-4 w-4" />
                          {product.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
`
}

// Blog Template
function getBlogApp(): string {
  return `import { Calendar, Clock, ArrowRight, Search, Bookmark, Heart, MessageCircle, Share2, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'

export default function App() {
  const featuredPost = {
    id: 0,
    title: 'The Future of Web Development: AI-Powered Design Systems',
    excerpt: 'Explore how artificial intelligence is revolutionizing the way we design and build modern web applications. From automated code generation to intelligent design suggestions, discover what lies ahead.',
    author: 'Sarah Chen',
    date: '2024-01-20',
    readTime: '12 min',
    category: 'Featured',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    likes: 2847,
    comments: 156,
  }

  const posts = [
    {
      id: 1,
      title: 'Mastering React Server Components',
      excerpt: 'Deep dive into React Server Components and learn how to build blazing-fast applications with improved SEO.',
      author: 'Alex Kim',
      date: '2024-01-18',
      readTime: '8 min',
      category: 'React',
      gradient: 'from-cyan-500 to-blue-600',
      likes: 1234,
      comments: 89,
    },
    {
      id: 2,
      title: 'TypeScript 5.0: Game-Changing Features',
      excerpt: 'Discover the powerful new features in TypeScript 5.0 that will transform how you write type-safe code.',
      author: 'Emma Davis',
      date: '2024-01-16',
      readTime: '6 min',
      category: 'TypeScript',
      gradient: 'from-blue-500 to-indigo-600',
      likes: 987,
      comments: 67,
    },
    {
      id: 3,
      title: 'Building Beautiful UIs with Tailwind',
      excerpt: 'Learn advanced Tailwind CSS techniques for creating stunning, responsive user interfaces.',
      author: 'Marcus Johnson',
      date: '2024-01-14',
      readTime: '10 min',
      category: 'CSS',
      gradient: 'from-teal-500 to-emerald-600',
      likes: 1567,
      comments: 112,
    },
    {
      id: 4,
      title: 'Next.js 14 App Router Deep Dive',
      excerpt: 'Everything you need to know about the new App Router in Next.js 14 and how to migrate your projects.',
      author: 'Lisa Wang',
      date: '2024-01-12',
      readTime: '15 min',
      category: 'Next.js',
      gradient: 'from-gray-800 to-gray-900',
      likes: 2103,
      comments: 145,
    },
    {
      id: 5,
      title: 'State Management in 2024',
      excerpt: 'Comparing Zustand, Jotai, and Redux Toolkit - which state management library should you use?',
      author: 'David Park',
      date: '2024-01-10',
      readTime: '9 min',
      category: 'Architecture',
      gradient: 'from-orange-500 to-red-600',
      likes: 892,
      comments: 78,
    },
    {
      id: 6,
      title: 'Performance Optimization Secrets',
      excerpt: 'Advanced techniques to make your web applications load faster and perform better.',
      author: 'Nina Patel',
      date: '2024-01-08',
      readTime: '11 min',
      category: 'Performance',
      gradient: 'from-amber-500 to-orange-600',
      likes: 1456,
      comments: 94,
    },
  ]

  const categories = ['All', 'React', 'TypeScript', 'CSS', 'Next.js', 'Architecture', 'Performance']

  const trendingTopics = ['AI Development', 'Web3', 'Rust', 'Edge Computing', 'Micro-frontends']

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">DevBlog</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Articles</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Topics</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero / Featured Post */}
      <section className="container mx-auto px-6 py-16">
        <div className="relative group">
          <div className={\`absolute inset-0 rounded-3xl bg-gradient-to-r \${featuredPost.gradient} opacity-20 group-hover:opacity-30 transition-opacity blur-xl\`} />
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight animate-fade-in-up">
                  {featuredPost.title}
                </h1>

                <p className="text-lg text-gray-400 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                      {featuredPost.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{featuredPost.author}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {featuredPost.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {featuredPost.comments}
                    </span>
                  </div>
                </div>

                <button className="group/btn flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium w-fit hover:shadow-lg hover:shadow-violet-500/25 transition-all animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  Read Article
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className={\`absolute inset-0 bg-gradient-to-r \${featuredPost.gradient} rounded-2xl blur-2xl opacity-50\`} />
                  <div className="relative w-80 h-80 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Sparkles className="h-20 w-20 text-violet-400 animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Trending */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={\`px-5 py-2.5 rounded-xl font-medium transition-all \${
                  index === 0
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }\`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Trending:</span>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic, index) => (
                <span key={index} className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                  #{topic.replace(' ', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: \`\${index * 0.1}s\` }}
            >
              {/* Gradient Header */}
              <div className={\`h-32 bg-gradient-to-r \${post.gradient} flex items-center justify-center relative overflow-hidden\`}>
                <div className="absolute inset-0 bg-black/20" />
                <span className="relative text-5xl group-hover:scale-110 transition-transform duration-300">
                  {post.category === 'React' ? '⚛️' :
                   post.category === 'TypeScript' ? '📘' :
                   post.category === 'CSS' ? '🎨' :
                   post.category === 'Next.js' ? '▲' :
                   post.category === 'Architecture' ? '🏗️' : '⚡'}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Bookmark className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Share2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-3 group-hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/50 to-purple-500/50 flex items-center justify-center text-xs font-bold">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{post.author}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="group px-8 py-4 rounded-xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-all">
            <span className="flex items-center gap-2">
              Load More Articles
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay ahead of the curve
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Get weekly insights on web development, design trends, and the latest tech delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                Subscribe
              </button>
            </form>
            <p className="text-sm text-white/60 mt-4">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-400">DevBlog</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">RSS</a>
            </div>
            <p className="text-sm text-gray-500">© 2024 DevBlog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
`
}

// Main export function
export function getViteTemplateFiles(template: string, projectId: string): TemplateFile[] {
  const baseFiles: TemplateFile[] = [
    {
      path: 'package.json',
      content: getVitePackageJson(),
      language: 'json'
    },
    {
      path: 'vite.config.ts',
      content: getViteConfig(),
      language: 'typescript'
    },
    {
      path: 'tailwind.config.js',
      content: getTailwindConfig(),
      language: 'javascript'
    },
    {
      path: 'postcss.config.js',
      content: getPostCSSConfig(),
      language: 'javascript'
    },
    {
      path: 'tsconfig.json',
      content: getTSConfig(),
      language: 'json'
    },
    {
      path: 'tsconfig.node.json',
      content: getTSNodeConfig(),
      language: 'json'
    },
    {
      path: 'index.html',
      content: getIndexHTML(),
      language: 'html'
    },
    {
      path: 'src/main.tsx',
      content: getMainTSX(),
      language: 'typescript'
    },
    {
      path: 'src/index.css',
      content: getIndexCSS(),
      language: 'css'
    }
  ]

  // Add template-specific App.tsx
  let appContent = ''
  switch (template) {
    case 'landing-page':
      appContent = getLandingPageApp()
      break
    case 'dashboard':
      appContent = getDashboardApp()
      break
    case 'blog':
      appContent = getBlogApp()
      break
    default:
      appContent = getPlaceholderApp()
  }

  baseFiles.push({
    path: 'src/App.tsx',
    content: appContent,
    language: 'typescript'
  })

  return baseFiles
}
