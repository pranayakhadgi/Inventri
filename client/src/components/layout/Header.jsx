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
        'flex items-center justify-between px-6 gap-4',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'ml-[var(--sidebar-collapsed)]' : 'ml-[var(--sidebar-width)]'
      )}
    >
      <div className="min-w-0">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
          {crumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-1 whitespace-nowrap">
              {idx > 0 && <span className="mx-1">/</span>}
              {idx === crumbs.length - 1 ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-foreground leading-tight break-words">
          {pageTitle}
        </h1>
      </div>

      {/* Right side — avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={clsx(
            'w-9 h-9 rounded-full',
            'bg-gradient-to-br from-rose-400 to-primary',
            'flex items-center justify-center text-primary-foreground text-sm font-bold',
            'ring-2 ring-background shadow-sm',
            'cursor-pointer hover:ring-primary/30 transition-all'
          )}
          title="User"
        >
          P
        </div>
      </div>
    </header>
  );
}
