'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, CircleHelp, Menu, Search, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useAlerts } from '@/features/alerts';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZimamLogo } from '@/features/landing/components/ZimamLogo';

interface HeaderProps {
  onMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  userName: string;
}

export function Header({ onMenu, searchQuery = '', onSearchChange, showSearch = true, userName }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<'help' | 'profile' | null>(null);
  const { data: unreadAlerts = [] } = useAlerts(true);
  const { logout } = useAuth();

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-[var(--zd-line)] px-4 py-4 sm:px-7 lg:px-10 transition-colors">
      <div className="flex items-center gap-2.5 lg:hidden">
        <button
          onClick={onMenu}
          aria-label="فتح القائمة"
          className="zd-focus rounded-lg bg-[var(--zd-surface-2)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <ZimamLogo href="/dashboard" compact />
      </div>

      {showSearch && onSearchChange && (
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
      )}

      <div className="relative mr-auto flex items-center gap-2">
        {/* ── Theme Switcher ── */}
        <ThemeToggle />

        <button
          type="button"
          aria-label="المساعدة"
          aria-expanded={openMenu === 'help'}
          onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
          className="zd-focus rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
        >
          <CircleHelp className="h-[17px] w-[17px]" />
        </button>

        {openMenu === 'help' && (
          <div className="absolute left-12 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2 shadow-xl">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-[var(--zd-muted)]">روابط سريعة</p>
            <Link href="/tasks" onClick={() => setOpenMenu(null)} className="block rounded-lg px-2 py-2 text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]">إدارة المهام</Link>
            <Link href="/fuel" onClick={() => setOpenMenu(null)} className="block rounded-lg px-2 py-2 text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]">سجلات الوقود</Link>
            <Link href="/vehicles" onClick={() => setOpenMenu(null)} className="block rounded-lg px-2 py-2 text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]">إدارة المركبات</Link>
          </div>
        )}

        <Link
          href="/dashboard#operational-alerts"
          aria-label="الإشعارات"
          title="الانتقال إلى التنبيهات"
          className="zd-focus relative rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2.5 text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
        >
          <Bell className="h-[17px] w-[17px]" />
          {unreadAlerts.length > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--zd-red)]" />}
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-label="قائمة الحساب"
            aria-expanded={openMenu === 'profile'}
            onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
            className="zd-focus hidden items-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2 text-xs text-[var(--zd-text)] sm:flex transition-colors"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--zd-blue)] text-[10px] font-bold text-white">
              {userName[0]}
            </span>
            {userName.split(' ')[0]}
            <ChevronDown className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
          </button>
          {openMenu === 'profile' && (
            <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2 shadow-xl">
              <p className="truncate px-2 py-1.5 text-[10px] text-[var(--zd-muted)]">{userName}</p>
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
