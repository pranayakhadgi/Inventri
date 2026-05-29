import clsx from 'clsx';

export function Card({ className, hover = false, glass = false, children, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border',
        'transition-all duration-200',
        glass ? 'glass' : 'bg-card text-card-foreground',
        hover && 'hover:shadow-lg hover:-translate-y-0.5',
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
    <div className={clsx('px-6 py-4 border-b border-border', className)}>
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
    <div className={clsx('px-6 py-3 border-t border-border bg-muted/50', className)}>
      {children}
    </div>
  );
}
