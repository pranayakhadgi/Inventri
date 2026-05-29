import clsx from 'clsx';

export function StatCard({ label, value, icon, trend, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: 'from-[var(--color-primary-500)] to-[var(--color-primary-700)]',
    accent: 'from-[var(--color-accent-400)] to-[var(--color-accent-600)]',
    green: 'from-emerald-400 to-emerald-600',
    amber: 'from-amber-400 to-amber-600',
    blue: 'from-blue-400 to-blue-600',
    violet: 'from-violet-400 to-violet-600',
    red: 'from-red-400 to-red-600',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[var(--radius-lg)]',
        'bg-[var(--surface-0)] border border-[var(--surface-border)]',
        'p-5 group',
        'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5',
        'transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]',
        'animate-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent strip */}
      <div className={clsx(
        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
        colorMap[color]
      )} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {value}
          </p>
          {trend !== undefined && (
            <p className={clsx(
              'text-xs font-medium mt-1.5 flex items-center gap-1',
              trend >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}</span>
            </p>
          )}
        </div>

        {/* Icon circle */}
        <div className={clsx(
          'w-11 h-11 rounded-[var(--radius-md)] bg-gradient-to-br flex items-center justify-center text-white',
          'shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-md)] transition-shadow',
          colorMap[color]
        )}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}
