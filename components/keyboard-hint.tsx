'use client'

import { cn } from '@/lib/utils'

interface KeyboardHintProps {
  keys: string[]
  className?: string
}

export function KeyboardHint({ keys, className }: KeyboardHintProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-xs text-muted-foreground">+</span>
          )}
        </span>
      ))}
    </div>
  )
}
