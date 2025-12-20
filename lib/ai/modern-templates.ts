// Modern Templates System - 2024-2025 Industry Standards
// Pre-built patterns for modern websites, web apps, and mobile apps

import type { PlatformType, SubPlatformType } from '@/types/app-schema'

// ============================================================================
// MODERN DESIGN TOKENS (2024-2025)
// ============================================================================

export const modernDesignTokens = {
  // Color Palettes
  palettes: {
    modern: {
      primary: '#6366f1', // Indigo
      secondary: '#8b5cf6', // Purple
      accent: '#06b6d4', // Cyan
      background: '#0a0a0f', // Near black
      foreground: '#fafafa',
      muted: '#71717a',
      border: 'rgba(255,255,255,0.1)',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    },
    vibrant: {
      primary: '#ec4899', // Pink
      secondary: '#8b5cf6', // Purple
      accent: '#14b8a6', // Teal
      background: '#030712',
      foreground: '#f9fafb',
      muted: '#6b7280',
      border: 'rgba(255,255,255,0.08)',
      error: '#f43f5e',
      success: '#10b981',
      warning: '#f59e0b',
    },
    minimal: {
      primary: '#18181b',
      secondary: '#3f3f46',
      accent: '#2563eb',
      background: '#ffffff',
      foreground: '#09090b',
      muted: '#a1a1aa',
      border: '#e4e4e7',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#ca8a04',
    },
    nature: {
      primary: '#22c55e', // Green
      secondary: '#14b8a6', // Teal
      accent: '#84cc16', // Lime
      background: '#052e16',
      foreground: '#f0fdf4',
      muted: '#86efac',
      border: 'rgba(134,239,172,0.2)',
      error: '#ef4444',
      success: '#4ade80',
      warning: '#fbbf24',
    },
  },

  // Typography
  typography: {
    modern: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      scale: 1.25, // Major Third
    },
    elegant: {
      headingFont: 'Playfair Display',
      bodyFont: 'Source Sans Pro',
      monoFont: 'Fira Code',
      scale: 1.333, // Perfect Fourth
    },
    minimal: {
      headingFont: 'DM Sans',
      bodyFont: 'DM Sans',
      monoFont: 'DM Mono',
      scale: 1.2, // Minor Third
    },
    tech: {
      headingFont: 'Space Grotesk',
      bodyFont: 'IBM Plex Sans',
      monoFont: 'IBM Plex Mono',
      scale: 1.25,
    },
  },

  // Spacing
  spacing: {
    compact: { base: 4, scale: 1.5 },
    normal: { base: 8, scale: 2 },
    spacious: { base: 12, scale: 2 },
  },

  // Border Radius
  radius: {
    sharp: '0',
    subtle: '0.375rem',
    rounded: '0.75rem',
    pill: '9999px',
  },

  // Shadows (2024 style - larger, softer)
  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    glow: '0 0 40px rgba(99,102,241,0.3)',
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },
}

// ============================================================================
// MODERN COMPONENT PATTERNS
// ============================================================================

