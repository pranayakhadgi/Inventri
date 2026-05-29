import clsx from 'clsx';

export function Card({ className, hover = false, glass = false, children, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] border border-[var(--surface-border)]',
        'transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]',
        glass
          ? 'glass'
          : 'bg-[var(--surface-0)]',
        hover && 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-[var(--surface-border)]', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }) {
  return (
    <div className={clsx('px-6 py-3 border-t border-[var(--surface-border)] bg-[var(--surface-1)]', className)}>
      {children}
    </div>
  );
}
