'use client';

import { Building2, ArrowLeft, Sparkles } from 'lucide-react';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { useOnboarding } from '../hooks/useOnboarding';

export function OnboardingForm() {
  const { register, handleSubmit, errors, isSubmitting, userName } = useOnboarding();

  return (
    <>
      <div className="zamam-rise">
        <AuthHeader
          title={userName ? `أهلاً بك، ${userName} 👋` : 'خطوة أخيرة لإعداد حسابك 🎉'}
          subtitle="أدخل اسم شركتك أو مؤسستك لنقوم بتجهيز مساحة العمل الخاصة بك على زمام"
        />
      </div>

      <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '2rem' }} noValidate>
        {errors.root && (
          <div className="auth-form__error-banner" role="alert">
            {errors.root.message}
          </div>
        )}

        <div className="zamam-rise zamam-delay-2 auth-form__field-group">
          <FormField
            id="companyName"
            label="اسم الشركة أو المؤسسة"
            type="text"
            placeholder="مثال: شركة الوفاق للنقل والخدمات اللوجستية"
            autoComplete="organization"
            required
            rightIcon={<Building2 size={17} />}
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </div>

        <div
          className="zamam-rise zamam-delay-3"
          style={{
            background: 'var(--surface-subtle, rgba(255, 255, 255, 0.04))',
            border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Sparkles size={20} style={{ color: 'var(--primary, #3b82f6)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.5' }}>
            سيتم إنشاء منظومة متكاملة لأسطولك وسائقيك تابعة لهذا الاسم، ويمكنك تعديل بيانات الشركة لاحقاً من الإعدادات.
          </p>
        </div>

        <div className="zamam-rise zamam-delay-4">
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            size="lg"
            icon={!isSubmitting ? <ArrowLeft size={16} /> : undefined}
          >
            {isSubmitting ? 'جاري تجهيز مساحة العمل...' : 'إكمال الإعداد وبدء الاستخدام'}
          </Button>
        </div>
      </form>
    </>
  );
}
