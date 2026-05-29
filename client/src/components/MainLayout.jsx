import { Outlet } from 'react-router';
import { useState } from 'react';
import clsx from 'clsx';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Header collapsed={collapsed} />

      <main
        className={clsx(
          'p-6 transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]',
          collapsed ? 'ml-[var(--sidebar-collapsed)]' : 'ml-[var(--sidebar-width)]'
        )}
      >
        <div className="max-w-7xl mx-auto animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
