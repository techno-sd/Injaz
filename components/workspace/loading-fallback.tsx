import { Loader2 } from 'lucide-react'

export function LoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
}
