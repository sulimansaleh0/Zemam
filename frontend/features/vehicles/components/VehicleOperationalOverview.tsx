'use client';

import React from 'react';
import { Activity, Fuel, Wrench, Gauge, Loader2 } from 'lucide-react';
import type { VehicleStats } from '../types/vehicle.types';

interface VehicleOperationalOverviewProps {
  stats: VehicleStats | null;
  isLoading?: boolean;
}

export function VehicleOperationalOverview({
  stats,
  isLoading = false,
}: VehicleOperationalOverviewProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--text)]">السجلات التشغيلية للمركبة (بيانات حية)</h3>
        {isLoading && (
          <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            جارٍ جلب السجلات...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Distance */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] block">المسافة التشغيلية المقطوعة</span>
            <span className="text-lg font-bold text-[var(--text)] font-mono">
              {stats ? `${stats.distance.toLocaleString('ar-SA')} كم` : '0 كم'}
            </span>
          </div>
        </div>

        {/* Fuel */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] block">إجمالي استهلاك الوقود</span>
            <span className="text-lg font-bold text-[var(--text)] font-mono">
              {stats ? `${stats.totalFuel.toLocaleString('ar-SA')} لتر` : '0 لتر'}
            </span>
            {stats && stats.totalFuelCost > 0 && (
              <span className="text-[10px] text-[var(--muted)] block">
                ({stats.totalFuelCost.toLocaleString('ar-SA')} ر.س)
              </span>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] block">مصروفات الصيانة المعتمدة</span>
            <span className="text-lg font-bold text-[var(--text)] font-mono">
              {stats ? `${stats.totalMaintenanceCost.toLocaleString('ar-SA')} ر.س` : '0 ر.س'}
            </span>
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] block">معدل كفاءة الوقود المحققة</span>
            <span className="text-lg font-bold text-[var(--text)] font-mono">
              {stats && stats.fuelEfficiency > 0
                ? `${stats.fuelEfficiency.toFixed(1)} كم/لتر`
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
