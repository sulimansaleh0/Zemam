import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login/components/LoginForm';

export const metadata: Metadata = { title: 'تسجيل الدخول' };

export default function LoginPage() {
  return <LoginForm />;
}
