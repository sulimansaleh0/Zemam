'use client';

import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { getDriverDisplayName } from '../utils/driverHelpers';

interface DriverDeleteModalProps {
  driver: Driver;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DriverDeleteModal({
  driver,
  onClose,
  onConfirm,
  isLoading,
}: DriverDeleteModalProps) {
  const displayName = getDriverDisplayName(driver);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-[440px] rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-6 shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--zd-red)]/15 text-[var(--zd-red)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="إلغاء"
            className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="mt-4">
          <h3
            id="delete-modal-title"
            className="text-[16px] font-bold text-[var(--zd-text)]"
          >
            تأكيد حذف السائق
          </h3>
          <p className="mt-2 text-[12px] leading-6 text-[var(--zd-muted)]">
            هل أنت متأكد من رغبتك في حذف سجل السائق{' '}
            <strong className="font-semibold text-[var(--zd-text)]">"{displayName}"</strong>؟
            <br />
            سيتم تعطيل الحساب وإزالته من لوحة السائقين. لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--zd-line)] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] transition-colors hover:text-[var(--zd-text)] disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="zd-focus flex items-center gap-1.5 rounded-xl bg-[var(--zd-red)] px-4 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isLoading ? 'جارٍ الحذف...' : 'نعم، احذف السائق'}
          </button>
        </div>
      </div>
    </div>
  );
}
