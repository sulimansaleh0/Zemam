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
      <div>
        <AuthHeader
          title="سجّل دخولك إلى زمام"
          subtitle="تابع أسطولك واتخذ قراراتك بثقة، من مكان واحد."
        />
      </div>

      <div className="w-full mt-6">
        <div>
          <GoogleButton 
            label="المتابعة باستخدام Google" 
            onSuccess={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />
        </div>

        <div className="relative flex items-center justify-center my-6 before:content-[''] before:absolute before:inset-x-0 before:h-px before:bg-border">
          <span className="relative px-3 bg-bg text-xs text-muted">
            أو باستخدام البريد الإلكتروني
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
          {resetSuccess && (
            <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold" role="status">
              ✓ تم تغيير كلمة المرور، سجّل دخولك الآن
            </div>
          )}
          {sessionExpired && (
            <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
              ⚠ انتهت الجلسة، يرجى إعادة تسجيل الدخول
            </div>
          )}
          {errors.root && (
            <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
              {errors.root.message}
            </div>
          )}

          <div>
            <FormField
              id="login-email" label="البريد الإلكتروني" type="email"
              placeholder="name@company.com" autoComplete="email" required
              rightIcon={<Mail size={17} />}
              error={errors.email?.message} {...register('email')}
            />
          </div>

          <div>
            <FormField
              id="login-password" label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="أدخل كلمة المرور" autoComplete="current-password" required
              rightIcon={<LockKeyhole size={17} />}
              leftAction={
                <button
                  type="button"
                  className="p-1 text-muted hover:text-text cursor-pointer transition-colors"
                  onClick={togglePassword}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
              error={errors.password?.message} {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between text-xs my-1">
            <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
              <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
              <span>تذكرني</span>
            </label>
            <Link href="/forgot-password" className="text-primary hover:underline font-semibold focus-visible:outline-2 focus-visible:outline-primary rounded">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="mt-2">
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              size="lg"
              icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}
            >
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
