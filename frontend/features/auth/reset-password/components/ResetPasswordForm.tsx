'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api/auth.api';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { ApiError } from '@/shared/lib/apiClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { useToast } from '@/shared/ui/Toast';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/resetPassword.schema';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({ token = '' }: ResetPasswordFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/forgot-password');
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const watchedPassword = watch('newPassword');

  async function onSubmit(data: ResetPasswordFormValues) {
    try {
      const res = await authApi.setNewPassword({
        token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      addToast({
        type: 'success',
        title: 'تم تغيير كلمة المرور',
        message: res.message || 'تم تحديث كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن',
      });
      router.push('/login?reset=success');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'حدث خطأ غير متوقع';
      setError('root', { message });
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="كلمة مرور جديدة" subtitle="أنشئ كلمة مرور قوية لحماية حسابك" />

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate aria-label="نموذج كلمة المرور الجديدة">
        {errors.root && (
          <div className="auth-form__error-banner" role="alert" aria-live="assertive">
            {errors.root.message}
          </div>
        )}

        <div className="auth-form__field-group">
          <FormField
            id="new-password" label="كلمة المرور الجديدة"
            type={showPassword ? 'text' : 'password'} placeholder="أدخل كلمة مرور قوية"
            autoComplete="new-password" required
            leftAction={
              <button type="button" className="form-field__toggle-password"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                <EyeIcon open={showPassword} />
              </button>
            }
            error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordStrength password={watchedPassword} />
        </div>

        <FormField
          id="confirm-new-password" label="تأكيد كلمة المرور"
          type={showConfirm ? 'text' : 'password'} placeholder="أعد إدخال كلمة المرور"
          autoComplete="new-password" required
          leftAction={
            <button type="button" className="form-field__toggle-password"
              onClick={() => setShowConfirm((p) => !p)}
              aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}>
              <EyeIcon open={showConfirm} />
            </button>
          }
          error={errors.confirmNewPassword?.message} {...register('confirmNewPassword')} />

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
        </Button>

        <p className="auth-form__footer">
          <Link href="/login" className="auth-form__link">← العودة لتسجيل الدخول</Link>
        </p>
      </form>
    </AuthCard>
  );
}
