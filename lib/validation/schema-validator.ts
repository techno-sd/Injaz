// Zod Schema Validation for UnifiedAppSchema
// Validates AI-generated schemas before processing

import { z } from 'zod'

// =============================================================================
// PLATFORM TYPES
// =============================================================================

export const PlatformTypeSchema = z.enum(['website', 'webapp'])
export const WebsiteSubTypeSchema = z.enum(['portfolio', 'blog', 'landing', 'business'])
export const WebappSubTypeSchema = z.enum(['dashboard', 'ecommerce', 'saas', 'social'])
export const SubPlatformTypeSchema = z.union([
  WebsiteSubTypeSchema,
  WebappSubTypeSchema,
])

export const ThemeModeSchema = z.enum(['light', 'dark', 'system'])
export const SpacingModeSchema = z.enum(['compact', 'normal', 'spacious'])

// =============================================================================
// RESPONSIVE CONFIG
// =============================================================================

export const ResponsiveBreakpointsSchema = z.object({
  sm: z.number().min(0).max(10000).default(640),
  md: z.number().min(0).max(10000).default(768),
  lg: z.number().min(0).max(10000).default(1024),
  xl: z.number().min(0).max(10000).default(1280),
  '2xl': z.number().min(0).max(10000).default(1536),
})

export const ResponsiveConfigSchema = z.object({
  strategy: z.enum(['mobile-first', 'desktop-first']).default('mobile-first'),
  breakpoints: ResponsiveBreakpointsSchema.optional(),
  containerMaxWidths: ResponsiveBreakpointsSchema.optional(),
  defaultPadding: z.object({
    mobile: z.string(),
    tablet: z.string(),
    desktop: z.string(),
  }).optional(),
})

// =============================================================================
// PWA CONFIG
// =============================================================================

export const PWAIconSchema = z.object({
  src: z.string().min(1),
  sizes: z.string().regex(/^\d+x\d+$/),
  type: z.string().min(1),
  purpose: z.enum(['any', 'maskable', 'monochrome']).optional(),
})

export const PWAServiceWorkerConfigSchema = z.object({
  enabled: z.boolean(),
  cachingStrategy: z.enum(['cache-first', 'network-first', 'stale-while-revalidate']),
  precacheAssets: z.array(z.string()).optional(),
})

export const PWAConfigSchema = z.object({
  enabled: z.boolean(),
  name: z.string().min(1).max(100),
  shortName: z.string().min(1).max(30),
  description: z.string().max(500).optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  display: z.enum(['standalone', 'fullscreen', 'minimal-ui', 'browser']),
  orientation: z.enum(['portrait', 'landscape', 'any']),
  startUrl: z.string().min(1),
  icons: z.array(PWAIconSchema),
  serviceWorker: PWAServiceWorkerConfigSchema,
})

// =============================================================================
// META SCHEMA
// =============================================================================

export const AppMetaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  platform: PlatformTypeSchema,
  subPlatform: SubPlatformTypeSchema.optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

// =============================================================================
// DESIGN SCHEMA
// =============================================================================

const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{3,8}$/, 'Invalid hex color')

export const ColorPaletteSchema = z.object({
  primary: HexColorSchema,
  secondary: HexColorSchema,
  accent: HexColorSchema,
  background: HexColorSchema,
  foreground: HexColorSchema,
  muted: HexColorSchema,
  border: HexColorSchema,
  error: HexColorSchema,
  success: HexColorSchema,
  warning: HexColorSchema,
})

export const TypographySchema = z.object({
  headingFont: z.string().min(1).max(100),
  bodyFont: z.string().min(1).max(100),
  monoFont: z.string().max(100).optional(),
  baseFontSize: z.number().min(8).max(48).default(16),
  lineHeight: z.number().min(1).max(3).default(1.5),
})

export const DesignSchemaSchema = z.object({
  theme: ThemeModeSchema.default('system'),
  colors: ColorPaletteSchema,
  typography: TypographySchema,
  spacing: SpacingModeSchema.default('normal'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  shadows: z.boolean().default(true),
  responsive: ResponsiveConfigSchema.optional(),
})

// =============================================================================
// COMPONENT SCHEMA
// =============================================================================

export const ComponentTypeSchema = z.enum([
  'button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'slider',
  'card', 'modal', 'drawer', 'tabs', 'accordion', 'table', 'list', 'grid', 'form',
  'nav', 'header', 'footer', 'sidebar', 'hero', 'cta', 'pricing', 'testimonial',
  'faq', 'contact', 'chart', 'map', 'image', 'video', 'carousel', 'avatar', 'badge',
  'alert', 'toast', 'progress', 'spinner', 'skeleton', 'custom',
])

export const ComponentPropSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'function']),
  required: z.boolean(),
  default: z.any().optional(),
  description: z.string().max(200).optional(),
})

export const ComponentSchemaSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  type: ComponentTypeSchema,
  description: z.string().max(500).optional(),
  props: z.array(ComponentPropSchema),
  children: z.array(z.string()).optional(),
  styles: z.record(z.string()).optional(),
  events: z.array(z.string()).optional(),
  dataBinding: z.object({
    source: z.string(),
    field: z.string(),
  }).optional(),
})

