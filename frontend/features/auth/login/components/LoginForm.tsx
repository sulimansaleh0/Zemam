'use client';

import Link from 'next/link';
import { Mail, LockKeyhole, ArrowLeft } from 'lucide-react';
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
    handleGoogleLogin, isGoogleLoading,
  } = useLogin();

  return (
    <>
      <div className="zamam-rise">
        <AuthHeader
          title="سجّل دخولك إلى زمام"
          subtitle="تابع أسطولك واتخذ قراراتك بثقة، من مكان واحد."
        />
      </div>

      <div className="auth-form" style={{ marginTop: '2rem' }}>
        <div className="zamam-rise zamam-delay-1">
          <GoogleButton 
            label="المتابعة باستخدام Google" 
            onSuccess={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />
        </div>
        <div className="auth-form__divider zamam-rise zamam-delay-1">أو باستخدام البريد الإلكتروني</div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {resetSuccess   && <div className="auth-form__success-banner" role="status">✓ تم تغيير كلمة المرور، سجّل دخولك الآن</div>}
          {sessionExpired && <div className="auth-form__error-banner"   role="alert">⚠ انتهت الجلسة، يرجى إعادة تسجيل الدخول</div>}
          {errors.root    && <div className="auth-form__error-banner"   role="alert">{errors.root.message}</div>}

          <div className="zamam-rise zamam-delay-2">
            <FormField
              id="login-email" label="البريد الإلكتروني" type="email"
              placeholder="name@company.com" autoComplete="email" required
              rightIcon={<Mail size={17} />}
              error={errors.email?.message} {...register('email')}
            />
          </div>

          <div className="zamam-rise zamam-delay-2">
            <FormField
              id="login-password" label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="أدخل كلمة المرور" autoComplete="current-password" required
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
          </div>

          <div className="zamam-rise zamam-delay-3 auth-form__forgot">
            <label className="auth-form__remember">
              <input type="checkbox" /> تذكرني
            </label>
            <Link href="/forgot-password" className="auth-form__link zamam-focus">نسيت كلمة المرور؟</Link>
          </div>

          <div className="zamam-rise zamam-delay-4">
            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg"
              icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}>
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </div>

          <p className="zamam-rise zamam-delay-4 auth-form__footer">
            ليس لديك حساب؟{' '}
            <Link href="/signup">أنشئ حساباً جديداً</Link>
          </p>
        </form>
      </div>
    </>
  );
}
