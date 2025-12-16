// Preview Types for Device Simulation and Responsive Testing
// Used by preview components to render realistic device frames

// =============================================================================
// DEVICE ORIENTATION & MODE
// =============================================================================

export type DeviceOrientation = 'portrait' | 'landscape'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile' | 'custom'

export type DeviceCategory = 'phone' | 'tablet' | 'desktop'

// =============================================================================
// DEVICE NOTCH CONFIGURATION
// =============================================================================

export type NotchType = 'notch' | 'dynamic-island' | 'pill' | 'punch-hole' | 'none'

export interface NotchConfig {
  type: NotchType
  width: number
  height: number
  borderRadius?: number
}

// =============================================================================
// HOME INDICATOR CONFIGURATION
// =============================================================================

export interface HomeIndicatorConfig {
  width: number
  height: number
  bottomOffset: number
  borderRadius?: number
}

// =============================================================================
// DEVICE PRESET
// =============================================================================

export interface DevicePreset {
  id: string
  name: string
  brand: string
  category: DeviceCategory
  // Screen dimensions (CSS pixels)
  width: number
  height: number
  // Device pixel ratio
  pixelRatio: number
  // Frame styling
  frameColor: string
  frameRadius: number
  framePadding: number
  // Screen border radius (inner)
  screenRadius?: number
  // Notch/Island/Camera specifications
  notch?: NotchConfig
  // Home indicator bar
  homeIndicator?: HomeIndicatorConfig
  // Status bar height
  statusBarHeight?: number
  // Year released (for sorting)
  year?: number
}

// =============================================================================
// VIEWPORT STATE
// =============================================================================

export interface ViewportState {
  device: DevicePreset | null
  mode: DeviceMode
  orientation: DeviceOrientation
  customWidth: number
  customHeight: number
  scale: number
  showFrame: boolean
}

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

export interface ResponsiveBreakpoint {
  name: string
  label: string
  minWidth: number
  maxWidth?: number
  color: string
  bgColor: string
}

// Default Tailwind CSS breakpoints
export const TAILWIND_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'xs', label: 'XS', minWidth: 0, maxWidth: 639, color: '#ef4444', bgColor: 'bg-red-500/20' },
  { name: 'sm', label: 'SM', minWidth: 640, maxWidth: 767, color: '#f97316', bgColor: 'bg-orange-500/20' },
  { name: 'md', label: 'MD', minWidth: 768, maxWidth: 1023, color: '#eab308', bgColor: 'bg-yellow-500/20' },
  { name: 'lg', label: 'LG', minWidth: 1024, maxWidth: 1279, color: '#22c55e', bgColor: 'bg-green-500/20' },
  { name: 'xl', label: 'XL', minWidth: 1280, maxWidth: 1535, color: '#3b82f6', bgColor: 'bg-blue-500/20' },
  { name: '2xl', label: '2XL', minWidth: 1536, color: '#8b5cf6', bgColor: 'bg-violet-500/20' },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBreakpointForWidth(width: number): ResponsiveBreakpoint {
  for (let i = TAILWIND_BREAKPOINTS.length - 1; i >= 0; i--) {
    if (width >= TAILWIND_BREAKPOINTS[i].minWidth) {
      return TAILWIND_BREAKPOINTS[i]
    }
  }
  return TAILWIND_BREAKPOINTS[0]
}

export function getDeviceDimensions(
  device: DevicePreset | null,
  orientation: DeviceOrientation,
  customWidth: number,
  customHeight: number,
  mode: DeviceMode
): { width: number; height: number } {
  if (mode === 'desktop') {
    return { width: 1920, height: 1080 }
  }

  if (mode === 'custom') {
    return { width: customWidth, height: customHeight }
  }

  if (device) {
    const w = orientation === 'portrait' ? device.width : device.height
    const h = orientation === 'portrait' ? device.height : device.width
    return { width: w, height: h }
  }

  // Fallback defaults
  const defaults = {
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 },
  }
  const dim = defaults[mode as 'tablet' | 'mobile'] || defaults.mobile
  return {
    width: orientation === 'portrait' ? dim.width : dim.height,
    height: orientation === 'portrait' ? dim.height : dim.width,
  }
}

// =============================================================================
// DEVICE PRESETS DATA
// =============================================================================

