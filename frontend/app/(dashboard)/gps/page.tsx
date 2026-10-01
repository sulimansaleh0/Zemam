'use client';

import React from 'react';
import {
  CalendarDays,
  Car,
  Compass,
  MapPin,
  Radio,
  RefreshCw,
  Route,
  Truck,
  UsersRound,
  Zap,
} from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { GpsTrackerView } from '@/features/gps/components/GpsTrackerView';
import { useFleetGps } from '@/features/gps/hooks/useFleetGps';

export default function GpsPage() {
  const { user } = useAuth();
  const isFleetManager = user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const {
    userName,
    menuOpen,
    setMenuOpen,
    searchQuery,
    setSearchQuery,
    logout,
  } = useDashboard();

  const { stats, isLoading, refreshFleet } = useFleetGps();

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── القائمة الجانبية للنظام (Sidebar) ── */}
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={userName}
          onLogout={logout}
        />

        {/* ── غطاء الموبايل عند فتح القائمة ── */}
        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ── منطقة المحتوى الرئيسية ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── ترويسة الصفحة (Hero Header) ── */}
            <section className="zd-rise flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--zd-muted)]">
                  <CalendarDays className="h-3.5 w-3.5" />{' '}
                  {new Date().toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    بث لحظي مباشر
                  </span>
                  {isFleetManager && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 border border-blue-500/20">
                      فريقك التشغيلي فقط
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--zd-text)] flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <span>مركز تتبع الأسطول المباشر (GPS Tracking)</span>
                </h1>
                <p className="mt-1 text-xs text-[var(--zd-muted)]">
                  مراقبة حركة المركبات لحظياً، قراءات السرعة، زوايا الاتجاه، وسجلات الرحلات المكتملة
                </p>
              </div>
            </section>

            {/* ── شريط بطاقات مؤشرات الأداء الحية (Live KPI Counters) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* إجمالي المركبات */}
              <div className="zd-panel rounded-2xl p-4 border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-xs transition-all hover:border-blue-500/30">
                <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
                  <span>إجمالي المركبات</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Truck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-[var(--zd-text)]">
                  {stats.total}
                </div>
                <p className="mt-1 text-[10px] text-[var(--zd-muted)]">مركبة مسجلة في الأسطول</p>
              </div>

              {/* متحركة الآن */}
              <div className="zd-panel rounded-2xl p-4 border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-xs transition-all hover:border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
                  <span>متحركة الآن</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-600 flex items-center gap-2">
                  <span>{stats.moving}</span>
                  {stats.moving > 0 && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-emerald-600/80 font-medium">تسير على الطرقات بسرعة &gt; 0</p>
              </div>

              {/* متوقفة مؤقتاً */}
              <div className="zd-panel rounded-2xl p-4 border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-xs transition-all hover:border-amber-500/30">
                <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
                  <span>متوقفة مؤقتاً</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-600">
                  {stats.idle}
                </div>
                <p className="mt-1 text-[10px] text-amber-600/80 font-medium">سائق متصل ولكن السرعة 0</p>
              </div>

              {/* غير متصلة */}
              <div className="zd-panel rounded-2xl p-4 border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-xs transition-all hover:border-neutral-500/30">
                <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
                  <span>غير متصلة</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-500/10 text-neutral-400">
                    <Compass className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-neutral-400">
                  {stats.offline}
                </div>
                <p className="mt-1 text-[10px] text-[var(--zd-muted)]">لا توجد نبضات منذ &gt; 3 دقائق</p>
              </div>
            </div>

            {/* ── لوحة الخريطة التفاعلية المركزية (Live GPS Canvas) ── */}
            <GpsTrackerView />
          </div>
        </div>
      </div>
    </main>
  );
}
