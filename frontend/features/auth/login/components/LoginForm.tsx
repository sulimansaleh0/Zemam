'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { GoogleButton } from '@/shared/ui/GoogleButton';
import { EyeIcon } from '@/shared/ui/EyeIcon';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const {
    register, handleSubmit, errors, isSubmitting,
    showPassword, togglePassword,
    resetSuccess, sessionExpired,
  } = useLogin();

  return (
    <AuthCard>
      <AuthHeader title="مرحباً بعودتك" subtitle="سجّل دخولك للمتابعة إلى لوحة تحكم زمام" />

      <div className="auth-form">
        <GoogleButton label="تسجيل الدخول بواسطة Google" />
        <div className="auth-form__divider">أو عبر البريد الإلكتروني</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {resetSuccess   && <div className="auth-form__success-banner" role="status">✓ تم تغيير كلمة المرور، سجّل دخولك الآن</div>}
          {sessionExpired && <div className="auth-form__error-banner"   role="alert">⚠ انتهت الجلسة، يرجى إعادة تسجيل الدخول</div>}
          {errors.root    && <div className="auth-form__error-banner"   role="alert">{errors.root.message}</div>}

          <FormField
            id="login-email" label="البريد الإلكتروني" type="email"
            placeholder="example@company.com" autoComplete="email" required
            error={errors.email?.message} {...register('email')}
          />

          <FormField
            id="login-password" label="كلمة المرور"
            type={showPassword ? 'text' : 'password'}
            placeholder="أدخل كلمة المرور" autoComplete="current-password" required
            leftAction={
              <button type="button" className="form-field__toggle-password"
                onClick={togglePassword}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                <EyeIcon open={showPassword} />
              </button>
            }
            error={errors.password?.message} {...register('password')}
          />

          <div className="auth-form__forgot">
            <Link href="/forgot-password" className="auth-form__link">نسيت كلمة المرور؟</Link>
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>

          <p className="auth-form__footer">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="auth-form__link">إنشاء حساب جديد</Link>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
