'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Clock, ArrowUpRight, Code2 } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  index: number
}

const templateIcons: Record<string, string> = {
  'react': '⚛️',
  'nextjs': '▲',
  'vue': '💚',
  'angular': '🅰️',
  'svelte': '🔥',
  'html': '🌐',
  'blank': '📄',
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const templateIcon = templateIcons[project.template?.toLowerCase() || 'blank'] || '📄'

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={`/workspace/${project.id}`}>
        <Card className="group h-full bg-white rounded-2xl border border-gray-200/80 hover:border-violet-300 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
          {/* Gradient top border on hover */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardHeader className="pb-3 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">{templateIcon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors duration-200">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Code2 className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500 capitalize">
                      {project.template || 'blank'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow icon on hover */}
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-violet-100 transition-all duration-300">
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-5">
            {project.description ? (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-4">
                No description
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(project.updated_at)}</span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-400">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
