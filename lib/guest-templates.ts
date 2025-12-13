// HTML templates for guest/demo users (no authentication required)
// These work with the WebContainer static file server
// Updated to use pure CSS instead of Tailwind CDN for blob URL compatibility

export interface GuestTemplate {
  id: string
  name: string
  icon: string
  description: string
  files: { path: string; content: string }[]
}

export const GUEST_TEMPLATES: Record<string, GuestTemplate> = {
  blank: {
    id: 'blank',
    name: 'Blank Project',
    icon: '📄',
    description: 'Start from scratch',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Animated Background -->
  <div class="bg-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <!-- Grid Pattern Overlay -->
  <div class="grid-pattern"></div>

  <div class="content-wrapper">
    <div class="container">
      <div class="text-center fade-in-up">
        <!-- Logo/Icon -->
        <div class="logo-icon">
          <span>✨</span>
        </div>

        <h1 class="hero-title">
          Welcome to iEditor!
        </h1>
        <p class="hero-subtitle">
          Start building your app by chatting with AI. Transform your ideas into reality.
        </p>
        <div class="button-group">
          <button class="btn btn-primary">Get Started</button>
          <button class="btn btn-secondary">Learn More</button>
        </div>

        <!-- Stats/Features Pills -->
        <div class="feature-pills">
          <div class="pill">⚡ Lightning Fast</div>
          <div class="pill">🎨 Beautiful Design</div>
          <div class="pill">🤖 AI Powered</div>
        </div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
  overflow-x: hidden;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(30px, 10px) scale(1.05); }
}

/* Background */
.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: blob 7s infinite;
}

.blob-1 {
  top: 25%;
  left: -8rem;
  width: 24rem;
  height: 24rem;
  background: rgba(139, 92, 246, 0.3);
}

.blob-2 {
  top: 50%;
  right: -8rem;
  width: 24rem;
  height: 24rem;
  background: rgba(6, 182, 212, 0.2);
  animation-delay: 2s;
}

.blob-3 {
  bottom: 25%;
  left: 50%;
  width: 20rem;
  height: 20rem;
  background: rgba(217, 70, 239, 0.2);
  animation-delay: 4s;
}

.grid-pattern {
  position: fixed;
  inset: 0;
  opacity: 0.02;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
}

/* Layout */
.content-wrapper {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.text-center {
  text-align: center;
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

/* Logo */
.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  margin-bottom: 2rem;
  border-radius: 1rem;
  background: linear-gradient(to bottom right, #8b5cf6, #d946ef);
  box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.25);
  animation: float 6s ease-in-out infinite;
}

.logo-icon span {
  font-size: 2rem;
}

/* Typography */
.hero-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #ffffff, #c4b5fd, #a5f3fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: #94a3b8;
  margin-bottom: 3rem;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Buttons */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 4rem;
  align-items: center;
}

