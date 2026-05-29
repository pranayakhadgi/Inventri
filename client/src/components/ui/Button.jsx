import clsx from 'clsx';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
  ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  accent: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
  icon: 'h-9 w-9 p-0 justify-center',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg cursor-pointer',
        'transition-all duration-150 whitespace-nowrap shrink-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
