'use client';

import type { Driver } from '../types/driver.types';
import { getDriverDisplayName, formatRelativeDate } from '../utils/driverHelpers';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';

interface DriverCardProps {
  driver: Driver;
  selected: boolean;
  onSelect: () => void;
}

export function DriverCard({ driver, selected, onSelect }: DriverCardProps) {
  const displayName = getDriverDisplayName(driver);

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`zd-focus block w-full rounded-2xl border p-4 text-right transition-all ${
        selected
          ? 'border-[var(--zd-blue)]/70 bg-[var(--zd-row-selected)] shadow-sm'
          : 'border-[var(--zd-line)] bg-[var(--zd-surface)] hover:border-[var(--zd-blue)]/40'
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <DriverAvatar driver={driver} size="md" />
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[14px] font-semibold text-[var(--zd-text)]">
            {displayName}
          </b>
          <span className="mt-0.5 block truncate text-[10px] text-[var(--zd-muted)]" dir="ltr">
            {driver.email}
          </span>
        </span>
        <StatusPill status={driver.status} />
      </div>

      {/* ── Mid: Score & Vehicle ── */}
      <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-[var(--zd-line)]">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            (driver.driverScore ?? 95) >= 90
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : (driver.driverScore ?? 95) >= 75
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          ★ تقييم: {driver.driverScore ?? 95}%
        </span>

        {driver.assignedVehicle ? (
          <span className="text-[11px] font-semibold text-[var(--zd-text)] truncate max-w-[140px]">
            {driver.assignedVehicle.model} ({driver.assignedVehicle.plateNumber})
          </span>
        ) : (
          <span className="text-[10px] text-[var(--zd-muted)] italic">بدون مركبة</span>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--zd-muted)]">
        <span>انضم {formatRelativeDate(driver.createdAt)}</span>
        {Array.isArray(driver.licenseTypes) && driver.licenseTypes.length > 0 && (
          <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
            رخصة {driver.licenseTypes.includes('truck') ? 'ثقيل' : driver.licenseTypes.includes('van') ? 'متوسط' : 'خفيف'}
          </span>
        )}
      </div>
    </button>
  );
}
