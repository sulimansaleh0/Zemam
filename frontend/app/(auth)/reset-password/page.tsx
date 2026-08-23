import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/reset-password/components/ResetPasswordForm';

export const metadata: Metadata = { title: 'تعيين كلمة المرور الجديدة' };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
