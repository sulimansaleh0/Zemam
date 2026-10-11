'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import type { FuelStatus } from '../types/fuel.types';
import type { BackendVehicle } from '@/features/vehicles';

interface FuelTableToolbarProps {
  activeTab: 'all' | FuelStatus;
  onTabChange: (tab: 'all' | FuelStatus) => void;
  selectedVehicleId: string;
  onVehicleChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  vehicles: BackendVehicle[];
}

const STATUS_TABS: { id: 'all' | FuelStatus; label: string }[] = [
  { id: 'all', label: 'جميع الإيصالات' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'approved', label: 'المعتمدة' },
  { id: 'declined', label: 'المرفوضة' },
];

export function FuelTableToolbar({
  activeTab,
  onTabChange,
  selectedVehicleId,
  onVehicleChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  vehicles,
}: FuelTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" dir="rtl">
      {/* التبويبات وفلتر المركبات */}
      <div className="flex flex-wrap items-center gap-2">
        {/* تبويبات الحالة */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                  : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* فلتر المركبات */}
        <select
          value={selectedVehicleId}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
        >
          <option value="all">كافة المركبات</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.model} ({v.plateNumber})
            </option>
          ))}
        </select>
      </div>

      {/* حقل البحث وزر الإضافة */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالمركبة، السائق، أو التنبيه..."
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>تسجيل إيصال وقود</span>
        </button>
      </div>
    </div>
  );
}
