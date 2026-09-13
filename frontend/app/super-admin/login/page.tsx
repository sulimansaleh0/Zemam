'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import shieldCheckIcon from '@/features/landing/assets/shield-check.svg';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }
    localStorage.setItem('zimam-super-admin-session', 'true');
    router.replace('/super-admin');
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-bg text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_360px_at_12%_16%,rgba(15,118,110,0.13),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_300px_at_88%_82%,rgba(37,99,235,0.08),transparent_70%)]" />
      <header className="relative z-10 flex h-[76px] items-center justify-between border-b border-[#10202F]/10 bg-white/85 px-6 backdrop-blur-[14px] lg:px-[72px]">
        <Link href="/" className="flex items-center gap-3 text-ink no-underline">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary">
            <Image src={shieldCheckIcon} alt="" width={20} height={20} />
          </span>
          <span className="text-2xl font-extrabold leading-none">زمام</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-primary">
          العودة إلى الصفحة الرئيسية
          <ArrowLeft size={16} />
        </Link>
      </header>
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-[1360px] items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_0.9fr] lg:px-[72px]">
        <div className="order-2 text-right lg:order-1">
          <p className="mb-4 inline-flex border-b-2 border-primary/30 pb-2 text-[13px] font-bold text-primary">مساحة العمليات المركزية</p>
          <h1 className="max-w-xl text-[44px] font-extrabold leading-[1.2] tracking-[-0.025em] text-ink max-[700px]:text-[32px]">
            إدارة المنصة
            <span className="block text-primary">بثقة ووضوح</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-[1.8] text-muted">
            لوحة تحكم مخصصة لفريق عمليات زمام لإدارة الشركات ومتابعة حالة المنصة مع الحفاظ على خصوصية بيانات كل شركة.
          </p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            {['إدارة الشركات من مكان واحد', 'بيانات الشركة فقط', 'دخول آمن لفريق العمليات', 'وضع دعم للقراءة فقط'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-text">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary"><ShieldCheck size={14} /></span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 flex justify-center lg:order-2">
          <form onSubmit={submit} className="w-full max-w-md rounded-[24px] border border-[#10202F]/10 bg-white/95 p-8 shadow-[0_20px_60px_rgba(16,32,47,0.12)] backdrop-blur-sm">
            <div className="mb-8">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole /></div>
              <h2 className="text-2xl font-extrabold text-ink">تسجيل دخول الإدارة</h2>
              <p className="mt-2 text-sm leading-7 text-muted">هذه المساحة مخصصة لمدراء النظام الأعلى في زمام.</p>
            </div>
            {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            <label className="mb-2 block text-sm font-bold text-text">البريد الإلكتروني</label>
            <input required type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} className="mb-5 w-full rounded-xl border border-[#10202F]/15 bg-[#F6F8F7] px-4 py-3 text-left text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="admin@zimam.sa" />
            <label className="mb-2 block text-sm font-bold text-text">كلمة المرور</label>
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mb-6 w-full rounded-xl border border-[#10202F]/15 bg-[#F6F8F7] px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="••••••••" />
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)] transition hover:bg-primary-hover active:scale-[0.98]">دخول آمن <ArrowLeft size={16} /></button>
            <p className="mt-5 text-center text-xs leading-6 text-muted">لا يوجد تسجيل ذاتي للحسابات.<br />الوصول مخصص لفريق عمليات زمام فقط.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
