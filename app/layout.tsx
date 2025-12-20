import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { WebContainerPreloader } from '@/components/webcontainer-preloader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Injaz.ai - AI-Powered App Builder',
  description: 'Build applications with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload WebContainer runtime for faster boot */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://cdn.jsdelivr.net"
        />
        {/* Preload WebContainer API module */}
        <link
          rel="modulepreload"
          href="https://cdn.jsdelivr.net/npm/@webcontainer/api/dist/index.js"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <WebContainerPreloader />
        </ThemeProvider>
      </body>
    </html>
  )
}
