// Unified App Schema Types for Multi-Platform Support
// Used by Controller (GPT-4.1-mini) to output structured planning data
// Used by CodeGen (GPT-4.1) to generate platform-specific code

// =============================================================================
// PLATFORM TYPES
// =============================================================================

export type PlatformType = 'website' | 'webapp' | 'mobile'

export type ThemeMode = 'light' | 'dark' | 'system'

export type SpacingMode = 'compact' | 'normal' | 'spacious'

// =============================================================================
// META SCHEMA
// =============================================================================

export interface AppMeta {
  name: string
  description: string
  platform: PlatformType
  version: string
  icon?: string
  keywords?: string[]
}

// =============================================================================
// DESIGN SCHEMA
// =============================================================================

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  error: string
  success: string
  warning: string
}

export interface Typography {
  headingFont: string
  bodyFont: string
  monoFont?: string
  baseFontSize: number
  lineHeight: number
}

export interface DesignSchema {
  theme: ThemeMode
  colors: ColorPalette
  typography: Typography
  spacing: SpacingMode
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  shadows: boolean
}

// =============================================================================
// COMPONENT SCHEMA
// =============================================================================

export type ComponentType =
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'card'
  | 'modal'
  | 'drawer'
  | 'tabs'
  | 'accordion'
  | 'table'
  | 'list'
  | 'grid'
  | 'form'
  | 'nav'
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'hero'
  | 'cta'
  | 'pricing'
  | 'testimonial'
  | 'faq'
  | 'contact'
  | 'chart'
  | 'map'
  | 'image'
  | 'video'
  | 'carousel'
  | 'avatar'
  | 'badge'
  | 'alert'
  | 'toast'
  | 'progress'
  | 'spinner'
  | 'skeleton'
  | 'custom'

export interface ComponentProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function'
  required: boolean
  default?: any
  description?: string
}

export interface ComponentSchema {
  id: string
  name: string
  type: ComponentType
  description?: string
  props: ComponentProp[]
  children?: string[] // IDs of child components
  styles?: Record<string, string>
  events?: string[]
  dataBinding?: {
    source: string
    field: string
  }
}

// =============================================================================
// PAGE SCHEMA
// =============================================================================

export type PageType = 'static' | 'dynamic' | 'protected'

export interface PageSchema {
  id: string
  name: string
  path: string
  type: PageType
  title: string
  description?: string
  components: string[] // Component IDs
  layout?: string // Layout ID
  meta?: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }
  params?: string[] // Dynamic route params
  middleware?: string[] // Middleware names
}

// =============================================================================
// NAVIGATION SCHEMA
// =============================================================================

export interface NavItem {
  id: string
  label: string
  path?: string
  icon?: string
  children?: NavItem[]
  badge?: string
  protected?: boolean
}

export interface NavigationSchema {
  type: 'tabs' | 'drawer' | 'stack' | 'header' | 'sidebar'
  items: NavItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  collapsible?: boolean
  showLabels?: boolean
}

// =============================================================================
// LAYOUT SCHEMA
// =============================================================================

export interface LayoutSchema {
  id: string
  name: string
  type: 'default' | 'dashboard' | 'auth' | 'marketing' | 'minimal'
  header?: boolean
  footer?: boolean
  sidebar?: boolean
  navigation?: NavigationSchema
}

// =============================================================================
// STRUCTURE SCHEMA
// =============================================================================

export interface StructureSchema {
  pages: PageSchema[]
  navigation: NavigationSchema
  layouts: LayoutSchema[]
}

// =============================================================================
// AUTH SCHEMA
// =============================================================================

export type AuthProvider = 'email' | 'google' | 'github' | 'apple' | 'facebook' | 'twitter'

export interface AuthSchema {
  enabled: boolean
  providers: AuthProvider[]
  requireEmailVerification: boolean
  passwordMinLength: number
  mfa?: boolean
  roles?: string[]
  redirectAfterLogin?: string
  redirectAfterLogout?: string
}

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'array'
  | 'uuid'
  | 'text'
  | 'email'
  | 'url'
  | 'enum'

export interface TableField {
  name: string
  type: FieldType
  required: boolean
  unique?: boolean
  default?: any
  reference?: {
    table: string
    field: string
    onDelete?: 'cascade' | 'set_null' | 'restrict'
  }
  enumValues?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface TableSchema {
  name: string
  fields: TableField[]
  timestamps?: boolean
  softDelete?: boolean
  indexes?: string[][]
  rls?: {
    enabled: boolean
    policies: {
      name: string
      action: 'select' | 'insert' | 'update' | 'delete' | 'all'
      using?: string
      withCheck?: string
    }[]
  }
}

export interface DatabaseSchema {
  provider: 'supabase' | 'planetscale' | 'neon' | 'sqlite'
  tables: TableSchema[]
  seeds?: Record<string, any[]>
}

// =============================================================================
// API SCHEMA
// =============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiEndpoint {
  path: string
  method: HttpMethod
  description?: string
  protected?: boolean
  requestBody?: {
    type: 'json' | 'form' | 'multipart'
    schema: Record<string, any>
  }
  responseSchema?: Record<string, any>
  rateLimit?: {
    requests: number
    window: number // seconds
  }
}

