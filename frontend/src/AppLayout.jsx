import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import GlobalSearch from './components/layout/GlobalSearch';
import { useAuth } from './contexts/AuthContext';
const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    user
  } = useAuth();
  return <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 nav-glass border-b border-black/5 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-surface-container text-on-surface">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 primary-gradient rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base" style={{
              fontVariationSettings: "'FILL' 1"
            }}>school</span>
            </div>
            <span className="font-bold text-primary">Knowledge Guru</span>
          </div>
          <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>
        <div className="lg:hidden px-4 py-2 border-b border-black/5 shrink-0">
          <GlobalSearch />
        </div>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-end px-6 py-3 border-b border-black/5 shrink-0">
          <GlobalSearch />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default AppLayout;