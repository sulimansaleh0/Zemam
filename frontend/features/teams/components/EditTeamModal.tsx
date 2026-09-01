'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Loader2 } from 'lucide-react';
import { updateTeamSchema, UpdateTeamFormValues } from '../schemas/team.schema';
import { useUpdateTeam } from '../hooks/useTeams';
import type { Team } from '../types/team.types';
import { Modal } from '@/shared/ui/Modal';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function EditTeamModal({ isOpen, onClose, team }: EditTeamModalProps) {
  const updateTeamMutation = useUpdateTeam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeamFormValues>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team?.name || '',
    },
  });

  useEffect(() => {
    if (isOpen && team) {
      reset({ name: team.name });
    }
  }, [isOpen, team, reset]);

  if (!team) return null;

  const isPending = updateTeamMutation.isPending || isSubmitting;

  const onSubmit = async (values: UpdateTeamFormValues) => {
    if (isPending) return;
    try {
      await updateTeamMutation.mutateAsync({
        teamId: team._id,
        payload: { name: values.name.trim() },
      });
      onClose();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل اسم الفريق"
      description="تحديث الاسم التعريفي للفريق التشغيلي"
      icon={Edit2}
      iconClassName="bg-amber-500/10 text-amber-600"
      maxWidth="md"
      preventClose={isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)]">
            اسم الفريق الجديد *
          </label>
          <input
            type="text"
            {...register('name')}
            disabled={isPending}
            placeholder="مثال: فريق الرياض..."
            className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors ${
              errors.name
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