export interface ApiSchema {
  name: string
  basePath: string
  endpoints: ApiEndpoint[]
}

// =============================================================================
// STORAGE SCHEMA
// =============================================================================

export interface StorageBucket {
  name: string
  public: boolean
  allowedMimeTypes?: string[]
  maxFileSize?: number // bytes
  transformations?: {
    resize?: { width: number; height: number }
    quality?: number
  }
}

export interface StorageSchema {
  provider: 'supabase' | 's3' | 'cloudinary'
  buckets: StorageBucket[]
}

// =============================================================================
// INTEGRATION SCHEMA
// =============================================================================

export type IntegrationType =
  | 'analytics'
  | 'payment'
  | 'email'
  | 'sms'
  | 'push'
  | 'search'
  | 'maps'
  | 'social'
  | 'ai'
  | 'monitoring'

export interface IntegrationSchema {
  type: IntegrationType
  provider: string
  config: Record<string, any>
  enabled: boolean
}

// =============================================================================
// FEATURES SCHEMA
// =============================================================================

export interface FeaturesSchema {
  auth?: AuthSchema
  database?: DatabaseSchema
  api?: ApiSchema[]
  storage?: StorageSchema
}

// =============================================================================
// UNIFIED APP SCHEMA
// =============================================================================

export interface UnifiedAppSchema {
  meta: AppMeta
  design: DesignSchema
  structure: StructureSchema
  features: FeaturesSchema
  components: ComponentSchema[]
  integrations: IntegrationSchema[]
}

// =============================================================================
// AI MODE TYPES
// =============================================================================

export type AIMode = 'auto' | 'controller' | 'codegen'

export interface ControllerOutput {
  schema: Partial<UnifiedAppSchema>
  reasoning?: string
  suggestions?: string[]
}

export interface CodeGenInput {
  schema: UnifiedAppSchema
  platform: PlatformType
  targetFiles?: string[]
}

export interface CodeGenOutput {
  files: {
    path: string
    content: string
    language: string
  }[]
  dependencies?: Record<string, string>
  scripts?: Record<string, string>
}

// =============================================================================
// SSE EVENT TYPES
// =============================================================================

export type SSEEventType =
  | 'planning'
  | 'schema'
  | 'generating'
  | 'content'
  | 'actions'
  | 'error'
  | 'complete'

export interface SSEEvent {
  type: SSEEventType
  data: any
  timestamp: number
}

export interface PlanningEvent extends SSEEvent {
  type: 'planning'
  data: {
    phase: string
    message: string
  }
}

export interface SchemaEvent extends SSEEvent {
  type: 'schema'
  data: {
    schema: Partial<UnifiedAppSchema>
    complete: boolean
  }
}

export interface GeneratingEvent extends SSEEvent {
  type: 'generating'
  data: {
    file: string
    progress: number
    total: number
  }
}

export interface ContentEvent extends SSEEvent {
  type: 'content'
  data: {
    content: string
  }
}

export interface ActionsEvent extends SSEEvent {
  type: 'actions'
  data: {
    actions: {
      type: 'create_or_update_file' | 'delete_file'
      path: string
      content?: string
    }[]
  }
}

// =============================================================================
// PROJECT EXTENSION
// =============================================================================

export interface ProjectWithSchema {
  id: string
  name: string
  platform: PlatformType
  schema?: UnifiedAppSchema
  generationHistory?: {
    timestamp: string
    mode: AIMode
    input: string
    output: ControllerOutput | CodeGenOutput
  }[]
}

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

export interface PlatformTemplate {
  id: string
  name: string
  description: string
  platform: PlatformType
  category: string
  thumbnail?: string
  schema: Partial<UnifiedAppSchema>
  baseFiles: {
    path: string
    content: string
  }[]
  dependencies?: Record<string, string>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function isValidPlatform(platform: string): platform is PlatformType {
  return ['website', 'webapp', 'mobile'].includes(platform)
}

export function isValidAIMode(mode: string): mode is AIMode {
  return ['auto', 'controller', 'codegen'].includes(mode)
}

export function createEmptySchema(platform: PlatformType): UnifiedAppSchema {
  return {
    meta: {
      name: '',
      description: '',
      platform,
      version: '1.0.0',
    },
    design: {
      theme: 'system',
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        foreground: '#0a0a0a',
        muted: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        baseFontSize: 16,
        lineHeight: 1.5,
      },
      spacing: 'normal',
      borderRadius: 'md',
      shadows: true,
    },
    structure: {
      pages: [],
      navigation: {
        type: 'header',
        items: [],
      },
      layouts: [],
    },
    features: {},
    components: [],
    integrations: [],
  }
}
