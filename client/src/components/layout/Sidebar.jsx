import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6l8-4 8 4-8 4-8-4z" />
        <path d="M2 10l8 4 8-4" />
        <path d="M2 14l8 4 8-4" />
      </svg>
    ),
  },
  {
    label: 'Reservations',
    path: '/reservations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="14" rx="2" />
        <path d="M3 8h14" />
        <path d="M7 2v4" />
        <path d="M13 2v4" />
      </svg>
    ),
  },
];

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setIsDark(true);
    else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen z-40',
        'bg-[var(--surface-0)] border-r border-[var(--surface-border)]',
        'flex flex-col',
        'transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-[var(--surface-border)]">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full rounded-[var(--radius-md)] p-2 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[var(--shadow-md)]">
            W
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                WiaB
              </span>
              <span className="block text-[10px] text-[var(--text-muted)] leading-none -mt-0.5">
                Equipment Inventory
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                'text-sm font-medium transition-all duration-[var(--duration-fast)]',
                'group relative',
                isActive
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-primary-600)]" />
              )}
              <span className={clsx(
                'shrink-0 transition-colors',
                isActive ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : ''
              )}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — Dark mode toggle */}
      <div className="p-3 border-t border-[var(--surface-border)]">
        <button
          onClick={() => setIsDark((d) => !d)}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)]',
            'text-sm font-medium text-[var(--text-secondary)]',
            'hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]',
            'transition-all duration-[var(--duration-fast)] cursor-pointer'
          )}
        >
          <span className="shrink-0">
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="4" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </span>
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}
