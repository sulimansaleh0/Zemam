import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/signup/components/SignupForm';

export const metadata: Metadata = { title: 'إنشاء حساب جديد' };

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="zamam-rise text-center text-sm text-[#8194b0]">جاري التحميل...</div>}>
      <SignupForm />
    </Suspense>
  );
}
