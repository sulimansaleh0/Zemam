'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gauge, ClipboardList, Fuel, Wrench, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'القيادة',
    href: '/driver',
    icon: Gauge,
  },
  {
    label: 'المهام',
    href: '/driver/tasks',
    icon: ClipboardList,
  },
  {
    label: 'الوقود',
    href: '/driver/fuel',
    icon: Fuel,
  },
  {
    label: 'الصيانة',
    href: '/driver/maintenance',
    icon: Wrench,
  },
  {
    label: 'الملف',
    href: '/driver/profile',
    icon: User,
  },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  if (pathname === '/driver/login') {
    return null;
  }

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/driver'
              ? pathname === '/driver'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all select-none ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200/70 shadow-xs'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
