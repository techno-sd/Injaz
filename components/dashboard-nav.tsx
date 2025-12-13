'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderKanban, LayoutTemplate, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DashboardNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const dashboardNavItems: DashboardNavItem[] = [
  {
    title: 'Projects',
    href: '/dashboard',
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: <LayoutTemplate className="h-4 w-4" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: 'Help',
    href: '/help',
    icon: <HelpCircle className="h-4 w-4" />,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {dashboardNavItems.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 transition-colors",
              isActive && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Link href={item.href}>
              {item.icon}
              <span className="hidden sm:inline">{item.title}</span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
