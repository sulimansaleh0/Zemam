'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Coins,
  Eye,
  FileText,
  Gauge,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Truck,
  User,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  getMaintenanceStatusConfig,
  getMaintenancePriorityConfig,
  getMaintenanceCategoryConfig,
  formatCostSAR,
} from '../utils/maintenanceHelpers';
import type { MaintenanceRecordWithRelations } from '../types/maintenance.types';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecordWithRelations | null;
  onOpenVerify?: (record: MaintenanceRecordWithRelations) => void;
}

export function MaintenanceDetailModal({
  isOpen,
  onClose,
  record,
  onOpenVerify,
}: MaintenanceDetailModalProps) {
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  if (!record) return null;

  const statusConfig = getMaintenanceStatusConfig(record.status);
  const priorityConfig = getMaintenancePriorityConfig(record.priority);
  const categoryConfig = getMaintenanceCategoryConfig(record.category);
  const isPending = record.status === 'pending';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="تفاصيل طلب الصيانة"
        description={`معرف السجل: ${record._id}`}
        icon={Wrench}
        maxWidth="3xl"
      >
        <div className="flex flex-col flex-1 min-h-0" dir="rtl">
          {/* محتوى التفاصيل القابل للتمرير */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* بطاقة الحالة والتاريخ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--zd-muted)]">حالة الطلب:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.bgClass}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--zd-muted)]">
                <Calendar className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
                <span>تاريخ التسجيل: <strong className="text-[var(--zd-text)]">{record.formattedDate}</strong></span>
              </div>
            </div>

            {/* بطاقات البيانات الأساسية (المركبة، مقدم الطلب، التصنيف، الأولوية) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* بيانات المركبة */}
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
                    {record.odoMeter !== undefined && record.odoMeter !== null
                      ? `${Number(record.odoMeter).toLocaleString('ar-EG')} كم`
                      : 'غير محددة'}
                  </span>
                </div>
              </div>

              {/* بيانات مقدم الطلب والمراجعة */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                  <User className="h-4 w-4 text-[var(--zd-blue)]" />
                  <span>مقدم البلاغ</span>
                </div>
                <p className="text-base font-bold text-[var(--zd-text)]">
                  {record.reporterName}
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--zd-line)]/50">
                  <span className="text-[var(--zd-muted)]">البريد الإلكتروني:</span>
                  <span className="font-mono text-[var(--zd-text)]">{record.reporterEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--zd-muted)]">التصنيف:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${categoryConfig.badgeClass}`}>
                    {categoryConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* الأولوية والتكلفة */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4">
                <div>
                  <p className="text-xs text-[var(--zd-muted)]">مستوى الأولوية</p>
                  <p className="mt-1 text-sm font-bold text-[var(--zd-text)]">{priorityConfig.label}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${priorityConfig.bgClass}`}>
                  <span className={`h-2 w-2 rounded-full ${priorityConfig.dotClass}`} />
                  {priorityConfig.shortLabel}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4">
                <div>
                  <p className="text-xs text-[var(--zd-muted)]">التكلفة (المعتمدة / المقدرة)</p>
                  <p className="mt-1 text-base font-bold text-[var(--zd-text)]">{formatCostSAR(record.cost)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* وصف الصيانة */}
            <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                <FileText className="h-4 w-4 text-[var(--zd-blue)]" />
                <span>تفاصيل ووصف الصيانة / العطل</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--zd-text)] whitespace-pre-wrap bg-[var(--zd-surface-2)]/30 p-3 rounded-lg border border-[var(--zd-line)]/50">
                {record.description}
              </p>
            </div>

            {/* نتيجة التحقق (اعتماد / رفض) */}
            {record.status === 'approved' && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>تم اعتماد هذا الطلب بنجاح</span>
                </div>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="text-emerald-300 font-medium">مسؤولية العطل:</span>
                  {record.isDriverFault ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>ناتج عن خطأ / إهمال من السائق</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                      <span>استهلاك وتآكل طبيعي</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {record.status === 'declined' && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <XCircle className="h-4 w-4 text-rose-500" />
                  <span>تم رفض هذا الطلب</span>
                </div>
                {record.declineReason && (
                  <div className="text-xs text-rose-300 pt-1">
                    <span className="font-semibold text-rose-400">سبب الرفض: </span>
                    <span>{record.declineReason}</span>
                  </div>
                )}
              </div>
            )}

            {/* معرض الصور المرفقة */}
            {record.images && record.images.length > 0 && (
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-muted)]">
                    <ImageIcon className="h-4 w-4 text-[var(--zd-blue)]" />
                    <span>الصور والإيصالات المرفقة ({record.images.length})</span>
                  </div>
                  <span className="text-[10px] text-[var(--zd-muted)]">انقر على الصورة للتكبير</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {record.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePreviewImage(imgUrl)}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--zd-line)] bg-black/20 transition hover:border-[var(--zd-blue)] cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={`Maintenance image ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* تذييل المودال وأزرار الإجراءات */}
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
                <span>اتخاذ قرار (اعتماد / رفض)</span>
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* نافذة معاينة الصورة بالحجم الكامل (Lightbox) */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={activePreviewImage}
              alt="Full Preview"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
