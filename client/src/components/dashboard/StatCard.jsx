import clsx from 'clsx';

export function StatCard({ label, value, icon, trend, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: 'from-primary to-indigo-700',
    accent: 'from-rose-400 to-rose-600',
    green: 'from-emerald-400 to-emerald-600',
    amber: 'from-amber-400 to-amber-600',
    blue: 'from-blue-400 to-blue-600',
    violet: 'from-violet-400 to-violet-600',
    red: 'from-red-400 to-red-600',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl min-w-0',
        'bg-card border border-border',
        'p-6 flex flex-col gap-3',
        'hover:shadow-lg hover:-translate-y-0.5',
        'transition-all duration-200',
        'animate-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent strip */}
      <div className={clsx('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', colorMap[color])} />

      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 break-words whitespace-normal">
            {label}
          </p>
          <p className="text-3xl font-bold text-card-foreground tracking-tight break-words">
            {value}
          </p>
          {trend !== undefined && (
            <p className={clsx(
              'text-xs font-medium mt-1.5 flex items-center gap-1',
              trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            )}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}</span>
            </p>
          )}
        </div>

        {/* Icon circle */}
        <div className={clsx(
          'w-11 h-11 rounded-lg bg-gradient-to-br flex items-center justify-center text-white',
          'shadow-sm shrink-0',
          colorMap[color]
        )}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}
