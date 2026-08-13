import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/reset-password/components/ResetPasswordForm';

export const metadata: Metadata = { title: 'تعيين كلمة المرور الجديدة' };

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token = '' } = await searchParams;
  return <ResetPasswordForm token={decodeURIComponent(token)} />;
}
