'use client';

import React from 'react';
import { AlertTriangle, Loader2, Users } from 'lucide-react';
import type { Team } from '../types/team.types';
import { useDeleteTeam } from '../hooks/useTeams';
import { Modal } from '@/shared/ui/Modal';

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  assignedVehiclesCount?: number;
  onSuccess?: () => void;
}

export function DeleteTeamModal({
  isOpen,
  onClose,
  team,
  assignedVehiclesCount = 0,
  onSuccess,
}: DeleteTeamModalProps) {
  const deleteTeamMutation = useDeleteTeam();
  const isSubmitting = deleteTeamMutation.isPending;

  if (!team) return null;

  const handleDelete = async () => {
    try {
      await deleteTeamMutation.mutateAsync(team._id);
      onClose();
      onSuccess?.();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف الفريق التشغيلي"
      description="تأكيد حذف الفريق من المنظومة"
      icon={Users}
      iconClassName="bg-rose-500/10 text-rose-500"
      maxWidth="md"
      preventClose={isSubmitting}
    >
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
    </Modal>
  );
}
