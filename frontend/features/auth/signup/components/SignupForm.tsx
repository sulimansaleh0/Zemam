'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { GoogleButton } from '@/shared/ui/GoogleButton';
import { EyeIcon } from '@/shared/ui/EyeIcon';
import { useSignup } from '../hooks/useSignup';

export function SignupForm() {
  const {
    register, handleSubmit, errors, isSubmitting,
    watchedPassword,
    showPassword, showConfirm, togglePassword, toggleConfirm,
  } = useSignup();

  return (
    <AuthCard>
      <AuthHeader title="إنشاء حساب جديد" subtitle="أنشئ حساب شركتك وابدأ في إدارة أسطولك" />

      <div className="auth-form">
        <GoogleButton label="إنشاء حساب بواسطة Google" />
        <div className="auth-form__divider">أو إدخال التفاصيل يدويًا</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

          <FormField id="s-name" label="الاسم الكامل" type="text" placeholder="محمد العلي"
            autoComplete="name" required error={errors.name?.message} {...register('name')} />

          <FormField id="s-email" label="البريد الإلكتروني" type="email"
            placeholder="example@company.com" autoComplete="email" required
            error={errors.email?.message} {...register('email')} />

          <div className="auth-form__field-group">
            <FormField id="s-password" label="كلمة المرور"
              type={showPassword ? 'text' : 'password'} placeholder="أدخل كلمة مرور قوية"
              autoComplete="new-password" required
              leftAction={
                <button type="button" className="form-field__toggle-password"
                  onClick={togglePassword} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                  <EyeIcon open={showPassword} />
                </button>
              }
              error={errors.password?.message} {...register('password')} />
            <PasswordStrength password={watchedPassword} />
          </div>

          <FormField id="s-confirm" label="تأكيد كلمة المرور"
            type={showConfirm ? 'text' : 'password'} placeholder="أعد إدخال كلمة المرور"
            autoComplete="new-password" required
            leftAction={
              <button type="button" className="form-field__toggle-password"
                onClick={toggleConfirm} aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}>
                <EyeIcon open={showConfirm} />
              </button>
            }
            error={errors.confirmPassword?.message} {...register('confirmPassword')} />

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>

          <p className="auth-form__footer">
            لديك حساب؟{' '}
            <Link href="/login" className="auth-form__link">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
