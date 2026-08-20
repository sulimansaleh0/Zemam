'use client';

import React from 'react';
import { Truck, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';
import { VehicleWithRelations } from '../types/vehicle.types';

interface VehicleStatsCardsProps {
  vehicles: VehicleWithRelations[];
}

export function VehicleStatsCards({ vehicles }: VehicleStatsCardsProps) {
  const total = vehicles.length;
  const active = vehicles.filter((v) => v.status === 'active').length;
  const maintenance = vehicles.filter((v) => v.status === 'maintenance').length;
  const stopped = vehicles.filter((v) => v.status === 'stopped' || v.status === 'unavailable').length;

  const stats = [
    {
      title: 'إجمالي المركبات',
      value: total,
      label: 'مركبة مسجلة',
      icon: Truck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      title: 'مركبات نشطة',
      value: active,
      label: 'على الطريق والعمليات',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    },
    {
      title: 'في الصيانة',
      value: maintenance,
      label: 'صيانة دورية وإصلاحات',
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
    {
      title: 'متوقفة / غير متاحة',
      value: stopped,
      label: 'خارج الخدمة مؤقتاً',
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
