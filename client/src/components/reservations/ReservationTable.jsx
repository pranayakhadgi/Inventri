import { Badge } from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';

export function ReservationTable({ reservations, isLoading, onRowClick }) {
  if (isLoading) {
    return <SkeletonTable rows={10} cols={5} />;
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] bg-[var(--surface-0)] border border-[var(--surface-border)] rounded-[var(--radius-lg)]">
        <p>No reservations found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface-0)]">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[var(--surface-1)] border-b border-[var(--surface-border)] text-sm text-[var(--text-secondary)] font-medium">
            <th className="px-6 py-4">Organization</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Time Range</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--surface-border)]">
          {reservations.map((res) => (
            <tr
              key={res.reservation_id}
              onClick={() => onRowClick(res)}
              className="hover:bg-[var(--surface-1)] cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">
                {res.organization_name}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)] truncate max-w-[200px]" title={res.item_names}>
                {res.item_names || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                {res.location_name || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                <div className="flex flex-col">
                  <span>{new Date(res.start_time).toLocaleDateString()}</span>
                  <span className="text-xs text-[var(--text-muted)]">to {new Date(res.end_time).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge status={res.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
