'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
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
      maxWidth="4xl"
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden" dir="rtl">
        {/* الجسم القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* الحالة ووقت البدء */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[var(--zd-muted)]">حالة المهمة:</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.bgClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Calendar className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
              <span>موعد الانطلاق: <strong className="text-[var(--zd-text)]">{task.formattedStartTime}</strong></span>
            </div>
          </div>

          {/* تنبيه سبب الإلغاء في حال كانت المهمة ملغاة */}
          {task.status === 'declined' && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <p className="font-bold text-rose-300">سبب إلغاء المهمة:</p>
                <p className="text-[11px] leading-relaxed text-rose-200">
                  {task.declineReason || 'لم يُحدد سبب عند الإلغاء'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ── العمود الأيمن: بيانات المهمة والمركبة والسائق (5 أعمدة) ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* وصف المهمة */}
              <div className="space-y-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
                  <FileText className="h-4 w-4 text-[var(--zd-blue)]" />
                  <span>وصف المهمة والتعليمات</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--zd-muted)] whitespace-pre-wrap pt-1">
                  {task.description}
                </p>
              </div>

              {/* كرت المركبة */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  <span>المركبة المخصصة</span>
                </div>
                <div className="mt-2 text-xs space-y-1.5 text-[var(--zd-muted)]">
                  <p className="flex justify-between">
                    <span className="text-[var(--zd-muted)]">الموديل:</span>
                    <span className="font-semibold text-[var(--zd-text)]">{task.vehicleModel}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--zd-muted)]">رقم اللوحة:</span>
                    <span className="font-semibold text-[var(--zd-text)]">{task.vehiclePlate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--zd-muted)]">الفريق:</span>
                    <span className="font-semibold text-[var(--zd-text)]">{task.teamName}</span>
                  </p>
                </div>
              </div>

              {/* كرت السائق */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>السائق المسؤول</span>
                </div>
                <div className="mt-2 text-xs space-y-1.5 text-[var(--zd-muted)]">
                  <p className="flex justify-between">
                    <span className="text-[var(--zd-muted)]">الاسم:</span>
                    <span className="font-semibold text-[var(--zd-text)]">{task.driverName}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-[var(--zd-muted)]">الهاتف:</span>
                    <span className="font-semibold text-[var(--zd-text)] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      {task.driverPhone}
                    </span>
                  </p>
                </div>
              </div>

              {/* التواريخ والأوقات */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/30 p-3 text-[11px] text-[var(--zd-muted)] space-y-1.5">
                <div className="flex justify-between">
                  <span>تاريخ الإنشاء:</span>
                  <span className="text-[var(--zd-text)]">{formatTaskDateTime(task.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>بدء التنفيذ:</span>
                  <span className="text-[var(--zd-text)]">{formatTaskDateTime(task.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الإكمال:</span>
                  <span className="text-[var(--zd-text)]">{formatTaskDateTime(task.finishedAt)}</span>
                </div>
              </div>
            </div>

            {/* ── العمود الأيسر: خريطة المسار والنقاط (7 أعمدة) ── */}
            <div className="lg:col-span-7 space-y-3">
              {/* المسار الجغرافي */}
              <div className="space-y-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
                <span className="text-xs font-bold text-[var(--zd-text)]">المسار ونقاط التحرك</span>

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

                {/* خريطة المسار التفاعلية المصغرة */}
                {hasCoords && (
                  <div className="space-y-2 pt-1">
                    <LeafletMapCanvas
                      pickupPosition={[pickupLat, pickupLng]}
                      deliveryPosition={[deliveryLat, deliveryLng]}
                      routeCoordinates={routeData?.coordinates}
                      className="h-[250px] w-full rounded-xl"
                      readOnly={true}
                    />

                    {routeData && (
                      <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shrink-0">
                            <Route className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--zd-muted)]">المسافة الفعلية</p>
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── شريط الزر الثابت بالأسفل ── */}
        <div className="shrink-0 border-t border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-6 py-2 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface)] transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
}
