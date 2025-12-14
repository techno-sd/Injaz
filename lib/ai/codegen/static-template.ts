// Static Website Template Generator
// Generates vanilla HTML/CSS/JS files for static websites

import type { UnifiedAppSchema, PageSchema, ComponentSchema } from '@/types/app-schema'

export interface StaticFile {
  path: string
  content: string
  language: string
}

export function generateStaticTemplate(schema: UnifiedAppSchema): StaticFile[] {
  const files: StaticFile[] = []
  const { meta, design, structure, components } = schema

  // Generate main index.html
  files.push({
    path: 'index.html',
    content: generateIndexHtml(schema),
    language: 'html',
  })

  // Generate styles.css
  files.push({
    path: 'styles.css',
    content: generateStyles(design, components),
    language: 'css',
  })

  // Generate script.js
  files.push({
    path: 'script.js',
    content: generateScript(structure, components),
    language: 'javascript',
  })

  // Generate additional pages
  structure.pages
    .filter((page) => page.path !== '/' && page.path !== '/index')
    .forEach((page) => {
      files.push({
        path: `${page.path.replace(/^\//, '')}.html`,
        content: generatePageHtml(schema, page),
        language: 'html',
      })
    })

  return files
}

function generateIndexHtml(schema: UnifiedAppSchema): string {
  const { meta, design, structure, components } = schema
  const mainPage = structure.pages.find((p) => p.path === '/' || p.path === '/index')
  const pageComponents = mainPage?.components || []

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${meta.description || ''}">
  <title>${meta.name}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${design.typography.headingFont.replace(' ', '+')}:wght@400;500;600;700&family=${design.typography.bodyFont.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  ${generateNavigation(structure.navigation)}

  <main>
    ${pageComponents.map((id) => generateComponentHtml(components.find((c) => c.id === id))).join('\n    ')}
  </main>

  ${generateFooter(components)}

  <script src="script.js"></script>
</body>
</html>`
}

function generatePageHtml(schema: UnifiedAppSchema, page: PageSchema): string {
  const { meta, design, structure, components } = schema
  const pageComponents = page.components || []

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${page.description || meta.description || ''}">
  <title>${page.title} | ${meta.name}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${design.typography.headingFont.replace(' ', '+')}:wght@400;500;600;700&family=${design.typography.bodyFont.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  ${generateNavigation(structure.navigation)}

  <main>
    <section class="page-header">
      <h1>${page.title}</h1>
      ${page.description ? `<p>${page.description}</p>` : ''}
    </section>
    ${pageComponents.map((id) => generateComponentHtml(components.find((c) => c.id === id))).join('\n    ')}
  </main>

  ${generateFooter(components)}

  <script src="script.js"></script>
</body>
</html>`
}

function generateNavigation(nav: any): string {
  if (!nav?.items?.length) return ''

  return `<header class="header">
    <nav class="nav container">
      <a href="/" class="nav-logo">Logo</a>
      <button class="nav-toggle" aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-menu">
        ${nav.items
          .map(
            (item: any) => `<li><a href="${item.path || '#'}" class="nav-link">${item.label}</a></li>`
          )
          .join('\n        ')}
      </ul>
    </nav>
  </header>`
}

function generateFooter(components: ComponentSchema[]): string {
  const footer = components.find((c) => c.type === 'footer')
  if (!footer) {
    return `<footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  </footer>`
  }
  return generateComponentHtml(footer)
}

function generateComponentHtml(component?: ComponentSchema): string {
  if (!component) return ''

  switch (component.type) {
    case 'hero':
      return `<section class="hero" id="${component.id}">
      <div class="container">
        <h1 class="hero-title">${component.props.find((p) => p.name === 'title')?.default || 'Welcome'}</h1>
        <p class="hero-subtitle">${component.props.find((p) => p.name === 'subtitle')?.default || 'Your amazing subtitle here'}</p>
        <div class="hero-actions">
          <a href="#" class="btn btn-primary">Get Started</a>
          <a href="#" class="btn btn-secondary">Learn More</a>
        </div>
      </div>
    </section>`

    case 'cta':
      return `<section class="cta" id="${component.id}">
      <div class="container">
        <h2>${component.props.find((p) => p.name === 'title')?.default || 'Ready to get started?'}</h2>
        <p>${component.props.find((p) => p.name === 'description')?.default || 'Join thousands of satisfied customers.'}</p>
        <a href="#" class="btn btn-primary">Get Started Now</a>
      </div>
    </section>`

    case 'card':
      return `<div class="card" id="${component.id}">
      <div class="card-body">
        <h3 class="card-title">${component.props.find((p) => p.name === 'title')?.default || 'Card Title'}</h3>
        <p class="card-text">${component.props.find((p) => p.name === 'description')?.default || 'Card description'}</p>
      </div>
    </div>`

    case 'form':
      return `<form class="form" id="${component.id}">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>`

    case 'pricing':
      return `<section class="pricing" id="${component.id}">
      <div class="container">
        <h2 class="section-title">Pricing</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Basic</h3>
            <div class="price">$9<span>/mo</span></div>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
            </ul>
            <a href="#" class="btn btn-secondary">Choose Plan</a>
          </div>
          <div class="pricing-card featured">
            <h3>Pro</h3>
            <div class="price">$29<span>/mo</span></div>
            <ul>
              <li>All Basic features</li>
              <li>Feature 3</li>
              <li>Feature 4</li>
            </ul>
            <a href="#" class="btn btn-primary">Choose Plan</a>
          </div>
        </div>
      </div>
    </section>`

    case 'testimonial':
      return `<section class="testimonials" id="${component.id}">
      <div class="container">
        <h2 class="section-title">What Our Customers Say</h2>
        <div class="testimonial-grid">
          <div class="testimonial-card">
            <p class="testimonial-text">"Amazing product! Highly recommended."</p>
            <div class="testimonial-author">
              <strong>John Doe</strong>
              <span>CEO, Company</span>
            </div>
          </div>
        </div>
      </div>
    </section>`

    case 'faq':
      return `<section class="faq" id="${component.id}">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>What is your refund policy?</summary>
            <p>We offer a 30-day money-back guarantee.</p>
          </details>
          <details class="faq-item">
            <summary>How do I get started?</summary>
            <p>Simply sign up and follow our quick start guide.</p>
          </details>
        </div>
      </div>
    </section>`

    case 'footer':
      return `<footer class="footer" id="${component.id}">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>Brand</h3>
          <p>Your tagline here.</p>
        </div>
        <div class="footer-links">
          <h4>Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
      </div>
    </div>
  </footer>`

    default:
      return `<section class="${component.type}" id="${component.id}">
      <div class="container">
        <p>Component: ${component.name}</p>
      </div>
    </section>`
  }
}

function generateStyles(design: any, components: ComponentSchema[]): string {
  const { colors, typography, spacing, borderRadius, shadows } = design

  const spacingValues = {
    compact: { section: '3rem', element: '0.75rem' },
    normal: { section: '5rem', element: '1rem' },
    spacious: { section: '8rem', element: '1.5rem' },
  }

  const radiusValues = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  }

  const sp = spacingValues[spacing as keyof typeof spacingValues] || spacingValues.normal
  const rad = radiusValues[borderRadius as keyof typeof radiusValues] || radiusValues.md

  return `/* Generated Styles */
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-muted: ${colors.muted};
  --color-border: ${colors.border};
  --color-error: ${colors.error};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};

  --font-heading: '${typography.headingFont}', system-ui, sans-serif;
  --font-body: '${typography.bodyFont}', system-ui, sans-serif;
  --font-size-base: ${typography.baseFontSize}px;
  --line-height: ${typography.lineHeight};

  --spacing-section: ${sp.section};
  --spacing-element: ${sp.element};
  --border-radius: ${rad};
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base */
html {
  font-size: var(--font-size-base);
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  line-height: var(--line-height);
  color: var(--color-foreground);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.2;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-secondary);
}

img {
  max-width: 100%;
  height: auto;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header & Navigation */
.header {
  position: sticky;
  top: 0;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  ${shadows ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-logo {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-foreground);
}

.nav-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  color: var(--color-muted);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-toggle span {
  width: 24px;
  height: 2px;
  background: var(--color-foreground);
  transition: 0.3s;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-secondary);
  color: white;
}

.btn-secondary {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
}

/* Hero Section */
.hero {
  padding: var(--spacing-section) 0;
  text-align: center;
  background: linear-gradient(135deg, var(--color-background) 0%, color-mix(in srgb, var(--color-primary) 5%, var(--color-background)) 100%);
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-muted);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Sections */
.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 3rem;
}

/* Cards */
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
  ${shadows ? 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);' : ''}
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card-text {
  color: var(--color-muted);
}

/* Forms */
.form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* CTA Section */
.cta {
  padding: var(--spacing-section) 0;
  text-align: center;
  background: var(--color-primary);
  color: white;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta p {
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta .btn-primary {
  background: white;
  color: var(--color-primary);
}

/* Pricing */
.pricing {
  padding: var(--spacing-section) 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  text-align: center;
}

.pricing-card.featured {
  border-color: var(--color-primary);
  ${shadows ? 'box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);' : ''}
}

.pricing-card h3 {
  margin-bottom: 1rem;
}

.pricing-card .price {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.pricing-card .price span {
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-muted);
}

.pricing-card ul {
  list-style: none;
  margin-bottom: 2rem;
}

.pricing-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

/* Testimonials */
.testimonials {
  padding: var(--spacing-section) 0;
  background: color-mix(in srgb, var(--color-muted) 5%, var(--color-background));
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  padding: 2rem;
  background: var(--color-background);
  border-radius: var(--border-radius);
  ${shadows ? 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);' : ''}
}

.testimonial-text {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author strong {
  display: block;
}

.testimonial-author span {
  color: var(--color-muted);
  font-size: 0.875rem;
}

/* FAQ */
.faq {
  padding: var(--spacing-section) 0;
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid var(--color-border);
}

.faq-item summary {
  padding: 1.25rem 0;
  font-weight: 500;
  cursor: pointer;
  list-style: none;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item p {
  padding-bottom: 1.25rem;
  color: var(--color-muted);
}

/* Footer */
.footer {
  padding: var(--spacing-section) 0 2rem;
  background: var(--color-foreground);
  color: var(--color-background);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer h3, .footer h4 {
  margin-bottom: 1rem;
}

.footer ul {
  list-style: none;
}

.footer li {
  margin-bottom: 0.5rem;
}

.footer a {
  color: inherit;
  opacity: 0.7;
}

.footer a:hover {
  opacity: 1;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
    gap: 0;
    display: none;
  }

  .nav-menu.active {
    display: flex;
  }

  .nav-menu li {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-actions .btn {
    width: 100%;
    max-width: 300px;
  }
}`
}

function generateScript(structure: any, components: ComponentSchema[]): string {
  return `// Generated JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu on link click
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (navMenu) navMenu.classList.remove('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Form submission
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      console.log('Form submitted:', data);
      alert('Thank you for your submission!');
      this.reset();
    });
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
});`
}
