'use client';

import React from 'react';
import { Users, UserCheck, ShieldAlert, Truck } from 'lucide-react';
import type { Team } from '../types/team.types';

interface TeamStatsCardsProps {
  teams: Team[];
  totalVehicles?: number;
}

export function TeamStatsCards({ teams, totalVehicles = 0 }: TeamStatsCardsProps) {
  const total = teams.length;
  const assigned = teams.filter((t) => Boolean(t.managerId)).length;
  const unassigned = total - assigned;

  const stats = [
    {
      title: 'إجمالي الفرق',
      value: total,
      label: 'فريق تشغيلي مسجل',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      title: 'فرق مدارة',
      value: assigned,
      label: 'معين لها مدير أسطول',
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    },
    {
      title: 'فرق شاغرة',
      value: unassigned,
      label: 'بانتظار تعيين مدير',
      icon: ShieldAlert,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
    {
      title: 'مركبات الأسطول',
      value: totalVehicles,
      label: 'موزعة عبر الفرق',
      icon: Truck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center justify-between transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
          >
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">{stat.title}</p>
              <h4 className="text-2xl font-bold text-[var(--text)] mt-1 tracking-tight">
                {stat.value}
              </h4>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{stat.label}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
