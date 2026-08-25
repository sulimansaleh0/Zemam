'use client';

import type { Driver } from '../types/driver.types';
import { getDriverDisplayName } from '../utils/driverHelpers';

interface DriverAvatarProps {
  driver: Driver;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[12px]',
  lg: 'h-12 w-12 text-[14px]',
} as const;

export function DriverAvatar({ driver, size = 'md' }: DriverAvatarProps) {
  const displayName = getDriverDisplayName(driver);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: driver.color }}
      aria-label={displayName}
      title={displayName}
    >
      {driver.initials}
    </span>
  );
}
