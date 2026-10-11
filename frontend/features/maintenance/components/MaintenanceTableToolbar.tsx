'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import type {
  MaintenanceStatus,
  MaintenanceCategory,
} from '../types/maintenance.types';
import type { BackendVehicle } from '@/features/vehicles';

interface MaintenanceTableToolbarProps {
  activeTab: 'all' | MaintenanceStatus;
  onTabChange: (tab: 'all' | MaintenanceStatus) => void;
  activeCategory: 'all' | MaintenanceCategory;
  onCategoryChange: (cat: 'all' | MaintenanceCategory) => void;
  selectedVehicleId: string;
  onVehicleChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  vehicles: BackendVehicle[];
}

const STATUS_TABS: { id: 'all' | MaintenanceStatus; label: string }[] = [
  { id: 'all', label: 'جميع السجلات' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'approved', label: 'المعتمدة' },
  { id: 'declined', label: 'المرفوضة' },
];

const CATEGORY_FILTERS: { id: 'all' | MaintenanceCategory; label: string }[] = [
  { id: 'all', label: 'كافة التصنيفات' },
  { id: 'Faults', label: 'أعطال طارئة' },
  { id: 'Periodic Maintenance', label: 'صيانة دورية' },
];

export function MaintenanceTableToolbar({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  selectedVehicleId,
  onVehicleChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  vehicles,
}: MaintenanceTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between" dir="rtl">
      {/* التبويبات وفلاتر التصنيف والمركبات */}
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

        {/* فلتر نوع الصيانة */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                  : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
              }`}
            >
              {cat.label}
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
            placeholder="ابحث بالمركبة، العطل، أو المسؤول..."
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>تسجيل طلب صيانة</span>
        </button>
      </div>
    </div>
  );
}
