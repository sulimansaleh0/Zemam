import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/forgot-password/components/ForgotPasswordForm';

export const metadata: Metadata = { title: 'استعادة كلمة المرور' };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="zamam-rise text-center text-sm text-[#8194b0]">جاري التحميل...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
