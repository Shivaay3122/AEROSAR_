import { PlusCircle, LayoutDashboard, BarChart3, History, Info, X } from 'lucide-react';
import type { Page } from '@/types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  hasResult: boolean;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose, hasResult }: SidebarProps) {
  const navItems: { key: Page; label: string; icon: typeof PlusCircle; badge?: string }[] = [
    { key: 'mission-control', label: 'New Mission', icon: PlusCircle },
    { key: 'mission-control', label: 'Mission Control', icon: LayoutDashboard },
    { key: 'search-analysis', label: 'Search Analysis', icon: BarChart3, badge: hasResult ? 'Ready' : undefined },
    { key: 'mission-history', label: 'Mission History', icon: History },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static z-50 w-60 h-full bg-panel border-r border-subtle flex flex-col
          transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-3 lg:hidden border-b border-subtle">
          <span className="text-sm font-semibold text-primary">Navigation</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-elevated text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-dim text-cyan border border-cyan/20'
                    : 'text-muted hover:text-primary hover:bg-elevated border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-radar-dim text-radar font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-subtle space-y-1">
          <button
            onClick={() => onNavigate('about')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'about'
                ? 'bg-cyan-dim text-cyan border border-cyan/20'
                : 'text-muted hover:text-primary hover:bg-elevated border border-transparent'
            }`}
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">About / How It Works</span>
          </button>
          <div className="px-3 pt-2 text-[10px] text-faint">
            AEROSAR v1.0 — Prototype
          </div>
        </div>
      </aside>
    </>
  );
}
