'use client';

import { ChevronLeft, Star } from 'lucide-react';
import { Driver } from '../types/driver.types';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';

interface DriverRowProps {
  driver: Driver;
  selected: boolean;
  onSelect: () => void;
}

export function DriverRow({ driver, selected, onSelect }: DriverRowProps) {
  // هل الرخصة تنتهي قريباً (خلال 60 يوم)؟
  const isExpiringSoon = (() => {
    if (!driver.expiry) return false;
    const expDate = new Date(driver.expiry).getTime();
    const now = new Date().getTime();
    const diffDays = (expDate - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 60;
  })();

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`zd-focus group grid w-full grid-cols-[minmax(180px,1.25fr)_100px_70px_76px_112px_112px_24px] items-center gap-3 border-b border-[var(--zd-line)] px-4 py-3.5 text-right transition-all last:border-0 ${
        selected
          ? 'bg-[var(--zd-row-selected)] border-l-2 border-l-[var(--zd-blue)]'
          : 'hover:bg-[var(--zd-surface-2)]'
      }`}
    >
      {/* ── Driver info & avatar ── */}
      <span className="flex min-w-0 items-center gap-3">
        <DriverAvatar driver={driver} />
        <span className="min-w-0">
          <b className="block truncate text-[13px] font-semibold text-[var(--zd-text)]">
            {driver.name}
          </b>
          <small className="mt-0.5 block text-[10px] text-[var(--zd-muted)]">
            {driver.phone}
          </small>
        </span>
      </span>

      {/* ── License & Expiry ── */}
      <span
        className={`text-[11px] ${
          isExpiringSoon ? 'text-[var(--zd-amber)] font-medium' : 'text-[var(--zd-muted)]'
        }`}
      >
        <span className="block font-manrope text-[10px]">{driver.license}</span>
        <small className="mt-0.5 block text-[9px]">{driver.expiryLabel}</small>
      </span>

      {/* ── Rating ── */}
      <span className="flex items-center gap-1 font-manrope text-[12px] text-[var(--zd-text)]">
        <Star className="h-3 w-3 fill-[var(--zd-amber)] text-[var(--zd-amber)]" />
        {driver.rating}
      </span>

      {/* ── Trips ── */}
      <span className="font-manrope text-[12px] text-[var(--zd-muted)]">
        {driver.trips}
      </span>

      {/* ── Status ── */}
      <span>
        <StatusPill status={driver.status} />
      </span>

      {/* ── Vehicle ── */}
      <span className="min-w-0">
        <b className="block truncate text-[11px] font-medium text-[var(--zd-text)]">
          {driver.vehicle}
        </b>
        <small className="mt-0.5 block truncate text-[9px] text-[var(--zd-muted)]">
          {driver.vehicleType}
        </small>
      </span>

      {/* ── Arrow icon ── */}
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
