'use client';

import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Eye,
  Fuel,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Truck,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  getFuelStatusConfig,
  formatCostSAR,
  formatLiters,
  formatFuelDate,
} from '../utils/fuelHelpers';
import type { FuelRecordWithRelations } from '../types/fuel.types';

interface FuelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FuelRecordWithRelations | null;
  onOpenVerify?: (record: FuelRecordWithRelations) => void;
  onVoidRecord?: (record: FuelRecordWithRelations, reason?: string) => Promise<void>;
  isVoiding?: boolean;
}

export function FuelDetailModal({
  isOpen,
  onClose,
  record,
  onOpenVerify,
  onVoidRecord,
  isVoiding = false,
}: FuelDetailModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  if (!record) return null;

  const statusConfig = getFuelStatusConfig(record.status);
  const isPending = record.status === 'pending';
  const isApproved = record.status === 'approved';

  const handleConfirmVoid = async () => {
    if (!onVoidRecord) return;
    await onVoidRecord(record, voidReason.trim() || undefined);
    setIsVoidConfirmOpen(false);
    setVoidReason('');
  };

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

            {/* تنبيه إلغاء الاعتماد وعكس الرصيد */}
            {(record.voidReason || record.voidedAt) && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">تم إلغاء اعتماد هذا الإيصال وعكس رصيد الوقود في المركبة</p>
                  {record.voidReason && (
                    <p className="text-[11px] text-rose-300">
                      سبب الإلغاء: <span className="font-semibold">{record.voidReason}</span>
                    </p>
                  )}
                  {record.voidedAt && (
                    <p className="text-[10px] text-rose-400/80">
                      تاريخ الإلغاء: {formatFuelDate(record.voidedAt)}
                    </p>
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

            <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--zd-muted)]">حالة الخزان بعد التعبئة</span>
                <span className={`font-bold ${record.isFullTank ? 'text-sky-500' : 'text-[var(--zd-text)]'}`}>
                  {record.isFullTank ? 'ممتلئ بالكامل (FULL)' : 'غير ممتلئ (NOT FULL)'}
                </span>
              </div>
              {record.isFullTank && record.fuelEfficiency != null && (
                <div className="grid grid-cols-1 gap-3 border-t border-[var(--zd-line)]/50 pt-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-[var(--zd-muted)]">المسافة منذ التعبئة الكاملة السابقة</p>
                    <p className="mt-1 font-bold text-[var(--zd-text)]">{Number(record.distanceSinceLastFull).toLocaleString('ar-SA')} كم</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--zd-muted)]">الوقود المضاف خلال الدورة</p>
                    <p className="mt-1 font-bold text-[var(--zd-text)]">{formatLiters(record.fuelSinceLastFull ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--zd-muted)]">الكفاءة الفعلية للدورة</p>
                    <p className="mt-1 font-bold text-[var(--zd-text)]">{record.fuelEfficiency.toFixed(2)} كم/لتر</p>
                  </div>
                </div>
              )}
              {record.fuelIssue && record.fuelIssueMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500" role="alert">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{record.fuelIssueMessage}</p>
                </div>
              )}
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

            {/* بطاقة تأكيد إلغاء الاعتماد وعكس الرصيد */}
            {isVoidConfirmOpen && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs font-bold">تأكيد إلغاء اعتماد الفاتورة وعكس رصيد الوقود</p>
                </div>
                <p className="text-[11px] text-rose-300 leading-relaxed">
                  سيتم إلغاء اعتماد هذه الفاتورة وخصم كمية الوقود ({formatLiters(record.qty)}) من رصيد المركبة في عملية آمنة (Transaction).
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--zd-muted)] mb-1">
                    سبب الإلغاء (اختياري)
                  </label>
                  <input
                    type="text"
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="مثال: فاتورة مكررة، إدخال بيانات خاطئة بالخطأ..."
                    className="w-full rounded-xl border border-rose-500/40 bg-[var(--zd-surface)] px-3 py-2 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoidConfirmOpen(false);
                      setVoidReason('');
                    }}
                    disabled={isVoiding}
                    className="rounded-lg border border-[var(--zd-line)] px-3 py-1.5 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface)] cursor-pointer"
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmVoid}
                    disabled={isVoiding}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isVoiding && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>تأكيد الإلغاء وعكس الرصيد</span>
                  </button>
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

            <div className="flex items-center gap-2">
              {isApproved && onVoidRecord && !isVoidConfirmOpen && (
                <button
                  type="button"
                  onClick={() => setIsVoidConfirmOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 shadow-sm hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إلغاء الاعتماد (عكس الرصيد)</span>
                </button>
              )}

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
