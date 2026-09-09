'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (status === 'unauthenticated') {
        router.replace('/login');
      } else if (status === 'authenticated' && !user?.companyId) {
        // منع المستخدم من الوصول إلى لوحة التحكم إذا لم يكن لديه companyId حسب بيانات الـ Backend
        router.replace('/onboarding');
      }
    }
  }, [status, isLoading, user?.companyId, router]);

  // أثناء تحميل بيانات الجلسة من الـ Backend
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--zd-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--zd-blue,#2563eb)] border-t-transparent" />
          <p className="text-xs text-[var(--zd-muted,#64748b)]">جاري التحقق من مساحة العمل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجلاً، توجيهه لصفحة الدخول
  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--zd-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--zd-blue,#2563eb)] border-t-transparent" />
          <p className="text-xs text-[var(--zd-muted,#64748b)]">جاري التوجيه لتسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // إذا كان مسجلاً لكن لا يملك شركة، توجيهه لإعداد الشركة
  if (!user?.companyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--zd-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--zd-blue,#2563eb)] border-t-transparent" />
          <p className="text-xs text-[var(--zd-muted,#64748b)]">جاري توجيهك لإعداد الشركة...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
