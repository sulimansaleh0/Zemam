'use client';

import { DriverStatus } from '../types/driver.types';

interface StatusPillProps {
  status: DriverStatus;
  className?: string;
}

/**
 * StatusPill — يستخدم CSS classes مُعرّفة في drivers.css
 * تدعم الثيمين (Dark / Light) عبر data-theme attribute.
 */
export function StatusPill({ status, className = '' }: StatusPillProps) {
  const classMap: Record<DriverStatus, { pill: string; dot: string }> = {
    نشط: {
      pill: 'zd-status-active',
      dot:  'zd-status-active-dot',
    },
    'في الصيانة': {
      pill: 'zd-status-maintenance',
      dot:  'zd-status-maintenance-dot',
    },
    'في إجازة': {
      pill: 'zd-status-leave',
      dot:  'zd-status-leave-dot',
    },
    'غير نشط': {
      pill: 'zd-status-inactive',
      dot:  'zd-status-inactive-dot',
    },
  };

  const current = classMap[status] ?? classMap['نشط'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${current.pill} ${className}`}
    >
      <i className={`h-1.5 w-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
