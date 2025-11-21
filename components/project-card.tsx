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
        <Card className="hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full group relative overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-300" />

          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <FolderOpen className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg group-hover:text-primary transition-colors">
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
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative">
            <Button
              variant="ghost"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
            >
              Open Project
              <ExternalLink className="ml-2 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
