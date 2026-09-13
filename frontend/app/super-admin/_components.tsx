'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Building2, ClipboardList, LayoutDashboard, ShieldCheck, UsersRound, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import shieldCheckIcon from '@/features/landing/assets/shield-check.svg';

export type Company = { id: string; name: string; status: 'نشطة' | 'معلقة'; plan: string; admin: string; email: string; onboarded: string; activity: string };
export const companies: Company[] = [
  { id: 'ZM-1042', name: 'شركة مسارات النقل', status: 'نشطة', plan: 'المؤسسات', admin: 'أحمد العتيبي', email: 'ahmad@masarat.sa', onboarded: '١٤ مايو ٢٠٢٤', activity: 'قبل ١٥ دقيقة' },
  { id: 'ZM-1037', name: 'لوجستيات المدار', status: 'نشطة', plan: 'النمو', admin: 'سارة القحطاني', email: 'sara@almadar.sa', onboarded: '٠٨ مايو ٢٠٢٤', activity: 'قبل ساعتين' },
  { id: 'ZM-1031', name: 'الركن الآمن', status: 'معلقة', plan: 'الأساسية', admin: 'محمد الحربي', email: 'mohammed@alrukn.sa', onboarded: '٢٦ أبريل ٢٠٢٤', activity: 'منذ ٤ أيام' },
  { id: 'ZM-1025', name: 'حلول المسار', status: 'نشطة', plan: 'النمو', admin: 'ريم السالم', email: 'reem@masar.sa', onboarded: '١٨ أبريل ٢٠٢٤', activity: 'منذ ٦ أيام' },
];
export const nav = [['لوحة التحكم', '/super-admin', LayoutDashboard], ['الشركات', '/super-admin/tenants', Building2], ['مدراء النظام', '/super-admin/admins', UsersRound], ['سجل النشاط', '/super-admin/activity-log', ClipboardList]] as const;

export function StatusBadge({ status }: { status: Company['status'] }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${status === 'نشطة' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><i className={`h-1.5 w-1.5 rounded-full ${status === 'نشطة' ? 'bg-emerald-500' : 'bg-amber-500'}`} />{status}</span>;
}

export function Shell({ children, title = 'لوحة التحكم' }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navItems = nav;
  return <div dir="rtl" className="min-h-screen bg-[var(--sa-bg)] text-[var(--sa-text)]">
    <aside className={`${open ? 'translate-x-0' : 'translate-x-full'} fixed inset-y-0 right-0 z-40 flex w-[258px] flex-col border-l border-[var(--sa-border)] bg-white p-4 transition-transform duration-300 lg:translate-x-0`}>
      <div className="mb-8 flex items-center justify-between px-2"><Link href="/super-admin" className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary shadow-[0_9px_24px_rgba(15,118,110,.22)]"><Image src={shieldCheckIcon} alt="" width={21} height={21} /></span><span className="leading-none"><b className="block text-[21px] font-extrabold tracking-[-.04em] text-ink">زمام</b><small className="mt-1 block text-[8px] font-semibold tracking-[.18em] text-muted">SUPER ADMIN</small></span></Link><button onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="rounded-lg p-2 text-muted hover:bg-surface2 lg:hidden"><X size={16} /></button></div>
      <div className="mb-3 px-3 text-[10px] font-semibold tracking-[.08em] text-muted">مساحة الإدارة</div>
      <nav aria-label="التنقل الرئيسي" className="space-y-1 overflow-y-auto">{navItems.map(([label, href, Icon]) => { const active = pathname === href || (href !== '/super-admin' && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex w-full items-center gap-3 rounded-[11px] px-3 py-3 text-right text-[13px] font-medium transition ${active ? 'bg-primary text-white shadow-[0_8px_18px_rgba(15,118,110,.22)]' : 'text-muted hover:bg-surface2 hover:text-text'}`}><Icon size={17} strokeWidth={active ? 2.5 : 1.8} /><span className="flex-1">{label}</span>{label === 'سجل النشاط' && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] text-white">٤</span>}</Link>; })}</nav>
    </aside>
    <div className="lg:mr-[258px]"><header className="flex h-[76px] items-center justify-between border-b border-[#10202F]/10 bg-white/85 px-5 backdrop-blur-[14px] lg:px-10"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} aria-label="فتح القائمة" className="rounded-lg p-2 text-muted hover:bg-surface2 lg:hidden"><span className="block h-0.5 w-5 bg-current shadow-[0_6px_0_currentColor,0_-6px_0_currentColor]" /></button><div><small className="text-xs text-muted">مساحة الإدارة /</small><h1 className="text-xl font-extrabold text-ink">{title}</h1></div></div><div className="flex items-center gap-3"><button aria-label="التنبيهات" className="relative rounded-lg p-2 text-muted hover:bg-surface2"><Bell size={18} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">ن ش</div><div className="hidden sm:block"><b className="block text-sm text-ink">نورة الشمري</b><small className="text-xs text-muted">مدير النظام الأعلى</small></div></div></header><main className="relative mx-auto max-w-[1480px] overflow-hidden p-5 lg:p-10"><div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(15,118,110,.06)_1px,transparent_1px)] [background-size:24px_24px]" /><div className="relative">{children}</div></main></div>
  </div>;
}

export function PrivacyNotice() { return <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-7 text-ink"><ShieldCheck className="mt-1 shrink-0 text-primary" size={19} /><span><b>الخصوصية أولاً:</b> تعرض هذه المساحة معلومات الشركة والنشاط المنصّي فقط. لا يمكن الوصول إلى بيانات المستخدمين أو المركبات أو العمليات الخاصة بالشركات.</span></div>; }
