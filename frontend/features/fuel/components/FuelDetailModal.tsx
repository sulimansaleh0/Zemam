'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Coins,
  Droplet,
  Eye,
  Fuel,
  Gauge,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  getFuelStatusConfig,
  formatCostSAR,
  formatLiters,
  formatEfficiency,
} from '../utils/fuelHelpers';
import type { FuelRecordWithRelations } from '../types/fuel.types';

interface FuelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FuelRecordWithRelations | null;
  onOpenVerify?: (record: FuelRecordWithRelations) => void;
}

export function FuelDetailModal({
  isOpen,
  onClose,
  record,
  onOpenVerify,
}: FuelDetailModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!record) return null;

  const statusConfig = getFuelStatusConfig(record.status);
  const isPending = record.status === 'pending';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="تفاصيل إيصال الوقود"
        description={`معرف الإيصال: ${record._id}`}
        icon={Fuel}
        maxWidth="3xl"
      >
        <div className="flex flex-col flex-1 min-h-0" dir="rtl">
          {/* محتوى التفاصيل القابل للتمرير */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* بطاقة الحالة والتاريخ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--zd-muted)]">حالة الإيصال:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.bgClass}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--zd-muted)]">
                <Calendar className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
                <span>تاريخ التوثيق: <strong className="text-[var(--zd-text)]">{record.formattedDate}</strong></span>
              </div>
            </div>

            {/* تنبيه الاستهلاك غير الطبيعي أو التسريب المحتمل */}
            {record.fuelIssue && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>تنبيه نظام الذكاء: استهلاك وقود مرتفع بشكل غير طبيعي</span>
                </div>
                <p className="text-xs text-rose-300 leading-relaxed">
                  {record.fuelIssueMessage ||
                    'تم رصد استهلاك وقود أعلى بكثير من المعدل المتوقع لهذه المركبة. يُنصح بفحص المركبة للتأكد من عدم وجود تسريب في خزان أو دورة الوقود.'}
                </p>
                {record.fuelEfficiency && (
                  <div className="flex items-center gap-4 text-xs pt-1 text-rose-200">
                    <span>
                      الكفاءة المسجلة: <strong>{formatEfficiency(record.fuelEfficiency)}</strong>
                    </span>
                    {record.expectedEfficiency && (
                      <span>
                        الكفاءة المتوقعة للمركبة: <strong>{formatEfficiency(record.expectedEfficiency)}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* تحليلات الكفاءة والمسافة عند التعبئة الكاملة */}
            {record.isFullTank && record.fuelEfficiency && !record.fuelIssue && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Gauge className="h-4 w-4 text-emerald-400" />
                    <span>كفاءة استهلاك الوقود المحسوبة</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {formatEfficiency(record.fuelEfficiency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  {record.distanceSinceLastFull && (
                    <div className="rounded-lg bg-[var(--zd-surface)] p-2.5 border border-[var(--zd-line)]/50">
                      <p className="text-[10px] text-[var(--zd-muted)]">المسافة منذ آخر تعبئة</p>
                      <p className="mt-0.5 font-bold text-[var(--zd-text)]">
                        {record.distanceSinceLastFull.toLocaleString('ar-EG')} كم
                      </p>
                    </div>
                  )}

                  {record.fuelSinceLastFull && (
                    <div className="rounded-lg bg-[var(--zd-surface)] p-2.5 border border-[var(--zd-line)]/50">
                      <p className="text-[10px] text-[var(--zd-muted)]">الوقود المستهلك</p>
                      <p className="mt-0.5 font-bold text-[var(--zd-text)]">
                        {formatLiters(record.fuelSinceLastFull)}
                      </p>
                    </div>
                  )}

                  {record.expectedEfficiency && (
                    <div className="rounded-lg bg-[var(--zd-surface)] p-2.5 border border-[var(--zd-line)]/50">
                      <p className="text-[10px] text-[var(--zd-muted)]">الكفاءة المعيارية للمركبة</p>
                      <p className="mt-0.5 font-bold text-[var(--zd-text)]">
                        {formatEfficiency(record.expectedEfficiency)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* بيانات المركبة والسائق */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* المركبة */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                  <Truck className="h-4 w-4 text-[var(--zd-blue)]" />
                  <span>بيانات المركبة</span>
                </div>
                <p className="text-base font-bold text-[var(--zd-text)]">
                  {record.vehicleModel}
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--zd-line)]/50">
                  <span className="text-[var(--zd-muted)]">رقم اللوحة:</span>
                  <span className="font-mono font-bold text-[var(--zd-text)]">{record.vehiclePlate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--zd-muted)]">قراءة العداد المسجلة:</span>
                  <span className="font-mono font-bold text-[var(--zd-text)]">
                    {Number(record.odometer).toLocaleString('ar-EG')} كم
                  </span>
                </div>
              </div>

              {/* السائق ومقدم الإيصال */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                  <User className="h-4 w-4 text-[var(--zd-blue)]" />
                  <span>مقدم الإيصال</span>
                </div>
                <p className="text-base font-bold text-[var(--zd-text)]">
                  {record.userName}
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--zd-line)]/50">
                  <span className="text-[var(--zd-muted)]">البريد الإلكتروني:</span>
                  <span className="font-mono text-[var(--zd-text)]">{record.userEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--zd-muted)]">نوع التعبئة:</span>
                  <span className="font-bold text-[var(--zd-text)]">
                    {record.isFullTank ? 'تعبئة خزان كامل (Full Tank)' : 'تعبئة جزئية'}
                  </span>
                </div>
              </div>
            </div>

            {/* تفاصيل التكلفة والكمية وسعر اللتر */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4">
                <p className="text-xs text-[var(--zd-muted)]">إجمالي التكلفة</p>
                <p className="mt-1 text-lg font-bold text-[var(--zd-text)]">{formatCostSAR(record.cost)}</p>
              </div>

              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4">
                <p className="text-xs text-[var(--zd-muted)]">الكمية المعبأة</p>
                <p className="mt-1 text-lg font-bold text-cyan-400">{formatLiters(record.qty)}</p>
              </div>

              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4">
                <p className="text-xs text-[var(--zd-muted)]">سعر اللتر الفعلي</p>
                <p className="mt-1 text-lg font-bold text-[var(--zd-text)] font-mono">
                  {record.pricePerLiter.toFixed(2)} ر.س / لتر
                </p>
              </div>
            </div>

            {/* صورة الإيصال المرفقة */}
            {record.image && (
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                    <Receipt className="h-4 w-4 text-[var(--zd-blue)]" />
                    <span>صورة فاتورة / إيصال الوقود</span>
                  </div>
                  <span className="text-[10px] text-[var(--zd-muted)]">انقر على الصورة للمعاينة المكبرة</span>
                </div>

                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="group relative max-h-64 w-full overflow-hidden rounded-xl border border-[var(--zd-line)] bg-black/20 transition hover:border-[var(--zd-blue)] cursor-pointer flex items-center justify-center p-2"
                >
                  <img
                    src={record.image}
                    alt="Receipt"
                    className="max-h-60 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* تذييل المودال */}
          <div className="shrink-0 flex items-center justify-between border-t border-[var(--zd-line)] p-4 bg-[var(--zd-surface-2)]/30">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--zd-line)] px-4 py-2 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface)] hover:text-[var(--zd-text)] transition cursor-pointer"
            >
              إغلاق
            </button>

            {isPending && onOpenVerify && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerify(record);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>مراجعة الإيصال (اعتماد / رفض)</span>
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Lightbox لتكبير صورة الإيصال */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={record.image}
              alt="Receipt Full Preview"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
