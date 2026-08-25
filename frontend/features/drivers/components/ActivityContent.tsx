'use client';

import { ClipboardCheck, Fuel, Wrench } from 'lucide-react';

interface ActivityContentProps {
  tab: 'المهام' | 'البلاغات' | 'الوقود';
}

const TAB_CONFIG = {
  المهام:    { icon: ClipboardCheck, label: 'المهام',   description: 'ستظهر هنا مهام التوصيل المكلَّف بها السائق' },
  البلاغات:  { icon: Wrench,         label: 'البلاغات', description: 'ستظهر هنا بلاغات الأعطال والصيانة المرتبطة بالسائق' },
  الوقود:    { icon: Fuel,           label: 'الوقود',   description: 'ستظهر هنا سجلات تعبئة الوقود ومتوسطات الاستهلاك' },
} as const;

export function ActivityContent({ tab }: ActivityContentProps) {
  const config = TAB_CONFIG[tab];
  const Icon = config.icon;

  return (
    <div
      role="tabpanel"
      aria-label={`محتوى تبويب ${config.label}`}
      className="mt-4 flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--zd-line)] p-6 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--zd-surface-2)] text-[var(--zd-muted)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] leading-5 text-[var(--zd-muted)]">
        {config.description}
      </p>
      <span className="rounded-full bg-[var(--zd-surface-2)] px-3 py-1 text-[10px] font-semibold text-[var(--zd-muted)]">
        قريباً
      </span>
    </div>
  );
}
