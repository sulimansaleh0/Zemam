'use client';

import React from 'react';
import {
  Clock,
  Coins,
  Droplet,
  Fuel,
  Gauge,
} from 'lucide-react';
import { formatCostSAR, formatLiters, formatEfficiency } from '../utils/fuelHelpers';
import type { FuelStats } from '../types/fuel.types';

interface FuelStatsCardsProps {
  stats: FuelStats;
}

export function FuelStatsCards({ stats }: FuelStatsCardsProps) {
  const cards = [
    {
      title: 'إجمالي تكلفة الوقود',
      value: formatCostSAR(stats.totalCost),
      icon: Coins,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      isText: true,
    },
    {
      title: 'إجمالي الوقود المعبأ',
      value: formatLiters(stats.totalQty),
      icon: Fuel,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      isText: true,
    },
    {
      title: 'متوسط كفاءة الوقود',
      value: formatEfficiency(stats.averageEfficiency),
      icon: Gauge,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      isText: true,
    },
    {
      title: 'إيصالات قيد المراجعة',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'رصيد الوقود الحالي',
      value: formatLiters(stats.fuelBalanceLitres),
      icon: Droplet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
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
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--zd-muted)] truncate">{card.title}</p>
              <p
                className={`mt-1 font-bold tracking-tight text-[var(--zd-text)] truncate ${
                  card.isText ? 'text-lg sm:text-base lg:text-lg' : 'text-xl'
                }`}
              >
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mr-2 ${card.bg} ${card.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
