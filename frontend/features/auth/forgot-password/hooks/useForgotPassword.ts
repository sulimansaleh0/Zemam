import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordService } from '../services/forgotPassword.service';
import { useToast } from '@/shared/ui/Toast';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/forgotPassword.schema';

export function useForgotPassword() {
  const router       = useRouter();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit({ email }: ForgotPasswordFormValues) {
    const result = await forgotPasswordService.requestPasswordReset(email);

    if (!result.success) {
      setError('root', { message: result.message });
      return;
    }

    addToast({ type: 'info', title: 'تم إرسال رمز التحقق', message: result.message });
    router.push(`/verify-code?email=${encodeURIComponent(email)}`);
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
}
