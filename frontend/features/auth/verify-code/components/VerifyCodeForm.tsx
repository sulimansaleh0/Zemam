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
}

export function VerifyCodeForm({ email }: Props) {
  const {
    control, handleSubmit, errors, isSubmitting,
    countdown, formattedCountdown, isResending, resend,
  } = useVerifyCode({ email });

  return (
    <>
      <div>
        <AuthHeader
          title="أدخل رمز التحقق"
          subtitle={email ? `أرسلنا 6 أرقام إلى ${email}` : 'أدخل الرمز المكون من 6 أرقام'}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-8" noValidate>
        {errors.root && (
          <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
            {errors.root.message}
          </div>
        )}

        <div>
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <div className="w-full flex flex-col items-center">
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={() => handleSubmit()}
                  disabled={isSubmitting}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error && (
                  <p className="text-xs text-danger font-medium mt-1 text-center" role="alert">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
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
            {isSubmitting ? 'جاري التحقق...' : 'تأكيد الرمز'}
          </Button>
        </div>

        <div className="text-center text-xs text-muted mt-2">
          {countdown > 0 ? (
            <span>
              إعادة الإرسال خلال <strong className="text-primary">{formattedCountdown}</strong>
            </span>
          ) : (
            <button
              type="button"
              className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
              onClick={resend}
              disabled={isResending}
            >
              {isResending ? 'جاري الإرسال...' : 'لم تستلم الرمز؟ أعد الإرسال'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-2">
          <Link href="/forgot-password" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
            <ArrowRight size={14} />
            <span>تغيير البريد الإلكتروني</span>
          </Link>
        </p>
      </form>
    </>
  );
}
