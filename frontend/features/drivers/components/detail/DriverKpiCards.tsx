'use client';

import React from 'react';
import { Award, CheckCheck, TrendingUp, Shield, AlertTriangle, CheckCircle2, Fuel } from 'lucide-react';

interface DriverKpiCardsProps {
  score: number;
  finishedTasksCount: number;
  totalTasksCount: number;
  onTimeRate: number;
  inProgressTasksCount: number;
  faultIncidentsCount: number;
  totalFuelCost: number;
  totalFuelQty: number;
  fuelRecordsCount: number;
}

export function DriverKpiCards({
  score,
  finishedTasksCount,
  totalTasksCount,
  onTimeRate,
  inProgressTasksCount,
  faultIncidentsCount,
  totalFuelCost,
  totalFuelQty,
  fuelRecordsCount,
}: DriverKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Driver Score */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)]">
            تقييم الأداء الشامل (Driver Score)
          </span>
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[var(--text)]">
            {score}
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">/ 100 نقطة</span>
        </div>
        <div className="space-y-1">
          <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 90
                  ? 'bg-emerald-500'
                  : score >= 75
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--muted)]">
            <span>معدل انضباط مرتفع</span>
            <span>{score >= 90 ? 'ممتاز' : 'جيد'}</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Completed Tasks & On-time Rate */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)]">
            المهام ومعدل الالتزام بالمواعيد
          </span>
          <CheckCheck className="w-4 h-4 text-teal-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[var(--text)]">
            {finishedTasksCount}
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">
            من أصل {totalTasksCount} مهمة مسندة
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-3.5 h-3.5" />
            {onTimeRate}% تسليم في الموعد (SLA)
          </span>
          <span className="text-[10px] text-[var(--muted)]">
            {inProgressTasksCount} جارية حالياً
          </span>
        </div>
      </div>

      {/* KPI 3: Safety & Maintenance Faults */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)]">
            سجل السلامة وأعطال الصيانة
          </span>
          <Shield className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-black tracking-tight ${
              faultIncidentsCount > 0 ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {faultIncidentsCount}
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">
            أعطال ناتجة عن خطأ السائق
          </span>
        </div>
        <div
          className={`text-[11px] font-medium flex items-center gap-1 ${
            faultIncidentsCount > 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {faultIncidentsCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>توجد أعطال مسجلة ناتجة عن خطأ السائق</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>سجل قيادة آمن ونظيف، لا توجد مخالفات مسجلة</span>
            </>
          )}
        </div>
      </div>

      {/* KPI 4: Fuel Consumption & Cost */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted)]">
            مصروفات واستجرار الوقود
          </span>
          <Fuel className="w-4 h-4 text-sky-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)]">
            {totalFuelCost.toLocaleString('ar-SA')}
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">ر.س مسجلة</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>{totalFuelQty.toLocaleString('ar-SA')} لتر مستهلك</span>
          <span className="font-semibold text-sky-500">
            {fuelRecordsCount} عملية تعبئة
          </span>
        </div>
      </div>
    </div>
  );
}
