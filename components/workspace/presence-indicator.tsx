"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface PresenceUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  activeFile?: string
  cursorPosition?: { line: number; column: number }
  lastSeen: Date
}

interface PresenceIndicatorProps {
  users: PresenceUser[]
  currentUserId: string
  maxVisible?: number
  className?: string
  onUserClick?: (user: PresenceUser) => void
}

// Generate a consistent color based on user ID
export function getUserColor(userId: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Get initials from name or email
function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return '?'
}

export function PresenceIndicator({
  users,
  currentUserId,
  maxVisible = 5,
  className,
  onUserClick,
}: PresenceIndicatorProps) {
  // Filter out current user and sort by last seen
  const otherUsers = users
    .filter(u => u.id !== currentUserId)
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())

  const visibleUsers = otherUsers.slice(0, maxVisible)
  const hiddenCount = otherUsers.length - maxVisible

  if (otherUsers.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onUserClick?.(user)}
                    className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                  >
                    <Avatar
                      className="h-8 w-8 border-2 border-background ring-2 transition-transform hover:scale-110 hover:z-10"
                      style={{ ringColor: user.color }}
                    >
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback
                        style={{ backgroundColor: user.color }}
                        className="text-white text-xs font-medium"
                      >
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background"
                      style={{ backgroundColor: isRecentlyActive(user.lastSeen) ? '#10B981' : '#9CA3AF' }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{user.name || user.email}</p>
                    {user.activeFile && (
                      <p className="text-xs text-muted-foreground">
                        Editing: <span className="font-mono">{user.activeFile}</span>
                      </p>
                    )}
                    {user.cursorPosition && (
                      <p className="text-xs text-muted-foreground">
                        Line {user.cursorPosition.line}, Col {user.cursorPosition.column}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {getLastSeenText(user.lastSeen)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}

          {hiddenCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{hiddenCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="space-y-1">
                    {otherUsers.slice(maxVisible).map(user => (
                      <p key={user.id} className="text-sm">
                        {user.name || user.email}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

// Check if user was active in the last 2 minutes
function isRecentlyActive(lastSeen: Date): boolean {
  return new Date().getTime() - new Date(lastSeen).getTime() < 2 * 60 * 1000
}

// Format last seen time
function getLastSeenText(lastSeen: Date): string {
  const diff = new Date().getTime() - new Date(lastSeen).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)

  if (seconds < 30) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  return 'Away'
}

// Collaborative cursor component for editor overlay
interface CollaborativeCursorProps {
  user: PresenceUser
  position: { top: number; left: number }
}

export function CollaborativeCursor({ user, position }: CollaborativeCursorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="absolute pointer-events-none z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Cursor */}
      <svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        style={{ color: user.color }}
      >
        <path
          d="M0 0L16 12L8 14L6 24L0 0Z"
          fill="currentColor"
        />
      </svg>
      {/* Name label */}
      <div
        className="absolute top-5 left-2 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.name || user.email?.split('@')[0]}
      </div>
    </motion.div>
  )
}

// Hook for managing presence
export function usePresence(
  projectId: string,
  userId: string,
  supabase: any // SupabaseClient type
) {
  const [users, setUsers] = React.useState<PresenceUser[]>([])

  React.useEffect(() => {
    if (!projectId || !userId || !supabase) return

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${projectId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const presenceUsers: PresenceUser[] = []

        for (const [key, values] of Object.entries(state)) {
          const presence = (values as any[])[0]
          presenceUsers.push({
            id: presence.user_id,
            name: presence.name,
            email: presence.email,
            avatar: presence.avatar,
            color: presence.color || getUserColor(presence.user_id),
            activeFile: presence.active_file,
            cursorPosition: presence.cursor_position,
            lastSeen: new Date(presence.online_at),
          })
        }

        setUsers(presenceUsers)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [projectId, userId, supabase])

  const updatePresence = React.useCallback(
    async (data: Partial<PresenceUser>) => {
      if (!supabase) return
      // Update presence in database and broadcast
      const channel = supabase.channel(`presence:${projectId}`)
      await channel.track({
        user_id: userId,
        ...data,
        online_at: new Date().toISOString(),
      })
    },
    [projectId, userId, supabase]
  )

  return { users, updatePresence }
}
