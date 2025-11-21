import { DashboardSkeleton } from '@/components/loading-skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-purple-50/50">
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    </div>
  )
}
