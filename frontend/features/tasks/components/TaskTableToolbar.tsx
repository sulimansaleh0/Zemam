'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { TaskStatus } from '../types/task.types';

interface TaskTableToolbarProps {
  activeTab: 'all' | TaskStatus;
  onTabChange: (tab: 'all' | TaskStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
}

const TABS: { id: 'all' | TaskStatus; label: string }[] = [
  { id: 'all', label: 'جميع المهام' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'inprogress', label: 'قيد التنفيذ' },
  { id: 'finished', label: 'المكتملة' },
  { id: 'declined', label: 'الملغية' },
];

export function TaskTableToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
}: TaskTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" dir="rtl">
      {/* ── تبويبات حالة المهمة ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── حقل البحث وزر الإضافة ── */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالوصف، السائق، المركبة..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pr-9 pl-3 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>مهمة جديدة</span>
        </button>
      </div>
    </div>
  );
}
