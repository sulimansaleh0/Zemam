'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Sidebar, Header } from '@/features/dashboard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (status === 'unauthenticated') {
        window.location.replace('/login?session=expired');
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
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--zd-blue,#2563eb)] border-t-transparent" />
          <p className="text-xs text-[var(--zd-muted,#64748b)]">انتهت الجلسة، جاري توجيهك لتسجيل الدخول...</p>
          <a
            href="/login?session=expired"
            className="mt-2 text-xs font-semibold text-[var(--zd-blue,#2563eb)] hover:underline"
          >
            اضغط هنا إذا لم يتم تحويلك تلقائياً
          </a>
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

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── القائمة الجانبية للنظام (Sidebar) ── */}
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={user?.name || 'مستخدم'}
          onLogout={logout}
        />

        {/* ── غطاء الموبايل عند فتح القائمة ── */}
        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden cursor-pointer"
          />
        )}

        {/* ── منطقة المحتوى الرئيسية ── */}
        <div className="min-w-0 flex-1 flex flex-col">
          <Header
            onMenu={() => setMenuOpen(true)}
            showSearch={false}
            userName={user?.name || 'مستخدم'}
          />

          <div className="flex-1 mx-auto max-w-[1540px] w-full px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
