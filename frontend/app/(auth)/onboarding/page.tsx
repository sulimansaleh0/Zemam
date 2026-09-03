import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OnboardingForm } from '@/features/auth/onboarding';

export const metadata: Metadata = { title: 'إعداد مساحة عمل الشركة' };

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="zamam-rise text-center text-sm text-[#8194b0]">جاري التحميل...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