// =============================================================================
// PAGE SCHEMA
// =============================================================================

export const PageTypeSchema = z.enum(['static', 'dynamic', 'protected'])

export const PageSchemaSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  path: z.string().min(1).max(200),
  type: PageTypeSchema.default('static'),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  components: z.array(z.string()),
  layout: z.string().optional(),
  meta: z.object({
    title: z.string().max(100).optional(),
    description: z.string().max(200).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }).optional(),
  params: z.array(z.string()).optional(),
  middleware: z.array(z.string()).optional(),
})

// =============================================================================
// NAVIGATION SCHEMA
// =============================================================================

const NavItemBaseSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(50),
  path: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  protected: z.boolean().optional(),
})

type NavItemType = z.infer<typeof NavItemBaseSchema> & {
  children?: NavItemType[]
}

export const NavItemSchema: z.ZodType<NavItemType> = NavItemBaseSchema.extend({
  children: z.lazy(() => z.array(NavItemSchema)).optional(),
})

export const NavigationSchemaSchema = z.object({
  type: z.enum(['tabs', 'drawer', 'stack', 'header', 'sidebar']),
  items: z.array(NavItemSchema),
  position: z.enum(['top', 'bottom', 'left', 'right']).optional(),
  collapsible: z.boolean().optional(),
  showLabels: z.boolean().optional(),
})

// =============================================================================
// LAYOUT SCHEMA
// =============================================================================

export const LayoutSchemaSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  type: z.enum(['default', 'dashboard', 'auth', 'marketing', 'minimal']),
  header: z.boolean().optional(),
  footer: z.boolean().optional(),
  sidebar: z.boolean().optional(),
  navigation: NavigationSchemaSchema.optional(),
})

// =============================================================================
// STRUCTURE SCHEMA
// =============================================================================

export const StructureSchemaSchema = z.object({
  pages: z.array(PageSchemaSchema),
  navigation: NavigationSchemaSchema,
  layouts: z.array(LayoutSchemaSchema),
})

// =============================================================================
// AUTH SCHEMA
// =============================================================================

export const AuthProviderSchema = z.enum(['email', 'google', 'github', 'apple', 'facebook', 'twitter'])

export const AuthSchemaSchema = z.object({
  enabled: z.boolean(),
  providers: z.array(AuthProviderSchema),
  requireEmailVerification: z.boolean().default(false),
  passwordMinLength: z.number().min(4).max(128).default(8),
  mfa: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  redirectAfterLogin: z.string().optional(),
  redirectAfterLogout: z.string().optional(),
})

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

export const FieldTypeSchema = z.enum([
  'string', 'number', 'boolean', 'date', 'datetime', 'json',
  'array', 'uuid', 'text', 'email', 'url', 'enum',
])

export const TableFieldSchema = z.object({
  name: z.string().min(1).max(100),
  type: FieldTypeSchema,
  required: z.boolean(),
  unique: z.boolean().optional(),
  default: z.any().optional(),
  reference: z.object({
    table: z.string(),
    field: z.string(),
    onDelete: z.enum(['cascade', 'set_null', 'restrict']).optional(),
  }).optional(),
  enumValues: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
})

export const TableSchemaSchema = z.object({
  name: z.string().min(1).max(100),
  fields: z.array(TableFieldSchema),
  timestamps: z.boolean().optional(),
  softDelete: z.boolean().optional(),
  indexes: z.array(z.array(z.string())).optional(),
  rls: z.object({
    enabled: z.boolean(),
    policies: z.array(z.object({
      name: z.string(),
      action: z.enum(['select', 'insert', 'update', 'delete', 'all']),
      using: z.string().optional(),
      withCheck: z.string().optional(),
    })),
  }).optional(),
})

export const DatabaseSchemaSchema = z.object({
  provider: z.enum(['supabase', 'planetscale', 'neon', 'sqlite']),
  tables: z.array(TableSchemaSchema),
  seeds: z.record(z.array(z.any())).optional(),
})

// =============================================================================
// API SCHEMA
// =============================================================================

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

export const ApiEndpointSchema = z.object({
  path: z.string().min(1).max(200),
  method: HttpMethodSchema,
  description: z.string().max(500).optional(),
  protected: z.boolean().optional(),
  requestBody: z.object({
    type: z.enum(['json', 'form', 'multipart']),
    schema: z.record(z.any()),
  }).optional(),
  responseSchema: z.record(z.any()).optional(),
  rateLimit: z.object({
    requests: z.number().min(1),
    window: z.number().min(1),
  }).optional(),
})

export const ApiSchemaSchema = z.object({
  name: z.string().min(1).max(100),
  basePath: z.string().min(1),
  endpoints: z.array(ApiEndpointSchema),
})

// =============================================================================
// STORAGE SCHEMA
// =============================================================================

