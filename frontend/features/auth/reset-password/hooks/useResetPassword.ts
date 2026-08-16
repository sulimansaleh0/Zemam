import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordService } from '../services/resetPassword.service';
import { useToast } from '@/shared/ui/Toast';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/resetPassword.schema';

interface UseResetPasswordProps {
  token: string;
}

export function useResetPassword({ token }: UseResetPasswordProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // إعادة التوجيه إذا لم يكن هناك token
  useEffect(() => {
    if (!token) router.replace('/forgot-password');
  }, [token, router]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const watchedPassword = watch('newPassword');

  async function onSubmit(data: ResetPasswordFormValues) {
    const result = await resetPasswordService.resetPassword(
      token,
      data.newPassword,
    );

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    addToast({ type: 'success', title: 'تم تغيير كلمة المرور', message: result.message });
    router.push('/login?reset=success');
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    watchedPassword,
    showPassword,
    showConfirm,
    togglePassword: () => setShowPassword((p) => !p),
    toggleConfirm: () => setShowConfirm((p) => !p),
  };
}
