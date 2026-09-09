'use client';

import { Activity, ArrowLeft, LockKeyhole, ShieldCheck, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

interface AuthShellProps {
  children: ReactNode;
}

/* ─── Logo ─────────────────────────────────────────────── */

function ZamamLogo() {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary text-white shadow-md shadow-primary/25">
        <Activity size={20} strokeWidth={2.5} />
      </div>
      <div className="leading-none text-right">
        <div className="text-[20px] font-extrabold text-text tracking-tight">زمام</div>
        <div className="mt-1 text-[8px] font-bold tracking-[.18em] text-muted">ZAMAM FLEET</div>
      </div>
    </div>
  );
}

/* ─── Operational Visual (Fleet Stats Panel) ───────────── */

function OperationalVisual() {
  return (
    <div className="relative mt-8 rounded-2xl border border-border bg-surface2/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-semibold mb-4 text-text">
        <span>مركز العمليات</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          النظام يعمل
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col">
          <Truck size={18} className="text-primary mb-2" />
          <div className="text-2xl font-black text-text">58</div>
          <div className="text-[11px] text-muted font-medium mt-0.5">مركبة في الخدمة</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col">
          <ShieldCheck size={18} className="text-success mb-2" />
          <div className="text-2xl font-black text-text">99.2%</div>
          <div className="text-[11px] text-muted font-medium mt-0.5">سلامة التشغيل</div>
          <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-success rounded-full w-[99.2%]" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/70 px-3.5 py-2.5 text-xs text-text">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Activity size={15} />
          </div>
          <div>
            <div className="font-bold">تحديث مباشر للأسطول</div>
            <div className="text-[10px] text-muted">آخر مزامنة منذ دقيقة واحدة</div>
          </div>
        </div>
        <ArrowLeft size={14} className="text-muted" />
      </div>
    </div>
  );
}

/* ─── Auth Shell ───────────────────────────────────────── */

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-bg text-text [direction:rtl]">
      <div className="relative flex min-h-screen overflow-hidden">
        {/* ── Form Side ── */}
        <section className="relative flex flex-col justify-between w-full lg:w-[46%] xl:w-[42%] p-6 sm:p-10 lg:p-12 min-h-screen bg-bg z-10">
          <div className="flex items-center justify-between w-full max-w-[430px] mx-auto">
            <ZamamLogo />
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-[430px] mx-auto">{children}</div>
          </div>

          <div className="text-center text-xs text-muted py-2 w-full max-w-[430px] mx-auto">
            © ٢٠٢٦ زمام · جميع الحقوق محفوظة
          </div>
        </section>

        {/* ── Aside — Fleet Operations Panel ── */}
        <aside className="relative hidden lg:flex lg:flex-1 flex-col justify-between p-12 xl:p-16 border-r border-border bg-surface overflow-hidden">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_32%,rgba(15,118,110,0.12),transparent_42%),radial-gradient(circle_at_76%_84%,rgba(37,99,235,0.08),transparent_36%)]" />

          <div className="relative z-10 flex items-center gap-3 text-muted text-xs font-semibold tracking-wider">
            <span className="block h-px w-9 bg-primary" />
            <span>منصة تشغيل الأسطول</span>
          </div>

          <div className="relative z-10 max-w-[540px] my-auto py-8">
            <div className="text-xs font-bold text-primary mb-3">
              رؤية أوضح. قرارات أسرع.
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-text leading-tight tracking-tight m-0 mb-4">
              أسطولك تحت<br />
              <span className="text-primary">سيطرتك الكاملة.</span>
            </h1>
            <p className="text-muted text-sm xl:text-base leading-relaxed m-0">
              زمام يجمع المركبات، السائقين، والعمليات اليومية في مساحة واحدة
              تمنح فريقك صورة دقيقة في كل لحظة.
            </p>
            <OperationalVisual />
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-muted font-medium">
            <LockKeyhole size={15} className="text-primary" />
            <span>بيانات عملياتك محمية ومشفرة دائماً</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
