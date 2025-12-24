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
  'react': '',
  'nextjs': '',
  'vue': '',
  'angular': '',
  'svelte': '',
  'html': '',
  'blank': '',
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const templateIcon = templateIcons[project.template?.toLowerCase() || 'blank'] || ''

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={`/workspace/${project.id}`}>
        <Card className="group h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
          {/* Gradient top border on hover */}
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardHeader className="pb-3 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-emerald-500/20 transition-all duration-300">
                  <Code2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors duration-200">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-white/40 capitalize">
                      {project.template || 'blank'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow icon on hover */}
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-emerald-500/10 transition-all duration-300">
                <ArrowUpRight className="h-4 w-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-5">
            {project.description ? (
              <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-sm text-white/30 italic mb-4">
                No description
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(project.updated_at)}</span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/40">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
