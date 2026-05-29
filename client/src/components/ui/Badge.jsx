import clsx from 'clsx';

const statusMap = {
  available:    { bg: 'bg-[var(--status-available-bg)]',    text: 'text-[var(--status-available)]',    dot: 'bg-[var(--status-available)]' },
  checked_out:  { bg: 'bg-[var(--status-checked-out-bg)]',  text: 'text-[var(--status-checked-out)]',  dot: 'bg-[var(--status-checked-out)]' },
  maintenance:  { bg: 'bg-[var(--status-maintenance-bg)]',  text: 'text-[var(--status-maintenance)]',  dot: 'bg-[var(--status-maintenance)]' },
  pending:      { bg: 'bg-[var(--status-pending-bg)]',      text: 'text-[var(--status-pending)]',      dot: 'bg-[var(--status-pending)]' },
  active:       { bg: 'bg-[var(--status-active-bg)]',       text: 'text-[var(--status-active)]',       dot: 'bg-[var(--status-active)]' },
  completed:    { bg: 'bg-[var(--status-completed-bg)]',    text: 'text-[var(--status-completed)]',    dot: 'bg-[var(--status-completed)]' },
  cancelled:    { bg: 'bg-red-500/10',                      text: 'text-red-500',                      dot: 'bg-red-500' },
  flagged:      { bg: 'bg-amber-500/10',                    text: 'text-amber-600',                    dot: 'bg-amber-500' },
  resolved:     { bg: 'bg-emerald-500/10',                  text: 'text-emerald-600',                  dot: 'bg-emerald-500' },
};

const fallback = { bg: 'bg-[var(--surface-2)]', text: 'text-[var(--text-secondary)]', dot: 'bg-[var(--text-muted)]' };

export function Badge({ status, label, className }) {
  const display = label || status?.replace(/_/g, ' ') || 'unknown';
  const colors = statusMap[status] || fallback;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        'transition-colors duration-[var(--duration-fast)]',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {display}
    </span>
  );
}
