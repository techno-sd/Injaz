"use client"

import * as React from "react"
import { Check, ChevronDown, Sparkles, Zap, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export interface AIModelOption {
  id: string
  name: string
  provider: string
  description?: string
  isAvailable: boolean
  isFast?: boolean
  isPremium?: boolean
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  availableModels: AIModelOption[]
  disabled?: boolean
  className?: string
}

const providerIcons: Record<string, React.ElementType> = {
  openai: Sparkles,
  anthropic: Brain,
  google: Zap,
}

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  availableModels,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const currentModel = availableModels.find(m => m.id === selectedModel)

  // Group models by provider
  const modelsByProvider = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, AIModelOption[]>)

  const ProviderIcon = currentModel ? providerIcons[currentModel.provider] || Sparkles : Sparkles

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-2 text-xs font-normal",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <ProviderIcon className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">
            {currentModel?.name || 'Select Model'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {Object.entries(modelsByProvider).map(([provider, models], index) => (
          <React.Fragment key={provider}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="flex items-center gap-2">
              {React.createElement(providerIcons[provider] || Sparkles, {
                className: "h-3.5 w-3.5",
              })}
              {providerLabels[provider] || provider}
            </DropdownMenuLabel>
            {models.map(model => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => model.isAvailable && onModelChange(model.id)}
                disabled={!model.isAvailable}
                className={cn(
                  "flex items-center justify-between py-2",
                  !model.isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.isFast && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        Fast
                      </Badge>
                    )}
                    {model.isPremium && (
                      <Badge variant="default" className="h-4 px-1 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500">
                        Pro
                      </Badge>
                    )}
                  </div>
                  {model.description && (
                    <span className="text-[10px] text-muted-foreground">
                      {model.description}
                    </span>
                  )}
                  {!model.isAvailable && (
                    <span className="text-[10px] text-yellow-500">
                      API key not configured
                    </span>
                  )}
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Default models for when the API isn't available
export const DEFAULT_MODELS: AIModelOption[] = [
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable model',
    isAvailable: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Fast and capable',
    isAvailable: true,
    isFast: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Quick responses, lower cost',
    isAvailable: true,
    isFast: true,
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Best for coding tasks',
    isAvailable: false,
    isPremium: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fast Claude model',
    isAvailable: false,
    isFast: true,
  },
]
