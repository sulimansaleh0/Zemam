'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api/auth.api';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { ApiError } from '@/shared/lib/apiClient';
import { Button } from '@/shared/ui/Button';
import { OtpInput } from '@/shared/ui/OtpInput';
import { useToast } from '@/shared/ui/Toast';
import { verifyCodeSchema, type VerifyCodeFormValues } from '../schemas/verifyCode.schema';

const COUNTDOWN_SECONDS = 60;

interface VerifyCodeFormProps {
  email: string;
  token: string;
}

export function VerifyCodeForm({ email, token }: VerifyCodeFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (!email && !token) {
      router.replace('/forgot-password');
    }
  }, [email, token, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function onSubmit({ code }: VerifyCodeFormValues) {
    try {
      const res = await authApi.verifyCode({ token, code, email });
      addToast({
        type: 'success',
        title: 'تم التحقق بنجاح',
        message: 'يمكنك الآن تعيين كلمة المرور الجديدة',
      });

      const nextToken = res.token || token;
      const nextTokenParam = nextToken ? `?token=${encodeURIComponent(nextToken)}` : '';
      router.push(`/reset-password${nextTokenParam}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'الرمز غير صحيح، حاول مرة أخرى';
      setError('root', { message });
    }
  }

  async function handleResendCode() {
    if (countdown > 0 || isResending || !email) return;

    setIsResending(true);
    try {
      const res = await authApi.requestPasswordReset({ email });
      setCountdown(COUNTDOWN_SECONDS);
      addToast({
        type: 'info',
        title: 'تم إعادة الإرسال',
        message: `تم إرسال رمز جديد إلى ${email}`,
      });
      if (res.token && res.token !== token) {
        router.replace(`/verify-code?email=${encodeURIComponent(email)}&token=${encodeURIComponent(res.token)}`);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'تعذر إعادة إرسال الرمز';
      setError('root', { message });
    } finally {
      setIsResending(false);
    }
  }

  const formattedTime = `00:${countdown.toString().padStart(2, '0')}`;

  return (
    <AuthCard>
      <AuthHeader
        title="أدخل رمز التحقق"
        subtitle={
          email
            ? `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${email}`
            : 'أدخل الرمز المكون من 6 أرقام الذي أرسلناه إليك'
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="auth-form"
        noValidate
        aria-label="نموذج التحقق من الرمز"
      >
        {errors.root && (
          <div className="auth-form__error-banner" role="alert" aria-live="assertive">
            {errors.root.message}
          </div>
        )}

        <Controller
          name="code"
          control={control}
          render={({ field, fieldState }) => (
            <div className="auth-form__otp-wrapper">
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                onComplete={() => void handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                error={Boolean(fieldState.error)}
              />
              {fieldState.error && (
                <p className="auth-form__otp-error" role="alert">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
          {isSubmitting ? 'جاري التحقق...' : 'تأكيد الرمز'}
        </Button>

        <div className="auth-form__footer" style={{ marginTop: 'var(--space-2)' }}>
          {countdown > 0 ? (
            <span className="form-field__hint" style={{ fontSize: 'var(--text-sm)' }}>
              إعادة إرسال الرمز خلال <strong style={{ color: 'var(--primary)' }}>{formattedTime}</strong>
            </span>
          ) : (
            <button
              type="button"
              className="auth-form__link"
              onClick={handleResendCode}
              disabled={isResending}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isResending ? 'جاري الإرسال...' : 'لم تستلم الرمز؟ أعد الإرسال الآن'}
            </button>
          )}
        </div>

        <p className="auth-form__footer">
          <Link href="/forgot-password" className="auth-form__link">
            ← تغيير البريد الإلكتروني
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
