'use client';

import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';
import { useVerifyCode } from '../hooks/useVerifyCode';

interface Props {
  email: string;
  token: string;
}

export function VerifyCodeForm({ email, token }: Props) {
  const {
    control, handleSubmit, errors, isSubmitting,
    countdown, formattedCountdown, isResending, resend,
  } = useVerifyCode({ email, token });

  return (
    <>
      <div className="zamam-rise">
        <AuthHeader
          title="أدخل رمز التحقق"
          subtitle={email ? `أرسلنا 6 أرقام إلى ${email}` : 'أدخل الرمز المكون من 6 أرقام'}
        />
      </div>

      <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '2rem' }} noValidate>
        {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

        <div className="zamam-rise zamam-delay-2">
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <div className="auth-form__otp-wrapper">
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={() => handleSubmit()}
                  disabled={isSubmitting}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error && (
                  <p className="auth-form__otp-error" role="alert">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="zamam-rise zamam-delay-3">
          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg"
            icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}>
            {isSubmitting ? 'جاري التحقق...' : 'تأكيد الرمز'}
          </Button>
        </div>

        <div className="zamam-rise zamam-delay-4 auth-form__footer">
          {countdown > 0 ? (
            <span className="form-field__hint">
              إعادة الإرسال خلال <strong style={{ color: '#6f9bff' }}>{formattedCountdown}</strong>
            </span>
          ) : (
            <button
              type="button" className="auth-form__link zamam-focus"
              onClick={resend} disabled={isResending}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {isResending ? 'جاري الإرسال...' : 'لم تستلم الرمز؟ أعد الإرسال'}
            </button>
          )}
        </div>

        <p className="zamam-rise zamam-delay-4 auth-form__footer">
          <Link href="/forgot-password">
            <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.25rem' }} />
            تغيير البريد الإلكتروني
          </Link>
        </p>
      </form>
    </>
  );
}
