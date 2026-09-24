import React from 'react';
import type { Metadata } from 'next';
import { DriverBottomNav } from '@/features/driver/components/DriverBottomNav';
import { PwaRegister } from '@/features/driver/components/PwaRegister';
import { DriverThemeEnforcer } from '@/features/driver/components/DriverThemeEnforcer';

export const metadata: Metadata = {
  title: 'زمام السائق | Zemam Driver PWA',
  description: 'تطبيق السائق الميداني لإدارة المهام وتتبع الأسطول',
  manifest: '/manifest.webmanifest',
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      data-theme="light"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white"
    >
      {/* ── إجبار وضع Light Mode النقي على تطبيق السائق ── */}
      <DriverThemeEnforcer />

      {/* ── إدارة وتثبيت الـ PWA والتنبيهات ── */}
      <PwaRegister />

      {/* ── محتوى الصفحة ── */}
      <div className="flex-1 flex flex-col pb-24">
        {children}
      </div>

      {/* ── شريط التنقل السفلي للهاتف المحمول ── */}
      <DriverBottomNav />
    </div>
  );
}
