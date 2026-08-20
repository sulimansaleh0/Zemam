'use client';

import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  color: string;
  note: string;
}

export function KpiCard({ icon: Icon, label, value, change, color, note }: KpiCardProps) {
  return (
    <article className="zd-panel zd-rise relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className={`absolute left-0 top-0 h-full w-1 ${color}`} />
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--zd-surface-2)] text-[var(--zd-blue)]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <span className="rounded-full bg-[var(--zd-surface-2)] px-2 py-1 text-[10px] font-semibold text-[var(--zd-teal)]">
          {change}
        </span>
      </div>
      <div className="mt-4 font-manrope text-[25px] font-extrabold tracking-[-.05em] text-[var(--zd-text)]">
        {value}
      </div>
      <div className="mt-1 text-[12px] font-semibold text-[var(--zd-text)] opacity-85">{label}</div>
      <div className="mt-1 text-[10px] text-[var(--zd-muted)]">{note}</div>
    </article>
  );
}
