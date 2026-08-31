'use client';

import { ChevronLeft } from 'lucide-react';
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

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`zd-focus group grid w-full grid-cols-[minmax(180px,1.5fr)_minmax(160px,1fr)_100px_130px_24px] items-center gap-3 border-b border-[var(--zd-line)] px-4 py-3.5 text-right transition-all last:border-0 ${
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
          <small className="mt-0.5 block truncate text-[10px] text-[var(--zd-muted)]">
            {driver.email}
          </small>
        </span>
      </span>

      {/* ── البريد الإلكتروني ── */}
      <span className="truncate font-manrope text-[11px] text-[var(--zd-muted)]" dir="ltr">
        {driver.email}
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
