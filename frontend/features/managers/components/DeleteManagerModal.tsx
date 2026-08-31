'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, Loader2, UserX } from 'lucide-react';
import type { FleetManager } from '../types/manager.types';
import { useDeleteManager } from '../hooks/useManagers';

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

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !manager) return null;

  const handleDelete = async () => {
    try {
      await deleteManagerMutation.mutateAsync(manager._id);
      onClose();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                تعطيل حساب مدير الأسطول
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                تأكيد إيقاف الصلاحيات الإدارية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="إغلاق النافذة"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
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
      </div>
    </div>
  );
}
