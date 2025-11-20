export const PROJECT_TEMPLATES = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero, features, and pricing sections',
    category: 'Marketing',
    icon: '🚀',
    tags: ['marketing', 'saas', 'startup'],
    previewImage: '/templates/landing.png',
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
  }
]

export type Template = typeof PROJECT_TEMPLATES[number]
