'use client';

import { useState } from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  Fuel,
  Mail,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  Wrench,
} from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { getDriverDisplayName, formatRelativeDate } from '../utils/driverHelpers';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';
import { PerformanceChart } from './PerformanceChart';
import { ActivityContent } from './ActivityContent';

interface DetailPanelProps {
  driver: Driver | null;
  onToggleStatus: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  isChangingStatus?: boolean;
}

type ActivityTab = 'المهام' | 'البلاغات' | 'الوقود';

const TAB_ITEMS: { label: ActivityTab; icon: React.ElementType }[] = [
  { label: 'المهام',   icon: ClipboardCheck },
  { label: 'البلاغات', icon: Wrench },
  { label: 'الوقود',   icon: Fuel },
];

export function DetailPanel({
  driver,
  onToggleStatus,
  onDelete,
  isChangingStatus = false,
}: DetailPanelProps) {
  const [tab, setTab]           = useState<ActivityTab>('المهام');
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Empty state ──
  if (!driver) {
    return (
      <section className="zd-panel zd-rise zd-d3 flex min-h-[400px] items-center justify-center rounded-2xl p-6 text-center text-[var(--zd-muted)]">
        <div>
          <UserRound className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-[12px]">اختر سائقاً من القائمة لعرض تفاصيل ملفه</p>
        </div>
      </section>
    );
  }

  const displayName = getDriverDisplayName(driver);
  const isActive    = driver.status === 'active';

  return (
    <section
      className="zd-panel zd-rise zd-d3 overflow-hidden rounded-2xl transition-all"
      aria-label={`تفاصيل السائق ${displayName}`}
    >
      {/* ── Header ── */}
      <div className="border-b border-[var(--zd-line)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex min-w-0 items-center gap-3">
            <DriverAvatar driver={driver} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-bold text-[var(--zd-text)]">
                {displayName}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-[var(--zd-muted)]" dir="ltr">
                {driver.email}
              </p>
              <div className="mt-1.5">
                <StatusPill status={driver.status} />
              </div>
            </div>
          </div>

          {/* Kebab menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="خيارات إضافية"
              aria-expanded={menuOpen}
              className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <button
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setMenuOpen(false)}
                />
                {/* Menu */}
                <div className="absolute left-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-lg">
                  <button
                    onClick={() => { onDelete(driver); setMenuOpen(false); }}
                    className="zd-focus flex w-full items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[var(--zd-red)] transition-colors hover:bg-[var(--zd-red)]/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف السائق
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3">
            <Mail className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
            <small className="mt-2 block text-[9px] text-[var(--zd-muted)]">البريد الإلكتروني</small>
            <b className="mt-0.5 block truncate text-[11px] font-semibold text-[var(--zd-text)]" dir="ltr">
              {driver.email}
            </b>
          </div>

          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--zd-teal)]" />
            <small className="mt-2 block text-[9px] text-[var(--zd-muted)]">تاريخ الانضمام</small>
            <b className="mt-0.5 block text-[11px] font-semibold text-[var(--zd-text)]">
              {formatRelativeDate(driver.createdAt)}
            </b>
          </div>
        </div>
      </div>

      {/* ── Performance Placeholder ── */}
      <div className="border-b border-[var(--zd-line)] p-5 sm:p-6">
        <h3 className="mb-3 text-[14px] font-bold text-[var(--zd-text)]">مؤشر الأداء</h3>
        <PerformanceChart />
      </div>

      {/* ── Activity Tabs ── */}
      <div className="p-5 sm:p-6">
        <h3 className="text-[14px] font-bold text-[var(--zd-text)]">سجل النشاط</h3>
        <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
          المهام والبلاغات وسجلات الوقود
        </p>

        {/* Tab selector */}
        <div
          className="mt-4 flex gap-1 rounded-xl bg-[var(--zd-surface-2)] p-1"
          role="tablist"
          aria-label="أقسام نشاط السائق"
        >
          {TAB_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              role="tab"
              aria-selected={tab === label}
              className={`zd-focus flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold transition-all ${
                tab === label
                  ? 'bg-[var(--zd-blue)] text-white shadow-xs'
                  : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <ActivityContent tab={tab} />
      </div>

      {/* ── Action Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--zd-line)] bg-[var(--zd-detail-bg)] px-5 py-4 sm:px-6">
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--zd-muted)]">
          <UserRound className="h-3.5 w-3.5" />
          إجراءات إدارة الأسطول
        </span>

        <button
          onClick={() => onToggleStatus(driver)}
          disabled={isChangingStatus}
          className={`zd-focus flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? 'border-[var(--zd-red)]/40 text-[var(--zd-red)] hover:bg-[var(--zd-red)]/10'
              : 'border-[var(--zd-teal)]/40 text-[var(--zd-teal)] hover:bg-[var(--zd-teal)]/10'
          }`}
        >
          {isActive ? (
            <><UserX className="h-3.5 w-3.5" /> تعطيل الحساب</>
          ) : (
            <><UserCheck className="h-3.5 w-3.5" /> تفعيل الحساب</>
          )}
        </button>
      </div>
    </section>
  );
}
