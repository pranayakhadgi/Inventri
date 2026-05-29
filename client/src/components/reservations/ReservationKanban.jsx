import { Badge } from '../ui/Badge';
import clsx from 'clsx';

export function ReservationKanban({ reservations, isLoading, onCardClick }) {
  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading board...</div>;
  }

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
          <div key={col.id} className="flex-1 min-w-[300px] flex flex-col bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--surface-border)]">
            <div className="p-4 border-b border-[var(--surface-border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">{col.title}</h3>
              <span className="text-xs font-medium px-2 py-1 bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-full">
                {columnCards.length}
              </span>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {columnCards.map(res => (
                <div
                  key={res.reservation_id}
                  onClick={() => onCardClick(res)}
                  className={clsx(
                    'bg-[var(--surface-0)] border border-[var(--surface-border)] rounded-[var(--radius-md)] p-4',
                    'hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-300)] hover:-translate-y-0.5',
                    'transition-all duration-[var(--duration-fast)] cursor-pointer'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-[var(--text-primary)] line-clamp-1" title={res.organization_name}>
                      {res.organization_name}
                    </h4>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3" title={res.item_names}>
                    {res.item_names || 'No items'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--surface-border)] pt-3">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      {new Date(res.start_time).toLocaleDateString()}
                    </span>
                    <Badge status={res.status} />
                  </div>
                </div>
              ))}
              
              {columnCards.length === 0 && (
                <div className="h-24 border-2 border-dashed border-[var(--surface-border)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] text-sm">
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
