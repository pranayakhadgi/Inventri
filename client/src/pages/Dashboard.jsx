import { Link } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { stats, isLoading, isError } = useDashboardStats();

  if (isError) {
    return (
      <div className="p-8 text-center bg-destructive/10 rounded-lg border border-destructive/30">
        <h2 className="text-destructive font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-destructive/80">Could not connect to the API. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions Header */}
      <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground break-words whitespace-normal">
            Welcome Back
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed break-words whitespace-normal">
            Here's what's happening with your inventory today.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline">
            <Link to="/inventory">Manage Items</Link>
          </Button>
          <Button variant="primary">
            <Link to="/reservations/new">+ New Reservation</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Total Items"
              value={stats.totalItems}
              color="blue"
              delay={0}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <StatCard
              label="Available"
              value={stats.availableItems}
              color="green"
              delay={100}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Active Reservations"
              value={stats.activeReservations}
              color="violet"
              delay={200}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <StatCard
              label="Flagged Discrepancies"
              value={stats.flaggedDiscrepancies}
              color={stats.flaggedDiscrepancies > 0 ? 'red' : 'amber'}
              delay={300}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-lg text-card-foreground break-words whitespace-normal min-w-0">Recent Reservations</h3>
            <Link to="/reservations" className="text-sm text-primary hover:underline shrink-0">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <SkeletonTable rows={5} cols={3} className="border-0" />
            ) : stats.recentReservations?.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentReservations.map((res) => (
                  <div key={res.reservation_id} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground break-words">{res.organization_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(res.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge status={res.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No recent reservations
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items / Discrepancies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-lg text-card-foreground break-words whitespace-normal min-w-0">Action Items</h3>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <SkeletonTable rows={5} cols={3} className="border-0" />
            ) : stats.recentDiscrepancies?.filter(d => d.status === 'flagged')?.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentDiscrepancies.filter(d => d.status === 'flagged').map((disc) => (
                  <div key={disc.discrepancy_id} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground break-words">{disc.item_name}</p>
                      <p className="text-sm text-muted-foreground">{disc.type}</p>
                    </div>
                    <Badge status="flagged" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>All caught up!</p>
                <p className="text-sm mt-1">No flagged discrepancies to review.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
