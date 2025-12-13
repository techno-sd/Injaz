"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TourStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for the target element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  spotlightPadding?: number
  action?: () => void // Action to perform when step is shown
}

interface OnboardingTourProps {
  steps: TourStep[]
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
  storageKey?: string
}

export function OnboardingTour({
  steps,
  isOpen,
  onComplete,
  onSkip,
  storageKey = 'onboarding-completed',
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  // Find and highlight target element
  React.useEffect(() => {
    if (!isOpen || !step?.target) {
      setTargetRect(null)
      return
    }

    const findTarget = () => {
      const element = document.querySelector(step.target!)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)

        // Execute step action if defined
        step.action?.()
      } else {
        setTargetRect(null)
      }
    }

    findTarget()

    // Re-find on resize
    window.addEventListener('resize', findTarget)
    return () => window.removeEventListener('resize', findTarget)
  }, [isOpen, step])

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true')
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true')
    onSkip()
  }

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || step?.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = step?.spotlightPadding ?? 8
    const tooltipWidth = 360
    const tooltipHeight = 200
    const margin = 16

    let top: number
    let left: number

    switch (step?.position || 'bottom') {
      case 'top':
        top = targetRect.top - tooltipHeight - margin
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
      case 'bottom':
        top = targetRect.bottom + margin
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        left = targetRect.left - tooltipWidth - margin
        break
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        left = targetRect.right + margin
        break
      default:
        top = targetRect.bottom + margin
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
    }

    // Keep tooltip within viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin))
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin))

    return {
      position: 'fixed',
      top,
      left,
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
            }}
          />

          {/* Spotlight cutout */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetRect.top - (step?.spotlightPadding ?? 8),
                left: targetRect.left - (step?.spotlightPadding ?? 8),
                width: targetRect.width + (step?.spotlightPadding ?? 8) * 2,
                height: targetRect.height + (step?.spotlightPadding ?? 8) * 2,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                borderRadius: 8,
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed z-[10000] w-[360px]"
            style={getTooltipStyle()}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h3 className="font-semibold">{step?.title}</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step?.description}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 pb-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                        ? "w-1.5 bg-primary/50"
                        : "w-1.5 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip tour
                </Button>
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="min-w-[100px]"
                  >
                    {isLastStep ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to manage onboarding state
export function useOnboarding(storageKey = 'onboarding-completed') {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasCompleted, setHasCompleted] = React.useState(true)

  React.useEffect(() => {
    const completed = localStorage.getItem(storageKey) === 'true'
    setHasCompleted(completed)
    if (!completed) {
      // Delay showing onboarding to let the page render
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  const startTour = () => setIsOpen(true)
  const endTour = () => setIsOpen(false)
  const resetTour = () => {
    localStorage.removeItem(storageKey)
    setHasCompleted(false)
    setIsOpen(true)
  }

  return {
    isOpen,
    hasCompleted,
    startTour,
    endTour,
    resetTour,
  }
}

// Default workspace tour steps
export const WORKSPACE_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to iEditor!',
    description: "Let's take a quick tour to help you get started building amazing apps with AI assistance.",
    position: 'center',
  },
  {
    id: 'file-tree',
    title: 'File Explorer',
    description: 'Browse and manage your project files here. Right-click to create new files or folders, or drag and drop to organize.',
    target: '[data-tour="file-tree"]',
    position: 'right',
    spotlightPadding: 12,
  },
  {
    id: 'code-editor',
    title: 'Code Editor',
    description: 'Write and edit your code with full syntax highlighting, autocomplete, and IntelliSense. Changes are saved automatically.',
    target: '[data-tour="code-editor"]',
    position: 'left',
    spotlightPadding: 12,
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    description: 'Chat with AI to generate code, fix bugs, or get explanations. Just describe what you want to build!',
    target: '[data-tour="ai-chat"]',
    position: 'left',
    spotlightPadding: 12,
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'See your changes in real-time. The preview updates automatically as you code.',
    target: '[data-tour="preview"]',
    position: 'top',
    spotlightPadding: 12,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    description: 'Run commands, install packages, and see build output right in the browser.',
    target: '[data-tour="terminal-tab"]',
    position: 'top',
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    description: 'Press ⌘K (or Ctrl+K) anytime to open the command palette. Access all features quickly without leaving the keyboard.',
    position: 'center',
  },
  {
    id: 'deploy',
    title: 'Deploy Your App',
    description: "When you're ready, deploy to Vercel with one click. Your app will be live in seconds!",
    target: '[data-tour="deploy"]',
    position: 'bottom',
  },
]
