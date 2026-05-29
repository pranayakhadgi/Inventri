import { Badge } from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';

export function ReservationTable({ reservations, isLoading, onRowClick }) {
  if (isLoading) return <SkeletonTable rows={10} cols={5} />;

  if (!reservations || reservations.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
        <p>No reservations found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-muted border-b border-border text-sm text-muted-foreground font-medium">
            <th className="px-6 py-4">Organization</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Time Range</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reservations.map((res) => (
            <tr key={res.reservation_id} onClick={() => onRowClick(res)} className="hover:bg-muted/50 cursor-pointer transition-colors group">
              <td className="px-6 py-4 font-medium text-card-foreground group-hover:text-primary transition-colors break-words min-w-0">{res.organization_name}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]" title={res.item_names}>{res.item_names || '—'}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{res.location_name || '—'}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                <div className="flex flex-col">
                  <span>{new Date(res.start_time).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground/70">to {new Date(res.end_time).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-6 py-4"><Badge status={res.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
