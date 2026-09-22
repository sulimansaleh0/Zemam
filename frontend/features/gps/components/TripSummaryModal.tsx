'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Navigation,
  Route,
  Timer,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import type { TripSummary } from '../types/gps.types';
import { decodePolyline } from '../utils/gpsHelpers';

const LeafletMapCanvas = dynamic(
  () => import('@/features/tasks/components/LeafletMapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
        <Compass className="h-6 w-6 animate-spin text-blue-500" />
        <span>جاري تحميل مسار الرحلة...</span>
      </div>
    ),
  }
);

interface TripSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TripSummary | null;
}

export function TripSummaryModal({
  isOpen,
  onClose,
  summary,
}: TripSummaryModalProps) {
  // فك تشفير المسار المضغوط
  const routeCoordinates = useMemo(() => {
    if (!summary?.encodedPath) return [];
    return decodePolyline(summary.encodedPath);
  }, [summary?.encodedPath]);

  if (!summary) return null;

  const pickupCoord: [number, number] | null =
    summary.startLocation?.lat && summary.startLocation?.lng
      ? [summary.startLocation.lat, summary.startLocation.lng]
      : null;

  const deliveryCoord: [number, number] | null =
    summary.endLocation?.lat && summary.endLocation?.lng
      ? [summary.endLocation.lat, summary.endLocation.lng]
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ملخص الرحلة الفعلي والتتبع المنجز"
      description="بيانات الأداء الميداني الدقيقة والمسار المقطوع للمهمة"
      icon={Route}
      iconClassName="text-blue-500"
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-2 text-[var(--zd-text)]">
        {/* معلومات المركبة والسائق */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <span className="font-bold">{summary.plateNumber || 'مركبة'}</span>
            <span className="text-[var(--zd-muted)]">• المهمة: {summary.taskTitle || summary.taskId}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--zd-muted)]">
            <User className="h-4 w-4 text-blue-500" />
            <span>السائق: <strong className="text-[var(--zd-text)]">{summary.driverName || 'سائق'}</strong></span>
          </div>
        </div>

        {/* كروت القياسات الأربعة الذكية */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* إجمالي المسافة */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Route className="h-3.5 w-3.5 text-blue-500" />
              <span>المسافة المقطوعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-blue-600">
              {summary.totalDistanceKm} <span className="text-xs font-normal text-[var(--zd-muted)]">كم</span>
            </div>
          </div>

          {/* مدة القيادة الفعلية */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Timer className="h-3.5 w-3.5 text-emerald-500" />
              <span>زمن الرحلة</span>
            </div>
            <div className="mt-1 text-xl font-black text-emerald-600">
              {summary.durationMinutes} <span className="text-xs font-normal text-[var(--zd-muted)]">دقيقة</span>
            </div>
          </div>

          {/* متوسط السرعة */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>متوسط السرعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-amber-600">
              {summary.averageSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
          </div>

          {/* أقصى سرعة مسجلة */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Gauge className="h-3.5 w-3.5 text-purple-500" />
              <span>أقصى سرعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-purple-600">
              {summary.maxSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
          </div>
        </div>

        {/* خريطة مسار الرحلة الفعلي */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--zd-muted)]">
            <span className="font-semibold text-[var(--zd-text)]">خريطة المسار الفعلي المسجل:</span>
            <span>
              {routeCoordinates.length > 0
                ? `${routeCoordinates.length} نقطة مسار مفكوكة من النص المضغوط`
                : 'المسار المباشر بين الانطلاق والوصول'}
            </span>
          </div>

          <LeafletMapCanvas
            pickupPosition={pickupCoord}
            deliveryPosition={deliveryCoord}
            routeCoordinates={routeCoordinates}
            className="h-[280px] w-full rounded-xl border border-[var(--zd-line)] shadow-inner"
            readOnly={true}
          />
        </div>

        {/* نقاط الانطلاق والوصول */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600">
              <MapPin className="h-4 w-4" />
              <span>نقطة الانطلاق (A):</span>
            </div>
            <p className="mt-1 text-[var(--zd-muted)]">
              {summary.startLocation?.address || `${summary.startLocation?.lat}, ${summary.startLocation?.lng}`}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3">
            <div className="flex items-center gap-1.5 font-bold text-blue-600">
              <MapPin className="h-4 w-4" />
              <span>نقطة الوصول (B):</span>
            </div>
            <p className="mt-1 text-[var(--zd-muted)]">
              {summary.endLocation?.address || `${summary.endLocation?.lat}, ${summary.endLocation?.lng}`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
