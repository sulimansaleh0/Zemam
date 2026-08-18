import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupService } from '../services/signup.service';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { signupSchema, type SignupFormValues } from '../schemas/signup.schema';
import type { SignupPayload } from '../types/signup.types';

export function useSignup() {
  const router       = useRouter();
  const { addToast } = useToast();
  const { checkSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  async function onSubmit(data: SignupFormValues) {
    const payload: SignupPayload = {
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      password: data.password,
    };

    const result = await signupService.signup(payload);

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    addToast({ type: 'success', title: 'تم إنشاء الحساب بنجاح', message: result.message });
    router.push('/login');
  }

  async function handleGoogleSignup(credential: string) {
    try {
      setIsGoogleLoading(true);
      const result = await signupService.googleSignup(credential);

      if (!result.success) {
        addToast({ type: 'error', title: 'خطأ', message: result.message || 'فشل إنشاء الحساب عبر Google' });
        return;
      }

      await checkSession();
      addToast({ type: 'success', title: 'تم إنشاء الحساب بنجاح', message: 'تم تسجيل دخولك تلقائياً' });
      router.push('/login');
    } catch (err) {
      console.error('Google signup error:', err);
      addToast({ type: 'error', title: 'خطأ', message: 'حدث خطأ أثناء إنشاء الحساب' });
    } finally {
      setIsGoogleLoading(false);
    }
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
    toggleConfirm:  () => setShowConfirm((p) => !p),
    handleGoogleSignup,
    isGoogleLoading,
  };
}
