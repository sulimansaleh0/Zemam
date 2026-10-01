'use client';

import React from 'react';
import {
  ClipboardList,
  Clock,
  Navigation,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type { TaskStats } from '../types/task.types';

interface TaskStatsCardsProps {
  stats: TaskStats;
}

export function TaskStatsCards({ stats }: TaskStatsCardsProps) {
  const cards = [
    {
      title: 'إجمالي المهام',
      value: stats.total,
      icon: ClipboardList,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'قيد الانتظار',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'قيد التنفيذ',
      value: stats.inProgress,
      icon: Navigation,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      title: 'المهام المكتملة',
      value: stats.finished,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'نسبة الإنجاز',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" dir="rtl">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 transition-all hover:border-[var(--zd-line-hover)] hover:shadow-sm"
          >
            <div>
              <p className="text-xs font-medium text-[var(--zd-muted)]">{card.title}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-[var(--zd-text)]">
                {card.value}
              </p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
