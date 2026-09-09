'use client';

import Link from 'next/link';
import { Mail, LockKeyhole, UserRound, Building2, ArrowLeft } from 'lucide-react';
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
    handleGoogleSignup, isGoogleLoading,
  } = useSignup();

  return (
    <>
      <div>
        <AuthHeader
          title="أنشئ حساب زمام"
          subtitle="مساحة واحدة تجمع تفاصيل أسطولك وفريقك وعملياتك."
        />
      </div>

      <div className="w-full mt-6">
        <div>
          <GoogleButton 
            label="إنشاء حساب باستخدام Google" 
            onSuccess={handleGoogleSignup}
            isLoading={isGoogleLoading}
          />
        </div>

        <div className="relative flex items-center justify-center my-6 before:content-[''] before:absolute before:inset-x-0 before:h-px before:bg-border">
          <span className="relative px-3 bg-bg text-xs text-muted">
            أو باستخدام البريد الإلكتروني
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
          {errors.root && (
            <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
              {errors.root.message}
            </div>
          )}

          <div>
            <FormField
              id="s-name" label="الاسم الكامل" type="text"
              placeholder="مثال: خالد العتيبي" autoComplete="name" required
              rightIcon={<UserRound size={17} />}
              error={errors.name?.message} {...register('name')}
            />
          </div>

          <div>
            <FormField
              id="s-company" label="اسم الشركة / المؤسسة" type="text"
              placeholder="مثال: شركة زمام للحلول اللوجستية" autoComplete="organization" required
              rightIcon={<Building2 size={17} />}
              error={errors.companyName?.message} {...register('companyName')}
            />
          </div>

          <div>
            <FormField
              id="s-email" label="البريد الإلكتروني" type="email"
              placeholder="name@company.com" autoComplete="email" required
              rightIcon={<Mail size={17} />}
              error={errors.email?.message} {...register('email')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FormField
              id="s-password" label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="٨ أحرف على الأقل" autoComplete="new-password" required
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
            <PasswordStrength password={watchedPassword} />
          </div>

          <div>
            <FormField
              id="s-confirm" label="تأكيد كلمة المرور"
              type={showConfirm ? 'text' : 'password'}
              placeholder="أعد كتابة كلمة المرور" autoComplete="new-password" required
              rightIcon={<LockKeyhole size={17} />}
              leftAction={
                <button
                  type="button"
                  className="p-1 text-muted hover:text-text cursor-pointer transition-colors"
                  onClick={toggleConfirm}
                  aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              }
              error={errors.confirmPassword?.message} {...register('confirmPassword')}
            />
          </div>

          <div className="mt-2">
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              size="lg"
              icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}
            >
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
