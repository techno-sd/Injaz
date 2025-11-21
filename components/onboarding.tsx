'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Keyboard,
  Zap,
  FileCode,
  GitBranch,
  Play,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'

interface OnboardingProps {
  open: boolean
  onComplete: () => void
}

const steps = [
  {
    title: 'Welcome to iEditor',
    description: 'Build AI-powered applications with ease',
    icon: Zap,
    features: [
      'AI-assisted code generation',
      'Live preview with WebContainers',
      'GitHub integration',
      'Deploy with one click'
    ]
  },
  {
    title: 'Quick Actions',
    description: 'Master keyboard shortcuts for faster workflow',
    icon: Keyboard,
    shortcuts: [
      { keys: ['Ctrl', 'K'], action: 'Command Palette' },
      { keys: ['Ctrl', 'N'], action: 'New File' },
      { keys: ['Ctrl', 'S'], action: 'Save File' },
      { keys: ['Ctrl', 'P'], action: 'Quick Search' }
    ]
  },
  {
    title: 'Start Building',
    description: 'Choose how you want to begin',
    icon: FileCode,
    actions: [
      { label: 'Browse Templates', icon: FileCode },
      { label: 'Import from GitHub', icon: GitBranch },
      { label: 'Chat with AI', icon: MessageSquare }
    ]
  }
]

export function Onboarding({ open, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onComplete()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <current.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{current.title}</DialogTitle>
              <DialogDescription>{current.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {current.features && (
            <div className="space-y-3">
              {current.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          )}

          {current.shortcuts && (
            <div className="space-y-3">
              {current.shortcuts.map((shortcut, i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <span className="text-sm">{shortcut.action}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                          {key}
                        </kbd>
                        {j < shortcut.keys.length - 1 && (
                          <span className="text-xs text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {current.actions && (
            <div className="grid gap-3">
              {current.actions.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={onComplete}
                >
                  <action.icon className="mr-3 h-5 w-5" />
                  {action.label}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onComplete}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
