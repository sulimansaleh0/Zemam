'use client';

import Link from 'next/link';
import { Clock3, ClipboardList } from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks/useTasks';

export function TodayTasksList() {
  const { data: tasks = [], isLoading, isError } = useTasks();
  const today = new Date();
  const todayTasks = tasks
    .filter((task) => {
      const startDate = new Date(task.startTime);
      return startDate.toDateString() === today.toDateString();
    })
    .sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime())
    .slice(0, 4);

  return (
    <section className="zd-panel zd-rise zd-d3 rounded-2xl p-5 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">مهام اليوم</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">{todayTasks.length} مهام مسجلة اليوم</p>
        </div>
        <Link href="/tasks" className="text-[11px] text-[var(--zd-blue)] font-medium">عرض كل المهام</Link>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <p className="py-8 text-center text-xs text-[var(--zd-muted)]">جارٍ تحميل المهام...</p>
        ) : isError ? (
          <p className="py-8 text-center text-xs text-rose-500">تعذر تحميل المهام</p>
        ) : todayTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-xs text-[var(--zd-muted)]">
            <ClipboardList className="h-7 w-7 opacity-40" />
            <span>لا توجد مهام مسجلة لهذا اليوم</span>
          </div>
        ) : (
          todayTasks.map((task) => {
            const isFinished = task.status === 'finished';
            const statusLabel = isFinished ? 'مكتملة' : task.status === 'inprogress' ? 'قيد التنفيذ' : task.status === 'declined' ? 'مرفوضة' : 'معلقة';
            return (
              <div key={task._id} className="flex items-center gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/50 px-3 py-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isFinished ? 'bg-[var(--zd-teal)] text-white' : 'bg-[var(--zd-surface-2)] text-[var(--zd-blue)]'}`}>
                  <Clock3 className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <b className={`block truncate text-[11px] font-semibold ${isFinished ? 'text-[var(--zd-teal)]' : 'text-[var(--zd-text)]'}`}>
                    {task.description}
                  </b>
                  <small className="mt-1 block text-[9px] text-[var(--zd-muted)]">
                    {new Date(task.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} · {task.vehiclePlate}
                  </small>
                </span>
                <span className={`rounded-full px-2 py-1 text-[9px] font-medium ${isFinished ? 'bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]' : 'bg-[var(--zd-surface-2)] text-[var(--zd-muted)]'}`}>
                  {statusLabel}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
