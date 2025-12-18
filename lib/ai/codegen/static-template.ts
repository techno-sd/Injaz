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
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${meta.description || ''}">
  <meta name="theme-color" content="${design.colors.primary}">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${meta.name}">
  <meta property="og:description" content="${meta.description || ''}">
  <meta property="og:site_name" content="${meta.name}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.name}">
  <meta name="twitter:description" content="${meta.description || ''}">

  <title>${meta.name}</title>

  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${design.typography.headingFont.replace(' ', '+')}:wght@400;500;600;700&family=${design.typography.bodyFont.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${meta.name}",
    "description": "${meta.description || ''}",
    "url": "/"
  }
  </script>
</head>
<body>
  <!-- Skip to content link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${generateNavigation(structure.navigation, design)}

  <main id="main-content">
    ${pageComponents.map((id) => generateComponentHtml(components.find((c) => c.id === id))).join('\n    ')}
  </main>

  ${generateFooter(components)}

  <script src="script.js" defer></script>
</body>
</html>`
}

function generatePageHtml(schema: UnifiedAppSchema, page: PageSchema): string {
  const { meta, design, structure, components } = schema
  const pageComponents = page.components || []
  const pageName = page.name?.toLowerCase() || ''

  // Try to get content from components or generate based on page type
  const componentContent = pageComponents
    .map((id) => generateComponentHtml(components.find((c) => c.id === id)))
    .filter(Boolean)
    .join('\n    ')

  // Generate page-specific content if no components available
  const pageContent = componentContent || generateStaticPageContent(page, pageName)

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
      <div class="container">
        <h1>${page.title}</h1>
        ${page.description ? `<p class="page-description">${page.description}</p>` : ''}
      </div>
    </section>
    ${pageContent}
  </main>

  ${generateFooter(components)}

  <script src="script.js"></script>
</body>
</html>`
}

function generateStaticPageContent(page: PageSchema, pageName: string): string {
  // Generate content based on page name/type
  if (pageName.includes('about')) {
    return generateStaticAboutContent()
  }
  if (pageName.includes('contact')) {
    return generateStaticContactContent()
  }
  if (pageName.includes('service')) {
    return generateStaticServicesContent()
  }
  if (pageName.includes('pricing') || pageName.includes('plan')) {
    return generateStaticPricingContent()
  }
  if (pageName.includes('feature')) {
    return generateStaticFeaturesContent()
  }
  if (pageName.includes('blog') || pageName.includes('post') || pageName.includes('article')) {
    return generateStaticBlogContent()
  }
  if (pageName.includes('faq') || pageName.includes('help')) {
    return generateStaticFaqContent()
  }
  if (pageName.includes('team') || pageName.includes('member')) {
    return generateStaticTeamContent()
  }
  if (pageName.includes('portfolio') || pageName.includes('work') || pageName.includes('project')) {
    return generateStaticPortfolioContent()
  }
  if (pageName.includes('testimonial') || pageName.includes('review')) {
    return generateStaticTestimonialsContent()
  }

  // Default generic content
  return generateStaticDefaultContent(page)
}

function generateStaticAboutContent(): string {
  return `<section class="about-mission">
      <div class="container">
        <div class="about-grid">
          <div class="about-text">
            <h2>Our Mission</h2>
            <p>We are dedicated to delivering exceptional solutions that empower businesses and individuals to achieve their goals. Our commitment to excellence drives everything we do.</p>
            <p>Founded with a vision to make a difference, we continue to innovate and push boundaries in our industry.</p>
          </div>
          <div class="about-image">
            <div class="placeholder-image">Company Image</div>
          </div>
        </div>
      </div>
    </section>

    <section class="values">
      <div class="container">
        <h2 class="section-title">Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <h3>Innovation</h3>
            <p>We constantly push boundaries and embrace new ideas.</p>
          </div>
          <div class="value-card">
            <h3>Integrity</h3>
            <p>We conduct business with honesty and transparency.</p>
          </div>
          <div class="value-card">
            <h3>Excellence</h3>
            <p>We strive for the highest quality in everything we do.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Want to learn more?</h2>
        <p>Get in touch with us today.</p>
        <a href="contact.html" class="btn btn-primary">Contact Us</a>
      </div>
    </section>`
}

function generateStaticContactContent(): string {
  return `<section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-form-wrapper">
            <h2>Get in Touch</h2>
            <form class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" placeholder="John" required>
                </div>
                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" placeholder="Doe" required>
                </div>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
          </div>
          <div class="contact-info">
            <h2>Contact Information</h2>
            <div class="info-item">
              <h3>Address</h3>
              <p>123 Business Street, Suite 100<br>City, State 12345</p>
            </div>
            <div class="info-item">
              <h3>Email</h3>
              <p>contact@example.com</p>
            </div>
            <div class="info-item">
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div>
            <div class="info-item">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>`
}

