'use client';

import type { DriverStatus } from '../types/driver.types';

interface StatusPillProps {
  status: DriverStatus;
}

const STATUS_CONFIG: Record<DriverStatus, { label: string; className: string }> = {
  active: {
    label: 'نشط',
    className: 'bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]',
  },
  inactive: {
    label: 'غير نشط',
    className: 'bg-[var(--zd-red)]/12 text-[var(--zd-red)]',
  },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
