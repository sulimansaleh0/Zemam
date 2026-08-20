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
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">مهام اليوم</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">٤ مهام مجدولة</p>
        </div>
        <button className="text-[11px] text-[var(--zd-blue)] font-medium">عرض كل المهام</button>
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
                  ? 'border-[var(--zd-teal)]/30 bg-[var(--zd-teal)]/10'
                  : 'border-[var(--zd-line)] bg-[var(--zd-surface-2)]/50 hover:border-[var(--zd-blue)]/50 hover:bg-[var(--zd-surface-2)]'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-[var(--zd-teal)] text-white' : 'bg-[var(--zd-surface-2)] text-[var(--zd-blue)]'
                }`}
              >
                <Clock3 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <b
                  className={`block truncate text-[11px] font-semibold ${
                    isDone ? 'text-[var(--zd-teal)] line-through' : 'text-[var(--zd-text)]'
                  }`}
                >
                  {name}
                </b>
                <small className="mt-1 block text-[9px] text-[var(--zd-muted)]">
                  {time} · {vehicle}
                </small>
              </span>
              <span
                className={`rounded-full px-2 py-1 text-[9px] font-medium ${
                  isDone || status === 'مكتملة'
                    ? 'bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]'
                    : 'bg-[var(--zd-surface-2)] text-[var(--zd-muted)]'
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
