import { Badge } from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';

export function ItemTable({ items, isLoading, onRowClick }) {
  if (isLoading) return <SkeletonTable rows={10} cols={4} />;

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
        <p>No items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-muted border-b border-border text-sm text-muted-foreground font-medium">
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr
              key={item.item_id}
              onClick={() => onRowClick(item)}
              className="hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-card-foreground group-hover:text-primary transition-colors break-words min-w-0">
                {item.name}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{item.category || '—'}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{item.location_name || '—'}</td>
              <td className="px-6 py-4"><Badge status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
