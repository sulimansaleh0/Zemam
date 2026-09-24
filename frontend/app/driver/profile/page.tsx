'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Truck,
  Users,
  LogOut,
  Smartphone,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { DriverHeader } from '@/features/driver/components/DriverHeader';
import { getQueuedTelemetry, getOfflineActions, clearQueuedTelemetry } from '@/features/driver/services/driverStorage';
import type { DriverProfile } from '@/features/driver/types/driverPwa.types';

export default function DriverProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [offlineCount, setOfflineCount] = useState({ telemetry: 0, actions: 0 });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data?.user || data?.data?.user || null);
        }
      } catch (err) {
        console.warn('Failed to load profile:', err);
      }

      try {
        const telem = await getQueuedTelemetry();
        const acts = await getOfflineActions();
        setOfflineCount({
          telemetry: telem.length,
          actions: acts.length,
        });
      } catch {}
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}

    router.push('/login');
    router.refresh();
  };

  const handleClearOffline = async () => {
    await clearQueuedTelemetry();
    setOfflineCount((prev) => ({ ...prev, telemetry: 0 }));
    setNotice('تم تفريغ طابور النبضات المخزنة محلياً.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 text-slate-900">
      <DriverHeader />

      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-teal-700" />
              <span>ملف السائق والوردية</span>
            </h2>
            <p className="text-xs text-slate-500">
              بيانات الحساب، حالة المناوبة وإعدادات التطبيق
            </p>
          </div>
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* ── بطاقة السائق الرئيسية ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm font-bold text-xl">
              {profile?.name ? profile.name.slice(0, 2) : 'س'}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{profile?.name || 'سائق زمام'}</h3>
              <p className="text-xs text-slate-500">{profile?.email || 'driver@zemam.sa'}</p>
              <span className="inline-block mt-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                سائق معتمد (Active Driver)
              </span>
            </div>
          </div>

          {/* حالة الوردية والمناوبة */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Power className={`h-4 w-4 ${isOnDuty ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900">حالة المناوبة (Shift):</p>
                <p className="text-[10px] text-slate-500">
                  {isOnDuty ? 'على رأس العمل - متاح للمهام' : 'في استراحة / خارج الخدمة'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isOnDuty
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isOnDuty ? 'نشط 🟢' : 'استراحة ⏸️'}
            </button>
          </div>
        </div>

        {/* ── معلومات الفريق والمركبة ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 mb-1">الارتباط التشغيلي:</h4>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-4 w-4 text-teal-700" />
              <span>الفريق التشغيلي:</span>
            </div>
            <span className="font-bold text-slate-900">
              {typeof profile?.teamId === 'object' ? profile.teamId?.name : 'فريق التوزيع الميداني'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>المركبة المسندة:</span>
            </div>
            <span className="font-bold text-slate-900">
              {typeof profile?.vehicleId === 'object'
                ? profile.vehicleId?.plateNumber
                : 'أ ب ج 1234'}
            </span>
          </div>
        </div>

        {/* ── حالة الذاكرة المحلية والـ PWA ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-teal-700" />
            <span>حالة تطبيق الـ PWA والتخزين المحلي:</span>
          </h4>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-1">نبضات GPS معلقة</span>
              <span className="text-base font-bold text-teal-700 font-mono">
                {offlineCount.telemetry}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-1">إجراءات بانتظار المزامنة</span>
              <span className="text-base font-bold text-amber-600 font-mono">
                {offlineCount.actions}
              </span>
            </div>
          </div>

          {offlineCount.telemetry > 0 && (
            <button
              onClick={handleClearOffline}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              تفريغ طابور النبضات المخزنة
            </button>
          )}
        </div>

        {/* ── زر تسجيل الخروج ── */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3.5 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        </div>
      </main>
    </div>
  );
}