// iPhone Models
export const IPHONE_15_PRO_MAX: DevicePreset = {
  id: 'iphone-15-pro-max',
  name: 'iPhone 15 Pro Max',
  brand: 'Apple',
  category: 'phone',
  width: 430,
  height: 932,
  pixelRatio: 3,
  frameColor: '#1a1a1f',
  frameRadius: 55,
  framePadding: 12,
  screenRadius: 47,
  notch: { type: 'dynamic-island', width: 126, height: 37, borderRadius: 20 },
  homeIndicator: { width: 134, height: 5, bottomOffset: 8, borderRadius: 3 },
  statusBarHeight: 59,
  year: 2023,
}

export const IPHONE_15_PRO: DevicePreset = {
  id: 'iphone-15-pro',
  name: 'iPhone 15 Pro',
  brand: 'Apple',
  category: 'phone',
  width: 393,
  height: 852,
  pixelRatio: 3,
  frameColor: '#1a1a1f',
  frameRadius: 47,
  framePadding: 12,
  screenRadius: 40,
  notch: { type: 'dynamic-island', width: 126, height: 37, borderRadius: 20 },
  homeIndicator: { width: 134, height: 5, bottomOffset: 8, borderRadius: 3 },
  statusBarHeight: 59,
  year: 2023,
}

export const IPHONE_15: DevicePreset = {
  id: 'iphone-15',
  name: 'iPhone 15',
  brand: 'Apple',
  category: 'phone',
  width: 393,
  height: 852,
  pixelRatio: 3,
  frameColor: '#2a2a2f',
  frameRadius: 47,
  framePadding: 12,
  screenRadius: 40,
  notch: { type: 'dynamic-island', width: 126, height: 37, borderRadius: 20 },
  homeIndicator: { width: 134, height: 5, bottomOffset: 8, borderRadius: 3 },
  statusBarHeight: 59,
  year: 2023,
}

export const IPHONE_SE: DevicePreset = {
  id: 'iphone-se',
  name: 'iPhone SE',
  brand: 'Apple',
  category: 'phone',
  width: 375,
  height: 667,
  pixelRatio: 2,
  frameColor: '#1a1a1f',
  frameRadius: 32,
  framePadding: 12,
  screenRadius: 0,
  notch: { type: 'none', width: 0, height: 0 },
  statusBarHeight: 20,
  year: 2022,
}

// Android Models
export const PIXEL_8_PRO: DevicePreset = {
  id: 'pixel-8-pro',
  name: 'Pixel 8 Pro',
  brand: 'Google',
  category: 'phone',
  width: 448,
  height: 998,
  pixelRatio: 2.625,
  frameColor: '#1f1f1f',
  frameRadius: 44,
  framePadding: 10,
  screenRadius: 36,
  notch: { type: 'punch-hole', width: 32, height: 32, borderRadius: 16 },
  homeIndicator: { width: 120, height: 4, bottomOffset: 8, borderRadius: 2 },
  statusBarHeight: 48,
  year: 2023,
}

export const PIXEL_8: DevicePreset = {
  id: 'pixel-8',
  name: 'Pixel 8',
  brand: 'Google',
  category: 'phone',
  width: 412,
  height: 915,
  pixelRatio: 2.625,
  frameColor: '#1f1f1f',
  frameRadius: 40,
  framePadding: 10,
  screenRadius: 32,
  notch: { type: 'punch-hole', width: 28, height: 28, borderRadius: 14 },
  homeIndicator: { width: 120, height: 4, bottomOffset: 8, borderRadius: 2 },
  statusBarHeight: 48,
  year: 2023,
}

export const SAMSUNG_S24_ULTRA: DevicePreset = {
  id: 'samsung-s24-ultra',
  name: 'Galaxy S24 Ultra',
  brand: 'Samsung',
  category: 'phone',
  width: 412,
  height: 915,
  pixelRatio: 3.5,
  frameColor: '#1a1a1a',
  frameRadius: 32,
  framePadding: 10,
  screenRadius: 24,
  notch: { type: 'punch-hole', width: 28, height: 28, borderRadius: 14 },
  homeIndicator: { width: 100, height: 4, bottomOffset: 8, borderRadius: 2 },
  statusBarHeight: 40,
  year: 2024,
}