export const modernComponents = {
  // Hero Sections
  heroes: {
    gradient: `
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>
      </section>
    `,
    minimal: `
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="text-primary font-medium mb-4 block">{tagline}</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground mb-8">{subtitle}</p>
            <Button size="lg">{cta}</Button>
          </div>
        </div>
      </section>
    `,
    split: `
      <section className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{description}</p>
            <div className="flex gap-4">
              <Button>{primaryCta}</Button>
              <Button variant="ghost">{secondaryCta}</Button>
            </div>
          </div>
        </div>
        <div className="relative bg-muted">
          <Image src={image} alt="" fill className="object-cover" />
        </div>
      </section>
    `,
  },

  // Bento Grids (2024 trend)
  bento: `
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <div className="col-span-2 row-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold mb-2">{mainFeature}</h3>
        <p className="text-muted-foreground">{mainDescription}</p>
      </div>
      <div className="bg-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <Icon className="h-8 w-8 text-primary mb-4" />
        <h4 className="font-semibold mb-2">{feature1}</h4>
        <p className="text-sm text-muted-foreground">{desc1}</p>
      </div>
      <div className="bg-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <Icon className="h-8 w-8 text-primary mb-4" />
        <h4 className="font-semibold mb-2">{feature2}</h4>
        <p className="text-sm text-muted-foreground">{desc2}</p>
      </div>
      <div className="col-span-2 bg-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <Icon className="h-10 w-10 text-primary" />
          <div>
            <h4 className="font-semibold">{feature3}</h4>
            <p className="text-sm text-muted-foreground">{desc3}</p>
          </div>
        </div>
      </div>
    </div>
  `,

  // Glassmorphism Card
  glass: `
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
      <div className="relative bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        {children}
      </div>
    </div>
  `,

  // Modern Navigation
  navigation: {
    sticky: `
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>
    `,
    floating: `
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <nav className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border border-border/40 rounded-full shadow-lg">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-all">
                {item.label}
              </Link>
            ))}
          </div>
          <Button size="sm" className="rounded-full">Get Started</Button>
        </nav>
      </header>
    `,
  },

  // Feature Sections
  features: {
    cards: `
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{sectionDescription}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(feature => (
              <Card key={feature.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    `,
    alternating: `
      <section className="py-24">
        <div className="container space-y-24">
          {features.map((feature, i) => (
            <div key={feature.id} className={\`grid lg:grid-cols-2 gap-12 items-center \${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}\`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <span className="text-primary font-medium">{feature.tagline}</span>
                <h3 className="text-3xl font-bold mt-2 mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.points.map(point => (
                    <li key={point} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={\`relative aspect-video rounded-2xl overflow-hidden \${i % 2 === 1 ? 'lg:order-1' : ''}\`}>
                <Image src={feature.image} alt="" fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>
    `,
  },

  // Pricing
  pricing: `
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Choose the plan that works for you</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(plan => (
            <Card key={plan.id} className={\`relative \${plan.popular ? 'border-primary shadow-lg scale-105' : ''}\`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">\${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  `,

  // Testimonials
  testimonials: `
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Thousands</h2>
          <p className="text-muted-foreground">See what our customers are saying</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <Card key={t.id} className="bg-background">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  `,

  // CTA
  cta: `
    <section className="py-24">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">{description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">{primaryCta}</Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                {secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  // Footer
  footer: `
    <footer className="border-t bg-muted/30">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Logo className="mb-4" />
            <p className="text-muted-foreground max-w-xs mb-4">{description}</p>
            <div className="flex gap-4">
              {socialLinks.map(link => (
                <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map(group => (
            <div key={group.title}>
              <h4 className="font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map(link => (
                  <li key={link.href}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {year} {companyName}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  `,
}

// ============================================================================
// MOBILE PATTERNS (React Native/Expo)
// ============================================================================

export const mobilePatterns = {
  // Tab Navigation
  tabBar: `
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
    </Tabs>
  `,

  // Modern Card
  card: `
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.cardDescription, { color: colors.muted }]}>{description}</Text>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>

    const styles = StyleSheet.create({
      card: {
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: 4,
          },
        }),
      },
    })
  `,

  // Pull to Refresh List
  list: `
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      }
    />
  `,

  // Bottom Sheet
  bottomSheet: `
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['25%', '50%', '90%']}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
    >
      <BottomSheetView style={styles.sheetContent}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  `,

  // Skeleton Loading
  skeleton: `
    <View style={styles.skeleton}>
      <Animated.View
        style={[
          styles.skeletonBar,
          { opacity: pulseAnim },
          { backgroundColor: colors.muted + '30' },
        ]}
      />
    </View>
  `,
}

// ============================================================================
// INDUSTRY TEMPLATES
// ============================================================================

export const industryTemplates: Record<SubPlatformType, {
  name: string
  description: string
  pages: string[]
  features: string[]
  components: string[]
}> = {
  // Website Types
  portfolio: {
    name: 'Portfolio',
    description: 'Personal or agency portfolio',
    pages: ['/', '/about', '/work', '/contact'],
    features: ['animations', 'gallery', 'contact-form'],
    components: ['hero-split', 'project-grid', 'skill-badges', 'testimonials'],
  },
  blog: {
    name: 'Blog',
    description: 'Content-focused blog',
    pages: ['/', '/blog', '/blog/[slug]', '/about', '/contact'],
    features: ['markdown', 'search', 'categories', 'newsletter'],
    components: ['hero-minimal', 'post-card', 'author-bio', 'newsletter-form'],
  },
  landing: {
    name: 'Landing Page',
    description: 'Product or service landing page',
    pages: ['/'],
    features: ['animations', 'scroll-effects', 'analytics'],
    components: ['hero-gradient', 'features-bento', 'pricing', 'testimonials', 'cta', 'faq'],
  },
  business: {
    name: 'Business',
    description: 'Company website',
    pages: ['/', '/about', '/services', '/team', '/contact'],
    features: ['contact-form', 'map', 'team-section'],
    components: ['hero-split', 'services-grid', 'team-cards', 'stats', 'cta'],
  },

  // Web App Types
  dashboard: {
    name: 'Dashboard',
    description: 'Admin or analytics dashboard',
    pages: ['/', '/analytics', '/users', '/settings'],
    features: ['auth', 'charts', 'tables', 'notifications'],
    components: ['sidebar-nav', 'stats-cards', 'data-table', 'charts', 'command-menu'],
  },
  ecommerce: {
    name: 'E-Commerce',
    description: 'Online store',
    pages: ['/', '/products', '/products/[id]', '/cart', '/checkout', '/account'],
    features: ['auth', 'payments', 'cart', 'search', 'filters'],
    components: ['product-grid', 'product-card', 'cart-drawer', 'checkout-form', 'order-summary'],
  },
  saas: {
    name: 'SaaS',
    description: 'Software as a Service',
    pages: ['/', '/features', '/pricing', '/login', '/signup', '/dashboard'],
    features: ['auth', 'subscriptions', 'billing', 'team'],
    components: ['hero-gradient', 'features-alternating', 'pricing-table', 'testimonials'],
  },
  social: {
    name: 'Social',
    description: 'Social network or community',
    pages: ['/', '/feed', '/profile/[id]', '/messages', '/notifications'],
    features: ['auth', 'realtime', 'uploads', 'notifications'],
    components: ['feed', 'post-card', 'profile-header', 'message-thread', 'notification-list'],
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDesignTokensForStyle(style: 'modern' | 'vibrant' | 'minimal' | 'nature' = 'modern') {
  return {
    colors: modernDesignTokens.palettes[style],
    typography: modernDesignTokens.typography[style === 'minimal' ? 'minimal' : 'modern'],
    shadows: modernDesignTokens.shadows,
    animations: modernDesignTokens.animations,
  }
}

export function getTemplateForIndustry(subPlatform: SubPlatformType) {
  return industryTemplates[subPlatform] || industryTemplates.landing
}

export function getComponentPattern(name: keyof typeof modernComponents) {
  return modernComponents[name]
}

export function getMobilePattern(name: keyof typeof mobilePatterns) {
  return mobilePatterns[name]
}
