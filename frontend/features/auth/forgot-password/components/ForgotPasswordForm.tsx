'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordForm() {
  const { register, handleSubmit, errors, isSubmitting } = useForgotPassword();

  return (
    <AuthCard>
      <AuthHeader title="استعادة كلمة المرور" subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق" />

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

        <FormField
          id="fp-email" label="البريد الإلكتروني" type="email"
          placeholder="example@company.com" autoComplete="email" required
          error={errors.email?.message} {...register('email')}
        />

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
