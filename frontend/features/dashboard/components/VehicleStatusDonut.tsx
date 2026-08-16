'use client';

import { MoreHorizontal } from 'lucide-react';

export function VehicleStatusDonut() {
  const statuses = [
    ['نشطة', '٤٢', '#28b89f'],
    ['في الصيانة', '٨', '#e6a849'],
    ['متوقفة', '٥', '#eb6570'],
    ['غير متاحة', '٣', '#304663'],
  ] as const;

  return (
    <section className="zd-panel zd-rise zd-d2 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[#edf4ff]">حالة المركبات</h2>
          <p className="mt-1 text-[10px] text-[#748aa8]">تحديث مباشر · ٥٨ مركبة</p>
        </div>
        <button aria-label="خيارات حالة المركبات" className="text-[#7087a5]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-around gap-4">
        <div
          className="relative h-[125px] w-[125px] rounded-full"
          style={{
            background:
              'conic-gradient(#28b89f 0 72%, #e6a849 72% 86%, #eb6570 86% 91%, #304663 91% 100%)',
          }}
        >
          <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full bg-[#102039]">
            <strong className="font-manrope text-2xl text-white">٥٨</strong>
            <span className="text-[9px] text-[#7187a5]">مركبة</span>
          </div>
        </div>

        <div className="space-y-3 text-[11px] text-[#aebed4]">
          {statuses.map(([name, count, color]) => (
            <div key={name} className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span className="w-16">{name}</span>
              <b className="font-manrope text-[#e7effc]">{count}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
