'use client';

import { ChevronLeft, Truck } from 'lucide-react';

export function LiveMapPanel() {
  const points = [
    [22, 44, 'ABC-1234'],
    [43, 60, 'KTL-7890'],
    [66, 37, 'DEF-9012'],
    [71, 69, 'XYZ-5678'],
    [34, 75, 'BHI-3456'],
  ] as const;

  return (
    <section className="zd-panel zd-rise zd-d3 overflow-hidden rounded-2xl p-5 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">التتبع المباشر</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">كل المركبات · آخر تحديث قبل ٤٢ ثانية</p>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-[var(--zd-blue)] font-medium">
          عرض الخريطة الكاملة <ChevronLeft className="h-3 w-3" />
        </button>
      </div>

      <div
        className="relative mt-4 h-[220px] overflow-hidden rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]"
        style={{
          backgroundImage:
            'linear-gradient(28deg, transparent 46%, rgba(37,99,235,.07) 47%, rgba(37,99,235,.07) 50%, transparent 51%), linear-gradient(102deg, transparent 46%, rgba(37,99,235,.06) 47%, rgba(37,99,235,.06) 50%, transparent 51%), linear-gradient(rgba(37,99,235,.05) 1px, transparent 1px),linear-gradient(90deg,rgba(37,99,235,.05) 1px,transparent 1px)',
          backgroundSize: 'auto,auto,28px 28px,28px 28px',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,.08),transparent_60%)]" />
        {points.map(([left, top, label], i) => (
          <div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md ${
                i === 2 ? 'bg-[#e7a951]' : 'bg-[#24b49c]'
              }`}
            >
              <Truck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="mt-1 block whitespace-nowrap rounded bg-[var(--zd-surface)]/90 border border-[var(--zd-line)] px-1.5 py-0.5 text-[8px] font-semibold text-[var(--zd-text)] shadow-xs">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-5 text-[10px] text-[var(--zd-muted)]">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#28b89f]" />
          متحركة
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#e6a849]" />
          متوقفة
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#eb6570]" />
          تنبيه
        </span>
      </div>
    </section>
  );
}
