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

      {/* ── Footer ── */}
      <div className="mt-3 border-t border-[var(--zd-line)] pt-3 text-[10px] text-[var(--zd-muted)]">
        انضم {formatRelativeDate(driver.createdAt)}
      </div>
    </button>
  );
}
