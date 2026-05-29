import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';

const routeLabels = {
  '/': 'Dashboard',
  '/inventory': 'Inventory',
  '/reservations': 'Reservations',
  '/reservations/new': 'New Reservation',
};

function buildBreadcrumbs(pathname) {
  if (pathname === '/') return [{ label: 'Dashboard', path: '/' }];

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', path: '/' }];

  segments.forEach((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/');
    const label = routeLabels[path] || seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, path });
  });

  return crumbs;
}

export function Header({ collapsed }) {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname);
  const pageTitle = crumbs[crumbs.length - 1].label;

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 h-[var(--header-height)]',
        'flex items-center justify-between px-6',
        'bg-[var(--surface-0)]/80 backdrop-blur-md',
        'border-b border-[var(--surface-border)]',
        'transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]',
        collapsed ? 'ml-[var(--sidebar-collapsed)]' : 'ml-[var(--sidebar-width)]'
      )}
    >
      <div>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-0.5">
          {crumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {idx > 0 && <span className="mx-1">/</span>}
              {idx === crumbs.length - 1 ? (
                <span className="text-[var(--text-secondary)] font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right side — avatar */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'w-9 h-9 rounded-full',
            'bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-primary-500)]',
            'flex items-center justify-center text-white text-sm font-bold',
            'ring-2 ring-[var(--surface-0)] shadow-[var(--shadow-sm)]',
            'cursor-pointer hover:ring-[var(--color-primary-200)] transition-all'
          )}
          title="User"
        >
          P
        </div>
      </div>
    </header>
  );
}
