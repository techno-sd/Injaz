import type { PlatformType, SubPlatformType } from '@/types/app-schema'

export interface TemplateMetadata {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  previewImage: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  techStack: string[]
  features: string[]
  files: { path: string; content: string }[]
  // Platform categorization
  platform?: PlatformType
  subPlatform?: SubPlatformType
  // Thumbnail gradient for UI
  thumbnailGradient?: string
}

export const PROJECT_TEMPLATES: TemplateMetadata[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero, features, and pricing sections',
    category: 'Marketing',
    icon: '🚀',
    tags: ['marketing', 'saas', 'startup'],
    previewImage: '/templates/landing.png',
    difficulty: 'Beginner',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Hero Section', 'Feature Grid', 'Responsive Design', 'Call-to-Action'],
    platform: 'webapp',
    subPlatform: 'landing',
    thumbnailGradient: 'from-amber-500 to-orange-600',
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Home() {
  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for speed and performance', gradient: 'from-amber-500 to-orange-600' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-grade encryption built-in', gradient: 'from-emerald-500 to-teal-600' },
    { icon: '🎨', title: 'Beautiful Design', desc: 'Stunning visuals out of the box', gradient: 'from-violet-500 to-purple-600' },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50K+', label: 'Projects' },
    { value: '4.9★', label: 'Rating' },
  ]

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <nav className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl">✨</div>
            <span className="text-xl font-bold">Lumina</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Now with AI-powered features</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Build the future
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            with AI magic
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Create stunning web applications without writing code. Our AI understands your vision and brings it to life.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105">
            Start Building Free →
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">
          Everything you need
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Powerful features that help you build, deploy, and scale effortlessly.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className={\`w-14 h-14 rounded-2xl bg-gradient-to-br \${feature.gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform\`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600" />
          <div className="relative p-12 md:p-20 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Join thousands of creators building the future today.
            </p>
            <button className="px-10 py-5 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105">
              Start Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 Lumina. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}`
      },
      {
        path: 'app/layout.tsx',
        content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}`
      }
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics dashboard with charts, tables, and metrics',
    category: 'Business',
    icon: '📊',
    tags: ['analytics', 'admin', 'business'],
    previewImage: '/templates/dashboard.png',
    difficulty: 'Intermediate',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Stat Cards', 'Charts', 'Tables', 'Responsive Layout'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Dashboard() {
  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', up: true, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Active Users', value: '2,345', change: '+15.3%', up: true, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Total Orders', value: '1,234', change: '+8.2%', up: true, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Conversion', value: '3.2%', change: '-2.5%', up: false, gradient: 'from-amber-500 to-orange-600' },
  ]

  const chartData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 82 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 70 },
  ]

  const activities = [
    { user: 'Sarah Chen', action: 'completed purchase', amount: '$249.00', time: '2m ago', status: 'success' },
    { user: 'Mike Johnson', action: 'started trial', amount: 'Pro Plan', time: '5m ago', status: 'info' },
    { user: 'Emma Davis', action: 'upgraded plan', amount: '$99.00/mo', time: '12m ago', status: 'success' },
    { user: 'Alex Kim', action: 'submitted ticket', amount: '#4521', time: '25m ago', status: 'warning' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">📊</div>
          <span className="text-xl font-bold">Nexus</span>
        </div>
        <nav className="space-y-1">
          {['Dashboard', 'Customers', 'Orders', 'Analytics', 'Settings'].map((item, i) => (
            <button key={i} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all \${i === 0 ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white border border-violet-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}>
              {item}
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-sm">JD</div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${stat.gradient} flex items-center justify-center shadow-lg\`}>
                    {i === 0 ? '💰' : i === 1 ? '👥' : i === 2 ? '📦' : '📈'}
                  </div>
                  <div className={\`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full \${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}\`}>
                    {stat.up ? '↑' : '↓'} {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold mb-6">Revenue Analytics</h2>
              <div className="relative h-64 flex items-end justify-between gap-4 px-2">
                {chartData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition-all"
                      style={{ height: \`\${item.value * 2}px\` }}
                    />
                    <span className="text-xs text-gray-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold \${activity.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : activity.status === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}\`}>
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm"><span className="font-medium">{activity.user}</span> <span className="text-gray-400">{activity.action}</span></p>
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
        </main>
      </div>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Blog with markdown support, categories, and dark mode',
    category: 'Content',
    icon: '📝',
    tags: ['blog', 'content', 'writing'],
    previewImage: '/templates/blog.png',
    difficulty: 'Beginner',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Post Listing', 'Author Info', 'Date Formatting', 'Responsive'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Blog() {
  const featuredPost = {
    title: 'The Future of Web Development: AI-Powered Design',
    excerpt: 'Explore how artificial intelligence is revolutionizing web development and what it means for the future of digital design.',
    date: '2024-01-20',
    author: 'Sarah Chen',
    readTime: '12 min',
    category: 'Featured',
  }

  const posts = [
    { title: 'Mastering React Server Components', excerpt: 'Deep dive into RSC and build blazing-fast apps.', date: '2024-01-18', author: 'Alex Kim', readTime: '8 min', category: 'React', gradient: 'from-cyan-500 to-blue-600' },
    { title: 'TypeScript 5.0: Game-Changing Features', excerpt: 'Discover powerful new features in TypeScript 5.0.', date: '2024-01-16', author: 'Emma Davis', readTime: '6 min', category: 'TypeScript', gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Building Beautiful UIs with Tailwind', excerpt: 'Learn advanced Tailwind techniques for stunning interfaces.', date: '2024-01-14', author: 'Marcus Johnson', readTime: '10 min', category: 'CSS', gradient: 'from-teal-500 to-emerald-600' },
    { title: 'Next.js 14 App Router Deep Dive', excerpt: 'Everything about the new App Router and migration.', date: '2024-01-12', author: 'Lisa Wang', readTime: '15 min', category: 'Next.js', gradient: 'from-gray-700 to-gray-900' },
    { title: 'State Management in 2024', excerpt: 'Comparing Zustand, Jotai, and Redux Toolkit.', date: '2024-01-10', author: 'David Park', readTime: '9 min', category: 'Architecture', gradient: 'from-orange-500 to-red-600' },
    { title: 'Performance Optimization Secrets', excerpt: 'Advanced techniques for faster web applications.', date: '2024-01-08', author: 'Nina Patel', readTime: '11 min', category: 'Performance', gradient: 'from-amber-500 to-orange-600' },
  ]

  const categories = ['All', 'React', 'TypeScript', 'CSS', 'Next.js', 'Architecture']

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">✨</div>
            <span className="text-xl font-bold">DevBlog</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Articles</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">Subscribe</button>
          </div>
        </nav>
      </header>

      {/* Featured Post */}
      <section className="container mx-auto px-6 py-16">
        <div className="relative group rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium">{featuredPost.category}</span>
              <span className="flex items-center gap-1 text-amber-400 text-sm">🔥 Trending</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{featuredPost.title}</h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">{featuredPost.excerpt}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-sm">SC</div>
                <div>
                  <div className="font-medium">{featuredPost.author}</div>
                  <div className="text-sm text-gray-500">{featuredPost.date} · {featuredPost.readTime}</div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">Read Article →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat, i) => (
            <button key={i} className={\`px-5 py-2.5 rounded-xl font-medium transition-all \${i === 0 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}\`}>{cat}</button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <article key={i} className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className={\`h-32 bg-gradient-to-r \${post.gradient} flex items-center justify-center relative\`}>
                <div className="absolute inset-0 bg-black/20" />
                <span className="relative text-4xl group-hover:scale-110 transition-transform">{post.category === 'React' ? '⚛️' : post.category === 'TypeScript' ? '📘' : post.category === 'CSS' ? '🎨' : post.category === 'Next.js' ? '▲' : post.category === 'Architecture' ? '🏗️' : '⚡'}</span>
              </div>
              <div className="p-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium">{post.category}</span>
                <h2 className="text-xl font-bold mt-4 mb-3 group-hover:text-violet-400 transition-colors">{post.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/50 to-purple-500/50 flex items-center justify-center text-xs font-bold">{post.author.split(' ').map(n => n[0]).join('')}</div>
                    <span className="text-sm text-gray-400">{post.author}</span>
                  </div>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
          <div className="relative p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay ahead of the curve</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Get weekly insights on web development delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-colors">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 DevBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Product catalog with cart and checkout',
    category: 'E-Commerce',
    icon: '🛍️',
    tags: ['shop', 'store', 'products'],
    previewImage: '/templates/ecommerce.png',
    difficulty: 'Advanced',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Product Grid', 'Shopping Cart', 'Product Cards', 'Responsive'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Shop() {
  const products = [
    { id: 1, name: 'Premium Sneakers', price: 129.99, oldPrice: 179.99, image: '👟', category: 'Footwear', gradient: 'from-rose-100 to-pink-100', rating: 4.8, reviews: 234 },
    { id: 2, name: 'Smart Watch Pro', price: 299.99, image: '⌚', category: 'Electronics', gradient: 'from-blue-100 to-cyan-100', rating: 4.9, reviews: 567 },
    { id: 3, name: 'Wireless Headphones', price: 199.99, oldPrice: 249.99, image: '🎧', category: 'Audio', gradient: 'from-violet-100 to-purple-100', rating: 4.7, reviews: 432 },
    { id: 4, name: 'Designer Backpack', price: 89.99, image: '🎒', category: 'Accessories', gradient: 'from-amber-100 to-orange-100', rating: 4.6, reviews: 189 },
    { id: 5, name: 'Fitness Tracker', price: 79.99, oldPrice: 99.99, image: '💪', category: 'Fitness', gradient: 'from-emerald-100 to-teal-100', rating: 4.5, reviews: 321 },
    { id: 6, name: 'Portable Speaker', price: 149.99, image: '🔊', category: 'Audio', gradient: 'from-indigo-100 to-blue-100', rating: 4.8, reviews: 278 },
    { id: 7, name: 'Leather Wallet', price: 59.99, image: '👛', category: 'Accessories', gradient: 'from-yellow-100 to-amber-100', rating: 4.4, reviews: 156 },
    { id: 8, name: 'Sunglasses', price: 119.99, oldPrice: 159.99, image: '🕶️', category: 'Fashion', gradient: 'from-gray-100 to-slate-100', rating: 4.7, reviews: 298 },
  ]

  const categories = ['All', 'Footwear', 'Electronics', 'Audio', 'Accessories', 'Fitness', 'Fashion']

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">🛍️</div>
            <span className="text-xl font-bold">Luxe Store</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Shop</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">🔍</button>
            <button className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">
              🛒 Cart
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="container mx-auto px-6 py-16">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
          <div className="relative p-12 md:p-16 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">🔥 Limited Time Offer</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Summer Collection 2024</h1>
            <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">Up to 50% off on selected items. Free shipping on orders over $100.</p>
            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105">Shop Now →</button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat, i) => (
            <button key={i} className={\`px-5 py-2.5 rounded-xl font-medium transition-all \${i === 0 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}\`}>{cat}</button>
          ))}
        </div>
      </section>

      {/* Products */}
      <main className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className={\`h-48 bg-gradient-to-br \${product.gradient} flex items-center justify-center relative\`}>
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{product.image}</span>
                {product.oldPrice && <span className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded-lg">SALE</span>}
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">❤️</button>
              </div>
              <div className="p-5">
                <span className="text-xs text-gray-400">{product.category}</span>
                <h3 className="font-semibold text-lg mt-1 mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400 text-sm">★ {product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-violet-400">\${product.price}</span>
                    {product.oldPrice && <span className="text-sm text-gray-500 line-through">\${product.oldPrice}</span>}
                  </div>
                </div>
                <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 Luxe Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio with projects and contact form',
    category: 'Personal',
    icon: '💼',
    tags: ['portfolio', 'personal', 'showcase'],
    previewImage: '/templates/portfolio.png',
    difficulty: 'Beginner',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Hero Section', 'Project Grid', 'Gradient Design', 'Dark Mode'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Portfolio() {
  const skills = [
    { name: 'React', color: 'from-cyan-500 to-blue-600' },
    { name: 'TypeScript', color: 'from-blue-500 to-indigo-600' },
    { name: 'Node.js', color: 'from-emerald-500 to-teal-600' },
    { name: 'Python', color: 'from-amber-500 to-orange-600' },
    { name: 'Next.js', color: 'from-gray-600 to-gray-800' },
    { name: 'Tailwind', color: 'from-cyan-400 to-blue-500' },
  ]

  const projects = [
    { title: 'AI Dashboard', desc: 'Real-time analytics platform with ML predictions', gradient: 'from-violet-500 to-purple-600', tags: ['React', 'Python', 'ML'] },
    { title: 'E-Commerce App', desc: 'Full-stack shopping platform with payments', gradient: 'from-emerald-500 to-teal-600', tags: ['Next.js', 'Stripe'] },
    { title: 'Social Network', desc: 'Real-time chat and social features', gradient: 'from-rose-500 to-pink-600', tags: ['React', 'Firebase'] },
    { title: 'SaaS Platform', desc: 'Multi-tenant application with billing', gradient: 'from-amber-500 to-orange-600', tags: ['Node.js', 'PostgreSQL'] },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-2xl opacity-50" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center text-5xl">👨‍💻</div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Available for work</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">John Doe</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">Full-Stack Developer crafting beautiful, performant web experiences with modern technologies.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-105">View Projects →</button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">Contact Me</button>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill, i) => (
            <span key={i} className={\`px-4 py-2 rounded-xl bg-gradient-to-r \${skill.color} text-sm font-medium\`}>{skill.name}</span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Featured Projects</h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">A selection of my recent work</p>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div key={i} className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className={\`h-48 bg-gradient-to-r \${project.gradient} flex items-center justify-center relative\`}>
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{i === 0 ? '📊' : i === 1 ? '🛒' : i === 2 ? '💬' : '🚀'}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, j) => (
                    <span key={j} className="px-3 py-1 bg-white/10 rounded-lg text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-6 py-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600" />
          <div className="relative p-12 md:p-20 text-center">
            <h2 className="text-4xl font-bold mb-6">Let's Work Together</h2>
            <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">Have a project in mind? I'd love to hear about it.</p>
            <button className="px-10 py-5 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105">Get In Touch →</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 John Doe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'saas',
    name: 'SaaS App',
    description: 'SaaS application with pricing, features, and signup',
    category: 'Business',
    icon: '☁️',
    tags: ['saas', 'startup', 'business'],
    previewImage: '/templates/saas.png',
    difficulty: 'Intermediate',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Pricing Cards', 'Hero Section', 'Feature Lists', 'CTA Buttons'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function SaaS() {
  const plans = [
    { name: 'Starter', price: 9, features: ['5 Team Members', '10 Projects', 'Basic Analytics', 'Email Support'], icon: '🚀', gradient: 'from-gray-500 to-gray-700' },
    { name: 'Pro', price: 29, features: ['25 Team Members', 'Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'API Access'], icon: '⚡', gradient: 'from-violet-500 to-purple-600', popular: true },
    { name: 'Enterprise', price: 99, features: ['Unlimited Members', 'Unlimited Projects', 'Custom Analytics', '24/7 Support', 'Custom Integrations', 'SLA'], icon: '🏢', gradient: 'from-cyan-500 to-blue-600' },
  ]

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for performance' },
    { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security' },
    { icon: '📊', title: 'Analytics', desc: 'Real-time insights' },
    { icon: '🔌', title: 'Integrations', desc: '100+ apps supported' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">☁️</div>
            <span className="text-xl font-bold">CloudFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">Start Free</button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          <span className="text-sm text-violet-300">New: AI-powered automation</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Supercharge your
          <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">workflow today</span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">The all-in-one platform that helps modern teams collaborate, automate, and scale faster.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-105">Start Free Trial →</button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">Watch Demo</button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 text-center">
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">No hidden fees. Cancel anytime.</p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={\`relative rounded-2xl bg-white/5 backdrop-blur-sm border \${plan.popular ? 'border-violet-500/50 scale-105' : 'border-white/10'} overflow-hidden transition-all duration-300 hover:-translate-y-1\`}>
              {plan.popular && <div className="absolute top-0 left-0 right-0 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-center text-sm font-medium">Most Popular</div>}
              <div className={\`p-8 \${plan.popular ? 'pt-12' : ''}\`}>
                <div className={\`w-14 h-14 rounded-2xl bg-gradient-to-br \${plan.gradient} flex items-center justify-center text-2xl mb-6\`}>{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold">\${plan.price}</span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={\`w-full py-4 rounded-xl font-semibold transition-all \${plan.popular ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-lg hover:shadow-violet-500/25' : 'bg-white/5 border border-white/10 hover:bg-white/10'}\`}>Get Started</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 CloudFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'auth-pages',
    name: 'Authentication',
    description: 'Login and signup pages with modern UI and validation',
    category: 'Authentication',
    icon: '🔐',
    tags: ['auth', 'login', 'security'],
    previewImage: '/templates/auth.png',
    difficulty: 'Intermediate',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Login Form', 'Signup Form', 'Validation', 'Responsive'],
    files: [
      {
        path: 'app/login/page.tsx',
        content: `export default function Login() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-8">✨</div>
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Lumina</h1>
          <p className="text-xl text-white/80 text-center max-w-md">The all-in-one platform for building amazing products.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">✨</div>
            <span className="text-2xl font-bold">Lumina</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-400">Enter your credentials to access your account</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" placeholder="••••••••" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5" />
                Remember me
              </label>
              <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
            </div>

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-[1.02]">Sign In</button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-slate-950 text-gray-500">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-xl">🔵</span>
              <span className="font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-xl">⚫</span>
              <span className="font-medium">GitHub</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account? <a href="/signup" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'admin-panel',
    name: 'Admin Panel',
    description: 'Complete admin dashboard with sidebar navigation and data management',
    category: 'Business',
    icon: '⚙️',
    tags: ['admin', 'dashboard', 'management'],
    previewImage: '/templates/admin.png',
    difficulty: 'Advanced',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Sidebar Navigation', 'Data Tables', 'User Management', 'Settings'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function AdminPanel() {
  const navItems = ['Dashboard', 'Users', 'Products', 'Analytics', 'Settings']
  const users = [
    { id: 1, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Admin', status: 'Active', avatar: 'SC' },
    { id: 2, name: 'Mike Johnson', email: 'mike@example.com', role: 'Editor', status: 'Active', avatar: 'MJ' },
    { id: 3, name: 'Emma Davis', email: 'emma@example.com', role: 'Viewer', status: 'Active', avatar: 'ED' },
    { id: 4, name: 'Alex Kim', email: 'alex@example.com', role: 'Editor', status: 'Inactive', avatar: 'AK' },
    { id: 5, name: 'Lisa Wang', email: 'lisa@example.com', role: 'Viewer', status: 'Active', avatar: 'LW' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">⚙️</div>
          <span className="text-xl font-bold">AdminX</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item, i) => (
            <button key={i} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left \${i === 1 ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white border border-violet-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}>{item}</button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-gray-400">Manage users and permissions</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">+ Add User</button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-sm">AD</div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: '1,234', change: '+12%', up: true },
              { label: 'Active Now', value: '42', change: '+5%', up: true },
              { label: 'New Today', value: '18', change: '+8%', up: true },
              { label: 'Pending', value: '7', change: '-2%', up: false },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={\`text-xs font-medium \${stat.up ? 'text-emerald-400' : 'text-red-400'}\`}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <input type="text" placeholder="Search users..." className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-violet-500/50 w-64" />
              <div className="flex items-center gap-2 text-sm text-gray-400">
                Showing <span className="text-white font-medium">5</span> of <span className="text-white font-medium">1,234</span>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold \${user.status === 'Active' ? 'bg-violet-500/20 text-violet-400' : 'bg-gray-500/20 text-gray-400'}\`}>{user.avatar}</div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={\`px-3 py-1 text-xs font-medium rounded-full \${user.role === 'Admin' ? 'bg-violet-500/20 text-violet-400' : user.role === 'Editor' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}\`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={\`flex items-center gap-2 text-sm \${user.status === 'Active' ? 'text-emerald-400' : 'text-gray-500'}\`}>
                        <span className={\`w-2 h-2 rounded-full \${user.status === 'Active' ? 'bg-emerald-400' : 'bg-gray-500'}\`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">✏️</button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Kanban-style task management with drag-and-drop',
    category: 'Productivity',
    icon: '✅',
    tags: ['tasks', 'productivity', 'kanban'],
    previewImage: '/templates/tasks.png',
    difficulty: 'Intermediate',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Kanban Board', 'Task Cards', 'Status Columns', 'Add Tasks'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function TaskManager() {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'amber', tasks: [
      { id: 1, title: 'Design new landing page', priority: 'High', assignee: 'SC', dueDate: 'Jan 25' },
      { id: 2, title: 'Update API documentation', priority: 'Low', assignee: 'MJ', dueDate: 'Jan 28' },
      { id: 3, title: 'Review PRs', priority: 'Medium', assignee: 'ED', dueDate: 'Jan 24' },
    ]},
    { id: 'progress', title: 'In Progress', color: 'violet', tasks: [
      { id: 4, title: 'Build authentication system', priority: 'High', assignee: 'AK', dueDate: 'Jan 22' },
      { id: 5, title: 'Implement dark mode', priority: 'Medium', assignee: 'LW', dueDate: 'Jan 26' },
    ]},
    { id: 'review', title: 'In Review', color: 'cyan', tasks: [
      { id: 6, title: 'Payment integration', priority: 'High', assignee: 'SC', dueDate: 'Jan 21' },
    ]},
    { id: 'done', title: 'Done', color: 'emerald', tasks: [
      { id: 7, title: 'Setup project structure', priority: 'Medium', assignee: 'MJ', dueDate: 'Jan 15' },
      { id: 8, title: 'Install dependencies', priority: 'Low', assignee: 'ED', dueDate: 'Jan 14' },
    ]},
  ]

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getColumnColor = (color: string) => ({
    amber: 'from-amber-500 to-orange-600',
    violet: 'from-violet-500 to-purple-600',
    cyan: 'from-cyan-500 to-blue-600',
    emerald: 'from-emerald-500 to-teal-600',
  }[color])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">✅</div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">+ New Task</button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-sm">JD</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: '24', icon: '📋' },
            { label: 'In Progress', value: '8', icon: '🔄' },
            { label: 'Completed', value: '12', icon: '✅' },
            { label: 'Due Today', value: '3', icon: '⚡' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={\`w-3 h-3 rounded-full bg-gradient-to-r \${getColumnColor(column.color)}\`}></div>
                  <h2 className="font-semibold">{column.title}</h2>
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{column.tasks.length}</span>
                </div>
                <button className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400">+</button>
              </div>

              <div className="space-y-3">
                {column.tasks.map(task => (
                  <div key={task.id} className={\`group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer \${column.id === 'done' ? 'opacity-60' : ''}\`}>
                    <div className="flex items-start justify-between mb-3">
                      <p className={\`font-medium \${column.id === 'done' ? 'line-through text-gray-500' : ''}\`}>{task.title}</p>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-gray-400">⋮</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={\`text-xs px-2 py-1 rounded-full border \${getPriorityStyles(task.priority)}\`}>{task.priority}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/50 to-purple-500/50 flex items-center justify-center text-[10px] font-bold">{task.assignee}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {column.id === 'todo' && (
                  <button className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:border-white/30 hover:text-gray-300 transition-colors">+ Add Task</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}`
      }
    ]
  },
  {
    id: 'docs-site',
    name: 'Documentation Site',
    description: 'Technical documentation site with sidebar navigation and search',
    category: 'Content',
    icon: '📚',
    tags: ['docs', 'documentation', 'technical'],
    previewImage: '/templates/docs.png',
    difficulty: 'Intermediate',
    techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript'],
    features: ['Sidebar Navigation', 'Search', 'Code Blocks', 'Table of Contents'],
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Docs() {
  const navSections = [
    { title: 'Getting Started', items: [
      { name: 'Introduction', active: true },
      { name: 'Installation' },
      { name: 'Quick Start' },
      { name: 'Configuration' },
    ]},
    { title: 'Core Concepts', items: [
      { name: 'Components' },
      { name: 'Routing' },
      { name: 'State Management' },
      { name: 'API Reference' },
    ]},
    { title: 'Advanced', items: [
      { name: 'Performance' },
      { name: 'Testing' },
      { name: 'Deployment' },
    ]},
  ]

  const tocItems = ['Overview', 'Installation', 'Quick Start', 'Example', 'Next Steps']

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 hidden lg:block fixed left-0 top-0 bottom-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">📚</div>
          <span className="text-xl font-bold">Docs</span>
        </div>

        <div className="relative mb-8">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input type="search" placeholder="Search docs..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-colors" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/10 rounded text-xs text-gray-500">⌘K</kbd>
        </div>

        <nav className="space-y-6">
          {navSections.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className={\`block py-2 px-3 rounded-lg transition-colors \${item.active ? 'bg-violet-500/20 text-violet-400 border-l-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}>{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 lg:pl-64 lg:pr-64">
        <div className="max-w-3xl mx-auto px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <span>→</span>
            <a href="#" className="hover:text-white transition-colors">Getting Started</a>
            <span>→</span>
            <span className="text-violet-400">Introduction</span>
          </div>

          <article>
            <h1 className="text-4xl font-bold mb-4">Introduction</h1>
            <p className="text-xl text-gray-400 mb-8">Welcome to the documentation. Learn how to build amazing applications with our platform.</p>

            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <span className="text-violet-400">#</span> Installation
            </h2>
            <p className="text-gray-300 mb-4">Get started by installing the package using your preferred package manager:</p>
            <div className="relative group rounded-xl bg-gray-900/50 border border-white/10 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                <span className="text-xs text-gray-500">Terminal</span>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">Copy</button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm"><code className="text-emerald-400">npm install @lumina/core</code></pre>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <span className="text-violet-400">#</span> Quick Start
            </h2>
            <p className="text-gray-300 mb-4">Here's a simple example to get you started:</p>
            <div className="relative group rounded-xl bg-gray-900/50 border border-white/10 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                <span className="text-xs text-gray-500">app.tsx</span>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">Copy</button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm"><code><span className="text-violet-400">import</span> <span className="text-cyan-400">{'{ Component }'}</span> <span className="text-violet-400">from</span> <span className="text-emerald-400">'@lumina/core'</span>

<span className="text-violet-400">export default function</span> <span className="text-cyan-400">App</span>() {'{'}
  <span className="text-violet-400">return</span> {'<'}<span className="text-cyan-400">Component</span> {'/>'}
{'}'}</code></pre>
            </div>

            {/* Callout */}
            <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-6 my-8">
              <div className="flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-violet-400 mb-1">Pro Tip</p>
                  <p className="text-gray-300">Check out our examples repository for more advanced use cases and patterns.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <span className="text-violet-400">#</span> Next Steps
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {['Learn Components', 'Explore Routing', 'State Management', 'Best Practices'].map((item, i) => (
                <a key={i} href="#" className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all">
                  <div className="font-semibold group-hover:text-violet-400 transition-colors">{item}</div>
                  <div className="text-sm text-gray-500">Learn more →</div>
                </a>
              ))}
            </div>
          </article>

          {/* Footer Nav */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/5">
            <div></div>
            <a href="#" className="group flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
              Next: Installation
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </main>

      {/* Table of Contents */}
      <aside className="w-64 border-l border-white/5 p-6 hidden lg:block fixed right-0 top-0 bottom-0 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">On This Page</h3>
        <ul className="space-y-2 text-sm">
          {tocItems.map((item, i) => (
            <li key={i}>
              <a href="#" className={\`block py-1 transition-colors \${i === 0 ? 'text-violet-400' : 'text-gray-400 hover:text-white'}\`}>{item}</a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}`
      }
    ]
  }
]

// Modern SaaS Dashboard Template
const SAAS_DASHBOARD_TEMPLATE: TemplateMetadata = {
  id: 'modern-saas-dashboard',
  name: 'Modern SaaS Dashboard',
  description: 'Production-ready dashboard with charts, metrics, and dark mode. Built with Next.js 14 and shadcn/ui patterns.',
  category: 'Business',
  icon: '📈',
  tags: ['dashboard', 'saas', 'analytics', 'charts', 'modern'],
  previewImage: '/templates/modern-dashboard.png',
  difficulty: 'Intermediate',
  techStack: ['Next.js 14', 'Tailwind CSS', 'TypeScript', 'Framer Motion'],
  features: ['Interactive Charts', 'Real-time Metrics', 'Dark Mode', 'Responsive Sidebar', 'Data Tables'],
  files: [
    {
      path: 'app/page.tsx',
      content: `import { ArrowUpRight, ArrowDownRight, Users, DollarSign, ShoppingCart, Activity, MoreHorizontal, Search, Bell, Settings, LogOut, ChevronRight, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', changeType: 'positive', icon: DollarSign, color: 'emerald' },
    { name: 'Active Users', value: '2,350', change: '+15.2%', changeType: 'positive', icon: Users, color: 'violet' },
    { name: 'Total Orders', value: '12,234', change: '+5.4%', changeType: 'positive', icon: ShoppingCart, color: 'blue' },
    { name: 'Conversion Rate', value: '3.24%', change: '-0.5%', changeType: 'negative', icon: Activity, color: 'amber' },
  ]

  const chartData = [
    { name: 'Jan', revenue: 4000, orders: 2400 },
    { name: 'Feb', revenue: 3000, orders: 1398 },
    { name: 'Mar', revenue: 2000, orders: 9800 },
    { name: 'Apr', revenue: 2780, orders: 3908 },
    { name: 'May', revenue: 1890, orders: 4800 },
    { name: 'Jun', revenue: 2390, orders: 3800 },
    { name: 'Jul', revenue: 3490, orders: 4300 },
  ]

  const recentOrders = [
    { id: '#3210', customer: 'Olivia Martin', email: 'olivia@email.com', amount: '$316.00', status: 'Completed' },
    { id: '#3209', customer: 'Jackson Lee', email: 'jackson@email.com', amount: '$242.00', status: 'Processing' },
    { id: '#3208', customer: 'Isabella Nguyen', email: 'isabella@email.com', amount: '$837.00', status: 'Completed' },
    { id: '#3207', customer: 'William Kim', email: 'william@email.com', amount: '$874.00', status: 'Pending' },
    { id: '#3206', customer: 'Sofia Davis', email: 'sofia@email.com', amount: '$721.00', status: 'Completed' },
  ]

  const maxRevenue = Math.max(...chartData.map(d => d.revenue))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f14] border-r border-white/[0.06] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Analytics</span>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {['Dashboard', 'Analytics', 'Customers', 'Products', 'Orders', 'Settings'].map((item, i) => (
            <button
              key={item}
              className={\`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-xl text-left transition-all \${
                i === 0
                  ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white border border-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }\`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-semibold">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-white/40 truncate">john@company.com</p>
            </div>
            <button className="p-2 hover:bg-white/[0.06] rounded-lg text-white/40 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-white/40">Welcome back, here's what's happening</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <button className="relative p-2.5 hover:bg-white/[0.06] rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
            </button>
            <button className="p-2.5 hover:bg-white/[0.06] rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.name} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={\`w-12 h-12 rounded-xl bg-\${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform\`}>
                      <Icon className={\`w-6 h-6 text-\${stat.color}-400\`} />
                    </div>
                    <span className={\`flex items-center gap-1 text-sm font-medium \${
                      stat.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'
                    }\`}>
                      {stat.changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-white/40">{stat.name}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Chart */}
            <div className="col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Revenue Overview</h2>
                  <p className="text-sm text-white/40">Monthly revenue performance</p>
                </div>
                <select className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm focus:outline-none focus:border-violet-500/50">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-64 flex items-end gap-4">
                {chartData.map((item, i) => (
                  <div key={item.name} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-violet-500 to-purple-500 rounded-t-lg hover:from-violet-400 hover:to-purple-400 transition-all cursor-pointer"
                      style={{ height: \`\${(item.revenue / maxRevenue) * 100}%\` }}
                    />
                    <span className="text-xs text-white/40">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Top Products</h2>
                <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Premium Plan', sales: 2341, growth: '+12%' },
                  { name: 'Enterprise', sales: 1832, growth: '+8%' },
                  { name: 'Basic Plan', sales: 1456, growth: '+5%' },
                  { name: 'Starter', sales: 987, growth: '+3%' },
                ].map((product, i) => (
                  <div key={product.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center text-lg \${
                        i === 0 ? 'bg-violet-500/20' : 'bg-white/[0.06]'
                      }\`}>
                        {i === 0 ? '👑' : i === 1 ? '💎' : i === 2 ? '⭐' : '🚀'}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-white/40">{product.sales.toLocaleString()} sales</p>
                      </div>
                    </div>
                    <span className="text-sm text-emerald-400">{product.growth}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <p className="text-sm text-white/40">Latest transactions from your store</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-white/40">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={\`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium \${
                          order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }\`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}`
    },
    {
      path: 'app/layout.tsx',
      content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Modern SaaS analytics dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`
    },
    {
      path: 'app/globals.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 10 10 15;
  --foreground: 255 255 255;
}

body {
  background-color: rgb(var(--background));
  color: rgb(var(--foreground));
}`
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`
    },
    {
      path: 'package.json',
      content: `{
  "name": "modern-saas-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.396.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.14.9",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  }
}`
    }
  ]
}

// Add the new template to the array
PROJECT_TEMPLATES.push(SAAS_DASHBOARD_TEMPLATE)

export type Template = TemplateMetadata
