'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus, Mail, Users, Key, Loader2 } from 'lucide-react';
import {
  createManagerSchema,
  CreateManagerFormValues,
} from '../schemas/manager.schema';
import { useCreateManager } from '../hooks/useManagers';
import type { Team } from '@/features/teams/types/team.types';

interface CreateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  initialTeamId?: string;
}

export function CreateManagerModal({
  isOpen,
  onClose,
  teams,
  initialTeamId,
}: CreateManagerModalProps) {
  const createManagerMutation = useCreateManager();
  const isSubmitting = createManagerMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateManagerFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      teamId: initialTeamId || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        phone: '',
        email: '',
        teamId: initialTeamId || '',
      });
    }
  }, [isOpen, initialTeamId, reset]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const isSubmittingRef = React.useRef(false);

  if (!isOpen) return null;

  const onSubmit = async (values: CreateManagerFormValues) => {
    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    try {
      await createManagerMutation.mutateAsync({
        email: values.email.trim(),
        name: values.name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        teamId: values.teamId,
      });
      onClose();
    } catch {
      // Handled by Toast in hook
    } finally {
      isSubmittingRef.current = false;
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
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                إضافة مدير أسطول جديد
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                إنشاء حساب مدير أسطول (يمكن تعيينه على فريق لاحقاً)
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
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] block">
              اسم مدير الأسطول (اختياري)
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="محمد أحمد"
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--muted)]" />
              البريد الإلكتروني لمدير الأسطول *
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="fleet.manager@example.com"
              dir="ltr"
              className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors text-right ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] block">
              رقم الهاتف (اختياري)
            </label>
            <input
              type="tel"
              dir="ltr"
              {...register('phone')}
              placeholder="05XXXXXXXX"
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Team Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
              الفريق المسؤول عنه (اختياري)
            </label>
            <select
              {...register('teamId')}
              className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                errors.teamId
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
              }`}
            >
              <option value="">-- بدون فريق حالياً (تعيين لاحقاً) --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.teamId && (
              <p className="text-xs text-rose-500 mt-1">{errors.teamId.message}</p>
            )}
          </div>

          {/* Password Notice */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span>كلمة المرور الافتراضية للحساب:</span>
            </div>
            <p className="font-mono text-sm font-bold tracking-wider">123456789</p>
            <p className="text-[11px] text-[var(--muted)] pt-0.5 leading-relaxed">
              سيتمكن المدير من تسجيل الدخول ببريده وكلمة المرور الافتراضية هذه، ويمكنه تغييرها لاحقاً من حسابه.
            </p>
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
              <span>إضافة المدير</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
