'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
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
  Car,
  Unlink,
  Building2,
  ExternalLink,
  Link2,
} from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { getDriverDisplayName, formatRelativeDate } from '../utils/driverHelpers';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';
import { PerformanceChart } from './PerformanceChart';
import { ActivityContent, ACTIVITY_TAB_ITEMS, type ActivityTab } from './ActivityContent';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

interface DetailPanelProps {
  driver: Driver | null;
  teamName?: string;
  onToggleStatus: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onAssignVehicle?: (driver: Driver) => void;
  onUnassignVehicle?: (driver: Driver) => void;
  onAssignTeam?: (driver: Driver) => void;
  onUnassignTeam?: (driver: Driver) => void;
  isChangingStatus?: boolean;
  isUnassigningVehicle?: boolean;
}

export function DetailPanel({
  driver,
  teamName,
  onToggleStatus,
  onDelete,
  onAssignVehicle,
  onUnassignVehicle,
  onAssignTeam,
  onUnassignTeam,
  isChangingStatus = false,
  isUnassigningVehicle = false,
}: DetailPanelProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';
  const [tab, setTab] = useState<ActivityTab>('المهام');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

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
  const isActive = driver.status === 'active';

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

          {/* Actions Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/drivers/${driver._id}`}
              className="zd-focus flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-[var(--zd-surface-2)] text-[var(--zd-text)] hover:bg-[var(--zd-line)] transition-colors"
              title="عرض صفحة التفاصيل الكاملة"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">الملف الكامل</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="خيارات إضافية"
                aria-expanded={menuOpen}
                className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute left-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-lg p-1 animate-in fade-in zoom-in-95 duration-150">
                  {teamName ? (
                    <button
                      onClick={() => {
                        onUnassignTeam?.(driver);
                        setMenuOpen(false);
                      }}
                      className="zd-focus flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/10 rounded-lg cursor-pointer"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      فك الارتباط عن الفريق
                    </button>
                  ) : (
                    !isFleetManager && (
                      <button
                        onClick={() => {
                          onAssignTeam?.(driver);
                          setMenuOpen(false);
                        }}
                        className="zd-focus flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-[var(--zd-blue)] transition-colors hover:bg-[var(--zd-blue)]/10 rounded-lg cursor-pointer"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        تعيين لفريق تشغيلي
                      </button>
                    )
                  )}

                  {driver.assignedVehicle && (
                    <button
                      onClick={() => {
                        onUnassignVehicle?.(driver);
                        setMenuOpen(false);
                      }}
                      className="zd-focus flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/10 rounded-lg cursor-pointer"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      فك ارتباط المركبة
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onDelete(driver);
                      setMenuOpen(false);
                    }}
                    className="zd-focus flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-[var(--zd-red)] transition-colors hover:bg-[var(--zd-red)]/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف السائق
                  </button>
                </div>
              )}
            </div>
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

        {/* ── Assigned Team Card ── */}
        <div className="mt-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <small className="block text-[9px] text-[var(--zd-muted)]">الفريق التشغيلي</small>
                {teamName ? (
                  <b className="truncate text-[11px] font-semibold text-[var(--zd-text)] block mt-0.5">
                    {teamName}
                  </b>
                ) : (
                  <span className="text-[11px] text-[var(--zd-muted)] italic block mt-0.5">
                    المستودع العام (بدون فريق)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {teamName ? (
                <button
                  type="button"
                  onClick={() => onUnassignTeam?.(driver)}
                  title="فك ارتباط السائق عن الفريق"
                  className="zd-focus p-1 text-[10px] font-semibold rounded-lg border border-[var(--zd-red)]/30 text-[var(--zd-red)] hover:bg-[var(--zd-red)]/10 transition-colors cursor-pointer"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </button>
              ) : (
                !isFleetManager && (
                  <button
                    type="button"
                    onClick={() => onAssignTeam?.(driver)}
                    className="zd-focus flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-[var(--zd-blue)]/10 text-[var(--zd-blue)] hover:bg-[var(--zd-blue)]/20 transition-colors cursor-pointer"
                  >
                    <Link2 className="h-3 w-3" />
                    <span>تعيين لفريق</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Assigned Vehicle Card ── */}
        <div className="mt-2.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--zd-teal)]/10 text-[var(--zd-teal)] shrink-0">
                <Car className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <small className="block text-[9px] text-[var(--zd-muted)]">المركبة المعينة</small>
                {driver.assignedVehicle ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <b className="truncate text-[11px] font-semibold text-[var(--zd-text)]">
                      {driver.assignedVehicle.model} ({driver.assignedVehicle.year})
                    </b>
                    <span className="font-mono text-[10px] bg-[var(--zd-surface)] px-1.5 py-0.2 rounded border border-[var(--zd-line)] text-[var(--zd-text)]">
                      لوحة: {driver.assignedVehicle.plateNumber}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--zd-muted)] italic">
                    لا توجد مركبة معينة حالياً
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {driver.assignedVehicle ? (
                <>
                  <button
                    type="button"
                    onClick={() => onAssignVehicle?.(driver)}
                    className="zd-focus px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-[var(--zd-blue)]/10 text-[var(--zd-blue)] hover:bg-[var(--zd-blue)]/20 transition-colors cursor-pointer"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={() => onUnassignVehicle?.(driver)}
                    disabled={isUnassigningVehicle}
                    title="فك ارتباط المركبة"
                    className="zd-focus p-1 text-[10px] font-semibold rounded-lg border border-[var(--zd-red)]/30 text-[var(--zd-red)] hover:bg-[var(--zd-red)]/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onAssignVehicle?.(driver)}
                  className="zd-focus flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-[var(--zd-teal)]/15 text-[var(--zd-teal)] hover:bg-[var(--zd-teal)]/25 transition-colors cursor-pointer"
                >
                  <Car className="h-3 w-3" />
                  <span>تعيين مركبة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Performance ── */}
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

        <div
          className="mt-4 flex gap-1 rounded-xl bg-[var(--zd-surface-2)] p-1"
          role="tablist"
          aria-label="أقسام نشاط السائق"
        >
          {ACTIVITY_TAB_ITEMS.map(({ label, icon: Icon }) => (
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
