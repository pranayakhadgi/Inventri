import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useTheme } from '../../hooks/useTheme';

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

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen z-40',
        'bg-sidebar border-r border-sidebar-border',
        'flex flex-col',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 shadow-md">
            I
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <span className="font-bold text-base tracking-tight text-sidebar-foreground break-words whitespace-normal">
                Inventri
              </span>
              <span className="block text-[10px] text-muted-foreground leading-tight mt-0.5 break-words whitespace-normal max-w-[160px]">
                Asset management platform for university orgs
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-all duration-150',
                'group relative min-w-0',
                isActive
                  ? 'bg-sidebar-active text-sidebar-active-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="break-words whitespace-normal">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — Dark mode toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'text-sm font-medium text-muted-foreground',
            'hover:bg-accent hover:text-foreground',
            'transition-all duration-150 cursor-pointer'
          )}
        >
          <span className="shrink-0">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}
