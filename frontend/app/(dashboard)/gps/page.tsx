'use client';

import React from 'react';
import {
  Compass,
  MapPin,
  Radio,
  Truck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { GpsTrackerView } from '@/features/gps/components/GpsTrackerView';
import { useFleetGps } from '@/features/gps/hooks/useFleetGps';

export default function GpsPage() {
  const { user } = useAuth();
  const isFleetManager = user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const fleetHook = useFleetGps();
  const { stats, refreshFleet, isLoading, error } = fleetHook;

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── تنبيه الخطأ الموحد ── */}
      {error && <ErrorAlert error={error} onRetry={() => refreshFleet()} />}

      {/* ── ترويسة الصفحة الموحدة ── */}
      <PageHeader
        title="مركز تتبع الأسطول المباشر (GPS Tracking)"
        description="مراقبة حركة المركبات لحظياً، قراءات السرعة، زوايا الاتجاه، وسجلات الرحلات المكتملة"
        icon={Radio}
        count={stats.total}
        onRefresh={() => refreshFleet()}
        isRefreshing={isLoading}
      />

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
      <GpsTrackerView fleetHook={fleetHook} />
    </div>
  );
}
