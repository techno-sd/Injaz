'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  CreditCard,
  Users,
  HelpCircle,
  LogOut,
  Code2,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
  },
  {
    title: 'Team',
    href: '/teams',
    icon: Users,
  },
  {
    title: 'Billing',
    href: '/pricing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-xl group-hover:shadow-violet-500/30 transition-all duration-300">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Injaz.ai</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t space-y-4">
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="font-semibold text-sm text-violet-700 dark:text-violet-300">Pro Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Upgrade for unlimited AI generations and advanced features.
          </p>
          <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0">
            Upgrade Now
          </Button>
        </div>

        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <Link href="/help" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <HelpCircle className="h-3 w-3" />
            Help & Support
          </Link>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )
}
