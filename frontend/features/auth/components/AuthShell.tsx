'use client';

import Image from 'next/image';
import { Activity, ArrowLeft, LockKeyhole, ShieldCheck, Truck, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { ZimamLogo } from '@/features/landing/components/ZimamLogo';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-bg text-text [direction:rtl]">
      <div className="relative flex min-h-screen overflow-hidden">
        {/* ── Form Side ── */}
        <section className="relative flex flex-col justify-between w-full lg:w-[48%] xl:w-[44%] p-6 sm:p-10 lg:p-12 min-h-screen bg-bg z-10">
          {/* Top Bar: Unified Navbar Logo + Theme Toggle */}
          <div className="flex items-center justify-between w-full max-w-[430px] mx-auto">
            <ZimamLogo />
            <ThemeToggle />
          </div>

          {/* Form Content */}
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-[430px] mx-auto">{children}</div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted py-2 w-full max-w-[430px] mx-auto">
            © ٢٠٢٦ زمام · جميع الحقوق محفوظة
          </div>
        </section>

        {/* ── Aside — Expressive Fleet Operations & System Showcase ── */}
        <aside className="relative hidden lg:flex lg:flex-1 flex-col justify-between p-12 xl:p-16 border-r border-[#162858] bg-[#041131] text-white overflow-hidden select-none">
          {/* Ambient Lighting & Royal Blue Glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(25,92,241,0.22),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(25,92,241,0.15),transparent_50%)]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-[#195CF1]/15 rounded-full blur-3xl" />

          {/* Top Tagline */}
          <div className="relative z-10 flex items-center gap-3 text-[#94A3B8] text-xs font-bold tracking-wider">
            <span className="block h-0.5 w-8 bg-[#195CF1] rounded-full" />
            <span className="text-[#DDE6FA] uppercase tracking-widest">منصة تشغيل وإدارة الأساطيل</span>
          </div>

          {/* Center: Expressive System Visual Showcase */}
          <div className="relative z-10 max-w-[560px] my-auto py-6 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#195CF1]/15 text-[#195CF1] border border-[#195CF1]/30 text-xs font-black">
                <Zap size={13} className="fill-[#195CF1]" />
                رؤية أوضح • قرارات أسرع
              </span>
              <h2 className="text-3xl xl:text-4xl font-black text-[#F4F7FE] leading-tight tracking-tight m-0">
                أسطولك بالكامل تحت{" "}
                <span className="text-[#195CF1]">سيطرتك اللحظية</span>
              </h2>
              <p className="text-[#94A3B8] text-sm xl:text-base leading-relaxed m-0 font-medium">
                تتبع حركة المركبات ثانية بثانية، إدارة مهام السائقين، وترشيد استهلاك الوقود من خلال لوحة تحكم سحابية وتطبيق جوال متكامل.
              </p>
            </div>

            {/* Expressive System Graphic Showcase */}
            <div className="relative rounded-[24px] border border-[#195CF1]/30 bg-[#081B4B]/80 backdrop-blur-xl p-6 shadow-[0_25px_60px_rgba(4,17,49,0.6)] overflow-hidden">
              {/* Inner ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#195CF1]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-6">
                {/* Visual side: 3D Phones Mockup */}
                <div className="relative flex justify-center items-center drop-shadow-[0_15px_30px_rgba(25,92,241,0.25)]">
                  <Image
                    src="/images/landing/driver-phones-clean.png"
                    alt="نظام وتطبيق زمام لإدارة الأسطول"
                    width={320}
                    height={260}
                    className="w-full h-auto object-contain max-h-[220px]"
                    priority
                  />
                </div>

                {/* Live System Telemetry Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#162858]">
                    <span className="font-bold text-[#DDE6FA]">مركز العمليات الحي</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                      مباشر
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#041131]/90 border border-[#195CF1]/25 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-[#195CF1]" />
                        <span className="text-xs font-bold text-white">المركبات النشطة</span>
                      </div>
                      <span className="text-sm font-black text-white">+5,600</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#041131]/90 border border-[#195CF1]/25 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#34D399]" />
                        <span className="text-xs font-bold text-white">دقة التتبع</span>
                      </div>
                      <span className="text-sm font-black text-[#34D399]">99.4%</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#041131]/90 border border-[#195CF1]/25 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#F59E0B]" />
                        <span className="text-xs font-bold text-white">توفير الوقود</span>
                      </div>
                      <span className="text-sm font-black text-[#F59E0B]">18% ↓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Banner */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-[#94A3B8] font-medium">
            <LockKeyhole size={15} className="text-[#195CF1]" />
            <span>بيانات أسطولك وعملياتك مشفرة ومحمية بأعلى المعايير الأمنية</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
