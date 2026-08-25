"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingService } from '../services/onboarding.service';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { onboardingSchema, type OnboardingFormValues } from '../schemas/onboarding.schema';

export function useOnboarding() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, checkSession } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: '',
    },
  });

  async function onSubmit(data: OnboardingFormValues) {
    const result = await onboardingService.setupCompany({
      companyName: data.companyName,
    });

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    await checkSession();
    addToast({
      type: 'success',
      title: 'تم إعداد الحساب بنجاح',
      message: 'مرحباً بك في منصة زمام! تم تجهيز مساحة عمل شركتك.',
    });
    router.refresh();
    router.replace('/dashboard');
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    userName: user?.name,
  };
}
