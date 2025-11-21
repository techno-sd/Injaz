'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Zap,
  FileCode,
  GitBranch,
  Settings as SettingsIcon,
  HelpCircle,
  Keyboard,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  onAction?: (action: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const router = useRouter()

  const actions = [
    { id: 'new-file', label: 'New File', icon: FileCode, shortcut: 'Ctrl+N' },
    { id: 'git-sync', label: 'Sync Changes', icon: GitBranch, shortcut: 'Ctrl+Shift+S' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, shortcut: 'Ctrl+K' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className="cursor-pointer"
          >
            <action.icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{action.label}</span>
            <kbd className="ml-auto px-2 py-0.5 text-xs font-semibold bg-muted border rounded">
              {action.shortcut}
            </kbd>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
