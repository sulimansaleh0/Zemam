'use client';

import React from 'react';
import { Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';

interface VehicleStatsCardsProps {
  vehicles: VehicleWithRelations[];
}

export function VehicleStatsCards({ vehicles }: VehicleStatsCardsProps) {
  const total = vehicles.length;
  const active = vehicles.filter((v) => v.status === 'active').length;
  const inTask = vehicles.filter((v) => v.isInTask).length;
  const inactive = vehicles.filter((v) => v.status === 'inactive').length;

  const stats = [
    {
      title: 'إجمالي المركبات',
      value: total,
      label: 'مركبة مسجلة بالأسطول',
      icon: Truck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      title: 'مركبات نشطة',
      value: active,
      label: 'جاهزة للتشغيل',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    },
    {
      title: 'في مهام حالياً',
      value: inTask,
      label: 'قيد التوصيل والعمليات',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
    {
      title: 'غير نشطة',
      value: inactive,
      label: 'متوقفة عن العمل',
      icon: AlertCircle,
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
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">{stat.title}</span>
              <div className="text-2xl font-black text-[var(--text)] font-manrope">
                {stat.value}
              </div>
              <span className="text-[11px] text-[var(--muted)] block">{stat.label}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
