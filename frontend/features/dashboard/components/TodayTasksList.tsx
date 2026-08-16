'use client';

import { Clock3 } from 'lucide-react';

interface TodayTasksListProps {
  doneTasks: number[];
  onToggleTask: (index: number) => void;
}

export function TodayTasksList({ doneTasks, onToggleTask }: TodayTasksListProps) {
  const items = [
    ['توصيل طلبات مطعم الرياض — جدة', '09:30 صباحاً', 'مركبة ABC-1234', 'مكتملة'],
    ['معاينة دورية — المنطقة الصناعية', '11:00 صباحاً', 'مركبة KTL-7890', 'معلقة'],
    ['توصيل مستلزمات — وزارة النقل', '01:45 مساءً', 'مركبة XYZ-5678', 'معلقة'],
    ['استلام شحنة المستودع الرئيسي', '03:30 مساءً', 'مركبة DEF-9012', 'معلقة'],
  ] as const;

  return (
    <section className="zd-panel zd-rise zd-d3 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[#edf4ff]">مهام اليوم</h2>
          <p className="mt-1 text-[10px] text-[#748aa8]">٤ مهام مجدولة</p>
        </div>
        <button className="text-[11px] text-[#76a0ff]">عرض كل المهام</button>
      </div>

      <div className="mt-4 space-y-2">
        {items.map(([name, time, vehicle, status], i) => {
          const isDone = doneTasks.includes(i);
          return (
            <button
              key={name}
              onClick={() => onToggleTask(i)}
              className={`zd-focus flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-right transition ${
                isDone
                  ? 'border-[#2cbca6]/25 bg-[#153934]/40'
                  : 'border-white/[.06] bg-white/[.025] hover:border-[#4a83ff]/40'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-[#2ebaa5]' : 'bg-[#1c365c]'
                }`}
              >
                <Clock3 className={`h-3.5 w-3.5 ${isDone ? 'text-[#092437]' : 'text-[#87acff]'}`} />
              </span>
              <span className="min-w-0 flex-1">
                <b
                  className={`block truncate text-[11px] ${
                    isDone ? 'text-[#76d7c5] line-through' : 'text-[#dbe7f8]'
                  }`}
                >
                  {name}
                </b>
                <small className="mt-1 block text-[9px] text-[#7187a5]">
                  {time} · {vehicle}
                </small>
              </span>
              <span
                className={`rounded-full px-2 py-1 text-[9px] ${
                  isDone || status === 'مكتملة'
                    ? 'bg-[#173d39] text-[#6ed2c0]'
                    : 'bg-[#1c2d48] text-[#9eb4d1]'
                }`}
              >
                {isDone ? 'مكتملة' : status}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
