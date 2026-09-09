'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordForm() {
  const { register, handleSubmit, errors, isSubmitting } = useForgotPassword();

  return (
    <>
      <div>
        <AuthHeader
          title="استعادة كلمة المرور"
          subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-8" noValidate>
        {errors.root && (
          <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/30 text-danger text-xs font-semibold" role="alert">
            {errors.root.message}
          </div>
        )}

        <div>
          <FormField
            id="fp-email" label="البريد الإلكتروني" type="email"
            placeholder="name@company.com" autoComplete="email" required
            rightIcon={<Mail size={17} />}
            error={errors.email?.message} {...register('email')}
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
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
            <ArrowRight size={14} />
            <span>العودة لتسجيل الدخول</span>
          </Link>
        </p>
      </form>
    </>
  );
}
