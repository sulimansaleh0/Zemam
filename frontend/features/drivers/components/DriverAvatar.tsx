'use client';

import { Driver } from '../types/driver.types';

interface DriverAvatarProps {
  driver: Driver;
  size?: string;
  className?: string;
}

export function DriverAvatar({
  driver,
  size = 'h-10 w-10',
  className = '',
}: DriverAvatarProps) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-[13px] text-[11px] font-bold text-[#07172b] shadow-xs select-none ${className}`}
      style={{ background: driver.color || '#3d7bff' }}
      aria-hidden="true"
    >
      {driver.initials}
    </span>
  );
}
