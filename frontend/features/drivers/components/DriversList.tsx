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
import { Driver, DriverSortOrder } from '../types/driver.types';
import { DriverRow } from './DriverRow';
import { DriverCard } from './DriverCard';

interface DriversListProps {
  filtered: Driver[];
  totalCount: number;
  selectedId: number;
  onSelect: (id: number) => void;
  query: string;
  setQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortOrder: DriverSortOrder;
  setSortOrder: (order: DriverSortOrder) => void;
  onAdd: () => void;
  onShowAll?: () => void;
}

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
    if (sortOrder === 'lastActivity') setSortOrder('rating');
    else if (sortOrder === 'rating') setSortOrder('trips');
    else if (sortOrder === 'trips') setSortOrder('name');
    else setSortOrder('lastActivity');
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'rating':
        return 'التقييم الأقوى';
      case 'trips':
        return 'الأكثر رحلات';
      case 'name':
        return 'أبجدياً (الاسم)';
      default:
        return 'آخر نشاط';
    }
  };

  return (
    <section
      className="zd-panel zd-rise zd-d2 min-w-0 overflow-hidden rounded-2xl transition-all"
      aria-labelledby="drivers-list-title"
    >
      {/* ── List Header & Filters ── */}
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
              اختر سجلاً لفتح الملف والملخص الكامل
            </p>
          </div>
          <button
            onClick={onAdd}
            className="zd-focus flex items-center gap-1.5 rounded-lg border border-[var(--zd-blue)]/35 bg-[var(--zd-blue)]/10 px-3 py-2 text-[11px] font-semibold text-[var(--zd-blue)] hover:bg-[var(--zd-blue)]/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة سريع
          </button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="البحث بالاسم أو رقم الرخصة أو المركبة"
              placeholder="ابحث بالاسم، رقم الرخصة، المركبة..."
              className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-10 pl-3 text-[11px] text-[var(--zd-text)] outline-none focus:border-[var(--zd-blue)] transition-colors"
            />
          </label>

          <label className="relative sm:w-[155px]">
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="تصفية حسب الحالة"
              className="zd-focus h-10 w-full appearance-none rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 pr-9 text-[11px] text-[var(--zd-text)] outline-none focus:border-[var(--zd-blue)] transition-colors cursor-pointer"
            >
              <option value="الكل">كل الحالات</option>
              <option value="نشط">نشط</option>
              <option value="في الصيانة">في الصيانة</option>
              <option value="في إجازة">في إجازة</option>
              <option value="غير نشط">غير نشط</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
          </label>

          <button
            onClick={toggleSort}
            title="تغيير طريقة الترتيب"
            className="zd-focus flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[11px] text-[var(--zd-muted)] hover:border-[var(--zd-blue)] hover:text-[var(--zd-text)] transition-colors"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span>{getSortLabel()}</span>
          </button>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[790px] grid-cols-[minmax(180px,1.25fr)_100px_70px_76px_112px_112px_24px] gap-3 border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 px-4 py-3 text-[10px] font-semibold text-[var(--zd-muted)] select-none">
          <span>السائق</span>
          <span>الرخصة</span>
          <span>التقييم</span>
          <span>الرحلات</span>
          <span>الحالة</span>
          <span>المركبة</span>
          <span aria-hidden="true" />
        </div>

        {filtered.length > 0 ? (
          filtered.map((driver) => (
            <DriverRow
              key={driver.id}
              driver={driver}
              selected={driver.id === selectedId}
              onSelect={() => onSelect(driver.id)}
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
              key={driver.id}
              driver={driver}
              selected={driver.id === selectedId}
              onSelect={() => onSelect(driver.id)}
            />
          ))
        ) : (
          <EmptyList onAdd={onAdd} />
        )}
      </div>

      {/* ── Footer count & reset ── */}
      <div className="flex items-center justify-between border-t border-[var(--zd-line)] px-4 py-3 text-[10px] text-[var(--zd-muted)]">
        <span>
          عرض {filtered.length} من {totalCount} سائقاً
        </span>
        {(query || statusFilter !== 'الكل') && onShowAll && (
          <button
            onClick={onShowAll}
            className="zd-focus font-medium text-[var(--zd-blue)] hover:underline"
          >
            إلغاء التصفية وعرض الكل <ChevronLeft className="mr-0.5 inline h-3 w-3" />
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
        جرّب تغيير كلمة البحث أو حالة السائق للتصفية.
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
