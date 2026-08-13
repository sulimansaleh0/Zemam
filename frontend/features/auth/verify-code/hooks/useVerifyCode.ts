import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyCodeService } from '../services/verifyCode.service';
import { forgotPasswordService } from '@/features/auth/forgot-password/services/forgotPassword.service';
import { useToast } from '@/shared/ui/Toast';
import { verifyCodeSchema, type VerifyCodeFormValues } from '../schemas/verifyCode.schema';

const RESEND_COUNTDOWN = 60;

interface UseVerifyCodeProps {
  email: string;
  token: string;
}

export function useVerifyCode({ email, token }: UseVerifyCodeProps) {
  const router       = useRouter();
  const { addToast } = useToast();
  const [countdown,   setCountdown]  = useState(RESEND_COUNTDOWN);
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

  // إعادة التوجيه إذا لم تكن هناك بيانات
  useEffect(() => {
    if (!email && !token) router.replace('/forgot-password');
  }, [email, token, router]);

  // عداد إعادة الإرسال
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function onSubmit({ code }: VerifyCodeFormValues) {
    const result = await verifyCodeService.verifyCode(token, code, email);

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    addToast({ type: 'success', title: 'تم التحقق بنجاح', message: result.message });
    const nextToken = result.data.token || token;
    router.push(`/reset-password?token=${encodeURIComponent(nextToken)}`);
  }

  async function resend() {
    if (countdown > 0 || isResending) return;
    setIsResending(true);

    const result = await forgotPasswordService.requestPasswordReset(email);
    setIsResending(false);

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    setCountdown(RESEND_COUNTDOWN);
    addToast({ type: 'info', title: 'تم إعادة الإرسال', message: result.message });

    if (result.data.token && result.data.token !== token) {
      router.replace(
        `/verify-code?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.data.token)}`,
      );
    }
  }

  const formattedCountdown = `00:${countdown.toString().padStart(2, '0')}`;

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    countdown,
    formattedCountdown,
    isResending,
    resend,
    email,
  };
}
