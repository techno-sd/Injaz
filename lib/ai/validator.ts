// Schema Validator Service
// Validates UnifiedAppSchema before code generation to ensure completeness and correctness

import type {
  UnifiedAppSchema,
  PlatformType,
  PageSchema,
  ComponentSchema,
  DesignSchema,
  StructureSchema,
  FeaturesSchema,
  ColorPalette,
} from '@/types/app-schema'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: string[]
  score: number // 0-100 completeness score
}

// Color validation regex for hex colors
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

// Validate hex color format
function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color)
}

// Validate URL path format
function isValidPath(path: string): boolean {
  return path.startsWith('/') && !path.includes(' ')
}

// Check color contrast (simplified WCAG check)
function hasGoodContrast(foreground: string, background: string): boolean {
  // Simplified check - in production, use proper luminance calculation
  const isDarkFg = foreground.toLowerCase().includes('0') || foreground.includes('1') || foreground.includes('2')
  const isLightBg = background.toLowerCase().includes('f') || background.includes('e') || background.includes('d')
  return (isDarkFg && isLightBg) || (!isDarkFg && !isLightBg)
}

// Validate meta section
function validateMeta(schema: Partial<UnifiedAppSchema>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!schema.meta) {
    errors.push({ field: 'meta', message: 'Meta section is required', severity: 'error' })
    return errors
  }

  const { meta } = schema

  if (!meta.name || meta.name.trim() === '') {
    errors.push({ field: 'meta.name', message: 'App name is required', severity: 'error' })
  }

  if (!meta.description || meta.description.trim() === '') {
    errors.push({ field: 'meta.description', message: 'App description is required', severity: 'warning' })
  }

  if (!meta.platform || !['website', 'webapp', 'mobile'].includes(meta.platform)) {
    errors.push({ field: 'meta.platform', message: 'Valid platform (website/webapp/mobile) is required', severity: 'error' })
  }

  if (!meta.version) {
    errors.push({ field: 'meta.version', message: 'Version is required', severity: 'warning' })
  }

  return errors
}

// Validate design section
function validateDesign(schema: Partial<UnifiedAppSchema>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!schema.design) {
    errors.push({ field: 'design', message: 'Design section is required', severity: 'error' })
    return errors
  }

  const { design } = schema

  // Validate colors
  if (!design.colors) {
    errors.push({ field: 'design.colors', message: 'Color palette is required', severity: 'error' })
  } else {
    const requiredColors: (keyof ColorPalette)[] = [
      'primary', 'secondary', 'accent', 'background', 'foreground',
      'muted', 'border', 'error', 'success', 'warning'
    ]

    for (const color of requiredColors) {
      if (!design.colors[color]) {
        errors.push({ field: `design.colors.${color}`, message: `${color} color is required`, severity: 'error' })
      } else if (!isValidHexColor(design.colors[color])) {
        errors.push({ field: `design.colors.${color}`, message: `${color} must be a valid hex color`, severity: 'error' })
      }
    }

    // Check contrast
    if (design.colors.foreground && design.colors.background) {
      if (!hasGoodContrast(design.colors.foreground, design.colors.background)) {
        errors.push({
          field: 'design.colors',
          message: 'Foreground/background colors may have poor contrast (WCAG)',
          severity: 'warning'
        })
      }
    }
  }

  // Validate typography
  if (!design.typography) {
    errors.push({ field: 'design.typography', message: 'Typography settings are required', severity: 'error' })
  } else {
    if (!design.typography.headingFont) {
      errors.push({ field: 'design.typography.headingFont', message: 'Heading font is required', severity: 'warning' })
    }
    if (!design.typography.bodyFont) {
      errors.push({ field: 'design.typography.bodyFont', message: 'Body font is required', severity: 'warning' })
    }
    if (!design.typography.baseFontSize || design.typography.baseFontSize < 12 || design.typography.baseFontSize > 24) {
      errors.push({ field: 'design.typography.baseFontSize', message: 'Base font size should be between 12-24px', severity: 'warning' })
    }
  }

  // Validate theme
  if (!design.theme || !['light', 'dark', 'system'].includes(design.theme)) {
    errors.push({ field: 'design.theme', message: 'Valid theme (light/dark/system) is required', severity: 'warning' })
  }

  return errors
}

