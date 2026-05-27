import { Outlet, NavLink } from 'react-router';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] text-[#1b1464] font-sans">
            {/* Top Navigation */}
            <header className="bg-[#1b1464] text-white p-4 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-wide">Inventory Management System</h1>
                    <nav className="flex gap-6">
                        <NavLink to="/" className="hover:text-[#e3000f] transition-colors">Dashboard</NavLink>
                        <NavLink to="/inventory" className="hover:text-[#e3000f] transition-colors">Inventory</NavLink>
                        <NavLink to="/reservations" className="hover:text-[#e3000f] transition-colors">Reservations</NavLink>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <main className="max-w-7xl mx-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