export const SAMSUNG_S24: DevicePreset = {
  id: 'samsung-s24',
  name: 'Galaxy S24',
  brand: 'Samsung',
  category: 'phone',
  width: 360,
  height: 780,
  pixelRatio: 3,
  frameColor: '#1a1a1a',
  frameRadius: 38,
  framePadding: 10,
  screenRadius: 28,
  notch: { type: 'punch-hole', width: 24, height: 24, borderRadius: 12 },
  homeIndicator: { width: 100, height: 4, bottomOffset: 8, borderRadius: 2 },
  statusBarHeight: 40,
  year: 2024,
}

// Tablets
export const IPAD_PRO_12_9: DevicePreset = {
  id: 'ipad-pro-12-9',
  name: 'iPad Pro 12.9"',
  brand: 'Apple',
  category: 'tablet',
  width: 1024,
  height: 1366,
  pixelRatio: 2,
  frameColor: '#1a1a1f',
  frameRadius: 18,
  framePadding: 16,
  screenRadius: 10,
  homeIndicator: { width: 200, height: 5, bottomOffset: 8, borderRadius: 3 },
  year: 2022,
}

export const IPAD_PRO_11: DevicePreset = {
  id: 'ipad-pro-11',
  name: 'iPad Pro 11"',
  brand: 'Apple',
  category: 'tablet',
  width: 834,
  height: 1194,
  pixelRatio: 2,
  frameColor: '#1a1a1f',
  frameRadius: 18,
  framePadding: 16,
  screenRadius: 10,
  homeIndicator: { width: 180, height: 5, bottomOffset: 8, borderRadius: 3 },
  year: 2022,
}

export const IPAD_AIR: DevicePreset = {
  id: 'ipad-air',
  name: 'iPad Air',
  brand: 'Apple',
  category: 'tablet',
  width: 820,
  height: 1180,
  pixelRatio: 2,
  frameColor: '#2a2a2f',
  frameRadius: 18,
  framePadding: 14,
  screenRadius: 10,
  homeIndicator: { width: 180, height: 5, bottomOffset: 8, borderRadius: 3 },
  year: 2022,
}

export const IPAD_MINI: DevicePreset = {
  id: 'ipad-mini',
  name: 'iPad Mini',
  brand: 'Apple',
  category: 'tablet',
  width: 744,
  height: 1133,
  pixelRatio: 2,
  frameColor: '#2a2a2f',
  frameRadius: 18,
  framePadding: 14,
  screenRadius: 10,
  homeIndicator: { width: 160, height: 5, bottomOffset: 8, borderRadius: 3 },
  year: 2021,
}

// =============================================================================
// DEVICE COLLECTIONS
// =============================================================================

export const PHONE_PRESETS: DevicePreset[] = [
  IPHONE_15_PRO_MAX,
  IPHONE_15_PRO,
  IPHONE_15,
  IPHONE_SE,
  PIXEL_8_PRO,
  PIXEL_8,
  SAMSUNG_S24_ULTRA,
  SAMSUNG_S24,
]

export const TABLET_PRESETS: DevicePreset[] = [
  IPAD_PRO_12_9,
  IPAD_PRO_11,
  IPAD_AIR,
  IPAD_MINI,
]

export const ALL_DEVICE_PRESETS: DevicePreset[] = [
  ...PHONE_PRESETS,
  ...TABLET_PRESETS,
]

export const DEVICE_PRESETS_BY_BRAND: Record<string, DevicePreset[]> = {
  Apple: [IPHONE_15_PRO_MAX, IPHONE_15_PRO, IPHONE_15, IPHONE_SE, IPAD_PRO_12_9, IPAD_PRO_11, IPAD_AIR, IPAD_MINI],
  Google: [PIXEL_8_PRO, PIXEL_8],
  Samsung: [SAMSUNG_S24_ULTRA, SAMSUNG_S24],
}

// =============================================================================
// COMMON VIEWPORT SIZES (for custom input)
// =============================================================================

export const COMMON_VIEWPORT_SIZES = [
  { label: 'iPhone SE', width: 375, height: 667 },
  { label: 'iPhone 15', width: 393, height: 852 },
  { label: 'Android', width: 360, height: 800 },
  { label: 'Tablet', width: 768, height: 1024 },
  { label: 'Laptop', width: 1366, height: 768 },
  { label: 'Desktop', width: 1920, height: 1080 },
  { label: 'Large Desktop', width: 2560, height: 1440 },
]
