'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Coins,
  Droplet,
  Gauge,
  Loader2,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { formatCostSAR, formatLiters } from '../utils/fuelHelpers';
import type {
  FuelRecordWithRelations,
  VerifyFuelInput,
} from '../types/fuel.types';

interface VerifyFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FuelRecordWithRelations | null;
  onConfirm: (data: VerifyFuelInput) => Promise<void>;
  isLoading: boolean;
}

export function VerifyFuelModal({
  isOpen,
  onClose,
  record,
  onConfirm,
  isLoading,
}: VerifyFuelModalProps) {
  const [status, setStatus] = useState<'approved' | 'declined'>('approved');

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      id: record._id,
      status,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مراجعة واعتماد إيصال الوقود"
      description={`المركبة: ${record.vehicleModel} (لوحة: ${record.vehiclePlate})`}
      icon={ShieldCheck}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0" dir="rtl">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ملخص بيانات الإيصال */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--zd-muted)]">السائق:</span>
              <span className="font-bold text-[var(--zd-text)]">{record.userName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--zd-muted)]">الكمية والتكلفة:</span>
              <span className="font-bold text-[var(--zd-text)]">
                {formatLiters(record.qty)} — {formatCostSAR(record.cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--zd-muted)]">قراءة العداد:</span>
              <span className="font-mono font-bold text-[var(--zd-text)]">
                {Number(record.odometer).toLocaleString('ar-EG')} كم
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--zd-muted)]">نوع التعبئة:</span>
              <span className="font-bold text-[var(--zd-text)]">
                {record.isFullTank ? 'تعبئة كاملة (Full Tank)' : 'تعبئة جزئية'}
              </span>
            </div>
          </div>

          {/* اختيار القرار: اعتماد أم رفض */}
          <div>
            <label className="block text-xs font-bold text-[var(--zd-text)] mb-2">
              القرار <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                  status === 'approved'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-xs'
                    : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>اعتماد وقبول الإيصال</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('declined')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                  status === 'declined'
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-xs'
                    : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                }`}
              >
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>رفض الإيصال</span>
              </button>
            </div>
          </div>

          {/* ملاحظة عند الاعتماد */}
          {status === 'approved' && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400 leading-relaxed animate-in fade-in duration-150">
              <Gauge className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                عند اعتماد هذا الإيصال، سيقوم النظام تلقائياً بربطه مع التعبئات السابقة لحساب كفاءة الاستهلاك الفعلية (كم/لتر) والتحقق من سلامة خزان الوقود.
              </span>
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
              status === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{status === 'approved' ? 'تأكيد الاعتماد' : 'تأكيد الرفض'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
