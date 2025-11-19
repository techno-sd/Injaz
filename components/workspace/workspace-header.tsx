'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Code2, Rocket } from 'lucide-react'
import type { Project } from '@/types'

interface WorkspaceHeaderProps {
  project: Project
}

export function WorkspaceHeader({ project }: WorkspaceHeaderProps) {
  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-lg">{project.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </div>
    </header>
  )
}
