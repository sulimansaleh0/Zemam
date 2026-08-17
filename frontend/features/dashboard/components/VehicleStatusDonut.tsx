'use client';

import { MoreHorizontal } from 'lucide-react';

export function VehicleStatusDonut() {
  const statuses = [
    ['نشطة', '٤٢', '#28b89f'],
    ['في الصيانة', '٨', '#e6a849'],
    ['متوقفة', '٥', '#eb6570'],
    ['غير متاحة', '٣', '#7187a5'],
  ] as const;

  return (
    <section className="zd-panel zd-rise zd-d2 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">حالة المركبات</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">تحديث مباشر · ٥٨ مركبة</p>
        </div>
        <button aria-label="خيارات حالة المركبات" className="text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-around gap-4">
        <div
          className="relative h-[125px] w-[125px] rounded-full shadow-inner"
          style={{
            background:
              'conic-gradient(#28b89f 0 72%, #e6a849 72% 86%, #eb6570 86% 91%, #7187a5 91% 100%)',
          }}
        >
          <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full bg-[var(--zd-surface)] shadow-xs">
            <strong className="font-manrope text-2xl text-[var(--zd-text)]">٥٨</strong>
            <span className="text-[9px] text-[var(--zd-muted)]">مركبة</span>
          </div>
        </div>

        <div className="space-y-3 text-[11px] text-[var(--zd-muted)]">
          {statuses.map(([name, count, color]) => (
            <div key={name} className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="w-16 text-[var(--zd-text)] opacity-90">{name}</span>
              <b className="font-manrope text-[var(--zd-text)]">{count}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
