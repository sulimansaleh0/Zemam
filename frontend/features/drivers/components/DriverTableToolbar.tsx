'use client';

import React from 'react';
import { Search, SlidersHorizontal, ShieldCheck, Building, Plus } from 'lucide-react';
import type { DriverStatus } from '../types/driver.types';
import type { Team } from '@/features/teams/types/team.types';

interface DriverTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: DriverStatus | 'all';
  onStatusFilterChange: (status: DriverStatus | 'all') => void;
  licenseFilter: 'all' | 'normal' | 'van' | 'truck';
  onLicenseFilterChange: (license: 'all' | 'normal' | 'van' | 'truck') => void;
  teamFilter: string;
  onTeamFilterChange: (teamId: string) => void;
  teamsList: Team[];
  onAddDriverClick: () => void;
}

export function DriverTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  licenseFilter,
  onLicenseFilterChange,
  teamFilter,
  onTeamFilterChange,
  teamsList,
  onAddDriverClick,
}: DriverTableToolbarProps) {
  return (
    <div className="p-4 border-b border-[var(--border)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="البحث بالاسم، البريد، الجوال، اللوحة، أو الرخصة..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-36">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as DriverStatus | 'all')}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">غير نشط فقط</option>
          </select>
        </div>

        {/* License Category Filter */}
        <div className="relative w-36">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={licenseFilter}
            onChange={(e) => onLicenseFilterChange(e.target.value as 'all' | 'normal' | 'van' | 'truck')}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
          >
            <option value="all">كل الرخص</option>
            <option value="normal">خفيف (سيارة)</option>
            <option value="van">متوسط (حافلة)</option>
            <option value="truck">ثقيل (شاحنة)</option>
          </select>
        </div>

        {/* Team Filter */}
        <div className="relative w-40">
          <Building className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={teamFilter}
            onChange={(e) => onTeamFilterChange(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
          >
            <option value="all">كل الفرق</option>
            <option value="without_team">بدون فريق</option>
            {teamsList.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Driver Button */}
      <button
        type="button"
        onClick={onAddDriverClick}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-opacity cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة سائق</span>
      </button>
    </div>
  );
}
