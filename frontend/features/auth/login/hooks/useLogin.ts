import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginService } from '../services/login.service';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

export function useLogin() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { checkSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const resetSuccess   = searchParams.get('reset')   === 'success';
  const sessionExpired = searchParams.get('session') === 'expired';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    const result = await loginService.login(data);

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    await checkSession();
    addToast({ type: 'success', title: 'مرحباً بعودتك!', message: result.message });
    router.push('/dashboard');
  }

  async function handleGoogleLogin(credential: string) {
    try {
      setIsGoogleLoading(true);
      const result = await loginService.googleLogin(credential);

      if (!result.success) {
        addToast({ type: 'error', title: 'خطأ', message: result.message || 'فشل تسجيل الدخول عبر Google' });
        return;
      }

      await checkSession();
      addToast({ type: 'success', title: 'مرحباً بعودتك!', message: 'تم تسجيل الدخول بنجاح' });
      router.push('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      addToast({ type: 'error', title: 'خطأ', message: 'حدث خطأ أثناء تسجيل الدخول' });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    showPassword,
    togglePassword: () => setShowPassword((p) => !p),
    resetSuccess,
    sessionExpired,
    handleGoogleLogin,
    isGoogleLoading,
  };
}
