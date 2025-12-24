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
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

interface DashboardSidebarProps {
  user: User | null
}

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

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-white/5 h-screen sticky top-0 hidden md:flex flex-col bg-[#0A0A0F]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-xl group-hover:shadow-emerald-500/30 transition-all duration-300">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Injaz.ai</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/60"
              )} />
              {item.title}
              {isActive && (
                <ChevronRight className="h-4 w-4 ml-auto text-emerald-400" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Upgrade Card */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
          {/* Glow effect */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-sm text-emerald-400">Pro Plan</span>
            </div>
            <p className="text-xs text-white/50 mb-3 leading-relaxed">
              Unlock unlimited AI generations and premium features.
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-0 rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* User section */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-medium text-white/80">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">
                {user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-white/40 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-between px-2 text-xs text-white/40">
          <Link href="/help" className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
            <HelpCircle className="h-3 w-3" />
            Help
          </Link>
          <span className="text-white/20">v1.0.0</span>
        </div>
      </div>
    </div>
  )
}
