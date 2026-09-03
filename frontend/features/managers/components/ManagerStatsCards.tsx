'use client';

import React from 'react';
import { Users, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { FleetManager } from '../types/manager.types';
import type { Team } from '@/features/teams/types/team.types';

interface ManagerStatsCardsProps {
  managers: FleetManager[];
  teams: Team[];
}

export function ManagerStatsCards({ managers, teams }: ManagerStatsCardsProps) {
  const totalManagers = managers.length;
  const activeManagers = managers.filter(
    (m) => (m.status || 'active').toLowerCase() === 'active'
  ).length;
  const inactiveManagers = totalManagers - activeManagers;

  const assignedTeamsCount = new Set(
    managers
      .filter((m) => Boolean(m.teamId))
      .map((m) => (typeof m.teamId === 'object' ? m.teamId?._id : m.teamId))
  ).size;

  const stats = [
    {
      title: 'إجمالي المدراء',
      value: totalManagers,
      label: 'مدير أسطول مسجل',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      title: 'مدراء نشطون',
      value: activeManagers,
      label: 'يمتلكون صلاحيات نشطة',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    },
    {
      title: 'الفرق المدارة',
      value: `${assignedTeamsCount} / ${teams.length}`,
      label: 'فريق معين له مدير',
      icon: UserCheck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    },
    {
      title: 'حسابات غير نشطة',
      value: inactiveManagers,
      label: 'تم إيقاف صلاحياتها',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
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
