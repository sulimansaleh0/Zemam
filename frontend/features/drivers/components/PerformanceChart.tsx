'use client';

import { BarChart2 } from 'lucide-react';

export function PerformanceChart() {
  return (
    <div className="flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--zd-line)] p-5 text-center">
      <BarChart2 className="h-6 w-6 text-[var(--zd-muted)]" />
      <p className="text-[11px] text-[var(--zd-muted)]">
        سيتوفر مؤشر الأداء التشغيلي عند اكتمال بيانات المهام
      </p>
      <span className="rounded-full bg-[var(--zd-surface-2)] px-3 py-1 text-[10px] font-semibold text-[var(--zd-muted)]">
        قريباً
      </span>
    </div>
  );
}
