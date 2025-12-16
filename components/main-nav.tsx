'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code2, LayoutTemplate, Zap, BookOpen, Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

const navItems: NavItem[] = [
  {
    title: 'Templates',
    href: '/templates',
    icon: <LayoutTemplate className="h-4 w-4" />,
  },
  {
    title: 'Features',
    href: '#features',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    title: 'Docs',
    href: '/docs',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: 'GitHub',
    href: 'https://github.com/injaz-ai/injaz',
    icon: <Github className="h-4 w-4" />,
    external: true,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        
        if (item.external) {
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.icon}
                <span className="hidden md:inline">{item.title}</span>
              </a>
            </Button>
          )
        }

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
              <span className="hidden md:inline">{item.title}</span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
