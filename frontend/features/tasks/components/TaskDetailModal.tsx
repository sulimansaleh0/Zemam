'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  Eye,
  FileText,
  Fuel,
  Gauge,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { getTaskStatusConfig, formatTaskDateTime } from '../utils/taskHelpers';
import type { TaskWithRelations } from '../types/task.types';
import { TaskDetailMapSection } from './TaskDetailMapSection';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithRelations | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  if (!task) return null;

  const statusConfig = getTaskStatusConfig(task.status);
  const vehicleId =
    typeof task.vehicleId === 'object' && task.vehicleId !== null
      ? task.vehicleId._id
      : typeof task.vehicleId === 'string'
      ? task.vehicleId
      : null;

  const driverId =
    typeof task.driverId === 'object' && task.driverId !== null
      ? task.driverId._id
      : typeof task.driverId === 'string'
      ? task.driverId
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل المهمة"
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
              <span>
                موعد الانطلاق:{' '}
                <strong className="text-[var(--zd-text)]">{task.formattedStartTime}</strong>
              </span>
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
            {/* ── العمود الأيمن: بيانات المهمة والتشغيل (5 أعمدة) ── */}
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
                    <span>الموديل:</span>
                    {vehicleId ? (
                      <Link
                        href={`/vehicles/${vehicleId}`}
                        className="font-semibold text-[var(--zd-text)] hover:text-[var(--zd-blue)] hover:underline"
                      >
                        {task.vehicleModel}
                      </Link>
                    ) : (
                      <span className="font-semibold text-[var(--zd-text)]">{task.vehicleModel}</span>
                    )}
                  </p>
                  <p className="flex justify-between">
                    <span>رقم اللوحة:</span>
                    <span className="font-semibold text-[var(--zd-text)]">{task.vehiclePlate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>الفريق:</span>
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
                    <span>الاسم:</span>
                    {driverId ? (
                      <Link
                        href={`/drivers/${driverId}`}
                        className="font-semibold text-[var(--zd-text)] hover:text-[var(--zd-blue)] hover:underline"
                      >
                        {task.driverName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-[var(--zd-text)]">{task.driverName}</span>
                    )}
                  </p>
                  <p className="flex justify-between items-center">
                    <span>الهاتف:</span>
                    <span className="font-semibold text-[var(--zd-text)] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      {task.driverPhone || '—'}
                    </span>
                  </p>
                </div>
              </div>

              {/* العداد والوقود للمهام المكتملة */}
              {(task.startOdometer !== undefined || task.endOdometer !== undefined || task.fuelConsumedLitres !== undefined) && (
                <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)]">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span>سجلات العداد والوقود</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-[var(--zd-muted)]">
                    {task.startOdometer !== undefined && (
                      <div className="flex justify-between">
                        <span>عداد البداية:</span>
                        <span className="font-semibold text-[var(--zd-text)]">{task.startOdometer} كم</span>
                      </div>
                    )}
                    {task.endOdometer !== undefined && (
                      <div className="flex justify-between">
                        <span>عداد النهاية:</span>
                        <span className="font-semibold text-[var(--zd-text)]">{task.endOdometer} كم</span>
                      </div>
                    )}
                    {task.fuelConsumedLitres !== undefined && (
                      <div className="flex justify-between items-center border-t border-[var(--zd-line)]/50 pt-1.5">
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <Fuel className="h-3.5 w-3.5" />
                          <span>الوقود المستهلك:</span>
                        </span>
                        <span className="font-bold text-amber-400">{task.fuelConsumedLitres} لتر</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* التواريخ والأوقات */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/30 p-3 text-[11px] text-[var(--zd-muted)] space-y-1.5">
                <div className="flex justify-between">
                  <span>موعد الانطلاق:</span>
                  <span className="text-[var(--zd-text)] font-medium">{formatTaskDateTime(task.startTime)}</span>
                </div>
                {task.expectedEndTime && (
                  <div className="flex justify-between">
                    <span>الوقت المتوقع للتسليم:</span>
                    <span className="text-[var(--zd-text)] font-medium">{formatTaskDateTime(task.expectedEndTime)}</span>
                  </div>
                )}
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
              <TaskDetailMapSection task={task} />
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
