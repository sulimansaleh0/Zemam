'use client';

import Link from 'next/link';
import { Activity, ArrowLeft, Building2, FilePlus2, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { companies, PrivacyNotice, Shell, StatusBadge } from './_components';

const areas = [
  ['الشركات', 'ملفات الشركة وحالتها', Building2],
  ['النشاط المنصّي', 'آخر ما حدث على المنصة', Activity],
  ['وضع الدعم', 'قراءة آمنة عند الحاجة', ShieldCheck],
];

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => companies.filter((company) => `${company.name} ${company.email}`.includes(query)), [query]);

  return <Shell>
    <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-[var(--sa-navy)] px-6 py-8 text-white shadow-[0_20px_60px_rgba(16,32,47,0.14)] lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 flex items-center gap-2 text-sm font-bold text-teal-200"><span className="h-2 w-2 rounded-full bg-teal-300" />مركز التحكم بالمنصة</p>
          <h2 className="max-w-xl text-4xl font-extrabold leading-[1.2] tracking-tight lg:text-5xl">أسطولك يتحرك.<br /><span className="text-teal-300">أنت تعرف لماذا.</span></h2>
          <p className="mt-5 max-w-lg text-sm leading-8 text-slate-300">مساحة عمليات زمام لإدارة الشركات ومتابعة حالة المنصة، مع إبقاء بيانات كل شركة ضمن حدود الخصوصية.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/super-admin/tenants/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[var(--sa-navy)] transition hover:bg-teal-50"><FilePlus2 size={17} />إضافة شركة جديدة</Link><Link href="/super-admin/tenants" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">استعرض الشركات <ArrowLeft size={16} /></Link></div>
        </div>
        <div className="relative min-h-[270px] overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-[11px] font-bold text-teal-200">معاينة مساحة العمليات</p><p className="mt-1 text-sm font-bold">حالة الشركات الآن</p></div><span className="flex items-center gap-2 text-[11px] text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400" />متصل</span></div>
          <div className="absolute left-[-10%] top-[54%] h-px w-[120%] rotate-[-12deg] bg-teal-300/70 shadow-[0_0_18px_rgba(94,234,212,.7)]" />
          <div className="absolute left-[34%] top-[48%] h-3 w-3 rounded-full border-2 border-white bg-teal-300 shadow-[0_0_0_6px_rgba(94,234,212,.12)]" />
          <div className="absolute bottom-5 right-5 left-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/10 p-3"><small className="block text-[10px] text-slate-300">نشطة</small><b className="mt-1 block text-lg">٢٢٩</b></div><div className="rounded-xl bg-white/10 p-3"><small className="block text-[10px] text-slate-300">تحتاج متابعة</small><b className="mt-1 block text-lg text-amber-300">١٩</b></div><div className="rounded-xl bg-white/10 p-3"><small className="block text-[10px] text-slate-300">آخر نشاط</small><b className="mt-1 block text-lg">١٥ د</b></div></div>
        </div>
      </div>
    </section>

    <section className="mb-10 grid border-y border-[var(--sa-border)] sm:grid-cols-3">{areas.map(([label, description, Icon]) => <div key={label as string} className="flex items-center gap-4 border-b border-[var(--sa-border)] px-4 py-5 last:border-0 sm:border-b-0 sm:border-l sm:last:border-l-0"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/20 text-primary"><Icon size={18} /></span><span><b className="block text-sm">{label}</b><small className="text-xs text-muted">{description}</small></span></div>)}</section>

    <section className="mb-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
      <div><div className="mb-5 flex items-end justify-between"><div><p className="mb-2 text-xs font-bold text-primary">سجل العمل</p><h3 className="text-2xl font-extrabold text-ink">الشركات على الطريق</h3></div><Link href="/super-admin/tenants" className="text-xs font-bold text-primary">عرض الكل</Link></div><div className="mb-4 relative"><Search className="absolute right-3 top-2.5 text-muted" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الشركة أو البريد..." className="w-full rounded-xl border border-[var(--sa-border)] bg-white py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></div><div className="overflow-x-auto rounded-2xl border border-[var(--sa-border)] bg-white"><table className="w-full min-w-[620px] text-right text-sm"><thead className="border-b border-[var(--sa-border)] text-xs text-muted"><tr><th className="px-5 py-4">الشركة</th><th className="px-5 py-4">الحالة</th><th className="px-5 py-4">الباقة</th><th className="px-5 py-4">آخر نشاط</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((company) => <tr key={company.id} className="transition hover:bg-primary/[0.03]"><td className="px-5 py-4"><Link href={`/super-admin/tenants/${company.id}`} className="font-bold text-ink">{company.name}<small dir="ltr" className="block text-left text-xs font-normal text-muted">{company.email}</small></Link></td><td className="px-5 py-4"><StatusBadge status={company.status} /></td><td className="px-5 py-4 text-xs font-bold text-slate-600">{company.plan}</td><td className="px-5 py-4 text-xs text-muted">{company.activity}</td></tr>)}</tbody></table>{!filtered.length && <div className="p-10 text-center text-sm text-muted">لا توجد نتائج مطابقة.</div>}</div></div>
      <aside className="relative rounded-[1.5rem] border border-[var(--sa-border)] bg-white p-6"><div className="mb-6 flex items-center justify-between"><div><p className="mb-2 text-xs font-bold text-amber-700">علامات الانتباه</p><h3 className="text-xl font-extrabold text-ink">تحتاج متابعة</h3></div><TriangleAlert className="text-amber-600" size={21} /></div>{companies.filter((company) => company.status === 'معلقة' || company.activity.includes('٤')).map((company) => <Link key={company.id} href={`/super-admin/tenants/${company.id}`} className="mb-4 block border-b border-slate-100 pb-4 last:mb-0 last:border-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div><b className="block text-sm text-ink">{company.name}</b><small className="mt-1 block text-xs text-muted">آخر نشاط: {company.activity}</small></div><StatusBadge status={company.status} /></div></Link>)}</aside>
    </section>
    <PrivacyNotice />
  </Shell>;
}
