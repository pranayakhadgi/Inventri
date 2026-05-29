import clsx from 'clsx';

const variants = {
  primary:
    'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
  secondary:
    'bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border border-[var(--surface-border)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]',
  destructive:
    'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
  accent:
    'bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)]',
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
        'inline-flex items-center font-medium rounded-[var(--radius-md)] cursor-pointer',
        'transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
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
