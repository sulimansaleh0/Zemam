'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, UserPlus, X } from 'lucide-react';
import { createDriverSchema, type CreateDriverFormValues } from '../schemas/driver.schema';

interface DriverModalProps {
  onClose: () => void;
  onSave: (data: CreateDriverFormValues) => Promise<void>;
  isLoading: boolean;
}

export function DriverModal({ onClose, onSave, isLoading }: DriverModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: { email: '' },
  });

  // إغلاق بـ Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLoading, onClose]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onSave(data);
    } catch (error) {
      // الـ toast يُطلق في الـ mutation — هنا نضع الخطأ على الحقل
      setError('email', {
        message: error instanceof Error ? error.message : 'حدث خطأ، حاول مرة أخرى',
      });
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-driver-title"
    >
      <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-[var(--zd-line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2
                id="add-driver-title"
                className="text-[15px] font-bold text-[var(--zd-text)]"
              >
                إضافة سائق جديد
              </h2>
              <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                سيتم إنشاء حساب للسائق بكلمة مرور مؤقتة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="إغلاق"
            className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={onSubmit} noValidate>
          <div className="p-6">
            {/* Email field */}
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
                autoFocus
                autoComplete="email"
                placeholder="example@company.com"
                {...register('email')}
                disabled={isLoading}
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

            {/* Info note */}
            <div className="mt-4 rounded-xl bg-[var(--zd-surface-2)] px-4 py-3 text-[10px] leading-5 text-[var(--zd-muted)]">
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
              disabled={isLoading}
              className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] transition-colors hover:text-[var(--zd-text)] disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? 'جارٍ الإضافة...' : 'إضافة السائق'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
