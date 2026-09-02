import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../stores/useAppStore';

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { highContrast, textSize, reducedMotion } = useAppStore();

  const classNames = [
    highContrast ? 'high-contrast' : '',
    textSize === 'large' ? 'text-size-large' : '',
    textSize === 'xlarge' ? 'text-size-xlarge' : '',
    reducedMotion ? 'reduce-motion' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`flex h-full ${classNames}`}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 lg:w-60 h-full flex-shrink-0">
        <div className="w-full h-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 h-full flex-shrink-0 shadow-xl">
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--background)]">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[var(--sidebar-bg)] border-b border-white/10">
          <button onClick={() => setDrawerOpen(true)} className="text-white">
            <MenuIcon />
          </button>
          <span className="text-white font-semibold text-sm font-display">AccessChain</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
