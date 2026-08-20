'use client';

import { Star } from 'lucide-react';
import { Driver } from '../types/driver.types';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';

interface DriverCardProps {
  driver: Driver;
  selected: boolean;
  onSelect: () => void;
}

export function DriverCard({ driver, selected, onSelect }: DriverCardProps) {
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
      <div className="flex items-start gap-3">
        <DriverAvatar driver={driver} />
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[14px] font-semibold text-[var(--zd-text)]">
            {driver.name}
          </b>
          <span className="mt-0.5 block text-[10px] text-[var(--zd-muted)]">
            {driver.phone}
          </span>
        </span>
        <StatusPill status={driver.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--zd-line)] pt-3 text-right">
        <span>
          <small className="block text-[9px] text-[var(--zd-muted)]">التقييم</small>
          <b className="mt-0.5 flex items-center gap-1 font-manrope text-[12px] text-[var(--zd-text)]">
            <Star className="h-3 w-3 fill-[var(--zd-amber)] text-[var(--zd-amber)]" />
            {driver.rating}
          </b>
        </span>
        <span>
          <small className="block text-[9px] text-[var(--zd-muted)]">الرحلات</small>
          <b className="mt-0.5 block font-manrope text-[12px] text-[var(--zd-text)]">
            {driver.trips}
          </b>
        </span>
        <span>
          <small className="block text-[9px] text-[var(--zd-muted)]">المركبة</small>
          <b className="mt-0.5 block truncate text-[11px] text-[var(--zd-text)]">
            {driver.vehicle}
          </b>
        </span>
      </div>
    </button>
  );
}
