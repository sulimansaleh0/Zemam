import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login/components/LoginForm';

export const metadata: Metadata = { title: 'تسجيل الدخول' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="zamam-rise text-center text-sm text-[#8194b0]">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}
