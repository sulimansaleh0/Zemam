'use client';

import React from 'react';
import {
  Car,
  Clock,
  Compass,
  Filter,
  Navigation,
  Radio,
  Search,
  Truck,
  User,
  X,
  Zap,
} from 'lucide-react';
import type { VehicleLiveTelemetry, VehicleGpsStatus, GpsFilterOptions } from '../types/gps.types';
import { getGpsStatusConfig, formatLastSeen } from '../utils/gpsHelpers';

interface FleetGpsSidebarProps {
  vehicles: VehicleLiveTelemetry[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  filters: GpsFilterOptions;
  onFilterChange: (filters: GpsFilterOptions) => void;
  stats: {
    total: number;
    moving: number;
    idle: number;
    available: number;
    offline: number;
  };
  isLoading?: boolean;
  onClose?: () => void;
}

export function FleetGpsSidebar({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  filters,
  onFilterChange,
  stats,
  isLoading,
  onClose,
}: FleetGpsSidebarProps) {
  const statusTabs: { id: 'all' | VehicleGpsStatus; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: stats.total },
    { id: 'moving', label: 'متحركة', count: stats.moving },
    { id: 'idle', label: 'متوقفة', count: stats.idle },
    { id: 'available', label: 'متاحة', count: stats.available },
    { id: 'offline', label: 'غير متصلة', count: stats.offline },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--zd-surface)] text-[var(--zd-text)]">
      {/* ── رأس القائمة الجانبية ── */}
      <div className="border-b border-[var(--zd-line)] p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--zd-text)]">أسطول المركبات</h3>
              <p className="text-[11px] text-[var(--zd-muted)]">
                {stats.moving} مركبة تتحرك في الميدان الآن
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] transition-colors cursor-pointer"
              title="إخفاء القائمة لتوسيع الخريطة"
              aria-label="إغلاق القائمة"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* حقل البحث */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
          <input
            type="text"
            placeholder="بحث باللوحة، السائق، الطراز..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-1.5 ps-9 pe-8 text-xs text-[var(--zd-text)] placeholder:text-[var(--zd-muted)] focus:border-blue-500 focus:outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--zd-muted)] hover:text-[var(--zd-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* فلاتر الحالة */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange({ ...filters, status: tab.id })}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[var(--zd-surface-2)] text-[var(--zd-muted)] hover:bg-[var(--zd-line)] hover:text-[var(--zd-text)]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--zd-surface)] text-[var(--zd-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── قائمة المركبات المتمررة ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-xs text-[var(--zd-muted)]">
            <Compass className="h-7 w-7 animate-spin text-blue-500" />
            <span>جاري استرجاع مواقع الأسطول...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-xs text-[var(--zd-muted)] p-4">
            <Truck className="h-10 w-10 stroke-1 text-[var(--zd-muted)] opacity-50" />
            <p className="font-semibold">لا توجد مركبات مطابقة</p>
            <p className="text-[10px]">جرّب تغيير فلتر الحالة أو إفراغ خانة البحث</p>
          </div>
        ) : (
          vehicles.map((v) => {
            const isSelected = v.vehicleId === selectedVehicleId;
            const statusConfig = getGpsStatusConfig(v.gpsStatus);
            const speed = Math.round(v.currentLocation?.speed || 0);

            return (
              <div
                key={v.vehicleId}
                onClick={() => onSelectVehicle(v.vehicleId)}
                className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/30'
                    : 'border-[var(--zd-line)] bg-[var(--zd-surface)] hover:border-blue-500/40 hover:bg-[var(--zd-surface-2)]'
                }`}
              >
                {/* رأس الكرت */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dotClass}`} />
                    <span className="font-bold text-xs tracking-tight text-[var(--zd-text)]">
                      {v.plateNumber}
                    </span>
                    <span className="text-[10px] text-[var(--zd-muted)]">({v.model})</span>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* السائق والفريق */}
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--zd-muted)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span className="truncate font-medium text-[var(--zd-text)]">
                      {v.driverName || 'سائق غير معيّن'}
                    </span>
                  </div>
                  {v.teamName && (
                    <span className="truncate text-[10px] font-semibold text-blue-600 bg-blue-500/10 rounded px-1.5 py-0.5">
                      {v.teamName}
                    </span>
                  )}
                </div>

                {/* السرعة وآخر تحديث */}
                <div className="mt-2.5 flex items-center justify-between border-t border-[var(--zd-line)] pt-2 text-[10px]">
                  <div className="flex items-center gap-1 font-semibold">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span
                      className={
                        speed > 0
                          ? 'text-emerald-500 font-bold'
                          : 'text-[var(--zd-muted)]'
                      }
                    >
                      {speed} كم/ساعة
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[var(--zd-muted)] text-[10px]">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSeen(v.currentLocation?.updatedAt)}</span>
                  </div>
                </div>

                {/* المهمة النشطة */}
                {v.isInTask && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-600">
                    <Navigation className="h-3 w-3 shrink-0" />
                    <span className="truncate">المهمة: {v.activeTaskTitle || 'جاري التوصيل'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
