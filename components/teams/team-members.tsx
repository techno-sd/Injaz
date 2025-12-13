"use client"

import * as React from "react"
import { MoreHorizontal, Shield, Crown, User, UserMinus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface PendingInvitation {
  id: string
  email: string
  role: 'admin' | 'member'
  expires_at: string
  invited_by: string
}

interface TeamMembersProps {
  teamId: string
  members: TeamMember[]
  invitations: PendingInvitation[]
  currentUserId: string
  currentUserRole: 'owner' | 'admin' | 'member'
  onRoleChange: (memberId: string, newRole: 'admin' | 'member') => Promise<void>
  onRemoveMember: (memberId: string) => Promise<void>
  onCancelInvitation: (invitationId: string) => Promise<void>
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
}

const roleColors = {
  owner: "text-yellow-500",
  admin: "text-blue-500",
  member: "text-muted-foreground",
}

export function TeamMembers({
  teamId,
  members,
  invitations,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemoveMember,
  onCancelInvitation,
}: TeamMembersProps) {
  const { toast } = useToast()
  const [removingMember, setRemovingMember] = React.useState<TeamMember | null>(null)
  const [loading, setLoading] = React.useState<string | null>(null)

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
  const isOwner = currentUserRole === 'owner'

  const handleRoleChange = async (member: TeamMember, newRole: 'admin' | 'member') => {
    if (!canManageMembers) return

    setLoading(member.id)
    try {
      await onRoleChange(member.id, newRole)
      toast({
        title: "Role updated",
        description: `${member.user.full_name || member.user.email} is now a ${newRole}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveMember = async () => {
    if (!removingMember) return

    setLoading(removingMember.id)
    try {
      await onRemoveMember(removingMember.id)
      toast({
        title: "Member removed",
        description: `${removingMember.user.full_name || removingMember.user.email} has been removed from the team`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
      setRemovingMember(null)
    }
  }

  const handleCancelInvitation = async (invitation: PendingInvitation) => {
    setLoading(invitation.id)
    try {
      await onCancelInvitation(invitation.id)
      toast({
        title: "Invitation cancelled",
        description: `Invitation to ${invitation.email} has been cancelled`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role]
            const isCurrentUser = member.user_id === currentUserId
            const canModify = canManageMembers && !isCurrentUser && member.role !== 'owner'

            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                  loading === member.id && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.user.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.full_name, member.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {member.user.full_name || member.user.email}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs h-5">You</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {member.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <RoleIcon className={cn("h-4 w-4", roleColors[member.role])} />
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>

                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role === 'member' && isOwner && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member, 'admin')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {member.role === 'admin' && isOwner && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member, 'member')}>
                            <User className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setRemovingMember(member)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Pending Invitations ({invitations.length})
          </h3>
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-dashed",
                  loading === invitation.id && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{invitation.email}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs h-5 capitalize">
                        {invitation.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {canManageMembers && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation)}
                    disabled={loading === invitation.id}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removingMember?.user.full_name || removingMember?.user.email} from the team?
              They will lose access to all team projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
