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
      <div className="zamam-rise">
        <AuthHeader
          title="استعادة كلمة المرور"
          subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق"
        />
      </div>

      <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '2rem' }} noValidate>
        {errors.root && <div className="auth-form__error-banner" role="alert">{errors.root.message}</div>}

        <div className="zamam-rise zamam-delay-2">
          <FormField
            id="fp-email" label="البريد الإلكتروني" type="email"
            placeholder="name@company.com" autoComplete="email" required
            rightIcon={<Mail size={17} />}
            error={errors.email?.message} {...register('email')}
          />
        </div>

        <div className="zamam-rise zamam-delay-3">
          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg"
            icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}>
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </Button>
        </div>

        <p className="zamam-rise zamam-delay-4 auth-form__footer">
          <Link href="/login">
            <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.25rem' }} />
            العودة لتسجيل الدخول
          </Link>
        </p>
      </form>
    </>
  );
}