@media (min-width: 640px) {
  .button-group {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #d946ef);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(to right, #7c3aed, #c026d3);
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.5), 0 0 30px rgba(217, 70, 239, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
  color: #c4b5fd;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

/* Feature Pills */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.pill {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  color: #cbd5e1;
  transition: all 0.3s;
  cursor: pointer;
}

.pill:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
  transform: translateY(-2px);
}

html {
  scroll-behavior: smooth;
}`,
      },
      {
        path: 'app.js',
        content: `// Modern JavaScript with enhanced interactions
console.log('🚀 Welcome to iEditor!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ App loaded successfully!');

  // Add staggered animation to elements
  const animatedElements = document.querySelectorAll('.fade-in-up');
  animatedElements.forEach((el, index) => {
    el.style.animationDelay = \`\${index * 0.1}s\`;
  });

  // Add hover parallax effect to buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      button.style.transform = \`perspective(1000px) rotateX(\${-y / 20}deg) rotateY(\${x / 20}deg) scale(1.05)\`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
});`,
      },
    ],
  },

  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    icon: '🚀',
    description: 'Modern landing page with hero and features',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Landing Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Animated Background -->
  <div class="bg-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <!-- Navigation -->
  <nav class="navbar">
    <div class="container nav-content">
      <div class="nav-brand">
        <div class="brand-icon">🚀</div>
        <span class="brand-name">YourApp</span>
      </div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#pricing">Pricing</a>
        <button class="btn-nav-signin">Sign In</button>
        <button class="btn-nav-primary">Get Started</button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container">
      <div class="badge">
        <span class="badge-dot"></span>
        <span>Now in Public Beta</span>
      </div>
      <h1 class="hero-title">
        <span class="title-line-1">Build Something</span>
        <br />
        <span class="title-line-2">Extraordinary</span>
      </h1>
      <p class="hero-description">
        The modern platform for building fast, secure, and beautiful applications. Ship faster with our powerful tools.
      </p>
      <div class="hero-buttons">
        <button class="btn btn-large btn-primary">
          Start Building Free
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
        <button class="btn btn-large btn-secondary">Watch Demo</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">10K+</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">99.9%</div>
          <div class="stat-label">Uptime</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">50ms</div>
          <div class="stat-label">Response Time</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="features-section">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Features</span>
        <h2 class="section-title">Everything You Need</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon icon-violet">⚡</div>
          <h3 class="feature-title">Lightning Fast</h3>
          <p class="feature-description">Optimized for speed with edge computing and smart caching. Load times under 100ms guaranteed.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-cyan">🔒</div>
          <h3 class="feature-title">Enterprise Security</h3>
          <p class="feature-description">Bank-level encryption, SOC2 compliant, and regular security audits to keep your data safe.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-fuchsia">🎨</div>
          <h3 class="feature-title">Beautiful Design</h3>
          <p class="feature-description">Stunning templates and components designed by world-class designers. Ready to use.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-green">🔧</div>
          <h3 class="feature-title">Developer Tools</h3>
          <p class="feature-description">Powerful CLI, APIs, and SDKs for every major language. Build faster than ever.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-orange">📊</div>
          <h3 class="feature-title">Analytics</h3>
          <p class="feature-description">Real-time insights and comprehensive dashboards to understand your users.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-purple">🌍</div>
          <h3 class="feature-title">Global Scale</h3>
          <p class="feature-description">Deploy to 30+ regions worldwide. Automatic scaling handles any traffic.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section id="testimonials" class="testimonials-section">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Testimonials</span>
        <h2 class="section-title">Loved by Developers</h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card card-violet">
          <div class="stars">★★★★★</div>
          <p class="testimonial-quote">"Absolutely incredible platform. Shipped our product 3x faster than expected."</p>
          <div class="testimonial-author">
            <div class="author-avatar bg-violet">S</div>
            <div>
              <div class="author-name">Sarah Chen</div>
              <div class="author-role">CTO at TechCorp</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card card-cyan">
          <div class="stars">★★★★★</div>
          <p class="testimonial-quote">"Best developer experience I've ever had. The docs are amazing."</p>
          <div class="testimonial-author">
            <div class="author-avatar bg-cyan">M</div>
            <div>
              <div class="author-name">Mike Johnson</div>
              <div class="author-role">Lead Dev at StartupXYZ</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card card-fuchsia">
          <div class="stars">★★★★★</div>
          <p class="testimonial-quote">"Migrated our entire infrastructure in a weekend. Zero downtime."</p>
          <div class="testimonial-author">
            <div class="author-avatar bg-fuchsia">A</div>
            <div>
              <div class="author-name">Alex Rivera</div>
              <div class="author-role">Founder at CloudApp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-box">
        <h2 class="cta-title">Ready to Get Started?</h2>
        <p class="cta-description">Join thousands of developers building the future. Free to start, no credit card required.</p>
        <button class="btn btn-cta">Start Building Free →</button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand">
            <div class="brand-icon">🚀</div>
            <span class="brand-name">YourApp</span>
          </div>
          <p class="footer-description">Build the future with the most powerful platform for modern applications.</p>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Product</h4>
          <ul class="footer-links">
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-links">
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Legal</h4>
          <ul class="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Security</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 YourApp. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
  overflow-x: hidden;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(30px, 10px) scale(1.05); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Background */
.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  animation: blob 7s infinite;
}

.blob-1 {
  top: 0;
  left: -10rem;
  width: 31.25rem;
  height: 31.25rem;
  background: rgba(139, 92, 246, 0.3);
}

.blob-2 {
  top: 33%;
  right: -10rem;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(6, 182, 212, 0.2);
  animation-delay: 2s;
}

.blob-3 {
  bottom: 0;
  left: 33%;
  width: 25rem;
  height: 25rem;
  background: rgba(217, 70, 239, 0.2);
  animation-delay: 4s;
}

/* Layout */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Navbar */
.navbar {
  position: relative;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(20px);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #8b5cf6, #d946ef);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-links {
  display: none;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #c4b5fd;
}

