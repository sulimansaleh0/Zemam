import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/signup/components/SignupForm';

export const metadata: Metadata = { title: 'إنشاء حساب جديد' };

export default function SignupPage() {
  return <SignupForm />;
}
