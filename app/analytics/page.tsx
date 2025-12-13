"use client"

import * as React from "react"
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Rocket,
  MessageSquare,
  FileCode,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface UsageStats {
  ai_requests: number
  ai_requests_limit: number
  deployments: number
  deployments_limit: number
  storage_used_mb: number
  storage_limit_mb: number
  projects_count: number
  projects_limit: number
}

interface DailyUsage {
  date: string
  ai_requests: number
  deployments: number
  file_operations: number
}

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: {
    current: number
    max: number
  }
}

function StatCard({ title, value, description, icon: Icon, trend, progress }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <Badge
              variant={trend.isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                trend.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {progress && (
          <div className="mt-3 space-y-1">
            <Progress value={(progress.current / progress.max) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress.current} / {progress.max} used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UsageChart({ data }: { data: DailyUsage[] }) {
  const maxValue = Math.max(...data.flatMap(d => [d.ai_requests, d.deployments, d.file_operations]))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span>AI Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500" />
          <span>Deployments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span>File Operations</span>
        </div>
      </div>

      <div className="h-64 flex items-end gap-2">
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-center">
            <div className="w-full flex items-end gap-0.5 h-48">
              <div
                className="flex-1 bg-primary rounded-t transition-all duration-300"
                style={{ height: `${(day.ai_requests / maxValue) * 100}%` }}
                title={`AI Requests: ${day.ai_requests}`}
              />
              <div
                className="flex-1 bg-blue-500 rounded-t transition-all duration-300"
                style={{ height: `${(day.deployments / maxValue) * 100}%` }}
                title={`Deployments: ${day.deployments}`}
              />
              <div
                className="flex-1 bg-green-500 rounded-t transition-all duration-300"
                style={{ height: `${(day.file_operations / maxValue) * 100}%` }}
                title={`File Operations: ${day.file_operations}`}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d")
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<UsageStats | null>(null)
  const [dailyUsage, setDailyUsage] = React.useState<DailyUsage[]>([])
  const [recentActivity, setRecentActivity] = React.useState<any[]>([])

  React.useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Get user quotas
      const { data: quotas } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Get usage events for the period
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const { data: usageEvents } = await supabase
        .from('usage_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      // Get project count
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // Calculate stats
      const aiRequests = usageEvents?.filter(e => e.event_type === 'ai_request').length || 0
      const deployments = usageEvents?.filter(e => e.event_type === 'deployment').length || 0

      setStats({
        ai_requests: quotas?.ai_requests_used || aiRequests,
        ai_requests_limit: quotas?.ai_requests_limit || 50,
        deployments: deployments,
        deployments_limit: quotas?.deployments_limit || 10,
        storage_used_mb: quotas?.storage_used_mb || 0,
        storage_limit_mb: quotas?.storage_limit_mb || 100,
        projects_count: projectsCount || 0,
        projects_limit: quotas?.projects_limit || 3,
      })

      // Generate daily usage data
      const daily: DailyUsage[] = []
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().slice(0, 10)

        const dayEvents = usageEvents?.filter(e =>
          e.created_at.startsWith(dateStr)
        ) || []

        daily.push({
          date: dateStr,
          ai_requests: dayEvents.filter(e => e.event_type === 'ai_request').length,
          deployments: dayEvents.filter(e => e.event_type === 'deployment').length,
          file_operations: dayEvents.filter(e => e.event_type === 'file_operation').length,
        })
      }

      // Only keep last 7 days for chart
      setDailyUsage(daily.slice(-7))

      // Get recent activity
      setRecentActivity(usageEvents?.slice(0, 10) || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded" />
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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your usage and activity
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="AI Requests"
          value={stats?.ai_requests || 0}
          description="Requests this period"
          icon={MessageSquare}
          progress={stats ? {
            current: stats.ai_requests,
            max: stats.ai_requests_limit,
          } : undefined}
        />
        <StatCard
          title="Deployments"
          value={stats?.deployments || 0}
          description="Deployments this period"
          icon={Rocket}
          progress={stats ? {
            current: stats.deployments,
            max: stats.deployments_limit,
          } : undefined}
        />
        <StatCard
          title="Storage Used"
          value={`${stats?.storage_used_mb || 0} MB`}
          description="Of total storage"
          icon={FileCode}
          progress={stats ? {
            current: stats.storage_used_mb,
            max: stats.storage_limit_mb,
          } : undefined}
        />
        <StatCard
          title="Projects"
          value={stats?.projects_count || 0}
          description="Active projects"
          icon={BarChart3}
          progress={stats ? {
            current: stats.projects_count,
            max: stats.projects_limit,
          } : undefined}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Over Time
            </CardTitle>
            <CardDescription>
              Your activity for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyUsage.length > 0 ? (
              <UsageChart data={dailyUsage} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No usage data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      activity.event_type === 'ai_request' && "bg-primary/10",
                      activity.event_type === 'deployment' && "bg-blue-500/10",
                      activity.event_type === 'file_operation' && "bg-green-500/10"
                    )}>
                      {activity.event_type === 'ai_request' && <MessageSquare className="h-4 w-4 text-primary" />}
                      {activity.event_type === 'deployment' && <Rocket className="h-4 w-4 text-blue-500" />}
                      {activity.event_type === 'file_operation' && <FileCode className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {activity.event_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quota Warning */}
      {stats && (
        (stats.ai_requests / stats.ai_requests_limit > 0.8 ||
         stats.storage_used_mb / stats.storage_limit_mb > 0.8) && (
          <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Approaching Usage Limits</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're using most of your allocated resources. Consider upgrading your plan for higher limits.
                  </p>
                  <Badge variant="outline" className="mt-3 cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Upgrade Plan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
