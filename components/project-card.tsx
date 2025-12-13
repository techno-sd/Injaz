'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { FolderOpen, Clock, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/workspace/${project.id}`}>
        <Card className="hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 cursor-pointer h-full group relative overflow-hidden border-2">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-violet-500/0 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-300" />

          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 group-hover:from-purple-600 group-hover:to-violet-600 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-purple-500/30">
                <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {project.name}
                </div>
                <div className="text-xs text-muted-foreground capitalize mt-0.5">
                  {project.template} template
                </div>
              </div>
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative">
            <Button
              variant="ghost"
              className="w-full group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-violet-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all"
            >
              Open Project
              <ExternalLink className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
