'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  CheckCircle2,
  Compass,
  MapPin,
  Navigation,
  Route,
  Timer,
} from 'lucide-react';
import type { TaskWithRelations } from '../types/task.types';
import { fetchDrivingRoute, type RouteData } from '../utils/mapHelpers';
import { decodePolyline } from '@/features/gps/utils/gpsHelpers';
import { gpsService } from '@/features/gps/services/gps.service';

const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
      <Compass className="h-6 w-6 animate-spin text-[var(--zd-blue)]" />
      <span>جاري تحميل مسار الخريطة...</span>
    </div>
  ),
});

interface TaskDetailMapSectionProps {
  task: TaskWithRelations;
}

export function TaskDetailMapSection({ task }: TaskDetailMapSectionProps) {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [actualGpsCoords, setActualGpsCoords] = useState<[number, number][]>([]);
  const [isLoadingGpsPath, setIsLoadingGpsPath] = useState(false);

  const pickupLat = task?.pickupLocation?.lat ? parseFloat(task.pickupLocation.lat) : NaN;
  const pickupLng = task?.pickupLocation?.lng ? parseFloat(task.pickupLocation.lng) : NaN;
  const deliveryLat = task?.deliveryLocation?.lat ? parseFloat(task.deliveryLocation.lat) : NaN;
  const deliveryLng = task?.deliveryLocation?.lng ? parseFloat(task.deliveryLocation.lng) : NaN;

  const hasCoords = !isNaN(pickupLat) && !isNaN(pickupLng) && !isNaN(deliveryLat) && !isNaN(deliveryLng);

  const encodedPath = task.tripSummary?.encodedPath;

  // 1. فك تشفير المسار المسجل فعلياً بالـ GPS في ملخص المهمة إن وُجد
  const decodedTripPath = useMemo(() => {
    if (encodedPath) {
      return decodePolyline(encodedPath);
    }
    return undefined;
  }, [encodedPath]);

  // 2. استرجاع مسار الـ GPS الفعلي عالي الدقة مباشرة من السيرفر لضمان واقعية المسار 100%
  useEffect(() => {
    if (!task?._id) return;
    if (decodedTripPath && decodedTripPath.length > 1) {
      setActualGpsCoords(decodedTripPath);
      return;
    }

    let isMounted = true;
    setIsLoadingGpsPath(true);
    gpsService
      .getLiveTripPath(task._id)
      .then((res) => {
        if (!isMounted || !res.success || !res.data) return;
        const pts = res.data.path?.points || [];
        if (pts.length > 1) {
          setActualGpsCoords(pts.map((p: any) => [Number(p.lat), Number(p.lng)]));
        } else if (res.data.path?.encodedPath) {
          const decoded = decodePolyline(res.data.path.encodedPath);
          if (decoded.length > 1) {
            setActualGpsCoords(decoded);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live trip path for task details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingGpsPath(false);
      });

    return () => {
      isMounted = false;
    };
  }, [task?._id, decodedTripPath]);

  const effectiveActualPath = actualGpsCoords.length > 1 ? actualGpsCoords : decodedTripPath;

  // 3. استدعاء مسار الطرق التقديري كمرجع تخطيطي
  useEffect(() => {
    if (!hasCoords) return;

    let isMounted = true;
    const controller = new AbortController();

    fetchDrivingRoute([pickupLat, pickupLng], [deliveryLat, deliveryLng], controller.signal)
      .then((res) => {
        if (isMounted) setRouteData(res);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng, hasCoords]);

  return (
    <div className="space-y-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--zd-text)]">المسار ونقاط التحرك</span>
        {effectiveActualPath && effectiveActualPath.length > 1 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            مسار الـ GPS الفعلي 100% ({effectiveActualPath.length} نقطة مسجلة)
          </span>
        ) : isLoadingGpsPath ? (
          <span className="text-[10px] text-[var(--zd-muted)] animate-pulse">
            جاري استرجاع مسار الـ GPS الميداني...
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-start gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="font-bold text-emerald-500 text-[11px]">الانطلاق A</p>
            <p className="text-[var(--zd-text)] text-[11px] truncate">{task.pickupLocation?.address || '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <div className="min-w-0">
            <p className="font-bold text-blue-500 text-[11px]">التسليم B</p>
            <p className="text-[var(--zd-text)] text-[11px] truncate">{task.deliveryLocation?.address || '—'}</p>
          </div>
        </div>
      </div>

      {/* خريطة المسار التفاعلية */}
      {hasCoords && (
        <div className="space-y-2 pt-1">
          <LeafletMapCanvas
            pickupPosition={[pickupLat, pickupLng]}
            deliveryPosition={[deliveryLat, deliveryLng]}
            routeCoordinates={effectiveActualPath || routeData?.coordinates}
            plannedCoordinates={routeData?.coordinates}
            routeType={effectiveActualPath && effectiveActualPath.length > 1 ? 'actual' : 'planned'}
            showGeofence={true}
            className="h-[280px] w-full rounded-2xl"
            readOnly={true}
          />

          {/* إذا كانت المهمة منتهية ويوجد ملخص GPS فعلي */}
          {task.tripSummary ? (
            <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تقرير التتبع الفعلي للمهمة (GPS Trip Summary)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="rounded-lg bg-[var(--zd-surface)] p-2 border border-[var(--zd-line)]">
                  <span className="text-[10px] text-[var(--zd-muted)] block">المسافة الفعلية</span>
                  <span className="font-black text-blue-600 text-sm">
                    {task.tripSummary.totalDistanceKm ?? '—'} كم
                  </span>
                </div>
                <div className="rounded-lg bg-[var(--zd-surface)] p-2 border border-[var(--zd-line)]">
                  <span className="text-[10px] text-[var(--zd-muted)] block">زمن القيادة</span>
                  <span className="font-black text-emerald-600 text-sm">
                    {task.tripSummary.durationMinutes ?? '—'} دقيقة
                  </span>
                </div>
                <div className="rounded-lg bg-[var(--zd-surface)] p-2 border border-[var(--zd-line)]">
                  <span className="text-[10px] text-[var(--zd-muted)] block">متوسط السرعة</span>
                  <span className="font-black text-amber-600 text-sm">
                    {task.tripSummary.averageSpeed ?? '—'} كم/س
                  </span>
                </div>
                <div className="rounded-lg bg-[var(--zd-surface)] p-2 border border-[var(--zd-line)]">
                  <span className="text-[10px] text-[var(--zd-muted)] block">أقصى سرعة</span>
                  <span className="font-black text-purple-600 text-sm">
                    {task.tripSummary.maxSpeed ?? '—'} كم/س
                  </span>
                </div>
              </div>
            </div>
          ) : routeData ? (
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shrink-0">
                  <Route className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--zd-muted)]">المسافة المقدرة</p>
                  <p className="text-xs font-bold text-blue-400">{routeData.distanceKm} كم</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
                  <Timer className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--zd-muted)]">الوقت المتوقع</p>
                  <p className="text-xs font-bold text-emerald-400">{routeData.durationMinutes} دقيقة تقريباً</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
