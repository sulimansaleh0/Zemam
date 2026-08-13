import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupService } from '../services/signup.service';
import { useToast } from '@/shared/ui/Toast';
import { signupSchema, type SignupFormValues } from '../schemas/signup.schema';
import type { SignupPayload } from '../types/signup.types';

export function useSignup() {
  const router       = useRouter();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '', email: '', password: '', confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  async function onSubmit(data: SignupFormValues) {
    const payload: SignupPayload = {
      name: data.name,
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
  };
}
