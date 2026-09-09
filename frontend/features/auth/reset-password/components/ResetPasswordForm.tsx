'use client';

import Link from 'next/link';
import { LockKeyhole, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { EyeIcon } from '@/shared/ui/EyeIcon';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordForm() {
  const {
    register, handleSubmit, errors, isSubmitting,
    watchedPassword, showPassword, showConfirm,
    togglePassword, toggleConfirm,
  } = useResetPassword();

  return (
    <>
      <div>
        <AuthHeader
          title="كلمة مرور جديدة"
          subtitle="أنشئ كلمة مرور قوية لحماية حسابك"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-8" noValidate>
        {errors.root && (
          <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
            {errors.root.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <FormField
            id="rp-password" label="كلمة المرور الجديدة"
            type={showPassword ? 'text' : 'password'}
            placeholder="أدخل كلمة مرور قوية" autoComplete="new-password" required
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
            error={errors.newPassword?.message} {...register('newPassword')}
          />
          <PasswordStrength password={watchedPassword} />
        </div>

        <div>
          <FormField
            id="rp-confirm" label="تأكيد كلمة المرور"
            type={showConfirm ? 'text' : 'password'}
            placeholder="أعد إدخال كلمة المرور" autoComplete="new-password" required
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
            error={errors.confirmNewPassword?.message} {...register('confirmNewPassword')}
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
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
            <ArrowRight size={14} />
            <span>العودة لتسجيل الدخول</span>
          </Link>
        </p>
      </form>
    </>
  );
}
