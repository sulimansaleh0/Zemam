'use client';

import { ChevronLeft, Car } from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { getDriverDisplayName, formatRelativeDate } from '../utils/driverHelpers';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';

interface DriverRowProps {
  driver: Driver;
  selected: boolean;
  onSelect: () => void;
}

export function DriverRow({ driver, selected, onSelect }: DriverRowProps) {
  const displayName = getDriverDisplayName(driver);
  const score = driver.driverScore ?? 95;

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`zd-focus group grid w-full grid-cols-[minmax(170px,1.4fr)_75px_95px_minmax(120px,1fr)_85px_100px_20px] items-center gap-3 border-b border-[var(--zd-line)] px-4 py-3.5 text-right transition-all last:border-0 ${
        selected
          ? 'border-l-2 border-l-[var(--zd-blue)] bg-[var(--zd-row-selected)]'
          : 'hover:bg-[var(--zd-surface-2)]'
      }`}
    >
      {/* ── الاسم والأفاتار ── */}
      <span className="flex min-w-0 items-center gap-3">
        <DriverAvatar driver={driver} size="md" />
        <span className="min-w-0">
          <b className="block truncate text-[13px] font-semibold text-[var(--zd-text)]">
            {displayName}
          </b>
          <small className="mt-0.5 block truncate text-[10px] text-[var(--zd-muted)]" dir="ltr">
            {driver.email}
          </small>
        </span>
      </span>

      {/* ── التقييم (Driver Score) ── */}
      <span className="flex items-center">
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            score >= 90
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : score >= 75
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          ★ {score}%
        </span>
      </span>

      {/* ── فئة الرخصة العربية ── */}
      <span className="truncate">
        {Array.isArray(driver.licenseTypes) && driver.licenseTypes.length > 0 ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            {driver.licenseTypes.includes('truck')
              ? 'ثقيل'
              : driver.licenseTypes.includes('van')
              ? 'متوسط'
              : 'خفيف'}
          </span>
        ) : (
          <span className="text-[10px] text-[var(--zd-muted)]">خفيف</span>
        )}
      </span>

      {/* ── المركبة المسندة ── */}
      <span className="truncate">
        {driver.assignedVehicle ? (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--zd-text)]">
            <Car className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[110px]">{driver.assignedVehicle.model}</span>
          </div>
        ) : (
          <span className="text-[10px] text-[var(--zd-muted)] italic">بدون مركبة</span>
        )}
      </span>

      {/* ── الحالة ── */}
      <span>
        <StatusPill status={driver.status} />
      </span>

      {/* ── تاريخ الانضمام ── */}
      <span className="text-[11px] text-[var(--zd-muted)]">
        {formatRelativeDate(driver.createdAt)}
      </span>

      {/* ── السهم ── */}
      <ChevronLeft
        className={`h-4 w-4 text-[var(--zd-muted)] transition-transform ${
          selected
            ? 'translate-x-0 text-[var(--zd-blue)]'
            : 'group-hover:-translate-x-1'
        }`}
      />
    </button>
  );
}
