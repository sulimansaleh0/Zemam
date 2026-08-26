'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, Loader2, Users } from 'lucide-react';
import type { Team } from '../types/team.types';
import { useDeleteTeam } from '../hooks/useTeams';

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  assignedVehiclesCount?: number;
}

export function DeleteTeamModal({
  isOpen,
  onClose,
  team,
  assignedVehiclesCount = 0,
}: DeleteTeamModalProps) {
  const deleteTeamMutation = useDeleteTeam();
  const isSubmitting = deleteTeamMutation.isPending;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !team) return null;

  const handleDelete = async () => {
    try {
      await deleteTeamMutation.mutateAsync(team._id);
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                حذف الفريق التشغيلي
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                تأكيد حذف الفريق من المنظومة
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
            هل أنت متأكد من رغبتك في حذف فريق{' '}
            <span className="font-bold text-[var(--primary)]">{team.name}</span>
            ؟
          </p>

          {assignedVehiclesCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>تنبيه: يوجد {assignedVehiclesCount} مركبة مرتبطة بهذا الفريق.</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                يُفضل إعادة تعيين المركبات إلى فريق آخر قبل حذف هذا الفريق لضمان استمرارية التشغيل.
              </p>
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
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تأكيد الحذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