export const StorageBucketSchema = z.object({
  name: z.string().min(1).max(100),
  public: z.boolean(),
  allowedMimeTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().min(0).optional(),
  transformations: z.object({
    resize: z.object({ width: z.number(), height: z.number() }).optional(),
    quality: z.number().min(1).max(100).optional(),
  }).optional(),
})

export const StorageSchemaSchema = z.object({
  provider: z.enum(['supabase', 's3', 'cloudinary']),
  buckets: z.array(StorageBucketSchema),
})

// =============================================================================
// INTEGRATION SCHEMA
// =============================================================================

export const IntegrationTypeSchema = z.enum([
  'analytics', 'payment', 'email', 'sms', 'push', 'search', 'maps', 'social', 'ai', 'monitoring',
])

export const IntegrationSchemaSchema = z.object({
  type: IntegrationTypeSchema,
  provider: z.string().min(1).max(100),
  config: z.record(z.any()),
  enabled: z.boolean(),
})

// =============================================================================
// FEATURES SCHEMA
// =============================================================================

export const FeaturesSchemaSchema = z.object({
  auth: AuthSchemaSchema.optional(),
  database: DatabaseSchemaSchema.optional(),
  api: z.array(ApiSchemaSchema).optional(),
  storage: StorageSchemaSchema.optional(),
  pwa: PWAConfigSchema.optional(),
})

// =============================================================================
// UNIFIED APP SCHEMA
// =============================================================================

export const UnifiedAppSchemaValidator = z.object({
  meta: AppMetaSchema,
  design: DesignSchemaSchema,
  structure: StructureSchemaSchema,
  features: FeaturesSchemaSchema,
  components: z.array(ComponentSchemaSchema),
  integrations: z.array(IntegrationSchemaSchema),
})

// Partial schema for incremental updates
export const PartialUnifiedAppSchemaValidator = UnifiedAppSchemaValidator.partial()

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: {
    path: string
    message: string
  }[]
}

/**
 * Validate a complete UnifiedAppSchema
 */
export function validateSchema(schema: unknown): ValidationResult<z.infer<typeof UnifiedAppSchemaValidator>> {
  const result = UnifiedAppSchemaValidator.safeParse(schema)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  }
}

/**
 * Validate a partial schema (for incremental updates)
 */
export function validatePartialSchema(schema: unknown): ValidationResult<Partial<z.infer<typeof UnifiedAppSchemaValidator>>> {
  const result = PartialUnifiedAppSchemaValidator.safeParse(schema)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  }
}

/**
 * Validate and fix common issues in AI-generated schemas
 */
export function validateAndRepairSchema(schema: unknown): ValidationResult<z.infer<typeof UnifiedAppSchemaValidator>> {
  // First, try direct validation
  const directResult = validateSchema(schema)
  if (directResult.success) {
    return directResult
  }

  // Attempt to repair common issues
  const repaired = repairSchemaIssues(schema as Record<string, any>)

  // Try validation again
  const repairedResult = validateSchema(repaired)
  if (repairedResult.success) {
    return repairedResult
  }

  // Return original errors if repair didn't help
  return directResult
}

/**
 * Repair common schema issues from AI generation
 */
function repairSchemaIssues(schema: Record<string, any>): Record<string, any> {
  const repaired = JSON.parse(JSON.stringify(schema)) // Deep clone

  // Fix missing version
  if (repaired.meta && !repaired.meta.version) {
    repaired.meta.version = '1.0.0'
  }

  // Fix hex colors (add # if missing)
  if (repaired.design?.colors) {
    for (const key of Object.keys(repaired.design.colors)) {
      const color = repaired.design.colors[key]
      if (typeof color === 'string' && /^[0-9A-Fa-f]{3,8}$/.test(color)) {
        repaired.design.colors[key] = `#${color}`
      }
    }
  }

  // Fix empty arrays
  if (!Array.isArray(repaired.components)) {
    repaired.components = []
  }
  if (!Array.isArray(repaired.integrations)) {
    repaired.integrations = []
  }
  if (repaired.structure && !Array.isArray(repaired.structure.pages)) {
    repaired.structure.pages = []
  }
  if (repaired.structure && !Array.isArray(repaired.structure.layouts)) {
    repaired.structure.layouts = []
  }

  // Fix navigation items
  if (repaired.structure?.navigation && !Array.isArray(repaired.structure.navigation.items)) {
    repaired.structure.navigation.items = []
  }

  // Fix default spacing mode
  if (repaired.design && !repaired.design.spacing) {
    repaired.design.spacing = 'normal'
  }

  // Fix default theme
  if (repaired.design && !repaired.design.theme) {
    repaired.design.theme = 'system'
  }

  return repaired
}

/**
 * Get validation error summary
 */
export function getValidationSummary(errors: { path: string; message: string }[]): string {
  if (errors.length === 0) return 'Schema is valid'

  const grouped = errors.reduce((acc, err) => {
    const root = err.path.split('.')[0] || 'root'
    if (!acc[root]) acc[root] = []
    acc[root].push(err.message)
    return acc
  }, {} as Record<string, string[]>)

  return Object.entries(grouped)
    .map(([section, messages]) => `${section}: ${messages.join(', ')}`)
    .join('\n')
}
