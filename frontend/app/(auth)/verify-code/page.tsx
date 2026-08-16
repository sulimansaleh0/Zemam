import type { Metadata } from 'next';
import { VerifyCodeForm } from '@/features/auth/verify-code/components/VerifyCodeForm';

export const metadata: Metadata = { title: 'التحقق من الرمز' };

interface Props {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function VerifyCodePage({ searchParams }: Props) {
  const { email = '', token = '' } = await searchParams;
  return <VerifyCodeForm email={decodeURIComponent(email)} token={decodeURIComponent(token)} />;
}
