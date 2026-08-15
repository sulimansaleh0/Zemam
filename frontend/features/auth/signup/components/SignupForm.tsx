'use client';

import Link from 'next/link';
import { Mail, LockKeyhole, UserRound, ArrowLeft } from 'lucide-react';
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
    <>
      <div className="zamam-rise">
        <AuthHeader
          title="أنشئ حساب زمام"
          subtitle="مساحة واحدة تجمع تفاصيل أسطولك وفريقك وعملياتك."
        />
      </div>

      <div className="auth-form" style={{ marginTop: '1.75rem' }}>
        <div className="zamam-rise zamam-delay-1">
          <GoogleButton label="إنشاء حساب باستخدام Google" />
        </div>
        <div className="auth-form__divider zamam-rise zamam-delay-1">أو باستخدام البريد الإلكتروني</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

          <div className="zamam-rise zamam-delay-2">
            <FormField
              id="s-name" label="الاسم الكامل" type="text"
              placeholder="مثال: خالد العتيبي" autoComplete="name" required
              rightIcon={<UserRound size={17} />}
              error={errors.name?.message} {...register('name')}
            />
          </div>

          <div className="zamam-rise zamam-delay-2">
            <FormField
              id="s-email" label="البريد الإلكتروني" type="email"
              placeholder="name@company.com" autoComplete="email" required
              rightIcon={<Mail size={17} />}
              error={errors.email?.message} {...register('email')}
            />
          </div>

          <div className="zamam-rise zamam-delay-3 auth-form__field-group">
            <FormField
              id="s-password" label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="٨ أحرف على الأقل" autoComplete="new-password" required
              rightIcon={<LockKeyhole size={17} />}
              leftAction={
                <button type="button" className="form-field__toggle-password"
                  onClick={togglePassword}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                  <EyeIcon open={showPassword} />
                </button>
              }
              error={errors.password?.message} {...register('password')}
            />
            <PasswordStrength password={watchedPassword} />
          </div>

          <div className="zamam-rise zamam-delay-3">
            <FormField
              id="s-confirm" label="تأكيد كلمة المرور"
              type={showConfirm ? 'text' : 'password'}
              placeholder="أعد كتابة كلمة المرور" autoComplete="new-password" required
              rightIcon={<LockKeyhole size={17} />}
              leftAction={
                <button type="button" className="form-field__toggle-password"
                  onClick={toggleConfirm}
                  aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}>
                  <EyeIcon open={showConfirm} />
                </button>
              }
              error={errors.confirmPassword?.message} {...register('confirmPassword')}
            />
          </div>

          <div className="zamam-rise zamam-delay-4">
            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg"
              icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}>
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </div>

          <p className="zamam-rise zamam-delay-4 auth-form__footer">
            لديك حساب بالفعل؟{' '}
            <Link href="/login">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </>
  );
}
