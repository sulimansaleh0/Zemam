import React from 'react';
import { VehicleStatus } from '../types/vehicle.types';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
}

const statusConfig: Record<
  VehicleStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  active: {
    label: 'نشطة',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  maintenance: {
    label: 'في الصيانة',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  stopped: {
    label: 'متوقفة',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  unavailable: {
    label: 'غير متاحة',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
