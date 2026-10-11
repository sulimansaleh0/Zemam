'use client';

import React from 'react';
import { FileText, Shield } from 'lucide-react';

interface DriverLicenseCardProps {
  licenseNumber?: string;
  licenseTypes?: string[];
  licenseExpiry?: string;
  licenseStatus: {
    text: string;
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown';
    daysLeft?: number | null;
  };
}

export function DriverLicenseCard({
  licenseNumber,
  licenseTypes,
  licenseExpiry,
  licenseStatus,
}: DriverLicenseCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">
              بيانات رخصة القيادة والتأهيل المروري العربي
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              تصنيف الهرمية القانونية لتشغيل شاحنات ومركبات الأسطول
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            licenseStatus.status === 'valid'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : licenseStatus.status === 'expiring_soon'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : licenseStatus.status === 'expired'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              licenseStatus.status === 'valid'
                ? 'bg-emerald-500'
                : licenseStatus.status === 'expiring_soon'
                ? 'bg-amber-500'
                : licenseStatus.status === 'expired'
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          />
          {licenseStatus.text}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* License Number Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] font-medium block">
            رقم رخصة القيادة
          </span>
          <div className="font-mono text-base font-bold text-[var(--text)] tracking-wider" dir="ltr">
            {licenseNumber || '—'}
          </div>
          <span className="text-[10px] text-[var(--muted)] block">
            المرجع المروري المعتمد
          </span>
        </div>

        {/* License Categories Allowed */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1.5">
          <span className="text-[11px] text-[var(--muted)] font-medium block">
            فئات القيادة المصرح بها
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {Array.isArray(licenseTypes) && licenseTypes.length > 0 ? (
              licenseTypes.map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25"
                >
                  {type === 'truck'
                    ? 'شاحنة نقل (ثقيل)'
                    : type === 'van'
                    ? 'فان وحافلة (متوسط)'
                    : 'سيارة خاصة (خفيف)'}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                سيارة خاصة (خفيف)
              </span>
            )}
          </div>
        </div>

        {/* Expiry Date */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] font-medium block">
            تاريخ انتهاء الرخصة
          </span>
          <div className="text-base font-bold text-[var(--text)]">
            {licenseExpiry
              ? new Date(licenseExpiry).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '—'}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
            {licenseStatus.status === 'valid'
              ? 'الرخصة سارية وصالحة للاستخدام الميداني'
              : 'يرجى متابعة التجديد لتفادي إيقاف السائق'}
          </span>
        </div>
      </div>

      {/* Legal Hierarchy Notice */}
      <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3 text-xs text-indigo-700 dark:text-indigo-300">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold block">ميثاق الأهلية القانونية لنظام زمام:</span>
          <p className="text-[11px] text-[var(--muted)]">
            السائق يحمل صلاحيات قيادة معتمدة. يمنع النظام آلياً إسناد أي مركبة ذات فئة أعلى من رخصته لضمان الامتثال التام للأنظمة المرورية.
          </p>
        </div>
      </div>
    </div>
  );
}
