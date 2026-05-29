import { Outlet } from 'react-router';
import { useState } from 'react';
import clsx from 'clsx';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { ErrorBoundary } from './ErrorBoundary';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Header collapsed={collapsed} />

      <main
        className={clsx(
          'flex-1 p-6 lg:p-8 overflow-x-hidden',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          collapsed ? 'ml-[var(--sidebar-collapsed)]' : 'ml-[var(--sidebar-width)]'
        )}
      >
        <div className="max-w-7xl mx-auto animate-in">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
