import { Badge } from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';

export function ItemTable({ items, isLoading, onRowClick }) {
  if (isLoading) {
    return <SkeletonTable rows={10} cols={4} />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] bg-[var(--surface-0)] border border-[var(--surface-border)] rounded-[var(--radius-lg)]">
        <p>No items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface-0)]">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-[var(--surface-1)] border-b border-[var(--surface-border)] text-sm text-[var(--text-secondary)] font-medium">
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--surface-border)]">
          {items.map((item) => (
            <tr
              key={item.item_id}
              onClick={() => onRowClick(item)}
              className="hover:bg-[var(--surface-1)] cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">
                {item.name}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)] capitalize">
                {item.category || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                {item.location_name || '—'}
              </td>
              <td className="px-6 py-4">
                <Badge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
