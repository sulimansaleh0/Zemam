'use client';

import {
  Activity,
  Bell,
  Bot,
  CircleHelp,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  MoreHorizontal,
  Package,
  Settings2,
  Truck,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onLogout?: () => void;
}

const navItems = [
  { label: 'لوحة التحكم', icon: Home, href: '/dashboard', active: true },
  { label: 'المركبات', icon: Truck, href: '/vehicles' },
  { label: 'السائقون', icon: UsersRound, href: '/drivers' },
  { label: 'الصيانة', icon: Wrench, href: '/maintenance' },
  { label: 'المهام', icon: ClipboardList, href: '/tasks' },
  { label: 'الوقود', icon: Package, href: '/fuel' },
  { label: 'التنبيهات', icon: Bell, href: '/alerts', badge: '3' },
  { label: 'تتبع GPS', icon: MapPin, href: '/gps' },
  { label: 'توصيات الذكاء', icon: Bot, href: '/ai' },
  { label: 'التقارير', icon: Activity, href: '/reports' },
];

function Logo() {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--zd-blue)] shadow-[0_9px_24px_rgba(37,99,235,.28)]">
        <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className="text-[21px] font-bold tracking-[-.04em] text-[var(--zd-text)]">زمام</div>
        <div className="mt-1 text-[8px] font-semibold tracking-[.18em] text-[var(--zd-muted)]">ZAMAM FLEET</div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose, userName, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        open ? 'translate-x-0' : 'translate-x-full'
      } fixed inset-y-0 right-0 z-40 flex w-[258px] flex-col border-l border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
    >
      <div className="mb-8 flex items-center justify-between px-2">
        <Logo />
        <button
          onClick={onClose}
          aria-label="إغلاق القائمة"
          className="zd-focus rounded-lg p-2 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 px-3 text-[10px] font-semibold tracking-[.08em] text-[var(--zd-muted)]">
        مساحة التشغيل
      </div>

      <nav aria-label="التنقل الرئيسي" className="space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href, badge }) => {
          const isActive = pathname === href || (href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={label}
              href={href}
              className={`zd-focus flex w-full items-center gap-3 rounded-[11px] px-3 py-3 text-right text-[13px] font-medium transition ${
                isActive
                  ? 'bg-[var(--zd-blue)] text-white shadow-[0_8px_18px_rgba(37,99,235,.22)]'
                  : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
              }`}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--zd-red)] px-1 text-[9px] text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-[var(--zd-line)] pt-4">
        <button className="zd-focus flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13px] text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]">
          <Settings2 className="h-[17px] w-[17px]" /> الإعدادات
        </button>
        <button className="zd-focus flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13px] text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]">
          <CircleHelp className="h-[17px] w-[17px]" /> مركز المساعدة
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="zd-focus flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13px] text-[#fca5a5] hover:bg-red-500/10"
          >
            <LogOut className="h-[17px] w-[17px]" /> تسجيل الخروج
          </button>
        )}

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-[var(--zd-surface-2)] p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--zd-blue)] text-xs font-bold text-white">
            {userName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-[var(--zd-text)]">{userName}</div>
            <div className="text-[10px] text-[var(--zd-muted)]">مدير الأسطول</div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-[var(--zd-muted)]" />
        </div>
      </div>
    </aside>
  );
}
