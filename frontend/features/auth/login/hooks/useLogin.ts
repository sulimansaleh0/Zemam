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

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    showPassword,
    togglePassword: () => setShowPassword((p) => !p),
    resetSuccess,
    sessionExpired,
  };
}
