import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthShell } from '@/features/auth/components/AuthShell';

export const metadata: Metadata = {
  title: {
    template: '%s | زمام',
    default: 'تسجيل الدخول | زمام',
  },
  description: 'منصة زمام لإدارة الأسطول',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
