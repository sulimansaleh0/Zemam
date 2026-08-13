'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { EyeIcon } from '@/shared/ui/EyeIcon';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordForm({ token = '' }: { token?: string }) {
  const {
    register, handleSubmit, errors, isSubmitting,
    watchedPassword, showPassword, showConfirm,
    togglePassword, toggleConfirm,
  } = useResetPassword({ token });

  return (
    <AuthCard>
      <AuthHeader title="كلمة مرور جديدة" subtitle="أنشئ كلمة مرور قوية لحماية حسابك" />

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

        <div className="auth-form__field-group">
          <FormField
            id="rp-password" label="كلمة المرور الجديدة"
            type={showPassword ? 'text' : 'password'} placeholder="أدخل كلمة مرور قوية"
            autoComplete="new-password" required
            leftAction={
              <button type="button" className="form-field__toggle-password"
                onClick={togglePassword} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                <EyeIcon open={showPassword} />
              </button>
            }
            error={errors.newPassword?.message} {...register('newPassword')}
          />
          <PasswordStrength password={watchedPassword} />
        </div>

        <FormField
          id="rp-confirm" label="تأكيد كلمة المرور"
          type={showConfirm ? 'text' : 'password'} placeholder="أعد إدخال كلمة المرور"
          autoComplete="new-password" required
          leftAction={
            <button type="button" className="form-field__toggle-password"
              onClick={toggleConfirm} aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}>
              <EyeIcon open={showConfirm} />
            </button>
          }
          error={errors.confirmNewPassword?.message} {...register('confirmNewPassword')}
        />

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
