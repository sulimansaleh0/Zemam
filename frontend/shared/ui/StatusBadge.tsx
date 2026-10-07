'use client';

import React from 'react';

export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantMap: Record<StatusBadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  danger: {
    container: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dot: 'bg-rose-500',
  },
  warning: {
    container: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  info: {
    container: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dot: 'bg-blue-500',
  },
  neutral: {
    container: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]',
    dot: 'bg-[var(--muted)]',
  },
};

export function StatusBadge({
  label,
  variant = 'neutral',
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  const styles = variantMap[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles.container} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
}
