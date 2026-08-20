'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Driver } from '../types/driver.types';

interface DriverDeleteModalProps {
  driver: Driver | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DriverDeleteModal({
  driver,
  onClose,
  onConfirm,
}: DriverDeleteModalProps) {
  if (!driver) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-[440px] rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-6 shadow-2xl transition-all">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--zd-red)]/15 text-[var(--zd-red)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            aria-label="إلغاء"
            className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <h3
            id="delete-modal-title"
            className="text-[16px] font-bold text-[var(--zd-text)]"
          >
            تأكيد حذف السائق
          </h3>
          <p className="mt-2 text-[12px] leading-6 text-[var(--zd-muted)]">
            هل أنت متأكد من رغبتك في حذف سجل السائق{' '}
            <strong className="text-[var(--zd-text)] font-semibold">
              &quot;{driver.name}&quot;
            </strong>{' '}
            (رخصة {driver.license})؟
            <br />
            هذا الإجراء سيؤدي لإزالة سجله من لوحة السائقين.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--zd-line)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="zd-focus flex items-center gap-1.5 rounded-xl bg-[var(--zd-red)] px-4 py-2 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            نعم، احذف السجل
          </button>
        </div>
      </div>
    </div>
  );
}
