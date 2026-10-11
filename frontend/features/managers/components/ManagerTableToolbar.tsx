'use client';

import React from 'react';
import { Search, Plus, ArrowDownUp, Building2, SlidersHorizontal } from 'lucide-react';
import type { ManagerFilterStatus, ManagerSortOrder } from '../types/manager.types';
import type { Team } from '@/features/teams/types/team.types';

const SORT_LABELS: Record<ManagerSortOrder, string> = {
  newest: 'الأحدث أولاً',
  oldest: 'الأقدم أولاً',
  name: 'أبجدياً (البريد)',
};

interface ManagerTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ManagerFilterStatus;
  onStatusFilterChange: (status: ManagerFilterStatus) => void;
  teamFilter?: string;
  onTeamFilterChange?: (teamId: string) => void;
  teams?: Team[];
  sortOrder?: ManagerSortOrder;
  onSortToggle?: () => void;
  totalCount?: number;
  onAddClick?: () => void;
}

export function ManagerTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  teamFilter,
  onTeamFilterChange,
  teams = [],
  sortOrder,
  onSortToggle,
  totalCount,
  onAddClick,
}: ManagerTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث بالاسم، البريد الإلكتروني أو الفريق..."
          className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        />
      </div>

      {/* Filter & Sort & Add Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            الكل {totalCount !== undefined ? `(${totalCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            نشط
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('inactive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            معطل
          </button>
        </div>

        {/* Team Filter Dropdown (if handler provided) */}
        {onTeamFilterChange && teams.length > 0 && (
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={teamFilter || 'all'}
              onChange={(e) => onTeamFilterChange(e.target.value)}
              className="pr-8 pl-3 py-2 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
            >
              <option value="all">كل الفرق</option>
              <option value="without_team">بدون فريق</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Button */}
        {sortOrder && onSortToggle && (
          <button
            type="button"
            onClick={onSortToggle}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] rounded-xl transition-colors cursor-pointer"
            title="تغيير ترتيب العرض"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>{SORT_LABELS[sortOrder]}</span>
          </button>
        )}

        {/* Add Manager Button */}
        {onAddClick && statusFilter !== 'inactive' && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدير</span>
          </button>
        )}
      </div>
    </div>
  );
}
