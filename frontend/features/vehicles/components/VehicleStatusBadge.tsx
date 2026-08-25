'use client';

import React from 'react';
import type { VehicleStatus } from '../types/vehicle.types';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  isInTask?: boolean;
}

export function VehicleStatusBadge({ status, isInTask }: VehicleStatusBadgeProps) {
  if (isInTask) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        في مهمة
      </span>
    );
  }

  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        جاهزة للعمل
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      غير نشطة
    </span>
  );
}
