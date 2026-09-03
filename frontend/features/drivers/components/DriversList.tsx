'use client';

import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import type { Driver, DriverStatusFilter, DriverSortOrder } from '../types/driver.types';
import { DriverRow } from './DriverRow';
import { DriverCard } from './DriverCard';

interface DriversListProps {
  filtered: Driver[];
  totalCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  setQuery: (value: string) => void;
  statusFilter: DriverStatusFilter;
  setStatusFilter: (value: DriverStatusFilter) => void;
  sortOrder: DriverSortOrder;
  setSortOrder: (order: DriverSortOrder) => void;
  onAdd: () => void;
  onShowAll?: () => void;
}

const SORT_CYCLE: DriverSortOrder[] = ['newest', 'oldest', 'name'];

const SORT_LABELS: Record<DriverSortOrder, string> = {
  newest: 'الأحدث أولاً',
  oldest: 'الأقدم أولاً',
  name:   'أبجدياً (الاسم)',
};

export function DriversList({
  filtered,
  totalCount,
  selectedId,
  onSelect,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  onAdd,
  onShowAll,
}: DriversListProps) {
  const toggleSort = () => {
    const currentIndex = SORT_CYCLE.indexOf(sortOrder);
    setSortOrder(SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length]);
  };

  return (
    <section
      className="zd-panel zd-rise zd-d2 min-w-0 overflow-hidden rounded-2xl transition-all"
      aria-labelledby="drivers-list-title"
    >
      {/* ── Header & Filters ── */}
      <div className="border-b border-[var(--zd-line)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="drivers-list-title"
              className="text-[15px] font-bold text-[var(--zd-text)]"
            >
              قائمة السائقين
            </h2>
            <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
              اختر سجلاً لفتح الملف الكامل
            </p>
          </div>
          <button
            onClick={onAdd}
            className="zd-focus flex items-center gap-1.5 rounded-lg border border-[var(--zd-blue)]/35 bg-[var(--zd-blue)]/10 px-3 py-2 text-[11px] font-semibold text-[var(--zd-blue)] transition-colors hover:bg-[var(--zd-blue)]/20"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة سريع
          </button>
        </div>

        {/* ── Search & Controls ── */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="البحث بالاسم أو البريد الإلكتروني"
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-10 pl-3 text-[11px] text-[var(--zd-text)] outline-none transition-colors focus:border-[var(--zd-blue)]"
            />
          </label>

          <label className="relative sm:w-[145px]">
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DriverStatusFilter)}
              aria-label="تصفية حسب الحالة"
              className="zd-focus h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 pr-9 text-[11px] text-[var(--zd-text)] outline-none transition-colors focus:border-[var(--zd-blue)]"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
          </label>

          <button
            onClick={toggleSort}
            title="تغيير طريقة الترتيب"
            className="zd-focus flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[11px] text-[var(--zd-muted)] transition-colors hover:border-[var(--zd-blue)] hover:text-[var(--zd-text)]"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span>{SORT_LABELS[sortOrder]}</span>
          </button>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[700px] grid-cols-[minmax(180px,1.5fr)_minmax(160px,1fr)_100px_130px_24px] gap-3 border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 px-4 py-3 text-[10px] font-semibold text-[var(--zd-muted)] select-none">
          <span>السائق</span>
          <span>البريد الإلكتروني</span>
          <span>الحالة</span>
          <span>تاريخ الانضمام</span>
          <span aria-hidden="true" />
        </div>

        {filtered.length > 0 ? (
          filtered.map((driver) => (
            <DriverRow
              key={driver._id}
              driver={driver}
              selected={driver._id === selectedId}
              onSelect={() => onSelect(driver._id)}
            />
          ))
        ) : (
          <EmptyList onAdd={onAdd} />
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="space-y-2 p-3 md:hidden">
        {filtered.length > 0 ? (
          filtered.map((driver) => (
            <DriverCard
              key={driver._id}
              driver={driver}
              selected={driver._id === selectedId}
              onSelect={() => onSelect(driver._id)}
            />
          ))
        ) : (
          <EmptyList onAdd={onAdd} />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-[var(--zd-line)] px-4 py-3 text-[10px] text-[var(--zd-muted)]">
        <span>
          عرض {filtered.length} من {totalCount} سائقاً
        </span>
        {(query || statusFilter !== 'all') && onShowAll && (
          <button
            onClick={onShowAll}
            className="zd-focus font-medium text-[var(--zd-blue)] hover:underline"
          >
            إلغاء التصفية <ChevronLeft className="mr-0.5 inline h-3 w-3" />
          </button>
        )}
      </div>
    </section>
  );
}

function EmptyList({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]">
        <UsersRound className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-[13px] font-semibold text-[var(--zd-text)]">
        لا توجد نتائج مطابقة
      </h3>
      <p className="mt-1 text-[10px] text-[var(--zd-muted)]">
        جرّب تغيير كلمة البحث أو حالة السائق.
      </p>
      <button
        onClick={onAdd}
        className="zd-focus mt-3 text-[11px] font-medium text-[var(--zd-blue)] hover:underline"
      >
        + إضافة سائق جديد الآن
      </button>
    </div>
  );
}
