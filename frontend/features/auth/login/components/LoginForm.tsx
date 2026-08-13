'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api/auth.api';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { ApiError } from '@/shared/lib/apiClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { GoogleButton } from '@/shared/ui/GoogleButton';
import { useToast } from '@/shared/ui/Toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { setAuthUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const resetSuccess = searchParams.get('reset') === 'success';
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
    try {
      const res = await authApi.login(data);
      if (res.user) {
        setAuthUser(res.user);
      }
      addToast({
        type: 'success',
        title: 'مرحباً بعودتك!',
        message: res.message || 'تم تسجيل الدخول بنجاح',
      });
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message });
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, msg]) => {
            const message = Array.isArray(msg) ? msg.join(' - ') : msg;
            setError(field as keyof LoginFormValues, { message });
          });
        }
      } else {
        setError('root', { message: 'حدث خطأ غير متوقع في الاتصال' });
      }
    }
  }

  return (
    <AuthCard>
      <AuthHeader
        title="مرحباً بعودتك"
        subtitle="سجّل دخولك للمتابعة إلى لوحة تحكم زمام"
      />

      <div className="auth-form">
        <GoogleButton label="تسجيل الدخول بواسطة Google" />

        <div className="auth-form__divider">أو عبر البريد الإلكتروني</div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="auth-form"
          noValidate
          aria-label="نموذج تسجيل الدخول"
        >
          {resetSuccess && (
            <div className="auth-form__success-banner" role="status">
              ✓ تم تغيير كلمة المرور بنجاح، سجّل دخولك الآن
            </div>
          )}

          {sessionExpired && (
            <div className="auth-form__error-banner" role="alert">
              ⚠ انتهت الجلسة السابقة، يرجى إعادة تسجيل الدخول
            </div>
          )}

          {errors.root && (
            <div className="auth-form__error-banner" role="alert" aria-live="assertive">
              {errors.root.message}
            </div>
          )}

          <FormField
            id="login-email"
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@company.com"
            autoComplete="email"
            required
            rightIcon={<MailIcon />}
            error={errors.email?.message}
            {...register('email')}
          />

          <FormField
            id="login-password"
            label="كلمة المرور"
            type={showPassword ? 'text' : 'password'}
            placeholder="أدخل كلمة المرور"
            autoComplete="current-password"
            required
            rightIcon={<LockIcon />}
            leftAction={
              <button
                type="button"
                className="form-field__toggle-password"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                <EyeIcon open={showPassword} />
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="auth-form__forgot">
            <Link href="/forgot-password" className="auth-form__link">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>

          <p className="auth-form__footer">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="auth-form__link">
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
