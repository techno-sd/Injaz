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
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Your App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build something amazing with our platform
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Fast</h3>
              <p className="text-gray-600">Lightning-fast performance</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-gray-600">Enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Beautiful</h3>
              <p className="text-gray-600">Stunning design</p>
            </div>
          </div>
        </div>
      </section>
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
      <body>{children}</body>
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
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total Users</div>
            <div className="text-3xl font-bold mt-2">1,234</div>
            <div className="text-green-500 text-sm mt-2">+12.5%</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Revenue</div>
            <div className="text-3xl font-bold mt-2">$12,345</div>
            <div className="text-green-500 text-sm mt-2">+8.2%</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Active Projects</div>
            <div className="text-3xl font-bold mt-2">42</div>
            <div className="text-blue-500 text-sm mt-2">+3</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Completion Rate</div>
            <div className="text-3xl font-bold mt-2">94%</div>
            <div className="text-green-500 text-sm mt-2">+2.1%</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart goes here
          </div>
        </div>
      </main>
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
  const posts = [
    {
      title: "Getting Started with Next.js",
      excerpt: "Learn the basics of building modern web applications",
      date: "2024-01-15",
      author: "John Doe"
    },
    {
      title: "The Future of Web Development",
      excerpt: "Exploring upcoming trends and technologies",
      date: "2024-01-10",
      author: "Jane Smith"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">My Blog</h1>
          <p className="text-gray-600">Thoughts, stories, and ideas</p>
        </div>
      </header>

      {/* Posts */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          {posts.map((post, i) => (
            <article key={i} className="border-b pb-8">
              <h2 className="text-3xl font-bold mb-2 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
              <div className="text-sm text-gray-500 mb-4">
                {post.date} · {post.author}
              </div>
              <p className="text-gray-700 text-lg mb-4">{post.excerpt}</p>
              <button className="text-blue-600 hover:underline">
                Read more →
              </button>
            </article>
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
    { id: 1, name: "Product 1", price: 29.99, image: "🎨" },
    { id: 2, name: "Product 2", price: 39.99, image: "🎮" },
    { id: 3, name: "Product 3", price: 49.99, image: "📱" },
    { id: 4, name: "Product 4", price: 59.99, image: "💻" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Shop</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Cart (0)
          </button>
        </div>
      </header>

      {/* Products */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Products</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl">
                {product.image}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  \${product.price}
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Add to Cart
                </button>
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
        <h1 className="text-5xl font-bold mb-4">John Doe</h1>
        <p className="text-xl text-gray-300 mb-8">Full-Stack Developer</p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700">
            View Work
          </button>
          <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-gray-900">
            Contact Me
          </button>
        </div>
      </section>

      {/* Projects */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Project {i}</h3>
                <p className="text-gray-400 mb-4">
                  A description of this amazing project
                </p>
                <button className="text-blue-400 hover:underline">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
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
    icon: '🚀',
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
    { name: "Starter", price: 9, features: ["5 Projects", "1GB Storage", "Email Support"] },
    { name: "Pro", price: 29, features: ["Unlimited Projects", "10GB Storage", "Priority Support", "Advanced Analytics"] },
    { name: "Enterprise", price: 99, features: ["Everything in Pro", "Custom Domain", "24/7 Support", "SLA"] }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            The All-in-One Platform for Your Business
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Everything you need to manage and grow your business
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className="border rounded-lg p-8 hover:shadow-lg transition">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  \${plan.price}<span className="text-lg text-gray-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </a>
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
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin</h1>
        </div>
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-3 bg-blue-600 rounded-lg">Dashboard</a>
          <a href="#" className="block px-4 py-3 hover:bg-gray-800 rounded-lg">Users</a>
          <a href="#" className="block px-4 py-3 hover:bg-gray-800 rounded-lg">Analytics</a>
          <a href="#" className="block px-4 py-3 hover:bg-gray-800 rounded-lg">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage users and permissions</p>
        </header>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`px-3 py-1 text-sm rounded-full \${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }\`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
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
  const columns = {
    todo: [
      { id: 1, title: 'Design new landing page', priority: 'High' },
      { id: 2, title: 'Update documentation', priority: 'Low' }
    ],
    inProgress: [
      { id: 3, title: 'Build authentication', priority: 'High' }
    ],
    done: [
      { id: 4, title: 'Setup project', priority: 'Medium' },
      { id: 5, title: 'Install dependencies', priority: 'Low' }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Task Manager</h1>
        <p className="text-gray-600">Organize your work efficiently</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
              To Do
            </h2>
            <span className="text-sm text-gray-500">{columns.todo.length}</span>
          </div>
          <div className="space-y-3">
            {columns.todo.map(task => (
              <div key={task.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition cursor-pointer">
                <p className="font-medium mb-2">{task.title}</p>
                <span className={\`text-xs px-2 py-1 rounded \${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'Medium'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-200 text-gray-700'
                }\`}>
                  {task.priority}
                </span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600">
              + Add Task
            </button>
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
              In Progress
            </h2>
            <span className="text-sm text-gray-500">{columns.inProgress.length}</span>
          </div>
          <div className="space-y-3">
            {columns.inProgress.map(task => (
              <div key={task.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition cursor-pointer">
                <p className="font-medium mb-2">{task.title}</p>
                <span className={\`text-xs px-2 py-1 rounded \${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'Medium'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-200 text-gray-700'
                }\`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-3 w-3 bg-green-500 rounded-full"></span>
              Done
            </h2>
            <span className="text-sm text-gray-500">{columns.done.length}</span>
          </div>
          <div className="space-y-3">
            {columns.done.map(task => (
              <div key={task.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500 hover:shadow-md transition cursor-pointer opacity-75">
                <p className="font-medium mb-2 line-through">{task.title}</p>
                <span className={\`text-xs px-2 py-1 rounded \${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'Medium'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-200 text-gray-700'
                }\`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Documentation</h1>
          <input
            type="search"
            placeholder="Search docs..."
            className="w-full mt-4 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <nav className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Getting Started</h3>
            <ul className="space-y-1">
              <li><a href="#" className="block py-1 text-blue-600 font-medium">Introduction</a></li>
              <li><a href="#" className="block py-1 hover:text-blue-600">Installation</a></li>
              <li><a href="#" className="block py-1 hover:text-blue-600">Quick Start</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Core Concepts</h3>
            <ul className="space-y-1">
              <li><a href="#" className="block py-1 hover:text-blue-600">Components</a></li>
              <li><a href="#" className="block py-1 hover:text-blue-600">Routing</a></li>
              <li><a href="#" className="block py-1 hover:text-blue-600">State Management</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-4xl p-12">
        <article className="prose prose-lg">
          <h1>Introduction</h1>
          <p className="text-xl text-gray-600">
            Welcome to our documentation. Learn how to build amazing applications.
          </p>

          <h2>Installation</h2>
          <p>Get started by installing the package:</p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>npm install my-package</code>
          </pre>

          <h2>Quick Start</h2>
          <p>Here's a simple example to get you started:</p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{\`import { Component } from 'my-package'

function App() {
  return <Component />
}\`}</code>
          </pre>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
            <p className="font-semibold text-blue-900">Pro Tip</p>
            <p className="text-blue-800 mt-1">
              Check out our examples repository for more advanced use cases.
            </p>
          </div>

          <h2>Next Steps</h2>
          <ul>
            <li>Read about <a href="#" className="text-blue-600 hover:underline">Components</a></li>
            <li>Learn about <a href="#" className="text-blue-600 hover:underline">Routing</a></li>
            <li>Explore <a href="#" className="text-blue-600 hover:underline">Best Practices</a></li>
          </ul>
        </article>
      </main>

      {/* Table of Contents */}
      <aside className="w-64 border-l p-6 hidden lg:block">
        <h3 className="text-sm font-semibold mb-4">On This Page</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="text-blue-600 hover:underline">Installation</a></li>
          <li><a href="#" className="hover:text-blue-600">Quick Start</a></li>
          <li><a href="#" className="hover:text-blue-600">Next Steps</a></li>
        </ul>
      </aside>
    </div>
  )
}`
      }
    ]
  }
]

export type Template = TemplateMetadata
