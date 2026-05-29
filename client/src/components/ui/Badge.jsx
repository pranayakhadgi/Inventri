import clsx from 'clsx';

const statusMap = {
  available:    { bg: 'bg-status-available-bg', text: 'text-status-available',    dot: 'bg-status-available' },
  checked_out:  { bg: 'bg-status-checkedout-bg', text: 'text-status-checkedout',  dot: 'bg-status-checkedout' },
  maintenance:  { bg: 'bg-status-maintenance-bg', text: 'text-status-maintenance', dot: 'bg-status-maintenance' },
  pending:      { bg: 'bg-status-pending-bg', text: 'text-status-pending',        dot: 'bg-status-pending' },
  active:       { bg: 'bg-status-active-bg', text: 'text-status-active',          dot: 'bg-status-active' },
  completed:    { bg: 'bg-status-completed-bg', text: 'text-status-completed',    dot: 'bg-status-completed' },
  cancelled:    { bg: 'bg-destructive/10', text: 'text-destructive',              dot: 'bg-destructive' },
  flagged:      { bg: 'bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  resolved:     { bg: 'bg-emerald-500/10',  text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

const fallback = { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };

export function Badge({ status, label, className }) {
  const display = label || status?.replace(/_/g, ' ') || 'unknown';
  const colors = statusMap[status] || fallback;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        'transition-colors duration-150',
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
