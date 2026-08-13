'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/features/auth/api/auth.api';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { ApiError } from '@/shared/lib/apiClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { GoogleButton } from '@/shared/ui/GoogleButton';
import { useToast } from '@/shared/ui/Toast';
import { signupSchema, type SignupFormValues } from '../schemas/signup.schema';

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

export function SignupForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // استخدام useState عادية بدلاً من useImmer
  const [addressDraft, setAddressDraft] = useState({
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    streetDetails: '',
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      address: {
        country: 'المملكة العربية السعودية',
        city: 'الرياض',
        streetDetails: '',
      },
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  const handleAddressChange = (field: keyof typeof addressDraft, value: string) => {
    setAddressDraft((prev) => ({ ...prev, [field]: value }));
    setValue(`address.${field}`, value, { shouldValidate: true });
  };

  async function onSubmit(data: SignupFormValues) {
    try {
      const res = await authApi.signup(data);
      addToast({
        type: 'success',
        title: 'تم إنشاء الحساب بنجاح',
        message: res.message || 'يمكنك الآن تسجيل الدخول بحسابك الجديد',
      });
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message });
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, msg]) => {
            const message = Array.isArray(msg) ? msg.join(' - ') : msg;
            setError(field as keyof SignupFormValues, { message });
          });
        }
      } else {
        setError('root', { message: 'حدث خطأ غير متوقع في الاتصال' });
      }
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="إنشاء حساب جديد" subtitle="أنشئ حساب شركتك وابدأ في إدارة أسطولك" />

      <div className="auth-form">
        <GoogleButton label="إنشاء حساب بواسطة Google" />

        <div className="auth-form__divider">أو إدخال التفاصيل يدويًا</div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate aria-label="نموذج إنشاء الحساب">
          {errors.root && (
            <div className="auth-form__error-banner" role="alert" aria-live="assertive">
              {errors.root.message}
            </div>
          )}

          <div className="auth-form__row">
            <FormField
              id="signup-firstName"
              label="الاسم الأول"
              type="text"
              placeholder="محمد"
              autoComplete="given-name"
              required
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <FormField
              id="signup-lastName"
              label="الاسم الأخير"
              type="text"
              placeholder="العلي"
              autoComplete="family-name"
              required
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="auth-form__row">
            <FormField
              id="signup-email"
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@company.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <FormField
              id="signup-phone"
              label="رقم الجوال"
              type="tel"
              placeholder="+966501234567"
              autoComplete="tel"
              required
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <FormField
            id="signup-companyName"
            label="اسم الشركة"
            type="text"
            placeholder="شركة زمام للنقل"
            autoComplete="organization"
            required
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <div className="auth-form__row">
            <FormField
              id="signup-address-country"
              label="الدولة"
              type="text"
              placeholder="المملكة العربية السعودية"
              required
              value={addressDraft.country}
              error={errors.address?.country?.message}
              {...register('address.country', {
                onChange: (e) => handleAddressChange('country', e.target.value),
              })}
            />
            <FormField
              id="signup-address-city"
              label="المدينة"
              type="text"
              placeholder="الرياض"
              required
              value={addressDraft.city}
              error={errors.address?.city?.message}
              {...register('address.city', {
                onChange: (e) => handleAddressChange('city', e.target.value),
              })}
            />
          </div>

          <FormField
            id="signup-address-street"
            label="تفاصيل العنوان / الشارع"
            type="text"
            placeholder="طريق الملك فهد، حي العليا، مبنى 12"
            required
            value={addressDraft.streetDetails}
            error={errors.address?.streetDetails?.message}
            {...register('address.streetDetails', {
              onChange: (e) => handleAddressChange('streetDetails', e.target.value),
            })}
          />

          <div className="auth-form__field-group">
            <FormField
              id="signup-password"
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="أدخل كلمة مرور قوية"
              autoComplete="new-password"
              required
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
            <PasswordStrength password={watchedPassword} />
          </div>

          <FormField
            id="signup-confirmPassword"
            label="تأكيد كلمة المرور"
            type={showConfirm ? 'text' : 'password'}
            placeholder="أعد إدخال كلمة المرور"
            autoComplete="new-password"
            required
            leftAction={
              <button
                type="button"
                className="form-field__toggle-password"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'}
              >
                <EyeIcon open={showConfirm} />
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>

          <p className="auth-form__footer">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="auth-form__link">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
