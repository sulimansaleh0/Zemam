'use client';

import React from 'react';
import { ClipboardCheck, Fuel, Wrench } from 'lucide-react';

export type ActivityTab = 'المهام' | 'البلاغات' | 'الوقود';

export interface ActivityTabItem {
  label: ActivityTab;
  icon: React.ElementType;
  description: string;
}

export const ACTIVITY_TAB_ITEMS: ActivityTabItem[] = [
  { label: 'المهام', icon: ClipboardCheck, description: 'ستظهر هنا مهام التوصيل المكلَّف بها السائق' },
  { label: 'البلاغات', icon: Wrench, description: 'ستظهر هنا بلاغات الأعطال والصيانة المرتبطة بالسائق' },
  { label: 'الوقود', icon: Fuel, description: 'ستظهر هنا سجلات تعبئة الوقود ومتوسطات الاستهلاك' },
];

interface ActivityContentProps {
  tab: ActivityTab;
}

export function ActivityContent({ tab }: ActivityContentProps) {
  const currentTab = ACTIVITY_TAB_ITEMS.find((t) => t.label === tab) ?? ACTIVITY_TAB_ITEMS[0];
  const Icon = currentTab.icon;

  return (
    <div
      role="tabpanel"
      aria-label={`محتوى تبويب ${currentTab.label}`}
      className="mt-4 flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--zd-line)] p-6 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--zd-surface-2)] text-[var(--zd-muted)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] leading-5 text-[var(--zd-muted)]">
        {currentTab.description}
      </p>
      <span className="rounded-full bg-[var(--zd-surface-2)] px-3 py-1 text-[10px] font-semibold text-[var(--zd-muted)]">
        قريباً
      </span>
    </div>
  );
}