.btn-nav-signin {
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-nav-signin:hover {
  background: rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

.btn-nav-primary {
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #d946ef);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-nav-primary:hover {
  background: linear-gradient(to right, #7c3aed, #c026d3);
  box-shadow: 0 5px 15px -3px rgba(139, 92, 246, 0.5);
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 10;
  padding: 8rem 0;
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out;
}

.badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #8b5cf6;
  animation: pulse 2s infinite;
}

.badge span {
  font-size: 0.875rem;
  color: #c4b5fd;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out 0.1s both;
  line-height: 1.1;
}

.title-line-1 {
  background: linear-gradient(to right, #ffffff, #c4b5fd, #a5f3fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-line-2 {
  background: linear-gradient(to right, #a78bfa, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: #94a3b8;
  margin-bottom: 3rem;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-bottom: 5rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

@media (min-width: 640px) {
  .hero-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-large {
  font-size: 1.125rem;
}

.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #d946ef);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(to right, #7c3aed, #c026d3);
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.5), 0 0 30px rgba(217, 70, 239, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
  color: #c4b5fd;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 40rem;
  margin: 0 auto;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(to right, #a78bfa, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: #64748b;
  margin-top: 0.25rem;
}

/* Features Section */
.features-section {
  position: relative;
  z-index: 10;
  padding: 8rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-label {
  color: #a78bfa;
  font-weight: 500;
}

.section-title {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  margin-top: 1rem;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-0.5rem);
  box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.3);
}

.feature-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.3s;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.icon-violet { background: linear-gradient(to bottom right, #8b5cf6, #d946ef); }
.icon-cyan { background: linear-gradient(to bottom right, #06b6d4, #3b82f6); }
.icon-fuchsia { background: linear-gradient(to bottom right, #d946ef, #ec4899); }
.icon-green { background: linear-gradient(to bottom right, #10b981, #059669); }
.icon-orange { background: linear-gradient(to bottom right, #f97316, #fb923c); }
.icon-purple { background: linear-gradient(to bottom right, #a855f7, #6366f1); }

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: #94a3b8;
}

/* Testimonials */
.testimonials-section {
  position: relative;
  z-index: 10;
  padding: 8rem 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .testimonials-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.testimonial-card {
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.testimonial-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-0.25rem);
  box-shadow: 0 15px 30px -10px rgba(139, 92, 246, 0.2);
}

.card-violet { background: linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.1)); }
.card-cyan { background: linear-gradient(to bottom right, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1)); }
.card-fuchsia { background: linear-gradient(to bottom right, rgba(217, 70, 239, 0.1), rgba(236, 72, 153, 0.1)); }

.stars {
  color: #fbbf24;
  margin-bottom: 1rem;
}

.testimonial-quote {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.bg-violet { background: linear-gradient(to bottom right, #8b5cf6, #d946ef); }
.bg-cyan { background: linear-gradient(to bottom right, #06b6d4, #3b82f6); }
.bg-fuchsia { background: linear-gradient(to bottom right, #d946ef, #ec4899); }

.author-name {
  font-weight: 600;
}

.author-role {
  font-size: 0.875rem;
  color: #64748b;
}

/* CTA Section */
.cta-section {
  position: relative;
  z-index: 10;
  padding: 8rem 0;
}

.cta-box {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(to right, #8b5cf6, #d946ef);
  padding: 4rem;
  text-align: center;
}

.cta-title {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

.btn-cta {
  padding: 1.25rem 2.5rem;
  background: white;
  color: #8b5cf6;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.btn-cta:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

/* Footer */
.footer {
  position: relative;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.footer-description {
  color: #64748b;
}

.footer-heading {
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #c4b5fd;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #64748b;
}

html {
  scroll-behavior: smooth;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('🚀 Landing page loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});`,
      },
    ],
  },

  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    description: 'Analytics dashboard with stats and charts',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand-icon">📊</div>
      <span class="brand-name">Nexus</span>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">Dashboard</a>
      <a href="#" class="nav-item">Customers</a>
      <a href="#" class="nav-item">Orders</a>
      <a href="#" class="nav-item">Analytics</a>
      <a href="#" class="nav-item">Settings</a>
    </nav>
  </aside>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div>
          <h1 class="header-title">Dashboard</h1>
          <p class="header-subtitle">Welcome back, here's what's happening</p>
        </div>
        <div class="header-actions">
          <div class="user-avatar">JD</div>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-emerald">
          <div class="stat-header">
            <div class="stat-icon icon-emerald">💰</div>
            <div class="stat-change stat-up">↑ +20.1%</div>
          </div>
          <div class="stat-value">$45,231</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card stat-blue">
          <div class="stat-header">
            <div class="stat-icon icon-blue">👥</div>
            <div class="stat-change stat-up">↑ +15.3%</div>
          </div>
          <div class="stat-value">2,345</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-card stat-violet">
          <div class="stat-header">
            <div class="stat-icon icon-violet">📦</div>
            <div class="stat-change stat-up">↑ +8.2%</div>
          </div>
          <div class="stat-value">1,234</div>
          <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card stat-amber">
          <div class="stat-header">
            <div class="stat-icon icon-amber">📈</div>
            <div class="stat-change stat-down">↓ -2.5%</div>
          </div>
          <div class="stat-value">3.2%</div>
          <div class="stat-label">Conversion</div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-card">
        <h2 class="chart-title">Revenue Analytics</h2>
        <div class="chart-container">
          <div class="chart-bar" style="height: 130px;">
            <div class="bar-label">Mon</div>
          </div>
          <div class="chart-bar" style="height: 156px;">
            <div class="bar-label">Tue</div>
          </div>
          <div class="chart-bar" style="height: 110px;">
            <div class="bar-label">Wed</div>
          </div>
          <div class="chart-bar" style="height: 180px;">
            <div class="bar-label">Thu</div>
          </div>
          <div class="chart-bar" style="height: 164px;">
            <div class="bar-label">Fri</div>
          </div>
          <div class="chart-bar" style="height: 190px;">
            <div class="bar-label">Sat</div>
          </div>
          <div class="chart-bar" style="height: 140px;">
            <div class="bar-label">Sun</div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 16rem;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: block;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #94a3b8;
  transition: all 0.3s;
}

.nav-item:hover {
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.1);
}

.nav-item.active {
  background: linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2));
  color: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* Main Content */
.main-content {
  flex: 1;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Dashboard Main */
.dashboard-main {
  padding: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-0.25rem);
  box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.2);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.icon-emerald { background: linear-gradient(to bottom right, #10b981, #059669); }
.icon-blue { background: linear-gradient(to bottom right, #3b82f6, #6366f1); }
.icon-violet { background: linear-gradient(to bottom right, #8b5cf6, #a855f7); }
.icon-amber { background: linear-gradient(to bottom right, #f59e0b, #f97316); }

.stat-change {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-up {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.stat-down {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Chart */
.chart-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.chart-container {
  height: 16rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #8b5cf6, #a855f7);
  border-radius: 0.5rem 0.5rem 0 0;
  position: relative;
  transition: all 0.3s;
}

.chart-bar:hover {
  background: linear-gradient(to top, #7c3aed, #c026d3);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  transform: scale(1.05);
}

.bar-label {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #64748b;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('📊 Dashboard loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Add hover effects to stat cards
  document.querySelectorAll('.stat-card').forEach((card, index) => {
    card.style.animationDelay = \`\${index * 0.1}s\`;
  });

  // Animate chart bars
  document.querySelectorAll('.chart-bar').forEach((bar, index) => {
    const height = bar.style.height;
    bar.style.height = '0';
    setTimeout(() => {
      bar.style.transition = 'height 0.8s ease-out';
      bar.style.height = height;
    }, 300 + (index * 100));
  });
});`,
      },
    ],
  },

  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    icon: '💼',
    description: 'Personal portfolio with projects',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
  </div>

  <div class="container">
    <!-- Header -->
    <header class="hero">
      <div class="avatar-container">
        <div class="avatar">👨‍💻</div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        Available for work
      </div>
      <h1 class="hero-title">John Doe</h1>
      <p class="hero-subtitle">Full-Stack Developer crafting beautiful, performant web experiences with modern technologies.</p>
      <div class="hero-buttons">
        <button class="btn btn-primary">View Projects →</button>
        <button class="btn btn-secondary">Contact Me</button>
      </div>
      <div class="skills">
        <span class="skill skill-violet">React</span>
        <span class="skill skill-blue">TypeScript</span>
        <span class="skill skill-emerald">Node.js</span>
        <span class="skill skill-amber">Python</span>
        <span class="skill skill-gray">Next.js</span>
        <span class="skill skill-cyan">Tailwind</span>
      </div>
    </header>

    <!-- Projects -->
    <section class="projects">
      <h2 class="section-title">Featured Projects</h2>
      <p class="section-subtitle">A selection of my recent work</p>

      <div class="projects-grid">
        <div class="project-card">
          <div class="project-header project-violet">📊</div>
          <h3 class="project-title">AI Dashboard</h3>
          <p class="project-description">Real-time analytics platform with ML predictions</p>
          <div class="project-tags">
            <span class="tag">React</span>
            <span class="tag">Python</span>
            <span class="tag">ML</span>
          </div>
        </div>

        <div class="project-card">
          <div class="project-header project-emerald">🛒</div>
          <h3 class="project-title">E-Commerce App</h3>
          <p class="project-description">Full-stack shopping platform with payments</p>
          <div class="project-tags">
            <span class="tag">Next.js</span>
            <span class="tag">Stripe</span>
          </div>
        </div>

        <div class="project-card">
          <div class="project-header project-rose">💬</div>
          <h3 class="project-title">Social Network</h3>
          <p class="project-description">Real-time chat and social features</p>
          <div class="project-tags">
            <span class="tag">React</span>
            <span class="tag">Firebase</span>
          </div>
        </div>

        <div class="project-card">
          <div class="project-header project-amber">🚀</div>
          <h3 class="project-title">SaaS Platform</h3>
          <p class="project-description">Multi-tenant application with billing</p>
          <div class="project-tags">
            <span class="tag">Node.js</span>
            <span class="tag">PostgreSQL</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-box">
        <h2 class="cta-title">Let's Work Together</h2>
        <p class="cta-description">Have a project in mind? I'd love to hear about it.</p>
        <button class="btn btn-cta">Get In Touch →</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2024 John Doe. All rights reserved.</p>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  animation: blob 7s infinite;
}

.blob-1 {
  top: 0;
  left: 25%;
  width: 24rem;
  height: 24rem;
  background: rgba(139, 92, 246, 0.2);
}

.blob-2 {
  bottom: 0;
  right: 25%;
  width: 24rem;
  height: 24rem;
  background: rgba(6, 182, 212, 0.2);
  animation-delay: 3s;
}

.container {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero */
.hero {
  padding: 6rem 0;
  text-align: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.avatar-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #8b5cf6, #06b6d4);
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
}

.avatar {
  position: relative;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #8b5cf6, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #34d399;
  animation: pulse 2s infinite;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 4rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
  align-items: center;
}

@media (min-width: 640px) {
  .hero-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #06b6d4);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.25);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

.skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.skill {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.skill {
  transition: all 0.3s;
  cursor: pointer;
}

.skill:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.4);
}

.skill-violet { background: linear-gradient(to right, #8b5cf6, #a855f7); }
.skill-blue { background: linear-gradient(to right, #3b82f6, #6366f1); }
.skill-emerald { background: linear-gradient(to right, #10b981, #059669); }
.skill-amber { background: linear-gradient(to right, #f59e0b, #f97316); }
.skill-gray { background: linear-gradient(to right, #4b5563, #111827); }
.skill-cyan { background: linear-gradient(to right, #06b6d4, #3b82f6); }

/* Projects */
.projects {
  padding: 6rem 0;
}

.section-title {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 4rem;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.project-card {
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.project-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-0.5rem);
  box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.3);
}

.project-header {
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  transition: transform 0.3s;
}

.project-card:hover .project-header {
  transform: scale(1.1);
}

.project-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.project-violet { background: linear-gradient(to right, #8b5cf6, #a855f7); }
.project-emerald { background: linear-gradient(to right, #10b981, #059669); }
.project-rose { background: linear-gradient(to right, #f43f5e, #ec4899); }
.project-amber { background: linear-gradient(to right, #f59e0b, #f97316); }

.project-title {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 1.5rem 1.5rem 0.75rem;
}

.project-description {
  color: #94a3b8;
  padding: 0 1.5rem 1rem;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
}

.tag:hover {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  transform: translateY(-2px);
}

/* CTA */
.cta {
  padding: 6rem 0;
}

.cta-box {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7, #06b6d4);
  padding: 5rem 3rem;
  text-align: center;
}

.cta-title {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.btn-cta {
  padding: 1.25rem 2.5rem;
  background: white;
  color: #8b5cf6;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cta:hover {
  background: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.4);
}

/* Footer */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 0;
  text-align: center;
  color: #64748b;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('💼 Portfolio loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});`,
      },
    ],
  },

  blog: {
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    description: 'Simple blog layout',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
  </div>

  <!-- Header -->
  <header class="header">
    <nav class="navbar">
      <div class="container nav-content">
        <div class="nav-brand">
          <div class="brand-icon">✨</div>
          <span class="brand-name">DevBlog</span>
        </div>
        <div class="nav-links">
          <a href="#">Home</a>
          <a href="#">Articles</a>
          <a href="#">About</a>
          <button class="btn-subscribe">Subscribe</button>
        </div>
      </div>
    </nav>
  </header>

  <div class="container">
    <!-- Featured Post -->
    <section class="featured">
      <div class="featured-card">
        <span class="featured-badge">Featured</span>
        <h1 class="featured-title">The Future of Web Development: AI-Powered Design</h1>
        <p class="featured-excerpt">Explore how artificial intelligence is revolutionizing web development and what it means for the future of digital design.</p>
        <div class="featured-meta">
          <div class="author">
            <div class="author-avatar">SC</div>
            <div>
              <div class="author-name">Sarah Chen</div>
              <div class="author-date">Jan 20, 2024 · 12 min</div>
            </div>
          </div>
          <button class="btn-read">Read Article →</button>
        </div>
      </div>
    </section>

    <!-- Blog Posts -->
    <section class="posts">
      <div class="posts-grid">
        <article class="post-card">
          <div class="post-header header-cyan">⚛️</div>
          <span class="post-category">React</span>
          <h2 class="post-title">Mastering React Server Components</h2>
          <p class="post-excerpt">Deep dive into RSC and build blazing-fast apps.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">AK</div>
              <span>Alex Kim</span>
            </div>
            <span class="post-time">8 min</span>
          </div>
        </article>

        <article class="post-card">
          <div class="post-header header-blue">📘</div>
          <span class="post-category">TypeScript</span>
          <h2 class="post-title">TypeScript 5.0: Game-Changing Features</h2>
          <p class="post-excerpt">Discover powerful new features in TypeScript 5.0.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">ED</div>
              <span>Emma Davis</span>
            </div>
            <span class="post-time">6 min</span>
          </div>
        </article>

        <article class="post-card">
          <div class="post-header header-teal">🎨</div>
          <span class="post-category">CSS</span>
          <h2 class="post-title">Building Beautiful UIs with Tailwind</h2>
          <p class="post-excerpt">Learn advanced Tailwind techniques for stunning interfaces.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">MJ</div>
              <span>Marcus Johnson</span>
            </div>
            <span class="post-time">10 min</span>
          </div>
        </article>

        <article class="post-card">
          <div class="post-header header-gray">▲</div>
          <span class="post-category">Next.js</span>
          <h2 class="post-title">Next.js 14 App Router Deep Dive</h2>
          <p class="post-excerpt">Everything about the new App Router and migration.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">LW</div>
              <span>Lisa Wang</span>
            </div>
            <span class="post-time">15 min</span>
          </div>
        </article>

        <article class="post-card">
          <div class="post-header header-orange">🏗️</div>
          <span class="post-category">Architecture</span>
          <h2 class="post-title">State Management in 2024</h2>
          <p class="post-excerpt">Comparing Zustand, Jotai, and Redux Toolkit.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">DP</div>
              <span>David Park</span>
            </div>
            <span class="post-time">9 min</span>
          </div>
        </article>

        <article class="post-card">
          <div class="post-header header-amber">⚡</div>
          <span class="post-category">Performance</span>
          <h2 class="post-title">Performance Optimization Secrets</h2>
          <p class="post-excerpt">Advanced techniques for faster web applications.</p>
          <div class="post-footer">
            <div class="post-author">
              <div class="post-avatar">NP</div>
              <span>Nina Patel</span>
            </div>
            <span class="post-time">11 min</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter">
      <div class="newsletter-box">
        <h2 class="newsletter-title">Stay ahead of the curve</h2>
        <p class="newsletter-description">Get weekly insights on web development delivered to your inbox.</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Enter your email" class="newsletter-input">
          <button type="submit" class="newsletter-button">Subscribe</button>
        </form>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2024 DevBlog. All rights reserved.</p>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
  animation: blob 7s infinite;
}

.blob-1 {
  top: 25%;
  left: -25%;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(139, 92, 246, 0.1);
}

.blob-2 {
  bottom: 25%;
  right: -25%;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(59, 130, 246, 0.1);
  animation-delay: 3s;
}

.container {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-links {
  display: none;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: white;
}

.btn-subscribe {
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-subscribe:hover {
  background: linear-gradient(to right, #7c3aed, #9333ea);
  box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.5);
}

/* Featured */
.featured {
  padding: 4rem 0;
}

.featured-card {
  position: relative;
  padding: 3rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.featured-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.featured-title {
  font-size: clamp(1.875rem, 4vw, 2.25rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.featured-excerpt {
  font-size: 1.125rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 48rem;
}

.featured-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.author-name {
  font-weight: 500;
}

.author-date {
  font-size: 0.875rem;
  color: #64748b;
}

.btn-read {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-read:hover {
  background: linear-gradient(to right, #7c3aed, #9333ea);
  box-shadow: 0 10px 20px -3px rgba(139, 92, 246, 0.5);
  transform: scale(1.02);
}

/* Posts */
.posts {
  padding: 5rem 0;
}

.posts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.post-card {
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.post-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-0.5rem);
  box-shadow: 0 15px 35px -10px rgba(139, 92, 246, 0.3);
}

.post-header {
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  transition: transform 0.3s;
}

.post-card:hover .post-header {
  transform: scale(1.1);
}

.post-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.header-cyan { background: linear-gradient(to right, #06b6d4, #3b82f6); }
.header-blue { background: linear-gradient(to right, #3b82f6, #6366f1); }
.header-teal { background: linear-gradient(to right, #14b8a6, #10b981); }
.header-gray { background: linear-gradient(to right, #4b5563, #111827); }
.header-orange { background: linear-gradient(to right, #f97316, #ef4444); }
.header-amber { background: linear-gradient(to right, #f59e0b, #f97316); }

.post-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 1.5rem 1.5rem 1rem;
  transition: all 0.3s;
}

.post-card:hover .post-category {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0 1.5rem 0.75rem;
  transition: color 0.3s;
}

.post-card:hover .post-title {
  color: #c4b5fd;
}

.post-excerpt {
  color: #94a3b8;
  padding: 0 1.5rem 1rem;
  font-size: 0.875rem;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.post-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.post-author span {
  font-size: 0.875rem;
  font-weight: 500;
}

.post-time {
  font-size: 0.75rem;
  color: #64748b;
}

/* Newsletter */
.newsletter {
  padding: 5rem 0;
}

.newsletter-box {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7, #6366f1);
  padding: 3rem;
  text-align: center;
}

.newsletter-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.newsletter-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 28rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .newsletter-form {
    flex-direction: row;
  }
}

.newsletter-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.newsletter-button {
  padding: 1rem 2rem;
  background: white;
  color: #8b5cf6;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.newsletter-button:hover {
  background: #ffffff;
  transform: scale(1.02);
}

/* Footer */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 0;
  text-align: center;
  color: #64748b;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('📝 Blog loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Newsletter form
  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks for subscribing!');
    });
  }
});`,
      },
    ],
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: '🛍️',
    description: 'Product listing page',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
  </div>

  <!-- Header -->
  <header class="header">
    <nav class="navbar">
      <div class="container nav-content">
        <div class="nav-brand">
          <div class="brand-icon">🛍️</div>
          <span class="brand-name">Luxe Store</span>
        </div>
        <div class="nav-links">
          <a href="#">Home</a>
          <a href="#">Shop</a>
          <a href="#">About</a>
          <button class="btn-cart">🛒 Cart <span class="cart-badge">3</span></button>
        </div>
      </div>
    </nav>
  </header>

  <div class="container">
    <!-- Hero Banner -->
    <section class="banner">
      <div class="banner-content">
        <span class="banner-badge">🔥 Limited Time Offer</span>
        <h1 class="banner-title">Summer Collection 2024</h1>
        <p class="banner-description">Up to 50% off on selected items. Free shipping on orders over $100.</p>
        <button class="btn-shop">Shop Now →</button>
      </div>
    </section>

    <!-- Products -->
    <section class="products">
      <div class="products-grid">
        <div class="product-card">
          <div class="product-image image-rose">
            <span class="product-icon">👟</span>
            <span class="sale-badge">SALE</span>
          </div>
          <div class="product-info">
            <span class="product-category">Footwear</span>
            <h3 class="product-name">Premium Sneakers</h3>
            <div class="product-rating">★ 4.8 (234)</div>
            <div class="product-price">
              <span class="price-current">$129.99</span>
              <span class="price-old">$179.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-image image-blue">
            <span class="product-icon">⌚</span>
          </div>
          <div class="product-info">
            <span class="product-category">Electronics</span>
            <h3 class="product-name">Smart Watch Pro</h3>
            <div class="product-rating">★ 4.9 (567)</div>
            <div class="product-price">
              <span class="price-current">$299.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-image image-violet">
            <span class="product-icon">🎧</span>
            <span class="sale-badge">SALE</span>
          </div>
          <div class="product-info">
            <span class="product-category">Audio</span>
            <h3 class="product-name">Wireless Headphones</h3>
            <div class="product-rating">★ 4.7 (432)</div>
            <div class="product-price">
              <span class="price-current">$199.99</span>
              <span class="price-old">$249.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-image image-amber">
            <span class="product-icon">🎒</span>
          </div>
          <div class="product-info">
            <span class="product-category">Accessories</span>
            <h3 class="product-name">Designer Backpack</h3>
            <div class="product-rating">★ 4.6 (189)</div>
            <div class="product-price">
              <span class="price-current">$89.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-image image-emerald">
            <span class="product-icon">💪</span>
            <span class="sale-badge">SALE</span>
          </div>
          <div class="product-info">
            <span class="product-category">Fitness</span>
            <h3 class="product-name">Fitness Tracker</h3>
            <div class="product-rating">★ 4.5 (321)</div>
            <div class="product-price">
              <span class="price-current">$79.99</span>
              <span class="price-old">$99.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-image image-indigo">
            <span class="product-icon">🔊</span>
          </div>
          <div class="product-info">
            <span class="product-category">Audio</span>
            <h3 class="product-name">Portable Speaker</h3>
            <div class="product-rating">★ 4.8 (278)</div>
            <div class="product-price">
              <span class="price-current">$149.99</span>
            </div>
            <button class="btn-add-cart">Add to Cart</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2024 Luxe Store. All rights reserved.</p>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
  animation: blob 7s infinite;
}

.blob-1 {
  top: 25%;
  left: -25%;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(139, 92, 246, 0.1);
}

.blob-2 {
  bottom: 25%;
  right: -25%;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(6, 182, 212, 0.1);
  animation-delay: 3s;
}

.container {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-links {
  display: none;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: white;
}

.btn-cart {
  position: relative;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cart:hover {
  background: linear-gradient(to right, #7c3aed, #9333ea);
  box-shadow: 0 10px 20px -3px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.cart-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #f43f5e;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Banner */
.banner {
  padding: 4rem 0;
}

.banner-content {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7, #6366f1);
  padding: 3rem;
  text-align: center;
}

.banner-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.banner-title {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.btn-shop {
  padding: 1rem 2rem;
  background: white;
  color: #8b5cf6;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-shop:hover {
  background: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

/* Products */
.products {
  padding: 5rem 0;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.product-card {
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-0.5rem);
  box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.3);
}

.product-image {
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-icon {
  font-size: 4rem;
  position: relative;
  z-index: 1;
}

.sale-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f43f5e;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.5rem;
  z-index: 2;
}

.image-rose { background: linear-gradient(to bottom right, #fda4af, #fecdd3); }
.image-blue { background: linear-gradient(to bottom right, #93c5fd, #bfdbfe); }
.image-violet { background: linear-gradient(to bottom right, #c4b5fd, #ddd6fe); }
.image-amber { background: linear-gradient(to bottom right, #fde68a, #fef3c7); }
.image-emerald { background: linear-gradient(to bottom right, #6ee7b7, #a7f3d0); }
.image-indigo { background: linear-gradient(to bottom right, #a5b4fc, #c7d2fe); }

.product-info {
  padding: 1.25rem;
}

.product-category {
  font-size: 0.75rem;
  color: #94a3b8;
  transition: color 0.3s;
}

.product-card:hover .product-category {
  color: #c4b5fd;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.25rem 0;
}

.product-rating {
  color: #fbbf24;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.price-current {
  font-size: 1.5rem;
  font-weight: 700;
  color: #a78bfa;
}

.price-old {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: line-through;
}

.btn-add-cart {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-cart:hover {
  background: linear-gradient(to right, #7c3aed, #9333ea);
  box-shadow: 0 10px 20px -3px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

/* Footer */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 0;
  text-align: center;
  color: #64748b;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('🛍️ E-Commerce loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Add to cart functionality
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Product added to cart!');
    });
  });
});`,
      },
    ],
  },

  'task-manager': {
    id: 'task-manager',
    name: 'Task Manager',
    icon: '✅',
    description: 'Simple task list manager',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg-container">
    <div class="blob blob-1"></div>
  </div>

  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-brand">
        <div class="brand-icon">✅</div>
        <h1 class="brand-name">TaskFlow</h1>
      </div>
      <button class="btn-add">+ New Task</button>
    </header>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-icon">📋</span>
        <div>
          <div class="stat-value">24</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🔄</span>
        <div>
          <div class="stat-value">8</div>
          <div class="stat-label">In Progress</div>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">✅</span>
        <div>
          <div class="stat-value">12</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⚡</span>
        <div>
          <div class="stat-value">3</div>
          <div class="stat-label">Due Today</div>
        </div>
      </div>
    </div>

    <!-- Task Columns -->
    <div class="task-columns">
      <div class="task-column">
        <div class="column-header color-amber">
          <div class="column-title">
            <span class="column-dot"></span>
            <h2>To Do</h2>
            <span class="column-count">3</span>
          </div>
        </div>
        <div class="tasks">
          <div class="task-card">
            <div class="task-header">
              <span class="task-title">Design new landing page</span>
              <span class="task-menu">⋮</span>
            </div>
            <div class="task-footer">
              <span class="task-priority priority-high">High</span>
              <span class="task-date">Jan 25</span>
              <div class="task-avatar">SC</div>
            </div>
          </div>
          <div class="task-card">
            <div class="task-header">
              <span class="task-title">Update API documentation</span>
              <span class="task-menu">⋮</span>
            </div>
            <div class="task-footer">
              <span class="task-priority priority-low">Low</span>
              <span class="task-date">Jan 28</span>
              <div class="task-avatar">MJ</div>
            </div>
          </div>
        </div>
      </div>

      <div class="task-column">
        <div class="column-header color-violet">
          <div class="column-title">
            <span class="column-dot"></span>
            <h2>In Progress</h2>
            <span class="column-count">2</span>
          </div>
        </div>
        <div class="tasks">
          <div class="task-card">
            <div class="task-header">
              <span class="task-title">Build authentication system</span>
              <span class="task-menu">⋮</span>
            </div>
            <div class="task-footer">
              <span class="task-priority priority-high">High</span>
              <span class="task-date">Jan 22</span>
              <div class="task-avatar">AK</div>
            </div>
          </div>
        </div>
      </div>

      <div class="task-column">
        <div class="column-header color-emerald">
          <div class="column-title">
            <span class="column-dot"></span>
            <h2>Done</h2>
            <span class="column-count">2</span>
          </div>
        </div>
        <div class="tasks">
          <div class="task-card task-done">
            <div class="task-header">
              <span class="task-title">Setup project structure</span>
              <span class="task-menu">⋮</span>
            </div>
            <div class="task-footer">
              <span class="task-priority priority-medium">Medium</span>
              <span class="task-date">Jan 15</span>
              <div class="task-avatar">MJ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        path: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #020617;
  color: white;
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.1); }
}

.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  top: 25%;
  left: 50%;
  width: 37.5rem;
  height: 37.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 50%;
  filter: blur(150px);
  animation: blob 7s infinite;
}

.container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover {
  background: linear-gradient(to right, #7c3aed, #9333ea);
  box-shadow: 0 10px 20px -3px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Task Columns */
.task-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding-bottom: 2rem;
}

@media (max-width: 1024px) {
  .task-columns {
    grid-template-columns: 1fr;
  }
}

.task-column {
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.column-header {
  margin-bottom: 1rem;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.color-amber .column-dot {
  background: linear-gradient(to right, #f59e0b, #f97316);
}

.color-violet .column-dot {
  background: linear-gradient(to right, #8b5cf6, #a855f7);
}

.color-emerald .column-dot {
  background: linear-gradient(to right, #10b981, #059669);
}

.column-title h2 {
  font-size: 1rem;
  font-weight: 600;
}

.column-count {
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.75rem;
}

/* Tasks */
.tasks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card {
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.task-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.08);
  box-shadow: 0 5px 15px -3px rgba(139, 92, 246, 0.2);
}

.task-done .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.task-title {
  font-weight: 500;
  flex: 1;
}

.task-menu {
  color: #94a3b8;
  cursor: pointer;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  border: 1px solid;
}

.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.priority-medium {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.priority-low {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.3);
}

.task-date {
  font-size: 0.75rem;
  color: #64748b;
}

.task-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
}`,
      },
      {
        path: 'app.js',
        content: `console.log('✅ Task Manager loaded!');

document.addEventListener('DOMContentLoaded', () => {
  // Add task button
  const addBtn = document.querySelector('.btn-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      alert('Add new task functionality would go here!');
    });
  }
});`,
      },
    ],
  },
};

export function getGuestTemplateFiles(templateId: string) {
  const template = GUEST_TEMPLATES[templateId] || GUEST_TEMPLATES.blank
  return template.files.map(file => ({
    id: `${templateId}-${file.path}`,
    project_id: 'demo',
    path: file.path,
    content: file.content,
    language: getLanguageFromPath(file.path),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'html': return 'html'
    case 'css': return 'css'
    case 'js': return 'javascript'
    case 'ts': return 'typescript'
    case 'tsx': return 'typescript'
    case 'jsx': return 'javascript'
    case 'json': return 'json'
    case 'md': return 'markdown'
    default: return 'plaintext'
  }
}