function generateStaticServicesContent(): string {
  return `<section class="services-section">
      <div class="container">
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">1</div>
            <h3>Consulting</h3>
            <p>Expert guidance to help you make informed decisions and achieve your objectives.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
          <div class="service-card">
            <div class="service-icon">2</div>
            <h3>Development</h3>
            <p>Custom solutions built with cutting-edge technology to meet your unique needs.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
          <div class="service-card">
            <div class="service-icon">3</div>
            <h3>Support</h3>
            <p>24/7 dedicated support to ensure your success and peace of mind.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
          <div class="service-card">
            <div class="service-icon">4</div>
            <h3>Training</h3>
            <p>Comprehensive training programs to empower your team with new skills.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
          <div class="service-card">
            <div class="service-icon">5</div>
            <h3>Analytics</h3>
            <p>Data-driven insights to optimize your operations and drive growth.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
          <div class="service-card">
            <div class="service-icon">6</div>
            <h3>Integration</h3>
            <p>Seamless integration with your existing systems and workflows.</p>
            <a href="#" class="btn btn-outline">Learn More</a>
          </div>
        </div>
      </div>
    </section>

    <section class="cta cta-primary">
      <div class="container">
        <h2>Need a custom solution?</h2>
        <p>Contact us to discuss your specific requirements.</p>
        <a href="contact.html" class="btn btn-secondary">Get a Quote</a>
      </div>
    </section>`
}

function generateStaticPricingContent(): string {
  return `<section class="pricing-section">
      <div class="container">
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Starter</h3>
            <div class="price">$9<span>/month</span></div>
            <ul class="features-list">
              <li>5 Projects</li>
              <li>10GB Storage</li>
              <li>Email Support</li>
              <li>Basic Analytics</li>
            </ul>
            <a href="#" class="btn btn-outline">Get Started</a>
          </div>
          <div class="pricing-card featured">
            <span class="badge">Most Popular</span>
            <h3>Professional</h3>
            <div class="price">$29<span>/month</span></div>
            <ul class="features-list">
              <li>Unlimited Projects</li>
              <li>100GB Storage</li>
              <li>Priority Support</li>
              <li>Advanced Analytics</li>
              <li>API Access</li>
            </ul>
            <a href="#" class="btn btn-primary">Get Started</a>
          </div>
          <div class="pricing-card">
            <h3>Enterprise</h3>
            <div class="price">$99<span>/month</span></div>
            <ul class="features-list">
              <li>Unlimited Everything</li>
              <li>Dedicated Support</li>
              <li>Custom Integrations</li>
              <li>SLA Guarantee</li>
              <li>On-premise Option</li>
            </ul>
            <a href="#" class="btn btn-outline">Get Started</a>
          </div>
        </div>
      </div>
    </section>

    <section class="faq">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Can I change plans later?</summary>
            <p>Yes, you can upgrade or downgrade your plan at any time.</p>
          </details>
          <details class="faq-item">
            <summary>Is there a free trial?</summary>
            <p>Yes, all plans come with a 14-day free trial.</p>
          </details>
          <details class="faq-item">
            <summary>What payment methods do you accept?</summary>
            <p>We accept all major credit cards and PayPal.</p>
          </details>
        </div>
      </div>
    </section>`
}

function generateStaticFeaturesContent(): string {
  return `<section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-content">
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for users of all skill levels.</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-content">
              <h3>Fast & Reliable</h3>
              <p>Built for performance with 99.9% uptime guarantee.</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-content">
              <h3>Secure</h3>
              <p>Enterprise-grade security to protect your data.</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-content">
              <h3>Scalable</h3>
              <p>Grows with your business, from startup to enterprise.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-highlight">
      <div class="container">
        <div class="highlight-grid">
          <div class="highlight-image">
            <div class="placeholder-image">Feature Preview</div>
          </div>
          <div class="highlight-content">
            <h2>Powerful Features</h2>
            <p>Our platform provides everything you need to succeed, with powerful tools and features designed to streamline your workflow.</p>
            <a href="#" class="btn btn-primary">Start Free Trial</a>
          </div>
        </div>
      </div>
    </section>`
}

