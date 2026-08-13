import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/forgot-password/components/ForgotPasswordForm';

export const metadata: Metadata = { title: 'استعادة كلمة المرور' };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
