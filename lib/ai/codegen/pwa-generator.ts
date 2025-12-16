// PWA Generator - Generates Progressive Web App files for webapp platform
// Generates manifest.json, service worker, offline page, and PWA provider

import type { UnifiedAppSchema, PWAConfig } from '@/types/app-schema'

// =============================================================================
// PWA FILE GENERATION
// =============================================================================

export interface PWAGeneratorOutput {
  files: {
    path: string
    content: string
    language: string
  }[]
}

/**
 * Generate manifest.json for PWA
 */
export function generateManifest(schema: UnifiedAppSchema): string {
  const pwaConfig = schema.features?.pwa
  const meta = schema.meta
  const design = schema.design

  const manifest = {
    name: pwaConfig?.name || meta.name || 'My App',
    short_name: pwaConfig?.shortName || meta.name?.split(' ')[0] || 'App',
    description: pwaConfig?.description || meta.description || 'A progressive web application',
    start_url: pwaConfig?.startUrl || '/',
    display: pwaConfig?.display || 'standalone',
    background_color: pwaConfig?.backgroundColor || design.colors.background || '#ffffff',
    theme_color: pwaConfig?.themeColor || design.colors.primary || '#8b5cf6',
    orientation: pwaConfig?.orientation || 'portrait-primary',
    scope: '/',
    icons: pwaConfig?.icons || [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['productivity', 'utilities'],
    prefer_related_applications: false,
  }

  return JSON.stringify(manifest, null, 2)
}

/**
 * Generate service worker for PWA
 */
export function generateServiceWorker(schema: UnifiedAppSchema): string {
  const pwaConfig = schema.features?.pwa
  const cachingStrategy = pwaConfig?.serviceWorker?.cachingStrategy || 'stale-while-revalidate'
  const appName = schema.meta.name?.toLowerCase().replace(/\s+/g, '-') || 'app'

  // Get pages to precache
  const pagePaths = schema.structure?.pages?.map((p) => p.path) || ['/']

  return `// Service Worker for ${schema.meta.name || 'PWA'}
// Caching Strategy: ${cachingStrategy}

const CACHE_NAME = '${appName}-cache-v1';
const OFFLINE_URL = '/offline';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
${pagePaths.filter((p) => p !== '/').map((p) => `  '${p}',`).join('\n')}
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

${cachingStrategy === 'cache-first' ? `
  // Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );` : cachingStrategy === 'network-first' ? `
  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );` : `
  // Stale-while-revalidate strategy (default)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache with new response
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return cached version if available
            return cachedResponse;
          });

        // Return cached response immediately, or wait for network
        return cachedResponse || fetchPromise;
      })
  );`}
});

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || '${schema.meta.name || 'Notification'}';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
`
}

/**
 * Generate offline page component
 */
export function generateOfflinePage(schema: UnifiedAppSchema): string {
  const appName = schema.meta.name || 'App'
  const primaryColor = schema.design.colors.primary || '#8b5cf6'

  return `// Offline Page - Shown when user is offline and page is not cached
'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          It looks like you've lost your internet connection.
          Please check your network settings and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '${primaryColor}' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        {/* App Name */}
        <p className="mt-12 text-xs text-muted-foreground">
          ${appName}
        </p>
      </div>
    </div>
  )
}
`
}

/**
 * Generate PWA provider component for service worker registration
 */
export function generatePWAProvider(): string {
  return `// PWA Provider - Registers service worker and provides install prompt
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAContextValue {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  installApp: () => Promise<void>
}

const PWAContext = createContext<PWAContextValue>({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  installApp: async () => {},
})

export function usePWA() {
  return useContext(PWAContext)
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsInstalled(isStandalone)

    // Check online status
    setIsOnline(navigator.onLine)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('[PWA] New content available, refresh to update')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('[PWA] App installed')
    }

    // Handle online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available')
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('[PWA] Install prompt outcome:', outcome)

      if (outcome === 'accepted') {
        setIsInstallable(false)
      }
    } catch (error) {
      console.error('[PWA] Install prompt error:', error)
    }

    setDeferredPrompt(null)
  }

  return (
    <PWAContext.Provider value={{ isInstallable, isInstalled, isOnline, installApp }}>
      {children}
    </PWAContext.Provider>
  )
}
`
}

/**
 * Generate PWA install button component
 */
export function generatePWAInstallButton(): string {
  return `// PWA Install Button - Shows install prompt for installable PWAs
'use client'

import { Download } from 'lucide-react'
import { usePWA } from './pwa-provider'

interface PWAInstallButtonProps {
  className?: string
}

export function PWAInstallButton({ className = '' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWA()

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <button
      onClick={installApp}
      className={\`inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] \${className}\`}
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  )
}
`
}

/**
 * Generate all PWA files for a schema
 */
export function generatePWAFiles(schema: UnifiedAppSchema): PWAGeneratorOutput {
  const pwaConfig = schema.features?.pwa

  // If PWA is not enabled, return empty
  if (!pwaConfig?.enabled) {
    return { files: [] }
  }

  const files: PWAGeneratorOutput['files'] = []

  // Generate manifest.json
  files.push({
    path: 'public/manifest.json',
    content: generateManifest(schema),
    language: 'json',
  })

  // Generate service worker
  if (pwaConfig.serviceWorker?.enabled !== false) {
    files.push({
      path: 'public/sw.js',
      content: generateServiceWorker(schema),
      language: 'javascript',
    })
  }

  // Generate offline page
  files.push({
    path: 'app/offline/page.tsx',
    content: generateOfflinePage(schema),
    language: 'typescript',
  })

  // Generate PWA provider
  files.push({
    path: 'components/pwa-provider.tsx',
    content: generatePWAProvider(),
    language: 'typescript',
  })

  // Generate PWA install button
  files.push({
    path: 'components/pwa-install-button.tsx',
    content: generatePWAInstallButton(),
    language: 'typescript',
  })

  return { files }
}

/**
 * Get default PWA configuration
 */
export function getDefaultPWAConfig(
  appName: string,
  themeColor: string = '#8b5cf6',
  backgroundColor: string = '#ffffff'
): PWAConfig {
  return {
    enabled: true,
    name: appName,
    shortName: appName.split(' ')[0] || appName,
    description: `${appName} - A progressive web application`,
    themeColor,
    backgroundColor,
    display: 'standalone',
    orientation: 'any',
    startUrl: '/',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    serviceWorker: {
      enabled: true,
      cachingStrategy: 'stale-while-revalidate',
      precacheAssets: ['/', '/offline'],
    },
  }
}