function generateStaticBlogContent(): string {
  return `<section class="blog-section">
      <div class="container">
        <div class="blog-grid">
          ${[1, 2, 3, 4, 5, 6].map(i => `
          <article class="blog-card">
            <div class="blog-image">
              <div class="placeholder-image">Blog Image</div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <span>Jan ${i}, 2024</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
              <h3><a href="#">Blog Post Title ${i}</a></h3>
              <p>A brief description of the blog post content that gives readers a preview...</p>
              <a href="#" class="btn btn-outline">Read More</a>
            </div>
          </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="newsletter cta-primary">
      <div class="container">
        <h2>Subscribe to our Newsletter</h2>
        <p>Get the latest updates delivered to your inbox.</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Enter your email" required>
          <button type="submit" class="btn btn-secondary">Subscribe</button>
        </form>
      </div>
    </section>`
}

function generateStaticFaqContent(): string {
  return `<section class="faq-section">
      <div class="container">
        <div class="faq-list">
          <details class="faq-item" open>
            <summary>What is your refund policy?</summary>
            <p>We offer a 30-day money-back guarantee on all plans. If you are not satisfied, simply contact support for a full refund.</p>
          </details>
          <details class="faq-item">
            <summary>How do I get started?</summary>
            <p>Simply sign up for a free account, choose your plan, and follow our quick setup guide. You will be up and running in minutes.</p>
          </details>
          <details class="faq-item">
            <summary>Do you offer customer support?</summary>
            <p>Yes, we offer 24/7 customer support via email and live chat. Premium plans also include phone support.</p>
          </details>
          <details class="faq-item">
            <summary>Can I upgrade or downgrade my plan?</summary>
            <p>Absolutely! You can change your plan at any time from your account settings. Changes take effect immediately.</p>
          </details>
          <details class="faq-item">
            <summary>Is my data secure?</summary>
            <p>Yes, we use industry-standard encryption and security measures to protect your data. We are also SOC 2 compliant.</p>
          </details>
          <details class="faq-item">
            <summary>Do you offer a free trial?</summary>
            <p>Yes, all plans come with a 14-day free trial. No credit card required to start.</p>
          </details>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Still have questions?</h2>
        <p>Our support team is here to help.</p>
        <a href="contact.html" class="btn btn-primary">Contact Support</a>
      </div>
    </section>`
}

function generateStaticTeamContent(): string {
  return `<section class="team-section">
      <div class="container">
        <div class="team-grid">
          ${[
            { name: 'John Smith', role: 'CEO & Founder' },
            { name: 'Sarah Johnson', role: 'CTO' },
            { name: 'Mike Williams', role: 'Lead Designer' },
            { name: 'Emily Brown', role: 'Marketing Director' },
            { name: 'David Lee', role: 'Senior Developer' },
            { name: 'Lisa Chen', role: 'Product Manager' },
            { name: 'James Wilson', role: 'Sales Lead' },
            { name: 'Anna Garcia', role: 'Customer Success' }
          ].map(member => `
          <div class="team-card">
            <div class="team-avatar">${member.name.charAt(0)}</div>
            <h3>${member.name}</h3>
            <p>${member.role}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="cta cta-primary">
      <div class="container">
        <h2>Join Our Team</h2>
        <p>We are always looking for talented individuals.</p>
        <a href="#" class="btn btn-secondary">View Open Positions</a>
      </div>
    </section>`
}

function generateStaticPortfolioContent(): string {
  return `<section class="portfolio-section">
      <div class="container">
        <div class="portfolio-grid">
          ${[1, 2, 3, 4, 5, 6].map(i => `
          <div class="portfolio-card">
            <div class="portfolio-image">
              <div class="placeholder-image">Project ${i}</div>
              <div class="portfolio-overlay">
                <a href="#" class="btn btn-secondary">View Project</a>
              </div>
            </div>
            <div class="portfolio-info">
              <h3>Project Title ${i}</h3>
              <p>Category</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Interested in working together?</h2>
        <p>Let us discuss your project.</p>
        <a href="contact.html" class="btn btn-primary">Start a Project</a>
      </div>
    </section>`
}

function generateStaticTestimonialsContent(): string {
  return `<section class="testimonials-section">
      <div class="container">
        <div class="testimonials-grid">
          ${[
            { name: 'Alex Thompson', company: 'Tech Corp', quote: 'This product has transformed the way we work. Highly recommended!' },
            { name: 'Maria Rodriguez', company: 'Design Studio', quote: 'Outstanding service and support. The team went above and beyond.' },
            { name: 'Chris Park', company: 'Startup Inc', quote: 'Best investment we have made this year. The ROI has been incredible.' },
            { name: 'Rachel Green', company: 'Marketing Co', quote: 'Easy to use and incredibly powerful. Exactly what we needed.' },
            { name: 'Tom Harris', company: 'Finance Ltd', quote: 'The customer support is exceptional. They truly care about their users.' },
            { name: 'Sophie Miller', company: 'E-commerce Plus', quote: 'We have seen a 40% increase in productivity since switching.' }
          ].map(t => `
          <div class="testimonial-card">
            <div class="stars">★★★★★</div>
            <p class="testimonial-text">"${t.quote}"</p>
            <div class="testimonial-author">
              <strong>${t.name}</strong>
              <span>${t.company}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="cta cta-primary">
      <div class="container">
        <h2>Ready to join them?</h2>
        <p>Start your success story today.</p>
        <a href="#" class="btn btn-secondary">Get Started Free</a>
      </div>
    </section>`
}

function generateStaticDefaultContent(page: PageSchema): string {
  return `<section class="content-section">
      <div class="container">
        <div class="content-wrapper">
          <p>Welcome to the ${page.title} page. This is where your content will appear. You can customize this page by adding components to your schema or editing the template.</p>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <div class="features-grid three-col">
          <div class="feature-card">
            <h3>Section 1</h3>
            <p>Content for this section.</p>
          </div>
          <div class="feature-card">
            <h3>Section 2</h3>
            <p>Content for this section.</p>
          </div>
          <div class="feature-card">
            <h3>Section 3</h3>
            <p>Content for this section.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Get Started Today</h2>
        <p>Ready to take the next step?</p>
        <a href="contact.html" class="btn btn-primary">Contact Us</a>
      </div>
    </section>`
}

// Helper to convert route paths to HTML file paths for static sites
function pathToHtmlHref(path: string | undefined): string {
  if (!path || path === '#') return '#'
  if (path === '/' || path === '/index') return 'index.html'
  // Convert /about to about.html, /services/web to services/web.html
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${cleanPath}.html`
}

function generateNavigation(nav: any, design?: any): string {
  if (!nav?.items?.length) return ''

  return `<header class="header" role="banner">
    <nav class="nav container" aria-label="Main navigation">
      <a href="index.html" class="nav-logo" aria-label="Home">Logo</a>
      <div class="nav-actions">
        <button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg class="icon-sun" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg class="icon-moon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <ul class="nav-menu" id="nav-menu" role="menubar">
        ${nav.items
          .map(
            (item: any) => `<li role="none"><a href="${pathToHtmlHref(item.path)}" class="nav-link" role="menuitem">${item.label}</a></li>`
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
    compact: { section: '4rem', element: '0.75rem' },
    normal: { section: '6rem', element: '1rem' },
    spacious: { section: '8rem', element: '1.5rem' },
  }

  const radiusValues = {
    none: '0',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  }

  const sp = spacingValues[spacing as keyof typeof spacingValues] || spacingValues.normal
  const rad = radiusValues[borderRadius as keyof typeof radiusValues] || radiusValues.lg

  return `/* Modern Generated Styles - 2024-2025 Industry Standards */

/* === CSS CUSTOM PROPERTIES === */
:root,
[data-theme="light"] {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-primary-rgb: ${hexToRgb(colors.primary)};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-muted: ${colors.muted};
  --color-border: ${colors.border};
  --color-error: ${colors.error};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};

  /* Neutral palette for depth */
  --color-surface: #ffffff;
  --color-surface-elevated: #fafafa;
  --color-surface-hover: #f4f4f5;

  /* Typography */
  --font-heading: '${typography.headingFont}', system-ui, -apple-system, sans-serif;
  --font-body: '${typography.bodyFont}', system-ui, -apple-system, sans-serif;
  --font-size-base: ${typography.baseFontSize}px;
  --line-height: ${typography.lineHeight};

  /* Spacing */
  --spacing-section: ${sp.section};
  --spacing-element: ${sp.element};
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: ${rad};
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows - Layered for premium feel */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-glow: 0 0 20px rgba(var(--color-primary-rgb), 0.3);
  --shadow-glow-lg: 0 0 40px rgba(var(--color-primary-rgb), 0.2);

  /* Transitions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  color-scheme: light;
}

/* Dark mode */
[data-theme="dark"] {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  --color-muted: #a1a1aa;
  --color-border: #27272a;
  --color-surface: #18181b;
  --color-surface-elevated: #27272a;
  --color-surface-hover: #3f3f46;
  color-scheme: dark;
}

/* System preference dark mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-background: #09090b;
    --color-foreground: #fafafa;
    --color-muted: #a1a1aa;
    --color-border: #27272a;
    --color-surface: #18181b;
    --color-surface-elevated: #27272a;
    --color-surface-hover: #3f3f46;
    color-scheme: dark;
  }
}

/* === RESET & BASE === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-lg);
  z-index: 1000;
  text-decoration: none;
  font-weight: 600;
  transition: top var(--duration-normal) var(--ease-out);
}

.skip-link:focus {
  top: 1rem;
}

/* Base */
html {
  font-size: var(--font-size-base);
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  line-height: var(--line-height);
  color: var(--color-foreground);
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Typography with modern letter-spacing */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

h1 { font-size: clamp(2.5rem, 6vw, 4rem); letter-spacing: -0.03em; }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

p {
  color: var(--color-muted);
  line-height: 1.7;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

a:hover {
  color: var(--color-secondary);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* === ANIMATIONS === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Scroll animation classes */
.animate-ready {
  opacity: 0;
  transform: translateY(20px);
}

.animate-in {
  animation: fadeInUp 0.6s var(--ease-out) forwards;
}

/* Stagger animation support */
[style*="--index"] {
  animation-delay: calc(var(--index) * 100ms);
}

/* === LAYOUT === */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }

/* === HEADER & NAVIGATION === */
.header {
  position: sticky;
  top: 0;
  background: rgba(var(--color-background), 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  transition: all var(--duration-normal) var(--ease-default);
}

.header.scrolled {
  box-shadow: var(--shadow-sm);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: var(--spacing-xl);
}

.nav-logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-foreground);
  letter-spacing: -0.02em;
  transition: opacity var(--duration-fast) var(--ease-default);
}

.nav-logo:hover {
  opacity: 0.8;
  color: var(--color-foreground);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  list-style: none;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-muted);
  font-weight: 500;
  font-size: 0.9375rem;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-default);
}

.nav-link:hover {
  color: var(--color-foreground);
  background: var(--color-surface-hover);
}

.nav-link.active {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  gap: 5px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default);
}

.nav-toggle:hover {
  background: var(--color-surface-hover);
}

.nav-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-foreground);
  border-radius: 1px;
  transition: all var(--duration-normal) var(--ease-spring);
}

.nav-toggle[aria-expanded="true"] span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.nav-toggle[aria-expanded="true"] span:nth-child(2) {
  opacity: 0;
}

.nav-toggle[aria-expanded="true"] span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Theme Toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-foreground);
  transition: all var(--duration-fast) var(--ease-default);
}

.theme-toggle:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-muted);
}

.theme-toggle .icon-sun { display: block; }
.theme-toggle .icon-moon { display: none; }

[data-theme="dark"] .theme-toggle .icon-sun { display: none; }
[data-theme="dark"] .theme-toggle .icon-moon { display: block; }

/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

/* === BUTTONS === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 0.875rem 1.75rem;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
  text-decoration: none;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  white-space: nowrap;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm), 0 0 0 0 rgba(var(--color-primary-rgb), 0);
}

.btn-primary:hover {
  background: var(--color-secondary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.btn-secondary {
  background: transparent;
  color: var(--color-foreground);
  border: 1.5px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-muted);
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: var(--color-foreground);
  padding: 0.75rem 1rem;
}

.btn-ghost:hover {
  background: var(--color-surface-hover);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
}

/* === HERO SECTION === */
.hero {
  position: relative;
  padding: var(--spacing-3xl) 0 var(--spacing-3xl);
  min-height: 80vh;
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(at 27% 37%, rgba(var(--color-primary-rgb), 0.08) 0px, transparent 50%),
    radial-gradient(at 97% 21%, rgba(var(--color-primary-rgb), 0.05) 0px, transparent 50%),
    radial-gradient(at 52% 99%, rgba(var(--color-primary-rgb), 0.04) 0px, transparent 50%),
    radial-gradient(at 10% 29%, rgba(var(--color-primary-rgb), 0.06) 0px, transparent 50%);
  pointer-events: none;
}

.hero .container {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  margin-bottom: var(--spacing-lg);
}

.hero-title {
  font-size: clamp(2.75rem, 7vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: var(--spacing-lg);
  line-height: 1.05;
  background: linear-gradient(135deg, var(--color-foreground) 0%, var(--color-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  color: var(--color-muted);
  max-width: 640px;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-2xl);
}

.hero-social-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  max-width: 500px;
  margin: 0 auto;
}

.hero-avatars {
  display: flex;
}

.hero-avatars img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--color-background);
  margin-left: -12px;
}

.hero-avatars img:first-child {
  margin-left: 0;
}

.hero-stat {
  text-align: left;
}

.hero-stat strong {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-foreground);
}

.hero-stat span {
  font-size: 0.875rem;
  color: var(--color-muted);
}

/* === SECTIONS === */
section {
  padding: var(--spacing-section) 0;
}

.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto var(--spacing-2xl);
}

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: var(--spacing-md);
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-muted);
  line-height: 1.7;
}

/* === CARDS === */
.card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-default);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.card-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-default);
}

.card:hover .card-image img {
  transform: scale(1.05);
}

.card-body {
  padding: var(--spacing-lg);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.card-text {
  color: var(--color-muted);
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Feature Cards */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-default);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  transition: all var(--duration-normal) var(--ease-default);
}

.feature-card:hover .feature-icon {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.feature-text {
  color: var(--color-muted);
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* === FORMS === */
.form {
  max-width: 480px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-foreground);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-foreground);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-default);
}

.form-input:hover,
.form-textarea:hover {
  border-color: var(--color-muted);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-muted);
  opacity: 0.7;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-error {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--color-error);
}

.form-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
  font-weight: 500;
}

.form-message--success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.form-message--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* === CTA SECTION === */
.cta {
  position: relative;
  padding: var(--spacing-3xl) 0;
  text-align: center;
  background: var(--color-primary);
  color: white;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%);
  pointer-events: none;
}

.cta .container {
  position: relative;
  z-index: 1;
}

.cta h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: var(--spacing-md);
  color: white;
}

.cta p {
  font-size: 1.125rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
  color: white;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.cta .btn-primary {
  background: white;
  color: var(--color-primary);
}

.cta .btn-primary:hover {
  background: rgba(255,255,255,0.9);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

/* === PRICING === */
.pricing {
  padding: var(--spacing-section) 0;
  background: var(--color-surface-elevated);
}

.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.pricing-toggle span {
  font-weight: 500;
  color: var(--color-muted);
}

.pricing-toggle span.active {
  color: var(--color-foreground);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  max-width: 900px;
  margin: 0 auto;
}

.pricing-card {
  position: relative;
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-2xl);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-default);
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-lg);
  transform: scale(1.02);
}

.pricing-card.featured:hover {
  transform: scale(1.02) translateY(-4px);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
}

.pricing-card h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
}

.pricing-card .price {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: var(--spacing-lg);
  color: var(--color-foreground);
}

.pricing-card .price span {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-muted);
}

.pricing-card ul {
  list-style: none;
  margin-bottom: var(--spacing-xl);
  text-align: left;
}

.pricing-card li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.pricing-card li::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.pricing-card .btn {
  width: 100%;
}

/* === TESTIMONIALS === */
.testimonials {
  padding: var(--spacing-section) 0;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.testimonial-card {
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-default);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.testimonial-rating {
  display: flex;
  gap: 2px;
  margin-bottom: var(--spacing-md);
  color: #fbbf24;
}

.testimonial-text {
  font-size: 1.0625rem;
  line-height: 1.7;
  margin-bottom: var(--spacing-lg);
  color: var(--color-foreground);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-author strong {
  display: block;
  font-weight: 600;
  color: var(--color-foreground);
}

.testimonial-author span {
  font-size: 0.875rem;
  color: var(--color-muted);
}

/* === FAQ === */
.faq {
  padding: var(--spacing-section) 0;
  background: var(--color-surface-elevated);
}

.faq-list {
  max-width: 720px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid var(--color-border);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) 0;
  font-weight: 600;
  font-size: 1.0625rem;
  color: var(--color-foreground);
  cursor: pointer;
  list-style: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.faq-item summary:hover {
  color: var(--color-primary);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: '+';
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--color-muted);
  transition: transform var(--duration-normal) var(--ease-spring);
}

.faq-item[open] summary::after {
  transform: rotate(45deg);
}

.faq-item p {
  padding-bottom: var(--spacing-lg);
  color: var(--color-muted);
  line-height: 1.7;
}

/* === FOOTER === */
.footer {
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
  background: var(--color-foreground);
  color: var(--color-background);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.footer-brand p {
  color: rgba(255,255,255,0.7);
  max-width: 280px;
  margin-top: var(--spacing-md);
}

.footer h3 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-background);
}

.footer h4 {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: var(--spacing-lg);
  color: rgba(255,255,255,0.5);
}

.footer ul {
  list-style: none;
}

.footer li {
  margin-bottom: var(--spacing-sm);
}

.footer a {
  color: rgba(255,255,255,0.7);
  font-size: 0.9375rem;
  transition: all var(--duration-fast) var(--ease-default);
}

.footer a:hover {
  color: white;
}

.footer-social {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.footer-social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-default);
}

.footer-social a:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-bottom p {
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem;
}

.footer-legal {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-legal a {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.5);
}

.footer-legal a:hover {
  color: white;
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: var(--spacing-lg);
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--duration-normal) var(--ease-default);
  }

  .nav-menu.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: var(--spacing-md);
    font-size: 1.125rem;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
  }

  .hero {
    min-height: auto;
    padding: var(--spacing-2xl) 0;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .hero-social-proof {
    flex-direction: column;
    text-align: center;
  }

  .hero-stat {
    text-align: center;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-brand p {
    margin-left: auto;
    margin-right: auto;
  }

  .footer-social {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card.featured {
    transform: none;
  }

  .pricing-card.featured:hover {
    transform: translateY(-4px);
  }
}

/* === UTILITY CLASSES === */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-primary { color: var(--color-primary); }
.text-muted { color: var(--color-muted); }
.text-success { color: var(--color-success); }
.text-error { color: var(--color-error); }

.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }

.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }

.hidden { display: none; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* === PAGE-SPECIFIC STYLES === */

/* Page Header */
.page-header {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  background: linear-gradient(to bottom, var(--color-surface-hover) 0%, transparent 100%);
  text-align: center;
}

.page-header h1 {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--spacing-md);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-muted);
  max-width: 600px;
  margin: 0 auto;
}

/* About Page */
.about-mission,
.values {
  padding: var(--spacing-section) 0;
}

.values {
  background: var(--color-surface-elevated);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
}

.about-text h2 {
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.about-text p {
  color: var(--color-muted);
  line-height: 1.7;
  margin-bottom: var(--spacing-md);
}

.about-image .placeholder-image {
  aspect-ratio: 16/9;
  background: var(--color-surface-hover);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.value-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.value-card h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.value-card p {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

/* Contact Page */
.contact-section {
  padding: var(--spacing-section) 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
}

.contact-form-wrapper h2,
.contact-info h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xl);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  background: var(--color-surface);
  color: var(--color-foreground);
  transition: all var(--duration-fast) var(--ease-default);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.info-item {
  margin-bottom: var(--spacing-xl);
}

.info-item h3 {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.info-item p {
  color: var(--color-muted);
}

/* Services Page */
.services-section {
  padding: var(--spacing-section) 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.service-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--duration-normal) var(--ease-default);
}

.service-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.service-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.service-card h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.service-card p {
  color: var(--color-muted);
  margin-bottom: var(--spacing-md);
  font-size: 0.9375rem;
}

/* Pricing Page */
.pricing-section,
.pricing {
  padding: var(--spacing-section) 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  text-align: center;
  position: relative;
  transition: all var(--duration-normal) var(--ease-default);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
  transform: scale(1.05);
}

.pricing-card .badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.pricing-card h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.pricing-card .price {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--spacing-lg);
}

.pricing-card .price span {
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-muted);
}

.features-list {
  list-style: none;
  text-align: left;
  margin-bottom: var(--spacing-xl);
}

.features-list li {
  padding: var(--spacing-sm) 0;
  color: var(--color-muted);
  position: relative;
  padding-left: var(--spacing-xl);
}

.features-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: 700;
}

/* Features Page */
.features-section {
  padding: var(--spacing-section) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
}

.features-grid.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.feature-item {
  display: flex;
  gap: var(--spacing-md);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.feature-content h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.feature-content p {
  color: var(--color-muted);
}

.feature-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.feature-card h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.feature-card p {
  color: var(--color-muted);
}

.features-highlight {
  padding: var(--spacing-section) 0;
  background: var(--color-surface-elevated);
}

.highlight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
}

.highlight-image .placeholder-image {
  aspect-ratio: 16/9;
  background: var(--color-surface-hover);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.highlight-content h2 {
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.highlight-content p {
  color: var(--color-muted);
  margin-bottom: var(--spacing-lg);
}

/* Blog Page */
.blog-section {
  padding: var(--spacing-section) 0;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.blog-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: all var(--duration-normal) var(--ease-default);
}

.blog-card:hover {
  box-shadow: var(--shadow-lg);
}

.blog-image .placeholder-image {
  aspect-ratio: 16/9;
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.blog-content {
  padding: var(--spacing-lg);
}

.blog-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-bottom: var(--spacing-sm);
}

.blog-content h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.blog-content h3 a {
  color: var(--color-foreground);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.blog-content h3 a:hover {
  color: var(--color-primary);
}

.blog-content p {
  color: var(--color-muted);
  margin-bottom: var(--spacing-md);
  font-size: 0.9375rem;
}

/* Newsletter */
.newsletter {
  padding: var(--spacing-section) 0;
  background: var(--color-primary);
  color: white;
  text-align: center;
}

.newsletter h2 {
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.newsletter p {
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
}

.newsletter-form {
  display: flex;
  gap: var(--spacing-sm);
  max-width: 400px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
}

/* FAQ Page */
.faq-section {
  padding: var(--spacing-section) 0;
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
}

.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
}

.faq-item summary {
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: "+";
  font-size: 1.25rem;
  color: var(--color-muted);
}

.faq-item[open] summary::after {
  content: "−";
}

.faq-item p {
  padding: 0 var(--spacing-lg) var(--spacing-md);
  color: var(--color-muted);
}

/* Team Page */
.team-section {
  padding: var(--spacing-section) 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
}

.team-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.team-avatar {
  width: 96px;
  height: 96px;
  background: var(--color-surface-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  font-size: 2rem;
  color: var(--color-muted);
}

.team-card h3 {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.team-card p {
  color: var(--color-muted);
  font-size: 0.875rem;
}

/* Portfolio Page */
.portfolio-section {
  padding: var(--spacing-section) 0;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.portfolio-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
}

.portfolio-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.portfolio-image {
  position: relative;
  aspect-ratio: 1;
}

.portfolio-image .placeholder-image {
  width: 100%;
  height: 100%;
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.portfolio-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--color-primary-rgb), 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-default);
}

.portfolio-card:hover .portfolio-overlay {
  opacity: 1;
}

.portfolio-info {
  padding: var(--spacing-md);
}

.portfolio-info h3 {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.portfolio-info p {
  color: var(--color-muted);
  font-size: 0.875rem;
}

/* Testimonials Page */
.testimonials-section {
  padding: var(--spacing-section) 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.testimonial-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.testimonial-card .stars {
  color: #fbbf24;
  margin-bottom: var(--spacing-md);
  letter-spacing: 2px;
}

.testimonial-text {
  color: var(--color-muted);
  font-style: italic;
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.testimonial-author strong {
  display: block;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.testimonial-author span {
  color: var(--color-muted);
  font-size: 0.875rem;
}

/* Content Section */
.content-section {
  padding: var(--spacing-section) 0;
}

.content-wrapper {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.content-wrapper p {
  color: var(--color-muted);
  font-size: 1.125rem;
  line-height: 1.7;
}

/* CTA Variants */
.cta-primary {
  background: var(--color-primary);
  color: white;
}

.cta-primary h2,
.cta-primary p {
  color: white;
}

.cta-primary p {
  opacity: 0.9;
}

/* Responsive for new sections */
@media (max-width: 1024px) {
  .about-grid,
  .contact-grid,
  .highlight-grid {
    grid-template-columns: 1fr;
  }

  .services-grid,
  .blog-grid,
  .portfolio-grid,
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .values-grid,
  .features-grid.three-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .services-grid,
  .blog-grid,
  .portfolio-grid,
  .testimonials-grid,
  .team-grid,
  .values-grid,
  .features-grid,
  .features-grid.three-col,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .newsletter-form {
    flex-direction: column;
  }
}`
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '99, 102, 241' // fallback to indigo
}

function generateScript(structure: any, components: ComponentSchema[]): string {
  return `// Generated JavaScript
(function() {
  'use strict';

  // Theme Management
  const ThemeManager = {
    STORAGE_KEY: 'theme-preference',

    init() {
      this.toggle = document.querySelector('.theme-toggle');
      this.root = document.documentElement;

      // Set initial theme
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      this.setTheme(theme);

      // Listen for toggle clicks
      if (this.toggle) {
        this.toggle.addEventListener('click', () => this.toggleTheme());
      }

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },

    setTheme(theme) {
      this.root.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    },

    toggleTheme() {
      const current = this.root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    }
  };

  // Mobile Navigation
  const Navigation = {
    init() {
      this.toggle = document.querySelector('.nav-toggle');
      this.menu = document.querySelector('.nav-menu');
      this.links = document.querySelectorAll('.nav-link');

      if (this.toggle && this.menu) {
        this.toggle.addEventListener('click', () => this.toggleMenu());

        // Close on link click
        this.links.forEach(link => {
          link.addEventListener('click', () => this.closeMenu());
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen()) {
            this.closeMenu();
            this.toggle.focus();
          }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
          if (this.isOpen() && !e.target.closest('.nav')) {
            this.closeMenu();
          }
        });
      }
    },

    isOpen() {
      return this.menu?.classList.contains('active');
    },

    toggleMenu() {
      const isOpen = this.menu.classList.toggle('active');
      this.toggle.setAttribute('aria-expanded', isOpen);
    },

    closeMenu() {
      this.menu?.classList.remove('active');
      this.toggle?.setAttribute('aria-expanded', 'false');
    }
  };

  // Smooth Scroll
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Set focus for accessibility
              target.setAttribute('tabindex', '-1');
              target.focus({ preventScroll: true });
            }
          }
        });
      });
    }
  };

  // Form Validation & Submission
  const Forms = {
    init() {
      document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', '');
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));

        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(field => {
          field.addEventListener('blur', () => this.validateField(field));
          field.addEventListener('input', () => this.clearError(field));
        });
      });
    },

    validateField(field) {
      const isValid = field.checkValidity();
      const errorEl = field.parentElement.querySelector('.error-message');

      if (!isValid) {
        field.classList.add('invalid');
        if (!errorEl) {
          const error = document.createElement('span');
          error.className = 'error-message';
          error.textContent = field.validationMessage;
          error.setAttribute('role', 'alert');
          field.parentElement.appendChild(error);
        }
      } else {
        this.clearError(field);
      }

      return isValid;
    },

    clearError(field) {
      field.classList.remove('invalid');
      const errorEl = field.parentElement.querySelector('.error-message');
      if (errorEl) errorEl.remove();
    },

    async handleSubmit(e, form) {
      e.preventDefault();

      // Validate all fields
      const fields = form.querySelectorAll('input, textarea');
      let isValid = true;
      fields.forEach(field => {
        if (!this.validateField(field)) isValid = false;
      });

      if (!isValid) {
        const firstError = form.querySelector('.invalid');
        if (firstError) firstError.focus();
        return;
      }

      // Submit
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        console.log('Form submitted:', data);

        // Show success message
        this.showMessage(form, 'Thank you for your submission!', 'success');
        form.reset();
      } catch (error) {
        this.showMessage(form, 'Something went wrong. Please try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    },

    showMessage(form, text, type) {
      const existing = form.querySelector('.form-message');
      if (existing) existing.remove();

      const message = document.createElement('div');
      message.className = 'form-message form-message--' + type;
      message.textContent = text;
      message.setAttribute('role', 'alert');
      form.appendChild(message);

      setTimeout(() => message.remove(), 5000);
    }
  };

  // Intersection Observer Animations
  const Animations = {
    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-ready');
        observer.observe(section);
      });
    }
  };

  // Initialize all modules
  document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
    Navigation.init();
    SmoothScroll.init();
    Forms.init();
    Animations.init();
  });
})();`
}
