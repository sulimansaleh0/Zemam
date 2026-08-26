'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Edit2, Loader2 } from 'lucide-react';
import { updateTeamSchema, UpdateTeamFormValues } from '../schemas/team.schema';
import { useUpdateTeam } from '../hooks/useTeams';
import type { Team } from '../types/team.types';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function EditTeamModal({ isOpen, onClose, team }: EditTeamModalProps) {
  const updateTeamMutation = useUpdateTeam();
  const isSubmitting = updateTeamMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !team) return null;

  const onSubmit = async (values: UpdateTeamFormValues) => {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                تعديل اسم الفريق
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                تحديث الاسم التعريفي للفريق التشغيلي
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              اسم الفريق الجديد *
            </label>
            <input
              type="text"
              {...register('name')}
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
