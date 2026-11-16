import { useEffect, useState } from 'react';
import { Radio, Menu, LogOut } from 'lucide-react';
import type { Page } from '@/types';

interface TopNavProps {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  userEmail?: string;
}

export default function TopNav({ currentPage, onNavigate, onToggleSidebar, onSignOut, userEmail }: TopNavProps) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems: { key: Page; label: string }[] = [
    { key: 'mission-control', label: 'Mission Control' },
    { key: 'search-analysis', label: 'Search Analysis' },
    { key: 'mission-history', label: 'Mission History' },
  ];

  return (
    <header className="flex-shrink-0 h-14 bg-panel border-b border-subtle flex items-center justify-between px-3 sm:px-4 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-elevated text-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-cyan/20 to-cyan/5 border border-cyan/30 flex items-center justify-center">
            <Radio className="w-4.5 h-4.5 text-cyan" />
            <div className="absolute inset-0 rounded-md border border-cyan/20 aerosar-radar-sweep pointer-events-none" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-widest text-primary leading-none">AEROSAR</div>
            <div className="text-[10px] text-muted tracking-wide mt-0.5">Aircraft Search &amp; Rescue Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentPage === item.key
                ? 'bg-cyan-dim text-cyan border border-cyan/20'
                : 'text-muted hover:text-primary hover:bg-elevated border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-radar opacity-75 animate-ping" />
            <span className="relative w-2 h-2 rounded-full bg-radar" />
          </span>
          <span className="text-[11px] text-radar font-medium hidden sm:inline">SYSTEM ONLINE</span>
        </div>
        <div className="text-xs font-mono text-muted tabular-nums bg-elevated px-2.5 py-1 rounded-md border border-subtle">
          {utcTime}
        </div>
        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-elevated rounded-md border border-subtle">
            <span className="text-[11px] text-muted truncate max-w-[140px]">{userEmail}</span>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-elevated text-muted hover:text-red rounded-md border border-subtle hover:border-red/20 transition-colors text-xs font-medium"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
