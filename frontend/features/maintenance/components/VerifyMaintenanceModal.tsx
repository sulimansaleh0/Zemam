'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  verifyMaintenanceSchema,
  type VerifyMaintenanceFormValues,
} from '../schemas/maintenance.schema';
import type {
  MaintenanceRecordWithRelations,
  VerifyMaintenanceInput,
} from '../types/maintenance.types';

interface VerifyMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecordWithRelations | null;
  onConfirm: (data: VerifyMaintenanceInput) => Promise<void>;
  isLoading: boolean;
}

export function VerifyMaintenanceModal({
  isOpen,
  onClose,
  record,
  onConfirm,
  isLoading,
}: VerifyMaintenanceModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VerifyMaintenanceFormValues>({
    resolver: zodResolver(verifyMaintenanceSchema),
    defaultValues: {
      status: 'approved',
      cost: record?.cost || 0,
      isDriverFault: false,
      declineReason: '',
    },
  });

  useEffect(() => {
    if (record) {
      reset({
        status: 'approved',
        cost: record.cost || 0,
        isDriverFault: false,
        declineReason: '',
      });
    }
  }, [record, reset]);

  if (!record) return null;

  const currentStatus = watch('status');
  const isDriverFault = watch('isDriverFault');

  const onFormSubmit = async (values: VerifyMaintenanceFormValues) => {
    await onConfirm({
      id: record._id,
      status: values.status,
      cost: values.cost,
      isDriverFault: values.isDriverFault,
      declineReason: values.declineReason,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مراجعة واعتماد طلب الصيانة"
      description={`المركبة: ${record.vehicleModel} (لوحة: ${record.vehiclePlate})`}
      icon={ShieldCheck}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0" dir="rtl">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* اختيار القرار: اعتماد أم رفض */}
          <div>
            <label className="block text-xs font-bold text-[var(--zd-text)] mb-2">
              القرار النهائي <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('status', 'approved')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                  currentStatus === 'approved'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-xs'
                    : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>اعتماد وقبول الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('status', 'declined')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                  currentStatus === 'declined'
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-xs'
                    : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                }`}
              >
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>رفض الطلب</span>
              </button>
            </div>
            {errors.status && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.status.message}</p>
            )}
          </div>

          {/* في حالة الاعتماد: تعديل التكلفة المعتمدة + تحديد مسؤولية السائق */}
          {currentStatus === 'approved' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* التكلفة الفعلية المعتمدة */}
              <div>
                <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                  التكلفة الفعلية المعتمدة (ر.س)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('cost')}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 pl-8 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
                  />
                  <Coins className="absolute left-2.5 top-3 h-3.5 w-3.5 text-[var(--zd-muted)]" />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.cost.message}</p>
                )}
              </div>

              {/* مسؤولية السائق (checkbox/toggle) */}
              <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(isDriverFault)}
                    onChange={(e) => setValue('isDriverFault', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--zd-line)] text-[var(--zd-blue)] focus:ring-0 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-[var(--zd-text)] flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                      <span>هل العطل ناتج عن إهمال أو سوء استخدام من السائق؟</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--zd-muted)]">
                      في حال التحديد، سيتم تصنيف التكلفة كـ (مسؤولية سائق) في تقارير الأسطول المالية.
                    </p>
                  </div>
                </label>
              </div>

              {/* ملاحظة تفعيل المركبة تلقائياً */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400">
                <Truck className="h-4 w-4 shrink-0" />
                <span>سيتم إعادة تفعيل حالة المركبة في النظام تلقائياً إلى (نشطة) عند الاعتماد.</span>
              </div>
            </div>
          )}

          {/* في حالة الرفض: سبب الرفض الإلزامي */}
          {currentStatus === 'declined' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-[var(--zd-text)]">
                سبب الرفض <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register('declineReason')}
                placeholder="وضح سبب رفض هذا الطلب (مثلاً: تكلفة مبالغ فيها، قطع غير مطابقة، تقرير غير مكتمل...)"
                className="w-full rounded-xl border border-rose-500/30 bg-[var(--zd-surface)] p-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-rose-500 focus:outline-none resize-none"
              />
              {errors.declineReason && (
                <p className="text-[11px] text-rose-500">{errors.declineReason.message}</p>
              )}
            </div>
          )}
        </div>

        {/* تذييل النافذة */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-[var(--zd-line)] p-4 bg-[var(--zd-surface-2)]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-[var(--zd-line)] px-4 py-2 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface)] hover:text-[var(--zd-text)] transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer ${
              currentStatus === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{currentStatus === 'approved' ? 'تأكيد الاعتماد' : 'تأكيد الرفض'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
