'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api/auth.api';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { ApiError } from '@/shared/lib/apiClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { useToast } from '@/shared/ui/Toast';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/forgotPassword.schema';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit({ email }: ForgotPasswordFormValues) {
    try {
      const res = await authApi.requestPasswordReset({ email });
      addToast({
        type: 'info',
        title: 'تم إرسال رمز التحقق',
        message: res.message || `تم إرسال الرمز إلى ${email}`,
      });

      const tokenParam = res.token ? `&token=${encodeURIComponent(res.token)}` : '';
      router.push(`/verify-code?email=${encodeURIComponent(email)}${tokenParam}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'حدث خطأ غير متوقع';
      setError('root', { message });
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="استعادة كلمة المرور" subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق" />

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate aria-label="نموذج استعادة كلمة المرور">
        {errors.root && (
          <div className="auth-form__error-banner" role="alert" aria-live="assertive">
            {errors.root.message}
          </div>
        )}

        <FormField id="forgot-email" label="البريد الإلكتروني" type="email"
          placeholder="example@company.com" autoComplete="email" required
          error={errors.email?.message} {...register('email')} />

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
        </Button>

        <p className="auth-form__footer">
          <Link href="/login" className="auth-form__link">← العودة لتسجيل الدخول</Link>
        </p>
      </form>
    </AuthCard>
  );
}
