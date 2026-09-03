'use client';

import React from 'react';
import { Loader2, UserX } from 'lucide-react';
import type { FleetManager } from '../types/manager.types';
import { useDeleteManager } from '../hooks/useManagers';
import { Modal } from '@/shared/ui/Modal';

interface DeleteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: FleetManager | null;
  teamName?: string;
}

export function DeleteManagerModal({
  isOpen,
  onClose,
  manager,
  teamName,
}: DeleteManagerModalProps) {
  const deleteManagerMutation = useDeleteManager();
  const isSubmitting = deleteManagerMutation.isPending;

  if (!manager) return null;

  const handleDelete = async () => {
    try {
      await deleteManagerMutation.mutateAsync(manager._id);
      onClose();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعطيل حساب مدير الأسطول"
      description="تأكيد إيقاف الصلاحيات الإدارية"
      icon={UserX}
      iconClassName="bg-rose-500/10 text-rose-500"
      maxWidth="md"
      preventClose={isSubmitting}
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">
          هل أنت متأكد من رغبتك في تعطيل حساب مدير الأسطول{' '}
          <span className="font-bold text-[var(--primary)]" dir="ltr">
            {manager.email}
          </span>
          ؟
        </p>

        {teamName && (
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted)] space-y-1">
            <span className="font-semibold text-[var(--text)] block">
              الفريق المرتبط به:
            </span>
            <span>
              سيتم فك ارتباط المدير بالفريق (
              <strong className="text-[var(--text)]">{teamName}</strong>) وإلغاء صلاحيات إدارته للأسطول.
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تأكيد التعطيل</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
