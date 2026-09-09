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
      <div>
        <AuthHeader
          title={userName ? `أهلاً بك، ${userName} 👋` : 'خطوة أخيرة لإعداد حسابك 🎉'}
          subtitle="أدخل اسم شركتك أو مؤسستك لنقوم بتجهيز مساحة العمل الخاصة بك على زمام"
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

        <div className="rounded-xl border border-border bg-surface2/60 p-4 flex items-start gap-3 my-1">
          <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="m-0 text-sm text-muted leading-relaxed">
            سيتم إنشاء منظومة متكاملة لأسطولك وسائقيك تابعة لهذا الاسم، ويمكنك تعديل بيانات الشركة لاحقاً من الإعدادات.
          </p>
        </div>

        <div className="mt-2">
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