// Validate structure section
function validateStructure(schema: Partial<UnifiedAppSchema>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!schema.structure) {
    errors.push({ field: 'structure', message: 'Structure section is required', severity: 'error' })
    return errors
  }

  const { structure } = schema

  // Validate pages
  if (!structure.pages || structure.pages.length === 0) {
    errors.push({ field: 'structure.pages', message: 'At least one page is required', severity: 'error' })
  } else {
    const pageIds = new Set<string>()
    const pagePaths = new Set<string>()

    for (let i = 0; i < structure.pages.length; i++) {
      const page = structure.pages[i]

      if (!page.id) {
        errors.push({ field: `structure.pages[${i}].id`, message: 'Page ID is required', severity: 'error' })
      } else if (pageIds.has(page.id)) {
        errors.push({ field: `structure.pages[${i}].id`, message: `Duplicate page ID: ${page.id}`, severity: 'error' })
      } else {
        pageIds.add(page.id)
      }

      if (!page.path) {
        errors.push({ field: `structure.pages[${i}].path`, message: 'Page path is required', severity: 'error' })
      } else if (!isValidPath(page.path)) {
        errors.push({ field: `structure.pages[${i}].path`, message: `Invalid path format: ${page.path}`, severity: 'error' })
      } else if (pagePaths.has(page.path)) {
        errors.push({ field: `structure.pages[${i}].path`, message: `Duplicate page path: ${page.path}`, severity: 'error' })
      } else {
        pagePaths.add(page.path)
      }

      if (!page.name) {
        errors.push({ field: `structure.pages[${i}].name`, message: 'Page name is required', severity: 'warning' })
      }
    }

    // Check for home page
    if (!pagePaths.has('/')) {
      errors.push({ field: 'structure.pages', message: 'Home page (path: /) is recommended', severity: 'warning' })
    }
  }

  // Validate navigation
  if (!structure.navigation) {
    errors.push({ field: 'structure.navigation', message: 'Navigation is required', severity: 'warning' })
  } else {
    if (!structure.navigation.type) {
      errors.push({ field: 'structure.navigation.type', message: 'Navigation type is required', severity: 'warning' })
    }
    if (!structure.navigation.items || structure.navigation.items.length === 0) {
      errors.push({ field: 'structure.navigation.items', message: 'Navigation items are recommended', severity: 'warning' })
    }
  }

  // Validate layouts
  if (!structure.layouts || structure.layouts.length === 0) {
    errors.push({ field: 'structure.layouts', message: 'At least one layout is recommended', severity: 'warning' })
  }

  return errors
}

// Validate components section
function validateComponents(schema: Partial<UnifiedAppSchema>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!schema.components) {
    errors.push({ field: 'components', message: 'Components section is required', severity: 'warning' })
    return errors
  }

  const componentIds = new Set<string>()

  for (let i = 0; i < schema.components.length; i++) {
    const component = schema.components[i]

    if (!component.id) {
      errors.push({ field: `components[${i}].id`, message: 'Component ID is required', severity: 'error' })
    } else if (componentIds.has(component.id)) {
      errors.push({ field: `components[${i}].id`, message: `Duplicate component ID: ${component.id}`, severity: 'error' })
    } else {
      componentIds.add(component.id)
    }

    if (!component.name) {
      errors.push({ field: `components[${i}].name`, message: 'Component name is required', severity: 'warning' })
    }

    if (!component.type) {
      errors.push({ field: `components[${i}].type`, message: 'Component type is required', severity: 'error' })
    }
  }

  // Validate component references in pages
  if (schema.structure?.pages) {
    for (const page of schema.structure.pages) {
      if (page.components) {
        for (const compId of page.components) {
          if (!componentIds.has(compId)) {
            errors.push({
              field: `structure.pages.${page.id}.components`,
              message: `Referenced component not found: ${compId}`,
              severity: 'error'
            })
          }
        }
      }
    }
  }

  return errors
}

// Validate features section
function validateFeatures(schema: Partial<UnifiedAppSchema>): ValidationError[] {
  const errors: ValidationError[] = []
  const platform = schema.meta?.platform

  if (!schema.features) {
    return errors // Features are optional
  }

  const { features } = schema

  // Validate auth if enabled
  if (features.auth?.enabled) {
    if (!features.auth.providers || features.auth.providers.length === 0) {
      errors.push({ field: 'features.auth.providers', message: 'At least one auth provider is required when auth is enabled', severity: 'error' })
    }
    if (features.auth.passwordMinLength && features.auth.passwordMinLength < 8) {
      errors.push({ field: 'features.auth.passwordMinLength', message: 'Password minimum length should be at least 8', severity: 'warning' })
    }
  }

  // Validate database if present
  if (features.database) {
    if (!features.database.tables || features.database.tables.length === 0) {
      errors.push({ field: 'features.database.tables', message: 'At least one table is required when database is configured', severity: 'warning' })
    } else {
      const tableNames = new Set<string>()
      for (const table of features.database.tables) {
        if (tableNames.has(table.name)) {
          errors.push({ field: 'features.database.tables', message: `Duplicate table name: ${table.name}`, severity: 'error' })
        }
        tableNames.add(table.name)

        if (!table.fields || table.fields.length === 0) {
          errors.push({ field: `features.database.tables.${table.name}`, message: 'Table must have at least one field', severity: 'error' })
        }
      }
    }
  }

  // Validate PWA for webapp
  if (platform === 'webapp' && features.pwa?.enabled) {
    if (!features.pwa.name) {
      errors.push({ field: 'features.pwa.name', message: 'PWA name is required when PWA is enabled', severity: 'warning' })
    }
    if (!features.pwa.shortName) {
      errors.push({ field: 'features.pwa.shortName', message: 'PWA short name is required', severity: 'warning' })
    }
  }

  return errors
}

