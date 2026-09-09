'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileText,
  MapPin,
  Navigation,
  Phone,
  Route,
  Shield,
  Timer,
  Truck,
  User,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { getTaskStatusConfig, formatTaskDateTime } from '../utils/taskHelpers';
import { fetchDrivingRoute, type RouteData } from '../utils/mapHelpers';
import type { TaskWithRelations } from '../types/task.types';

const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
      <Compass className="h-6 w-6 animate-spin text-[var(--zd-blue)]" />
      <span>جاري تحميل مسار الخريطة...</span>
    </div>
  ),
});

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithRelations | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const pickupLat = task?.pickupLocation?.lat ? parseFloat(task.pickupLocation.lat) : NaN;
  const pickupLng = task?.pickupLocation?.lng ? parseFloat(task.pickupLocation.lng) : NaN;
  const deliveryLat = task?.deliveryLocation?.lat ? parseFloat(task.deliveryLocation.lat) : NaN;
  const deliveryLng = task?.deliveryLocation?.lng ? parseFloat(task.deliveryLocation.lng) : NaN;

  const hasCoords = !isNaN(pickupLat) && !isNaN(pickupLng) && !isNaN(deliveryLat) && !isNaN(deliveryLng);

  useEffect(() => {
    if (!task || !hasCoords) {
      setRouteData(null);
      return;
    }

    let isMounted = true;
    fetchDrivingRoute([pickupLat, pickupLng], [deliveryLat, deliveryLng]).then((res) => {
      if (isMounted) setRouteData(res);
    });

    return () => {
      isMounted = false;
    };
  }, [task?._id, pickupLat, pickupLng, deliveryLat, deliveryLng, hasCoords]);

  if (!task) return null;

  const statusConfig = getTaskStatusConfig(task.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title || 'تفاصيل المهمة'}
      description={`معرف المهمة: ${task._id}`}
      icon={Eye}
      maxWidth="lg"
    >
      <div className="space-y-5" dir="rtl">
        {/* الحالة ووقت البدء */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--zd-muted)]">حالة المهمة:</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig.bgClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--zd-muted)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>موعد الانطلاق: {task.formattedStartTime}</span>
          </div>
        </div>

        {/* وصف المهمة */}
        <div className="space-y-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
            <FileText className="h-4 w-4 text-[var(--zd-blue)]" />
            <span>وصف المهمة والتعليمات</span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--zd-muted)] whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        {/* السائق والمركبة والفريق */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* كرت المركبة */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
              <Truck className="h-4 w-4 text-emerald-500" />
              <span>المركبة المخصصة</span>
            </div>
            <div className="mt-2 text-xs space-y-1 text-[var(--zd-muted)]">
              <p>
                <span className="font-semibold text-[var(--zd-text)]">الموديل:</span>{' '}
                {task.vehicleModel}
              </p>
              <p>
                <span className="font-semibold text-[var(--zd-text)]">رقم اللوحة:</span>{' '}
                {task.vehiclePlate}
              </p>
              <p>
                <span className="font-semibold text-[var(--zd-text)]">الفريق التشغيلي:</span>{' '}
                {task.teamName}
              </p>
            </div>
          </div>

          {/* كرت السائق */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
              <User className="h-4 w-4 text-blue-500" />
              <span>السائق المسؤول</span>
            </div>
            <div className="mt-2 text-xs space-y-1 text-[var(--zd-muted)]">
              <p>
                <span className="font-semibold text-[var(--zd-text)]">الاسم:</span>{' '}
                {task.driverName}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>الهاتف: {task.driverPhone}</span>
              </p>
            </div>
          </div>
        </div>

        {/* المسار الجغرافي */}
        <div className="space-y-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
          <span className="text-xs font-bold text-[var(--zd-text)]">المسار ونقاط التحرك</span>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div className="text-xs">
                <p className="font-bold text-[var(--zd-text)]">نقطة الانطلاق (Pickup)</p>
                <p className="text-[var(--zd-muted)]">{task.pickupLocation?.address || '—'}</p>
                <p className="text-[10px] text-[var(--zd-muted)]">
                  الإحداثيات: {task.pickupLocation?.lat}, {task.pickupLocation?.lng}
                </p>
              </div>
            </div>

            <div className="mr-2 h-4 border-r-2 border-dashed border-[var(--zd-line)]" />

            <div className="flex items-start gap-2.5">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div className="text-xs">
                <p className="font-bold text-[var(--zd-text)]">نقطة التسليم والوصول (Delivery)</p>
                <p className="text-[var(--zd-muted)]">{task.deliveryLocation?.address || '—'}</p>
                <p className="text-[10px] text-[var(--zd-muted)]">
                  الإحداثيات: {task.deliveryLocation?.lat}, {task.deliveryLocation?.lng}
                </p>
              </div>
            </div>
          </div>

          {/* خريطة المسار التفاعلية المصغرة */}
          {hasCoords && (
            <div className="space-y-2 pt-1">
              <LeafletMapCanvas
                pickupPosition={[pickupLat, pickupLng]}
                deliveryPosition={[deliveryLat, deliveryLng]}
                routeCoordinates={routeData?.coordinates}
                className="h-[220px] w-full"
                readOnly={true}
              />

              {routeData && (
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Route className="h-4 w-4 text-blue-400" />
                    <span>المسافة الفعلية: <strong className="text-blue-400">{routeData.distanceKm} كم</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-emerald-400" />
                    <span>الوقت المقدر: <strong className="text-emerald-400">{routeData.durationMinutes} دقيقة</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* التواريخ والأوقات */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--zd-muted)] border-t border-[var(--zd-line)] pt-3">
          <div>
            <span>تاريخ الإنشاء:</span> {formatTaskDateTime(task.createdAt)}
          </div>
          <div>
            <span>بدء التنفيذ الفعلي:</span> {formatTaskDateTime(task.startedAt)}
          </div>
          <div>
            <span>تاريخ الإكمال:</span> {formatTaskDateTime(task.finishedAt)}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-6 py-2.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface)]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
}
