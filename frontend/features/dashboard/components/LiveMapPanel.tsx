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
          <h2 className="text-[14px] font-bold text-[#edf4ff]">التتبع المباشر</h2>
          <p className="mt-1 text-[10px] text-[#748aa8]">كل المركبات · آخر تحديث قبل ٤٢ ثانية</p>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-[#76a0ff]">
          عرض الخريطة الكاملة <ChevronLeft className="h-3 w-3" />
        </button>
      </div>

      <div
        className="relative mt-4 h-[220px] overflow-hidden rounded-xl border border-[#b4c9ea]/10 bg-[#172b48]"
        style={{
          backgroundImage:
            'linear-gradient(28deg, transparent 46%, rgba(183,205,234,.2) 47%, rgba(183,205,234,.2) 50%, transparent 51%), linear-gradient(102deg, transparent 46%, rgba(183,205,234,.18) 47%, rgba(183,205,234,.18) 50%, transparent 51%), linear-gradient(rgba(113,154,208,.12) 1px, transparent 1px),linear-gradient(90deg,rgba(113,154,208,.12) 1px,transparent 1px)',
          backgroundSize: 'auto,auto,28px 28px,28px 28px',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,123,255,.12),transparent_60%)]" />
        {points.map(([left, top, label], i) => (
          <div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#b8eff0] ${
                i === 2 ? 'bg-[#e7a951]' : 'bg-[#24b49c]'
              } shadow-[0_0_0_5px_rgba(58,199,181,.12)]`}
            >
              <Truck className="h-3.5 w-3.5 text-[#092036]" />
            </div>
            <span className="mt-1 block whitespace-nowrap rounded bg-[#0b1a2f]/90 px-1.5 py-0.5 text-[8px] text-[#d4e2f6]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-5 text-[10px] text-[#8da2bf]">
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
