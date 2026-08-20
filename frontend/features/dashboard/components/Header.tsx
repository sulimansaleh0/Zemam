'use client';

import { Bell, ChevronDown, CircleHelp, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

interface HeaderProps {
  onMenu: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  userName: string;
}

export function Header({ onMenu, searchQuery, onSearchChange, userName }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-[var(--zd-line)] px-4 py-4 sm:px-7 lg:px-10 transition-colors">
      <button
        onClick={onMenu}
        aria-label="فتح القائمة"
        className="zd-focus rounded-lg bg-[var(--zd-surface-2)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative order-3 w-full sm:order-none sm:max-w-[310px] sm:flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)]" />
        <input
          aria-label="البحث في المركبات والمهام"
          placeholder="ابحث في المركبات، السائقين، المهام..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] pr-10 pl-4 text-xs text-[var(--zd-text)] outline-none placeholder:text-[var(--zd-muted)] focus:border-[var(--zd-blue)] transition-colors"
        />
      </div>

      <div className="mr-auto flex items-center gap-2">
        {/* ── Theme Switcher ── */}
        <ThemeToggle />

        <button
          aria-label="المساعدة"
          className="zd-focus rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
        >
          <CircleHelp className="h-[17px] w-[17px]" />
        </button>

        <button
          aria-label="الإشعارات"
          className="zd-focus relative rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--zd-red)]" />
        </button>

        <button className="zd-focus hidden items-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2 text-xs text-[var(--zd-text)] sm:flex transition-colors">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--zd-blue)] text-[10px] font-bold text-white">
            {userName[0]}
          </span>
          {userName.split(' ')[0]}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
        </button>
      </div>
    </header>
  );
}
