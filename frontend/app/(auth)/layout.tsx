import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s | زمام',
    default: 'تسجيل الدخول | زمام',
  },
  description: 'منصة زمام لإدارة الأسطول',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__bg" aria-hidden="true">
        <div className="auth-layout__blob auth-layout__blob--1" />
        <div className="auth-layout__blob auth-layout__blob--2" />
        <div className="auth-layout__grid" />
      </div>

      <main className="auth-layout__main">{children}</main>
    </div>
  );
}
