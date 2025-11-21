'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg"
      >
        <Icon className="h-12 w-12 text-primary" />
      </motion.div>

      <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description}
      </p>

      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick} size="lg" className="shadow-md">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            size="lg"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
