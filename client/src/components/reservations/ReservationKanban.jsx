import { Badge } from '../ui/Badge';
import clsx from 'clsx';

export function ReservationKanban({ reservations, isLoading, onCardClick }) {
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading board...</div>;

  const columns = [
    { id: 'pending', title: 'Pending', status: 'pending' },
    { id: 'active', title: 'Active', status: 'active' },
    { id: 'completed', title: 'Completed', status: 'completed' },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map((col) => {
        const columnCards = reservations.filter(r => r.status === col.status);
        return (
          <div key={col.id} className="flex-1 min-w-[300px] flex flex-col bg-muted rounded-xl border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <h3 className="font-semibold text-foreground">{col.title}</h3>
              <span className="text-xs font-medium px-2 py-1 bg-secondary text-muted-foreground rounded-full">{columnCards.length}</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {columnCards.map(res => (
                <div
                  key={res.reservation_id}
                  onClick={() => onCardClick(res)}
                  className={clsx(
                    'bg-card border border-border rounded-lg p-4',
                    'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
                    'transition-all duration-150 cursor-pointer'
                  )}
                >
                  <h4 className="font-medium text-card-foreground line-clamp-1 break-words mb-2" title={res.organization_name}>{res.organization_name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 break-words mb-3" title={res.item_names}>{res.item_names || 'No items'}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 gap-2">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
                      {new Date(res.start_time).toLocaleDateString()}
                    </span>
                    <Badge status={res.status} />
                  </div>
                </div>
              ))}
              {columnCards.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                  No {col.id} reservations
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
