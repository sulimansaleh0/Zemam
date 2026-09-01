'use client';

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="تأكيد حذف السائق"
      icon={AlertTriangle}
      iconClassName="bg-[var(--zd-red)]/15 text-[var(--zd-red)]"
      maxWidth="max-w-[440px]"
      preventClose={isLoading}
      aria-labelledby="delete-modal-title"
    >
      <div className="p-6">
        <p className="text-[12px] leading-6 text-[var(--zd-muted)]">
          هل أنت متأكد من رغبتك في حذف سجل السائق{' '}
          <strong className="font-semibold text-[var(--zd-text)]">"{displayName}"</strong>؟
          <br />
          سيتم تعطيل الحساب وإزالته من لوحة السائقين. لا يمكن التراجع عن هذا الإجراء.
        </p>

        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--zd-line)] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] transition-colors hover:text-[var(--zd-text)] disabled:opacity-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="zd-focus flex items-center gap-1.5 rounded-xl bg-[var(--zd-red)] px-4 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
    </Modal>
  );
}
