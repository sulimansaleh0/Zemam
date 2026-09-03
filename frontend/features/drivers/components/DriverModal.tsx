'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, UserPlus, Users } from 'lucide-react';
import { createDriverSchema, type CreateDriverFormValues } from '../schemas/driver.schema';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getDriverTeamId, getDriverTeamName } from '../utils/driverHelpers';
import { Modal } from '@/shared/ui/Modal';

interface DriverModalProps {
  onClose: () => void;
  onSave: (data: CreateDriverFormValues) => Promise<void>;
  isLoading: boolean;
}

export function DriverModal({ onClose, onSave, isLoading }: DriverModalProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';
  const { data: teamsList = [], isLoading: isLoadingTeams } = useTeams();

  const userTeamId = getDriverTeamId(user?.teamId);
  const userTeamName =
    getDriverTeamName(user?.teamId, teamsList) || 'فريقك التشغيلي';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      teamId: isFleetManager && userTeamId ? userTeamId : '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isLoading || isSubmitting) return;
    try {
      await onSave({
        email: data.email.trim(),
        name: data.name?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        teamId: isFleetManager && userTeamId ? userTeamId : (data.teamId || undefined),
      });
    } catch (error) {
      setError('email', {
        message: error instanceof Error ? error.message : 'حدث خطأ، حاول مرة أخرى',
      });
    }
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="إضافة سائق جديد"
      description="سيتم إنشاء حساب للسائق بكلمة مرور مؤقتة"
      icon={UserPlus}
      iconClassName="bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]"
      maxWidth="max-w-[460px]"
      preventClose={isLoading || isSubmitting}
      aria-labelledby="add-driver-title"
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="p-6 space-y-4">
          {/* Name field */}
          <div>
            <label
              htmlFor="driver-name"
              className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              اسم السائق (اختياري)
            </label>
            <input
              id="driver-name"
              type="text"
              placeholder="أحمد محمد"
              {...register('name')}
              disabled={isLoading || isSubmitting}
              className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
            />
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="driver-email"
              className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              البريد الإلكتروني <span className="text-[var(--zd-red)]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)]" />
              <input
                id="driver-email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="driver@company.com"
                {...register('email')}
                disabled={isLoading || isSubmitting}
                className={`zd-focus h-11 w-full rounded-xl border bg-[var(--zd-input-bg)] pr-10 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors disabled:opacity-60 ${
                  errors.email
                    ? 'border-[var(--zd-red)] focus:border-[var(--zd-red)]'
                    : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                }`}
              />
            </div>
            {errors.email && (
              <p role="alert" className="mt-1.5 text-[10px] font-medium text-[var(--zd-red)]">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label
              htmlFor="driver-phone"
              className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              رقم الهاتف (اختياري)
            </label>
            <input
              id="driver-phone"
              type="tel"
              dir="ltr"
              placeholder="05XXXXXXXX"
              {...register('phone')}
              disabled={isLoading || isSubmitting}
              className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
            />
          </div>

          {/* Team field */}
          <div>
            <label
              htmlFor="driver-team"
              className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              الفريق التشغيلي {isFleetManager ? '(فريقك)' : '(اختياري)'}
            </label>
            <div className="relative">
              <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)] pointer-events-none" />
              {isFleetManager ? (
                <input
                  id="driver-team"
                  type="text"
                  readOnly
                  value={userTeamName}
                  className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] pr-10 pl-3 text-[12px] font-semibold text-[var(--zd-text)] outline-none cursor-not-allowed opacity-90"
                />
              ) : (
                <select
                  id="driver-team"
                  {...register('teamId')}
                  disabled={isLoading || isSubmitting || isLoadingTeams}
                  className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-10 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors cursor-pointer"
                >
                  <option value="">بدون فريق حالياً (تعيين لاحقاً)</option>
                  {teamsList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Info note */}
          <div className="rounded-xl bg-[var(--zd-surface-2)] px-4 py-3 text-[10px] leading-5 text-[var(--zd-muted)]">
            <b className="text-[var(--zd-text)]">ملاحظة:</b> سيُنشأ الحساب بكلمة المرور الافتراضية{' '}
            <code className="rounded bg-[var(--zd-line)] px-1 py-0.5 font-mono">123456789</code>.
            يجب على السائق تغييرها عند أول دخول.
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-2 border-t border-[var(--zd-line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] transition-colors hover:text-[var(--zd-text)] disabled:opacity-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {(isLoading || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isLoading || isSubmitting ? 'جارٍ الإضافة...' : 'إضافة السائق'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