// Generate suggestions based on schema
function generateSuggestions(schema: Partial<UnifiedAppSchema>): string[] {
  const suggestions: string[] = []
  const platform = schema.meta?.platform

  // Platform-specific suggestions
  if (platform === 'webapp') {
    if (!schema.features?.auth?.enabled) {
      suggestions.push('Consider enabling authentication for user management')
    }
    if (!schema.features?.pwa?.enabled) {
      suggestions.push('Enable PWA for offline support and better mobile experience')
    }
    if (!schema.features?.database) {
      suggestions.push('Consider adding a database for data persistence')
    }
  }

  if (platform === 'mobile') {
    if (!schema.structure?.navigation || schema.structure.navigation.type !== 'tabs') {
      suggestions.push('Tab navigation is recommended for mobile apps')
    }
  }

  // Design suggestions
  if (schema.design?.theme === 'light') {
    suggestions.push('Consider supporting dark mode with theme: "system"')
  }

  // Structure suggestions
  if (schema.structure?.pages && schema.structure.pages.length > 10) {
    suggestions.push('Large number of pages detected - consider grouping with layouts')
  }

  // Component suggestions
  if (schema.components && schema.components.length < 3) {
    suggestions.push('Consider defining more reusable components for consistency')
  }

  return suggestions
}

// Calculate completeness score
function calculateScore(errors: ValidationError[], warnings: ValidationError[], schema: Partial<UnifiedAppSchema>): number {
  let score = 100

  // Deduct for errors
  score -= errors.filter(e => e.severity === 'error').length * 10
  score -= warnings.filter(e => e.severity === 'warning').length * 2

  // Bonus for completeness
  if (schema.meta?.name && schema.meta?.description) score += 2
  if (schema.design?.colors && schema.design?.typography) score += 2
  if (schema.structure?.pages && schema.structure.pages.length > 0) score += 2
  if (schema.components && schema.components.length > 0) score += 2
  if (schema.features?.auth) score += 1
  if (schema.features?.database) score += 1

  return Math.max(0, Math.min(100, score))
}

// Main validation function
export function validateSchema(schema: Partial<UnifiedAppSchema>): ValidationResult {
  const allErrors: ValidationError[] = []

  // Run all validators
  allErrors.push(...validateMeta(schema))
  allErrors.push(...validateDesign(schema))
  allErrors.push(...validateStructure(schema))
  allErrors.push(...validateComponents(schema))
  allErrors.push(...validateFeatures(schema))

  // Separate errors and warnings
  const errors = allErrors.filter(e => e.severity === 'error')
  const warnings = allErrors.filter(e => e.severity === 'warning')

  // Generate suggestions
  const suggestions = generateSuggestions(schema)

  // Calculate score
  const score = calculateScore(errors, warnings, schema)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    score,
  }
}

// Quick validation check (returns boolean only)
export function isValidSchema(schema: Partial<UnifiedAppSchema>): boolean {
  const result = validateSchema(schema)
  return result.valid
}

// Get validation summary as string
export function getValidationSummary(result: ValidationResult): string {
  const lines: string[] = []

  lines.push(`Schema Validation: ${result.valid ? '✅ PASSED' : '❌ FAILED'}`)
  lines.push(`Completeness Score: ${result.score}/100`)

  if (result.errors.length > 0) {
    lines.push(`\nErrors (${result.errors.length}):`)
    result.errors.forEach(e => lines.push(`  ❌ ${e.field}: ${e.message}`))
  }

  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`)
    result.warnings.forEach(e => lines.push(`  ⚠️ ${e.field}: ${e.message}`))
  }

  if (result.suggestions.length > 0) {
    lines.push(`\nSuggestions:`)
    result.suggestions.forEach(s => lines.push(`  💡 ${s}`))
  }

  return lines.join('\n')
}
