'use client';

import { ClipboardCheck, Fuel, Wrench } from 'lucide-react';
import { useToast } from '@/shared/ui/Toast';
import { Driver } from '../types/driver.types';

interface ActivityContentProps {
  tab: 'المهام' | 'البلاغات' | 'الوقود';
  driver: Driver;
}

export function ActivityContent({ tab, driver }: ActivityContentProps) {
  const { addToast } = useToast();

  if (tab === 'المهام') {
    const tasks = driver.tasksList || [
      {
        id: '1',
        title: 'توصيل طلبات المنطقة الشمالية',
        date: 'اليوم · ٠٩:٣٠ ص',
        statusOrAmount: 'مكتملة',
        tagStyle: 'text-[var(--zd-teal)] bg-[var(--zd-teal)]/15',
        type: 'task' as const,
      },
      {
        id: '2',
        title: 'استلام شحنة المستودع الرئيسي',
        date: 'أمس · ٠٣:٤٥ م',
        statusOrAmount: 'مكتملة',
        tagStyle: 'text-[var(--zd-teal)] bg-[var(--zd-teal)]/15',
        type: 'task' as const,
      },
      {
        id: '3',
        title: 'معاينة دورية — مركز الصيانة ٤',
        date: '١٢ أغسطس · ١١:٠٠ ص',
        statusOrAmount: 'مراجعة',
        tagStyle: 'text-[var(--zd-amber)] bg-[var(--zd-amber)]/15',
        type: 'task' as const,
      },
    ];

    return (
      <div className="mt-3 space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id || task.title}
            onClick={() =>
              addToast({
                type: 'info',
                title: 'تفاصيل المهمة',
                message: `تم فتح تفاصيل: ${task.title}`,
              })
            }
            className="zd-focus flex w-full items-center gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-right hover:border-[var(--zd-blue)] transition-colors"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--zd-blue)]/15 text-[var(--zd-blue)]">
              <ClipboardCheck className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[11px] font-semibold text-[var(--zd-text)]">
                {task.title}
              </b>
              <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
                {task.date}
              </small>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                task.tagStyle || 'text-[var(--zd-teal)] bg-[var(--zd-teal)]/15'
              }`}
            >
              {task.statusOrAmount}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (tab === 'البلاغات') {
    const reports = driver.reportsList || [
      {
        id: '1',
        title: 'ملاحظة على ضغط الإطارات',
        date: '٠٩ أغسطس · تمّت المعالجة',
        statusOrAmount: 'مغلقة',
        tagStyle: 'text-[var(--zd-teal)] bg-[var(--zd-teal)]/15',
        type: 'report' as const,
      },
      {
        id: '2',
        title: 'اهتزاز خفيف أثناء التوقف',
        date: '٢٨ يوليو · بانتظار الفحص',
        statusOrAmount: 'مفتوحة',
        tagStyle: 'text-[var(--zd-amber)] bg-[var(--zd-amber)]/15',
        type: 'report' as const,
      },
    ];

    return (
      <div className="mt-3 space-y-2">
        {reports.map((report) => (
          <button
            key={report.id || report.title}
            onClick={() =>
              addToast({
                type: 'info',
                title: 'بلاغ الصيانة',
                message: `تم فتح تفاصيل البلاغ: ${report.title}`,
              })
            }
            className="zd-focus flex w-full items-center gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-right hover:border-[var(--zd-blue)] transition-colors"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--zd-amber)]/15 text-[var(--zd-amber)]">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[11px] font-semibold text-[var(--zd-text)]">
                {report.title}
              </b>
              <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
                {report.date}
              </small>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                report.tagStyle || 'text-[var(--zd-teal)] bg-[var(--zd-teal)]/15'
              }`}
            >
              {report.statusOrAmount}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // الوقود
  const fuels = driver.fuelList || [
    {
      id: '1',
      title: 'تعبئة وقود · محطة طريق الملك',
      date: 'اليوم · ٠٧:٤٢ ص',
      statusOrAmount: '١٨٦ ريال',
      type: 'fuel' as const,
    },
    {
      id: '2',
      title: 'تعبئة وقود · محطة النخيل',
      date: '٠٨ أغسطس · ٠٦:١٠ م',
      statusOrAmount: '٢٣٤ ريال',
      type: 'fuel' as const,
    },
    {
      id: '3',
      title: 'متوسط الاستهلاك هذا الشهر',
      date: 'آخر ٣٠ يوماً',
      statusOrAmount: '١٢.٤ لتر/١٠٠كم',
      type: 'fuel' as const,
    },
  ];

  return (
    <div className="mt-3 space-y-2">
      {fuels.map((item) => (
        <button
          key={item.id || item.title}
          onClick={() =>
            addToast({
              type: 'info',
              title: 'سجل الوقود',
              message: `تفاصيل التعبئة: ${item.statusOrAmount}`,
            })
          }
          className="zd-focus flex w-full items-center gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-right hover:border-[var(--zd-blue)] transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]">
            <Fuel className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-[11px] font-semibold text-[var(--zd-text)]">
              {item.title}
            </b>
            <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
              {item.date}
            </small>
          </span>
          <span className="font-manrope text-[10px] font-semibold text-[var(--zd-teal)]">
            {item.statusOrAmount}
          </span>
        </button>
      ))}
    </div>
  );
}
