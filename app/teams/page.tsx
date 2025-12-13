"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Users, Settings, Crown, MoreHorizontal, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog"
import { createClient } from "@/lib/supabase/client"

interface Team {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  plan: string
  member_count: number
  project_count: number
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

interface TeamMember {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = React.useState<Team[]>([])
  const [loading, setLoading] = React.useState(true)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

  React.useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get teams where user is a member
      const { data: memberships } = await supabase
        .from('team_members')
        .select(`
          role,
          team:teams (
            id,
            name,
            slug,
            avatar_url,
            plan,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (memberships) {
        // Get member counts and project counts for each team
        const teamsWithCounts = await Promise.all(
          memberships.map(async (m: any) => {
            const team = m.team

            const [membersRes, projectsRes] = await Promise.all([
              supabase.from('team_members').select('id', { count: 'exact' }).eq('team_id', team.id),
              supabase.from('projects').select('id', { count: 'exact' }).eq('team_id', team.id),
            ])

            return {
              ...team,
              role: m.role,
              member_count: membersRes.count || 0,
              project_count: projectsRes.count || 0,
            }
          })
        )
        setTeams(teamsWithCounts)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (name: string, slug: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          slug,
          owner_id: user.id,
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Add owner as team member
      await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner',
        })

      setCreateDialogOpen(false)
      loadTeams()
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleInviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!selectedTeam) return

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from('team_invitations')
        .insert({
          team_id: selectedTeam.id,
          email,
          role,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      setInviteDialogOpen(false)
      // TODO: Send invitation email
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage your teams and collaborate on projects
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a team to start collaborating with others
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={team.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {team.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {team.name}
                        {team.role === 'owner' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription>/{team.slug}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeam(team)
                          setInviteDialogOpen(true)
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </DropdownMenuItem>
                      {(team.role === 'owner' || team.role === 'admin') && (
                        <>
                          <DropdownMenuItem onClick={() => router.push(`/teams/${team.slug}/settings`)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Team Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Leave Team
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team.member_count} members
                  </span>
                  <span>{team.project_count} projects</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={getRoleBadgeVariant(team.role)} className="capitalize">
                    {team.role}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {team.plan}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateTeam}
      />

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        teamName={selectedTeam?.name || ''}
        onInvite={handleInviteMember}
      />
    </div>
  )
}
