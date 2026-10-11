'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

export type IconComponent = React.ComponentType<{ className?: string }>;

export interface PageHeaderProps {
  title: string;
  count?: number;
  description?: string;
  icon?: IconComponent;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actionLabel?: string;
  actionIcon?: IconComponent;
  onAction?: () => void;
  extraActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  count,
  description,
  icon: Icon,
  onRefresh,
  isRefreshing = false,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
  extraActions,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      dir="rtl"
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--zd-text)] flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-[var(--zd-blue)] shrink-0" />}
          <span>
            {title}
            {count !== undefined && <span className="opacity-80 font-mono"> ({count})</span>}
          </span>
        </h1>
        {description && (
          <p className="mt-1 text-xs text-[var(--zd-muted)] leading-relaxed">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {extraActions}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="تحديث البيانات"
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:text-[var(--zd-text)] hover:border-[var(--zd-line-hover)] transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[var(--zd-blue)]' : ''}`} />
          </button>
        )}

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] hover:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-98 cursor-pointer shrink-0"
          >
            <ActionIcon className="h-4 w-4" />
            <span>{actionLabel}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
