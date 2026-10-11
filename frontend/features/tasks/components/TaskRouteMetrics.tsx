'use client';

import React from 'react';
import { MapPin, Navigation, Route, Timer } from 'lucide-react';
import type { RouteData } from '../utils/mapHelpers';
import type { LocationPoint } from '../types/task.types';

interface TaskRouteMetricsProps {
  routeData: RouteData | null;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
}

export function TaskRouteMetrics({
  routeData,
  pickupLocation,
  deliveryLocation,
}: TaskRouteMetricsProps) {
  return (
    <div className="space-y-2.5">
      {/* ملخص المسار والمسافة الحقيقية والوقت المقدر */}
      {routeData && (
        <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-[var(--zd-text)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shrink-0">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--zd-muted)]">المسافة الفعلية</p>
              <p className="text-xs font-bold text-blue-400">
                {routeData.distanceKm} كم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--zd-muted)]">الوقت المتوقع</p>
              <p className="text-xs font-bold text-emerald-400">
                {routeData.durationMinutes} دقيقة تقريباً
              </p>
            </div>
          </div>
        </div>
      )}

      {/* العناوين الحالية المحددة */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-[11px]">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-emerald-500">الانطلاق A:</span>{' '}
            <span className="text-[var(--zd-text)] truncate inline-block max-w-[160px] align-bottom">
              {pickupLocation.address || 'لم يُحدد بعد'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <Navigation className="h-4 w-4 shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-blue-500">التسليم B:</span>{' '}
            <span className="text-[var(--zd-text)] truncate inline-block max-w-[160px] align-bottom">
              {deliveryLocation.address || 'لم يُحدد بعد'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
